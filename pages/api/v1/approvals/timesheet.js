import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { timesheetSelectStatusPending } from "../../../../lib/constants";
import { timeEntryStatus } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { getUserRoleRestrictionId, isUserHasAccess } from "../../../../lib/backendUtils";
import { ApprovalStatus } from "@prisma/client";
import { perAccessIds, permissionTypeIds, roleRestrictionIds } from "../../../../DBConstants";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { projectId, createdById, startDate, endDate } = req.query;
      const newEndDate = endDate ? new Date(endDate) : undefined; // Parse the endDate if provided
      const newStartDate = startDate ? new Date(startDate) : undefined; // Parse the startDate if provided
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.approvals,
        perAccessIds.view,
        // COMMENTING THE BELOW LINE FOR NOW AS IT IS NOT WORKING
        // projectId
      );
      if (hasAccess) {
        const restrictionId = await getUserRoleRestrictionId(userToken.userId, userToken.workspaceId);
        let timesheet = [];
        switch (restrictionId) {
          case roleRestrictionIds.subordinates:
            // select all timesheets in which project contains pmId as current user
            timesheet = await prisma.timesheet.findMany({
              where: {
                workspaceId: userToken.workspaceId,
                status: timeEntryStatus.Pending,
                submittedForApproval: true,
                projectId: projectId ? Number(projectId) : undefined,
                createdById: createdById ? Number(createdById) : undefined,
                // date: startDate && endDate ? { gte: new Date(startDate), lte: new Date(endDate) } : undefined,
                date: {
                  gte: newStartDate, // Use the parsed startDate
                  lte: newEndDate ? new Date(newEndDate.getTime() + 86400000) : undefined, // Add one day to endDate if provided
                },
                project: {
                  is: {
                    pmId: userToken.userId,
                  },
                },
              },
              orderBy: [
                {
                  date: "desc",
                },
              ],
              select: timesheetSelectStatusPending,
            });
            break;
          case roleRestrictionIds.none:
            timesheet = await prisma.timesheet.findMany({
              where: {
                workspaceId: userToken.workspaceId,
                status: timeEntryStatus.Pending,
                submittedForApproval: true,
                projectId: projectId ? Number(projectId) : undefined,
                createdById: createdById ? Number(createdById) : undefined,
                // date: startDate && endDate ? { gte: new Date(startDate), lte: new Date(endDate) } : undefined,
                date: {
                  gte: newStartDate, // Use the parsed startDate
                  lte: newEndDate ? new Date(newEndDate.getTime() + 86400000) : undefined, // Add one day to endDate if provided
                },
              },
              orderBy: [
                {
                  date: "desc",
                },
              ],
              select: timesheetSelectStatusPending,
            });
            break;
          default:
            break;
        }
        response({
          res,
          success: true,
          status_code: 200,
          data: timesheet,
          message: "Timesheet fetched successfully",
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 401,
          message: "You don't have access to view Timesheet",
        });
        return;
      }
    } else if (req.method === "PATCH") {
      // const hasAccess = await isUserPmOrSupervisor(userToken.userId, userToken.workspaceId);
      const { id: ids, approved, rejected, rejectionNote } = req.body;
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.approvals,
        perAccessIds.view,
        { projectIds: ids }
      );
      if (hasAccess) {
        if (!ids) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Please provide all the required fields",
          });
          return;
        }
        if (Array.isArray(ids) && ids.length > 0) {
          let updatedTimesheet = [];
          ids.map(async (id) => {
            updatedTimesheet = await prisma.timesheet.update({
              where: {
                workspaceId_id: { id: Number(id), workspaceId: userToken.workspaceId },
                status: ApprovalStatus.Pending,
              },
              data: {
                status: approved ? timeEntryStatus.Approved : timeEntryStatus.Rejected,
                approved: approved ? approved : undefined,
                rejected: rejected ? rejected : undefined,
                approvedAt: approved ? new Date() : undefined,
                approvedById: approved ? userToken.userId : undefined,
                rejectedAt: rejected ? new Date() : undefined,
                rejectedById: rejected ? userToken.userId : undefined,
                rejectionNote: rejected ? rejectionNote : undefined,
              },
            });
          });
          response({
            res,
            success: true,
            status_code: 200,
            data: [updatedTimesheet],
            message: "Timesheet updated successfully",
          });
          return;
        } else {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Please provide all the required fields",
          });
          return;
        }
      } else {
        response({
          res,
          success: false,
          status_code: 401,
          message: "You don't have access to update Timesheet",
        });
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "Method not allowed",
      });
    }
  } catch (err) {
    console.log("error in approvals/index.js", err);
    response({ res, success: false, status_code: 500, message: "Some Internal Error Occured. Please try again later" });
  }
}
