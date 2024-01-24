import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { timeEntryStatus } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { roleRestrictionIds } from "../../../../DBConstants";
import { getProjIdsWherePmis, getUserRoleRestrictionId } from "../../../../lib/backendUtils";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const hasAccess = true;
      if (hasAccess) {
        const restrictionId = await getUserRoleRestrictionId(userToken.userId, userToken.workspaceId);
        const statusCount = [{ approved: 0 }, { pending: 0 }, { rejected: 0 }];
        switch (restrictionId) {
          case roleRestrictionIds.own:
            statusCount[0].approved = await prisma.todaysTask.count({
              where: {
                workspaceId: userToken.workspaceId,
                createdById: userToken.userId,
                status: timeEntryStatus.Approved,
              },
            });
            statusCount[1].pending = await prisma.todaysTask.count({
              where: {
                workspaceId: userToken.workspaceId,
                createdById: userToken.userId,
                status: timeEntryStatus.Pending,
              },
            });
            statusCount[2].rejected = await prisma.todaysTask.count({
              where: {
                workspaceId: userToken.workspaceId,
                createdById: userToken.userId,
                status: timeEntryStatus.Rejected,
              },
            });
            break;
          case roleRestrictionIds.subordinates:
            const projectPmIds = await getProjIdsWherePmis(userToken.userId, userToken.workspaceId);
            statusCount[0].approved = await prisma.todaysTask.count({
              where: {
                workspaceId: userToken.workspaceId,
                createdById: userToken.userId,
                status: timeEntryStatus.Approved,
                projectId: { in: projectPmIds },
              },
            });
            statusCount[1].pending = await prisma.todaysTask.count({
              where: {
                workspaceId: userToken.workspaceId,
                createdById: userToken.userId,
                status: timeEntryStatus.Pending,
                projectId: { in: projectPmIds },
              },
            });
            statusCount[2].rejected = await prisma.todaysTask.count({
              where: {
                workspaceId: userToken.workspaceId,
                createdById: userToken.userId,
                status: timeEntryStatus.Rejected,
                projectId: { in: projectPmIds },
              },
            });
            break;
          case roleRestrictionIds.none:
            statusCount[0].approved = await prisma.todaysTask.count({
              where: {
                workspaceId: userToken.workspaceId,
                status: timeEntryStatus.Approved,
              },
            });
            statusCount[1].pending = await prisma.todaysTask.count({
              where: {
                workspaceId: userToken.workspaceId,
                status: timeEntryStatus.Pending,
              },
            });
            statusCount[2].rejected = await prisma.todaysTask.count({
              where: {
                workspaceId: userToken.workspaceId,
                status: timeEntryStatus.Rejected,
              },
            });
            break;
          default:
            break;
        }
        response({
          res,
          success: true,
          status_code: 200,
          data: statusCount,
          message: "Today's task count fetched successfully",
        });
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You are not allowed to access this resource",
        });
      }
    } else {
      response({
        res,
        success: false,
        status_code: 405,
        message: "Method Not Allowed",
      });
    }
  } catch (err) {
    console.error("error in todays task count file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
