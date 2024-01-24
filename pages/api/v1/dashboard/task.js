import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { maxTake, DashBoardTaskSelectSome } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { perAccessIds, permissionTypeIds, roleRestrictionIds } from "../../../../DBConstants";
import {
  getProjIdsWherePmis,
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

      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.projAndTask,
        perAccessIds.view
      );
      if (hasAccess) {
        const restrictionId = await getUserRoleRestrictionId(userToken.userId, userToken.workspaceId);
        let task = [];
        switch (restrictionId) {
          case roleRestrictionIds.own:
            // the below query will return all clients who are created by the current user
            task = await prisma.task.findMany({
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
              select: DashBoardTaskSelectSome,
            });
            break;
          case roleRestrictionIds.subordinates:
            // the below query will return all projects which are created by the subordinates of the current user and the projects which are created by the current user
            const projectIds = await getProjIdsWherePmis(userToken.userId, userToken.workspaceId);
            task = await prisma.task.findMany({
              where: {
                AND: {
                  workspaceId: userToken.workspaceId,
                  projectId: { in: projectIds },
                },
              },
              take: maxTake,
              select: DashBoardTaskSelectSome,
            });
            break;
          case roleRestrictionIds.none:
            // the below query will return all projects of workspace
            task = await prisma.task.findMany({
              where: {
                workspaceId: userToken.workspaceId,
                // active: projectActive,
                // pmId: idForPm,
                // statusId: idForStatus,
                // priorityId: idForPriority,
                // OR: searchArr,
              },
              take: maxTake,
              select: DashBoardTaskSelectSome,
            });
            break;
          default:
            task = [];
            break;
        }

        response({ res, success: true, status_code: 200, data: task, message: "Tasks fetched successfully" });
        return;
      } else {
        response({ res, success: false, status_code: 401, message: "You don't have access to view tasks" });
        return;
      }
    } else {
      response({ res, success: false, status_code: 405, message: "Method not allowed" });
      return;
    }
  } catch (err) {
    console.error("error in task index file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
