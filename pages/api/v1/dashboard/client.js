import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { maxTake,  DashBoardClientSelectSome } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { perAccessIds, permissionTypeIds, roleRestrictionIds } from "../../../../DBConstants";
import {
  getRecordCounts,
  getSubordinateIds,
  getUserRoleRestrictionId,
  isUserHasAccess,
} from "../../../../lib/backendUtils";
import { minSearchLength } from "../../../../src/utils/Constants";
import { redisDelProject, redisSetProject } from "../../../../lib/redis-operations";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      // const { active, search, pmId, statusId, priorityId } = req.query;
      // let projectActive = undefined;
      // if (active) {
      //   projectActive = active === "true" ? true : false;
      // }
      // const searchArr =
      //   search && search.length >= minSearchLength
      //     ? [
      //         {
      //           // db column name
      //           name: {
      //             startsWith: search,
      //             mode: "insensitive",
      //           },
      //         },
      //         // {
      //         //   projectUsers: {
      //         //     some: {
      //         //       user: {
      //         //         name: {
      //         //           startsWith: search,
      //         //           mode: "insensitive",
      //         //         },
      //         //       },
      //         //     },
      //         //   },
      //         // },
      //       ]
      //     : undefined;
      // const idForPm = pmId ? pmId : undefined; // pmIs is not number, as pm is a user and users have string ids
      // const idForStatus = statusId ? Number(statusId) : undefined;
      // const idForPriority = priorityId ? Number(priorityId) : undefined;

      //get api for client report page 
        
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.clients,
        perAccessIds.view
      );
      if (hasAccess) {
        const restrictionId = await getUserRoleRestrictionId(userToken.userId, userToken.workspaceId);
        let client = [];
        switch (restrictionId) {
          case roleRestrictionIds.own:
            // the below query will return all clients who are created by the current user
            client = await prisma.client.findMany({
              where: {
                AND: {
                  workspaceId: userToken.workspaceId,
                  // active: projectActive,
                  createdById: userToken.userId,
                  // pmId: idForPm,
                  // statusId: idForStatus,
                  // priorityId: idForPriority,
                },
                // OR: searchArr,
              },
              take: maxTake,
              select: DashBoardClientSelectSome,
            });
            break;
          case roleRestrictionIds.subordinates:
            // the below query will return all projects which are created by the subordinates of the current user and the projects which are created by the current user
            // const subordinateIds = await getSubordinateIds(userToken.userId, userToken.workspaceId);
            client = await prisma.client.findMany({
              where: {
                AND: {
                  workspaceId: userToken.workspaceId,
                  // active: projectActive,
                  // pmId: idForPm,
                  // statusId: idForStatus,
                  // priorityId: idForPriority,
                  // OR: [
                  //   {
                  //     createdById: { in: subordinateIds },
                  //   },
                  //   {
                  //     createdById: userToken.userId,
                  //   },
                  // ],
                },
                // OR: searchArr,
              },
              take: maxTake,
              select: DashBoardClientSelectSome,
            });
            break;
          case roleRestrictionIds.none:
            // the below query will return all projects of workspace
            client = await prisma.client.findMany({
              where: {
                workspaceId: userToken.workspaceId,
                // active: projectActive,
                // pmId: idForPm,
                // statusId: idForStatus,
                // priorityId: idForPriority,
                // OR: searchArr,
              },
              take: maxTake,
              select: DashBoardClientSelectSome,
            });
            break;
          default:
            client = [];
            break;
        }

        response({ res, success: true, status_code: 200, data: client, message: "Clients fetched successfully" });
        return;
      } else {
        response({ res, success: false, status_code: 401, message: "You don't have access to view clients" });
        return;
      }
    } else {
      response({ res, success: false, status_code: 405, message: "Method not allowed" });
      return;
    }
  } catch (err) {
    console.error("error in client index file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
