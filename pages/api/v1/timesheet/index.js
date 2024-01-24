import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { maxTake, timeEntryStatus } from "../../../../lib/constants";
import { getProjectPMEmail, getRecordCounts, getTimesheetSettingsCache } from "../../../../lib/backendUtils";
import sendEmail, { sendTimeApprovalEmail } from "../../../../lib/send-email";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { projectId, taskId, status, startDate, endDate } = req.query;
      const idForProject = projectId ? Number(projectId) : undefined;
      const idForTask = taskId ? Number(taskId) : undefined;
      const idForStatus = status ? status : undefined;
      // const newEndDate = new Date(endDate).getDate() + 1;
      // const newNewDate = new Date();
      // newNewDate.setDate(newNewDate.getDate());
      const newEndDate = endDate ? new Date(endDate) : undefined; // Parse the endDate if provided
      const newStartDate = startDate ? new Date(startDate) : undefined; // Parse the startDate if provided
      const timesheets = await prisma.timesheet.findMany({
        where: {
          workspaceId: userToken.workspaceId,
          // in this api user will see its own timesheets
          createdById: userToken.userId,
          projectId: idForProject,
          taskId: idForTask,
          status: idForStatus,
          // date: startDate && endDate ? { gte: new Date(startDate), lte: new Date(newNewDate) } : undefined,
          date: {
            gte: newStartDate, // Use the parsed startDate
            lte: newEndDate ? new Date(newEndDate.getTime() + 86400000) : undefined, // Add one day to endDate if provided
          },
        },
        take: maxTake,
        orderBy: [
          {
            date: "desc",
          },
        ],
        select: {
          id: true,
          date: true,
          duration: true,
          description: true,
          approved: true,
          taskId: true,
          status: true,
          ticket: true,
          task: {
            select: {
              name: true,
              id: true,
            },
          },
          projectId: true,
          project: {
            select: {
              name: true,
              id: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      response({
        res,
        success: true,
        status_code: 200,
        data: timesheets,
        message: "Timesheet fetched successfully",
      });
      return;
    } else if (req.method === "POST") {
      const {
        projectId,
        taskId,
        date,
        duration,
        ticket,
        description,
        submittedForApproval,
        multiple,
        totalHrs,
        multipleTimesheetsData,
        resourceAllocationId,
      } = req.body;
      if (multiple) {
        if (!Array.isArray(multipleTimesheetsData)) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Please provide multiple multipleTimesheetsData as array of objects",
          });
          return;
        }
        const timesheetSettings = await getTimesheetSettingsCache(userToken.workspaceId);
        let projectIdsForMail = [];

        const counts = await getRecordCounts(userToken.workspaceId);
        let timesheetCount = counts.timesheet;
        const [timesheets, updateCount] = await prisma.$transaction([
          prisma.timesheet.createMany({
            data: multipleTimesheetsData.map((timesheet) => {
              let timeStatus = timeEntryStatus.Draft;
              if (timesheet.submittedForApproval === true) {
                if (timesheetSettings.approvalEnabled) {
                  timeStatus = timeEntryStatus.Pending;
                } else {
                  // approve timesheet if approval is not enabled
                  timeStatus = timeEntryStatus.Approved;
                }
                projectIdsForMail.push(timesheet.projectId);
              }
              return {
                id: ++timesheetCount,
                workspaceId: userToken.workspaceId,
                createdById: userToken.userId,
                projectId: Number(timesheet.projectId),
                taskId: Number(timesheet.taskId),
                date: new Date(timesheet.date),
                duration: Number(timesheet.duration),
                ticket: timesheet.ticket,
                description: timesheet.description,
                submittedForApproval: timesheet.submittedForApproval,
                resourceAllocationId: timesheet.resourceAllocationId,
                status: timeStatus,
              };
            }),
          }),
          prisma.recordCounts.update({
            where: {
              workspaceId: userToken.workspaceId,
            },
            data: {
              timesheet: {
                increment: multipleTimesheetsData.length,
              },
            },
          }),
        ]);

        response({
          res,
          success: true,
          status_code: 200,
          data: [timesheets],
          message: "Timesheet created successfully",
        });

        if (timesheetSettings.sendMailForApproval) {
          //don't await for this email function
          sendTimeApprovalEmail({
            userId: userToken.userId,
            workspaceId: userToken.workspaceId,
            multiple: true,
            projectIds: projectIdsForMail,
            isTimesheet: true,
            totalHrs: totalHrs,
            timeEntryData: multipleTimesheetsData,
          });
        }
        return;
      }

      if (!projectId || !taskId || !date) {
        response({
          res,
          success: false,
          status_code: 400,
          message: "Please provide ProjectId, TasId, Date and Duration",
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

      const counts = await getRecordCounts(userToken.workspaceId);
      const [timesheet, updateCount] = await prisma.$transaction([
        prisma.timesheet.create({
          data: {
            id: counts.timesheet + 1,
            workspaceId: userToken.workspaceId,
            projectId: Number(projectId),
            taskId: Number(taskId),
            date: new Date(date),
            duration: Number(duration),
            ticket: ticket,
            description: description,
            createdById: userToken.userId,
            submittedForApproval: submittedForApproval,
            status: timeStatus,
            resourceAllocationId: resourceAllocationId,
          },
        }),
        prisma.recordCounts.update({
          where: {
            workspaceId: userToken.workspaceId,
          },
          data: {
            timesheet: {
              increment: 1,
            },
          },
        }),
      ]);

      response({ res, success: true, status_code: 200, data: [timesheet], message: "Timesheet created successfully" });
      // send email afetr response for fast response
      if (sendMailForApproval) {
        //don't await for this email function
        sendTimeApprovalEmail({
          projectId,
          userId: userToken.userId,
          workspaceId: userToken.workspaceId,
          isTimesheet: true,
          timeEntryData: multipleTimesheetsData,
        });
      }
      return;
    } else if (req.method === "PATCH") {
      const { timesheetIds, submittedForApproval, projectIds } = req.body;
      let timeStatus = timeEntryStatus.Draft;
      const timesheetSettings = await getTimesheetSettingsCache(userToken.workspaceId);
      if (submittedForApproval === true) {
        if (timesheetSettings.approvalEnabled) {
          timeStatus = timeEntryStatus.Pending;
        } else {
          // approve timesheet if approval is not enabled
          timeStatus = timeEntryStatus.Approved;
        }
      }
      if (Array.isArray(timesheetIds)) {
        const timesheet = await prisma.timesheet.updateMany({
          where: {
            workspaceId: userToken.workspaceId,
            // in this api user will see its own timesheets
            createdById: userToken.userId,
            id: { in: timesheetIds },
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
          data: [timesheet],
          message: "Timesheet updated successfully",
        });

        if (timesheetSettings.sendMailForApproval && Array.isArray(projectIds)) {
          //don't await for this email function
          sendTimeApprovalEmail({
            userId: userToken.userId,
            workspaceId: userToken.workspaceId,
            multiple: true,
            projectIds: projectIds,
            isTimesheet: true,
          });
        }
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 400,
          message: "Please provide timesheet ids and it should be array",
        });
        return;
      }
    } else {
      response({ res, success: false, status_code: 400, message: "Method not Allowed" });
    }
  } catch (err) {
    console.log("error in timesheet/index.js", err);
    response({ res, success: false, status_code: 500, message: "Some Internal Error Occured. Please try again later" });
  }
}
