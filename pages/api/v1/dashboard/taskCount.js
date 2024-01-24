import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { maxTake, DashBoardProjectSelectSome } from "../../../../lib/constants";
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
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.projAndTask,
        perAccessIds.view
      );
      if (hasAccess) {
        const restrictionId = await getUserRoleRestrictionId(userToken.userId, userToken.workspaceId);

        let taskCount = [{ count: 0 }];
        switch (restrictionId) {
          case roleRestrictionIds.own:
            taskCount[0].count = await prisma.task.count({
              where: {
                workspaceId: userToken.workspaceId,
                active: true,
                createdBy: userToken.userId,
              },
            });
            break;
          case roleRestrictionIds.subordinates:
            const projectIds = await getProjIdsWherePmis(userToken.userId, userToken.workspaceId);
            taskCount[0].count = await prisma.task.count({
              where: {
                AND: {
                  workspaceId: userToken.workspaceId,
                  active: true,
                  projectId: { in: projectIds },
                },
              },
            });
            break;
          case roleRestrictionIds.none:
            taskCount[0].count = await prisma.task.count({
              where: {
                workspaceId: userToken.workspaceId,
                active: true,
              },
            });
            break;
          default:
            taskCount[0].count = 0;
            break;
        }

        response({
          res,
          success: true,
          status_code: 200,
          message: "Task count fetched successfully",
          data: taskCount,
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to view tasks",
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 405,
        message: "Method Not Allowed",
      });
      return;
    }
  } catch (err) {
    console.error("error in task count file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
