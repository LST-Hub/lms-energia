import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { timeEntryStatus, timesheetSelectAll } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import {
  getProjectNameFromId,
  getTaskNameFromId,
  getTimesheetSettingsCache,
  handlePrismaDeleteError,
} from "../../../../lib/backendUtils";
import { sendTimeApprovalEmail } from "../../../../lib/send-email";
import { convertSecToTime } from "../../../../src/utils/time";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    const id = Number(req.query.tid);
    let timesheetDetails = null;
    if (id) {
      timesheetDetails = await prisma.timesheet.findUnique({
        where: {
          workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
        },
        select: timesheetSelectAll,
      });
      if (!timesheetDetails) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "The requested timesheet does not exist.",
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "Timesheet Id in URL is required",
      });
      return;
    }
    if (req.method === "GET") {
      response({
        res,
        success: true,
        status_code: 200,
        data: [timesheetDetails],
        message: "Timesheet details fetched successfully",
      });
      return;
    } else if (req.method === "PUT") {
      const { projectId, taskId, date, duration, description, submittedForApproval, ticket } = req.body;
      if (!projectId || !taskId || !date) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "Please provide project, task, date, duration.",
        });
        return;
      } else {
        let timeStatus = timeEntryStatus.Draft;
        let sendMailForApproval = false;
        const timesheetSettings = await getTimesheetSettingsCache(userToken.workspaceId);
        const projectName = await getProjectNameFromId(projectId, userToken.workspaceId);
        const taskName = await getTaskNameFromId(taskId, userToken.workspaceId);

        if (submittedForApproval === true) {
          if (timesheetSettings.approvalEnabled) {
            timeStatus = timeEntryStatus.Pending;
          } else {
            // approve timesheet if approval is not enabled
            timeStatus = timeEntryStatus.Approved;
          }
          // send email after returning response
          if (timesheetSettings.sendMailForApproval) {
            sendMailForApproval = true;
          }
        }
        const updatedTimesheet = await prisma.timesheet.update({
          where: {
            workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
          },
          data: {
            projectId: projectId,
            taskId: taskId,
            date: new Date(date),
            duration: Number(duration),
            description: description,
            ticket: ticket,
            submittedForApproval: submittedForApproval,
            status: timeStatus,
          },
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: [updatedTimesheet],
          message: "Timesheet updated successfully",
        });
        if (timesheetSettings.sendMailForApproval && sendMailForApproval) {
          let todaysTaskData = [];

          todaysTaskData.push({
            projectName: projectName,
            taskName: taskName,
            duration: duration,
            ticket: ticket,
            description: description,
            date: date,
          });
          //don't await for this email function
          sendTimeApprovalEmail({
            projectId,
            userId: userToken.userId,
            workspaceId: userToken.workspaceId,
            isTimesheet: true,
            totalHrs: convertSecToTime(duration),
            timeEntryData: todaysTaskData,
          });
        }
        return;
      }
    } else if (req.method === "PATCH") {
      const { projectId, submittedForApproval } = req.body;
      if (!projectId) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "projectId is required.",
        });
        return;
      }
      let timeStatus = timeEntryStatus.Draft;
      let sendMailForApproval = false;
      if (submittedForApproval === true) {
        const timesheetSettings = await getTimesheetSettingsCache(userToken.workspaceId);
        if (timesheetSettings.approvalEnabled) {
          timeStatus = timeEntryStatus.Pending;
        } else {
          // approve timesheet if approval is not enabled
          timeStatus = timeEntryStatus.Approved;
        }
        // send email after returning response
        if (timesheetSettings.sendMailForApproval) {
          sendMailForApproval = true;
        }
      }
      const updateApprovalStatus = await prisma.timesheet.update({
        where: {
          workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
        },
        data: {
          submittedForApproval: submittedForApproval,
          status: timeStatus,
        },
      });
      response({
        res,
        success: true,
        status_code: 200,
        data: [updateApprovalStatus],
        message: "Timesheet Submitted for Approval",
      });
      if (sendMailForApproval) {
        //don't await for this email function
        sendTimeApprovalEmail({
          projectId,
          userId: userToken.userId,
          workspaceId: userToken.workspaceId,
          isTimesheet: true,
        });
      }
    } else if (req.method === "DELETE") {
      try {
        const deleteTimesheet = await prisma.timesheet.delete({
          where: {
            workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
          },
        });
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
          message: "Timesheet deleted successfully",
        });
        return;
      } catch (e) {
        const errRes = handlePrismaDeleteError(e, "Timesheet");
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
  } catch (error) {
    console.error("error in timesheet/[tid] file", error);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
    return;
  }
}
