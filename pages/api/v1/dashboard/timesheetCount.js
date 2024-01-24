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
        // create an array of object with keys as approved , pending and rejected to store the count of each status
        const statusCount = [{ approved: 0 }, { pending: 0 }, { rejected: 0 }];
        switch (restrictionId) {
          case roleRestrictionIds.own:
            // get the count of all the timesheets with status approved
            statusCount[0].approved = await prisma.timesheet.count({
              where: {
                workspaceId: userToken.workspaceId,
                status: timeEntryStatus.Approved,
                createdById: userToken.userId,
              },
            });
            // get the count of all the timesheets with status pending
            statusCount[1].pending = await prisma.timesheet.count({
              where: {
                workspaceId: userToken.workspaceId,
                status: timeEntryStatus.Pending,
                createdById: userToken.userId,
              },
            });
            // get the count of all the timesheets with status rejected
            statusCount[2].rejected = await prisma.timesheet.count({
              where: {
                workspaceId: userToken.workspaceId,
                status: timeEntryStatus.Rejected,
                createdById: userToken.userId,
              },
            });
            break;
          case roleRestrictionIds.subordinates:
            const projectPmIds = await getProjIdsWherePmis(userToken.userId, userToken.workspaceId);
            // get the count of all the timesheets with status approved
            statusCount[0].approved = await prisma.timesheet.count({
              where: {
                workspaceId: userToken.workspaceId,
                status: timeEntryStatus.Approved,
                projectId: { in: projectPmIds },
              },
            });
            // get the count of all the timesheets with status pending
            statusCount[1].pending = await prisma.timesheet.count({
              where: {
                workspaceId: userToken.workspaceId,
                status: timeEntryStatus.Pending,
                projectId: { in: projectPmIds },
              },
            });

            // get the count of all the timesheets with status rejected
            statusCount[2].rejected = await prisma.timesheet.count({
              where: {
                workspaceId: userToken.workspaceId,
                status: timeEntryStatus.Rejected,
                projectId: { in: projectPmIds },
              },
            });
            break;
          case roleRestrictionIds.none:
            // get the count of all the timesheets with status approved
            statusCount[0].approved = await prisma.timesheet.count({
              where: {
                workspaceId: userToken.workspaceId,
                status: timeEntryStatus.Approved,
              },
            });
            // get the count of all the timesheets with status pending
            statusCount[1].pending = await prisma.timesheet.count({
              where: {
                workspaceId: userToken.workspaceId,
                status: timeEntryStatus.Pending,
              },
            });
            // get the count of all the timesheets with status rejected
            statusCount[2].rejected = await prisma.timesheet.count({
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
          message: "Timesheet count fetched successfully",
          data: statusCount,
        });
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to view this page",
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
    console.error("error in timesheet count file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
