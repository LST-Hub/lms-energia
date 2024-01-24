import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { todayTaskSelectAll, timeEntryStatus } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import {
  getProjectNameFromId,
  getTaskNameFromId,
  getTodaysTaskSettingsCache,
  handlePrismaDeleteError,
  isTodaysTaskEnabled,
} from "../../../../lib/backendUtils";
import { sendTimeApprovalEmail } from "../../../../lib/send-email";
import { convertSecToTime } from "../../../../src/utils/time";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    const isTodayTaskEnabled = await isTodaysTaskEnabled(userToken.workspaceId);
    if (!isTodayTaskEnabled) {
      response({
        res,
        success: false,
        status_code: 404,
        message: "Today's task is not enabled for this workspace.",
      });
      return;
    }
    const id = Number(req.query.did);
    let todayTaskDetails = null;
    if (id) {
      todayTaskDetails = await prisma.todaysTask.findUnique({
        where: {
          workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
        },
        select: todayTaskSelectAll,
      });
      if (!todayTaskDetails) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "The requested Today's task does not exist.",
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "Today's task Id in URL is required",
      });
      return;
    }
    if (req.method === "GET") {
      response({
        res,
        success: true,
        status_code: 200,
        data: [todayTaskDetails],
        message: "Today's task details fetched successfully",
      });
      return;
    } else if (req.method === "PUT") {
      const { projectId, taskId, date, duration, description, submittedForApproval, ticket } = req.body;
      if (!projectId || !taskId) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "Please provide project, task, duration.",
        });
        return;
      } else {
        let timeStatus = timeEntryStatus.Draft;
        let sendMailForApproval = false;
        const todaysTaskSettings = await getTodaysTaskSettingsCache(userToken.workspaceId);
        const projectName = await getProjectNameFromId(projectId, userToken.workspaceId);
        const taskName = await getTaskNameFromId(taskId, userToken.workspaceId);

        if (submittedForApproval === true) {
          if (todaysTaskSettings.approvalEnabled) {
            timeStatus = timeEntryStatus.Pending;
          } else {
            // approve timesheet if approval is not enabled
            timeStatus = timeEntryStatus.Approved;
          }
          // send email after returning response
          if (todaysTaskSettings.sendMailForApproval) {
            sendMailForApproval = true;
          }
        }
        const updatedTodayTask = await prisma.todaysTask.update({
          where: {
            workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
          },
          data: {
            projectId: projectId,
            taskId: taskId,
            duration: duration,
            date: new Date(date),
            description: description,
            submittedForApproval: submittedForApproval,
            status: timeStatus,
            ticket: ticket,
          },
          select: todayTaskSelectAll,
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: [updatedTodayTask],
          message: "Today's task updated successfully",
        });
        if (todaysTaskSettings.sendMailForApproval && sendMailForApproval) {
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
            isTodaytask: true,
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
        const todaysTaskSetting = await getTodaysTaskSettingsCache(userToken.workspaceId);
        if (todaysTaskSetting.approvalEnabled) {
          timeStatus = timeEntryStatus.Pending;
        } else {
          // approve timesheet if approval is not enabled
          timeStatus = timeEntryStatus.Approved;
        }
        // send email after returning response
        if (todaysTaskSetting.sendMailForApproval) {
          sendMailForApproval = true;
        }
      }
      const updateApprovalStatus = await prisma.todaysTask.update({
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
        message: "Today's task updated successfully",
      });

      if (sendMailForApproval) {
        //don't await for this email function
        sendTimeApprovalEmail({
          projectId,
          userId: userToken.userId,
          workspaceId: userToken.workspaceId,
          isTodaytask: true,
        });
      }
    } else if (req.method === "DELETE") {
      try {
        const deletedTodayTask = await prisma.todaysTask.delete({
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
          message: "Today's task deleted successfully",
        });
        return;
      } catch (e) {
        const errRes = handlePrismaDeleteError(e, "Today's task");
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
    console.error("error in Today's task/[did] file", error);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
    return;
  }
}
