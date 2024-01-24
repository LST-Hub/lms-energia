import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { maxTake, roleSelectSome } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { perAccessIds, permissionTypeIds, roleRestrictionIds } from "../../../../DBConstants";
import {
  getRecordCounts,
  getSubordinateIds,
  getUserRoleRestrictionId,
  isUserHasAccess,
  updateRoleCache,
} from "../../../../lib/backendUtils";
import { minSearchLength } from "../../../../src/utils/Constants";
import { redisDelRole } from "../../../../lib/redis-operations";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { active, search, restrictionId } = req.query;
      let roleActive = undefined;
      if (active) {
        roleActive = active === "true" ? true : false;
      }
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
            ]
          : undefined;
      const idForRestriction = restrictionId ? Number(restrictionId) : undefined;
      // const idForStatus = active ? Boolean(active) : undefined;
      const hasAccess = await isUserHasAccess(userToken.userId,userToken.workspaceId, permissionTypeIds.roles, perAccessIds.view);
      if (hasAccess) {
        const restrictionId = await getUserRoleRestrictionId(userToken.userId, userToken.workspaceId);
        let roles = [];
        switch (restrictionId) {
          // case roleRestrictionIds.own:
          //   // the below query will return all roles who are created by the current user
          //   roles = await prisma.role.findMany({
          //     where: {
          //       AND: {
          //         workspaceId: userToken.workspaceId,
          //         active: roleActive,
          //         createdById: userToken.userId,
          //         restrictionId: idForRestriction,
          //       },
          //       OR: searchArr,
          //     },
          //     take: maxTake,
          //     select: roleSelectSome,
          //   });
          //   break;
          // case roleRestrictionIds.subordinates:
          //   // the below query will return all roles which are created by the subordinates of the current user and the roles which are created by the current user
          //   const subordinateIds = await getSubordinateIds(userToken.userId, userToken.workspaceId);
          //   roles = await prisma.role.findMany({
          //     where: {
          //       AND: {
          //         workspaceId: userToken.workspaceId,
          //         active: roleActive,
          //         createdById: { in: [...subordinateIds, userToken.userId] },
          //         restrictionId: idForRestriction,
          //       },
          //       OR: searchArr,
          //     },
          //     take: maxTake,
          //     select: roleSelectSome,
          //   });
          //   break;
          case roleRestrictionIds.none:
            // the below query will return all roles of the current user's workspace
            roles = await prisma.role.findMany({
              where: {
                workspaceId: userToken.workspaceId,
                active: roleActive,
                restrictionId: idForRestriction,
                OR: searchArr,
              },
              take: maxTake,
              select: roleSelectSome,
            });
            break;
          default:
            roles = [];
            break;
        }
        response({ res, success: true, status_code: 200, data: roles, message: "Roles fetched successfully" });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 401,
          message: "You don't have access to view Projects",
        });
        return;
      }
    } 
    else if (req.method === "POST") {
      const hasAccess = await isUserHasAccess(userToken.userId,userToken.workspaceId, permissionTypeIds.roles, perAccessIds.create);
      if (hasAccess) {
        const { roleName, roleDescription, restrictionId, permissions } = req.body;
        if (!roleName || !permissions || !restrictionId) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "RoleName, it's permissions and restrictionId are required",
          });
          return;
        }

        const roleExists = await prisma.role.findFirst({
          where: {
            name: roleName,
            workspaceId: userToken.workspaceId,
          },
        });

        if (roleExists) {
          response({
            res,
            success: false,
            status_code: 409,
            message: "Role with this name already exists",
          });
          return;
        }

        if (Array.isArray(permissions)) {
          const counts = await getRecordCounts(userToken.workspaceId);
          const [role, updateCount] = await prisma.$transaction([
            prisma.role.create({
              data: {
                id: counts.role + 1,
                name: roleName,
                description: roleDescription,
                workspaceId: userToken.workspaceId,
                createdById: userToken.userId,
                restrictionId: restrictionId,
                permissions: {
                  create: permissions.map((p) => ({
                    permissionId: p.permissionId,
                    accessLevel: p.accessId,
                  })),
                },
              },
            }),
            prisma.recordCounts.update({
              where: {
                workspaceId: userToken.workspaceId,
              },
              data: {
                role: {
                  increment: 1,
                },
              },
            }),
          ]);

          if (role) {
            // update role cache, here it creates new cache for role insted of upadting
            // it returns a promise but dont await for it here
            updateRoleCache(role.id, userToken.workspaceId);
          }
          response({ res, success: true, status_code: 200, data: [role], message: "Role created successfully" });
          return;
        } else {
          response({
            res,
            success: false,
            status_code: 422,
            message: "permissions is not array, please pass array of permissions",
          });
          return;
        }
      } else {
        response({
          res,
          success: false,
          status_code: 401,
          message: "You don't have access to create Roles",
        });
        return;
      }
    } else if (req.method === "PATCH") {
      // we use patch request to delete multiple records in batch
      // delete role cache
      // for (id of ids) redisDelRole(role.id, userToken.workspaceId);
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "method not allowed",
      });
      return;
    }
  } catch (err) {
    console.error("error in role index file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
