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
        permissionTypeIds.users,
        perAccessIds.view
      );
      if (hasAccess) {
        const restrictionId = await getUserRoleRestrictionId(userToken.userId, userToken.workspaceId);

        let userCount = [{ count: 0 }];
        switch (restrictionId) {
          case roleRestrictionIds.own:
            userCount[0].count = await prisma.user.count({
              where: {
                workspaceId: userToken.workspaceId,
                createdBy: userToken.userId,
                active: true,
              },
            });
            break;
          case roleRestrictionIds.subordinates:
            const projectPMIds = await getProjIdsWherePmis(userToken.userId, userToken.workspaceId);
            userCount[0].count = await prisma.user.count({
              where: {
                workspaceId: userToken.workspaceId,
                active: true,
                id: { in: projectPMIds },
              },
            });
            break;
          case roleRestrictionIds.none:
            userCount[0].count = await prisma.user.count({
              where: {
                workspaceId: userToken.workspaceId,
                active: true,
              },
            });
            break;
          default:
            userCount[0].count = 0;
            break;
        }

        response({
          res,
          success: true,
          status_code: 200,
          message: "User count fetched successfully",
          data: userCount,
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to view User Count",
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
    console.error("error in user index file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
