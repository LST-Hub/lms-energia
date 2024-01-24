import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { maxTake, userSelectSome } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import {
  getSubordinateIds,
  getUserRoleRestrictionId,
  isUserHasAccess,
  updateMultipUsersCache,
} from "../../../../lib/backendUtils";
import { permissionTypeIds, perAccessIds, roleRestrictionIds } from "../../../../DBConstants";
import { minSearchLength } from "../../../../src/utils/Constants";
import { redisDelUser } from "../../../../lib/redis-operations";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { active, search, supervisorId, roleId } = req.query;
      const idForSupervisor = supervisorId ? supervisorId : undefined;
      const idForRole = roleId ? Number(roleId) : undefined;
      let userActive = undefined;
      if (active) {
        userActive = active === "true" ? true : false;
      }

      /* this Implementation is of full text search,It will work fast than LIKE statement, but the problem is that it tries to match whole word not substring
      like if name is 'Suraj Gupta', and user types 'sur' then full text search will not return result because it matches words not substring
      if user search 'Suraj' then full text search will return the result becuse now it will amtch the word, but we need to check substring also
      hence dropping full tet serach now, but later someone may replace with a better implementation, or third party search engine
      
      There was a alternative called pg_tram contrib module, for searching substrings in postgres,
      but accccording to this answer (https://stackoverflow.com/questions/44284078/postgresql-full-text-search-with-substrings)
      it would be slow for small string, and we have small strings
      
      const searchArr = search
        ? [
            {
              name: {
                search: search,
              },
            },
            {
              designation: {
                search: search,
              },
            },
            //TODO: not included email here as it dont work, find out why leaving currently
          ]
        : undefined;
      */
      const searchArr =
        search && search.length >= minSearchLength
          ? [
              {
                // db column name
                name: {
                  startsWith: search,
                  // mode: "insensitive",
                },
              },
              {
                firstName: {
                  startsWith: search,
                  // mode: "insensitive",
                },
              },
              {
                lastName: {
                  startsWith: search,
                  // mode: "insensitive",
                },
              },
            ]
          : undefined;
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.users,
        perAccessIds.view
      );
      if (hasAccess) {
        const restrictionId = await getUserRoleRestrictionId(userToken.userId, userToken.workspaceId);
        let users = [];
        switch (restrictionId) {
          // case roleRestrictionIds.own:
          //   // the below query will return all users who are created by the current user and the user himself
          //   users = await prisma.user.findMany({
          //     where: {
          //       AND: {
          //         workspaceId: userToken.workspaceId,
          //         supervisorId: idForSupervisor,
          //         roleId: idForRole,
          //         active: userActive,
          //         OR: [
          //           {
          //             createdById: userToken.userId,
          //           },
          //           {
          //             id: userToken.userId,
          //           },
          //         ],
          //       },
          //       OR: searchArr,
          //     },
          //     take: maxTake,
          //     select: userSelectSome,
          //   });
          //   break;
          // case roleRestrictionIds.subordinates:
          //   // this will return all subordinates ids of the current user, means userID of all users who are subordinate of the current user
          //   const subordnateIds = await getSubordinateIds(userToken.userId, userToken.workspaceId);
          //   users = await prisma.user.findMany({
          //     where: {
          //       workspaceId: userToken.workspaceId,
          //       supervisorId: idForSupervisor,
          //       roleId: idForRole,
          //       active: userActive,
          //       id: { in: subordnateIds }, // get all the users whose userId is in the subordnateIds array
          //       OR: searchArr,
          //     },
          //     take: maxTake,
          //     select: userSelectSome,
          //   });
          //   break;
          case roleRestrictionIds.none:
            users = await prisma.user.findMany({
              where: {
                workspaceId: userToken.workspaceId,
                active: userActive,
                supervisorId: idForSupervisor,
                roleId: idForRole,
                OR: searchArr,
              }, // return aall users of workspace
              take: maxTake,
              orderBy: [
                {
                  name: "asc",
                },
              ],
              select: userSelectSome,
            });
            break;
          default:
            users = [];
            break;
        }
        response({ res, success: true, status_code: 200, data: users, message: "Users fetched successfully" });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to view users",
        });
        return;
      }
    } else if (req.method === "PATCH") {
      // here delet has the priority,
      // make makeDelete and makeActive, bith are passed true, then delete will be executed, and makeActive will be ignored
      const { makeDelete, deleteIds, makeActive, activeIds, makeInactive, inactiveIds } = req.body;
      if (
        (makeDelete && !Array.isArray(deleteIds)) ||
        (makeActive && !Array.isArray(activeIds)) ||
        (makeInactive && !Array.isArray(inactiveIds))
      ) {
        response({
          res,
          success: false,
          status_code: 400,
          message: "ids should be an array",
        });
        return;
      }
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.users,
        perAccessIds.all
      );
      if (hasAccess) {
        if (makeDelete) {
          try {
            const userDelete = await prisma.user.deleteMany({
              where: { id: { in: deleteIds }, workspaceId: userToken.workspaceId },
            });
            // delete user cache
            for (id of deleteIds) redisDelUser(id, userToken.workspaceId);

            response({
              res,
              success: true,
              status_code: 200,
              data: [
                {
                  deleted: true,
                  hasChild: false,
                  error: false,
                },
              ],
              message: "user Deleted succesfully",
            });
            return;
          } catch (e) {
            const errRes = handlePrismaDeleteError(e, "User");
            response({
              res,
              success: false,
              status_code: 400,
              data: [
                {
                  deleted: false,
                  ...errRes,
                },
              ],
              message: errRes.message,
            });

            if (userDelete) {
              // upadte cache for the users who are deleted
              updateMultipUsersCache(deleteIds, userToken.workspaceId);
            }
            return;
          }
        }
        if (makeActive || makeInactive) {
          const active = makeActive ? true : false;
          const Ids = makeActive ? activeIds : inactiveIds;
          const userUpdate = await prisma.user.updateMany({
            where: { id: { in: Ids }, workspaceId: userToken.workspaceId },
            data: { active: active },
          });
          response({
            res,
            success: true,
            status_code: 200,
            data: userUpdate,
            message: "user updated succesfully",
          });
          if (userUpdate) {
            // upadte cache for the users who are deleted
            updateMultipUsersCache(Ids, userToken.workspaceId);
          }
          return;
        }

        response({
          res,
          success: false,
          status_code: 400,
          message: "Invalid data in request body",
        });
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to perform this action.",
        });
        return;
      }
    } else {
      // currently we are not creating user in this API route so I have not acepted POST rquest, but later if you want to add some login you can edit this route
      response({
        res,
        success: false,
        status_code: 405,
        message: "method is not allowed",
      });
    }
  } catch (err) {
    console.error("error in user index page", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
