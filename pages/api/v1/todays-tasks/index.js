import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { todayTaskSelectSome, maxTake, timeEntryStatus } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { getRecordCounts, getTodaysTaskSettingsCache, isTodaysTaskEnabled } from "../../../../lib/backendUtils";
import { sendTimeApprovalEmail } from "../../../../lib/send-email";

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
      const todayTask = await prisma.todaysTask.findMany({
        where: {
          workspaceId: userToken.workspaceId,
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
        orderBy: {
          date: "desc",
        },
        select: todayTaskSelectSome,
      });
      response({
        res,
        success: true,
        status_code: 200,
        data: todayTask,
        message: "Today's task fetched successfully",
      });
    } else if (req.method === "POST") {
      const {
        projectId,
        taskId,
        duration,
        ticket,
        description,
        submittedForApproval,
        multiple,
        totalHrs,
        multipleTodaysTaskData,
        resourceAllocationId,
      } = req.body;

      if (multiple) {
        if (!Array.isArray(multipleTodaysTaskData)) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Please provide multiple multipleTodaysTaskData as array of objects",
          });
          return;
        }
        const todaysTaskSettings = await getTodaysTaskSettingsCache(userToken.workspaceId);
        let projectIdsForMail = [];

        const counts = await getRecordCounts(userToken.workspaceId);
        let ttCount = counts.todaysTask;
        const [todaysTask, updateCount] = await prisma.$transaction([
          prisma.todaysTask.createMany({
            data: multipleTodaysTaskData.map((task) => {
              let timeStatus = timeEntryStatus.Draft;
              if (task.submittedForApproval === true) {
                if (todaysTaskSettings.approvalEnabled) {
                  timeStatus = timeEntryStatus.Pending;
                } else {
                  // approve todays tasks if approval is not enabled
                  timeStatus = timeEntryStatus.Approved;
                }
                projectIdsForMail.push(task.projectId);
              }
              return {
                id: ++ttCount,
                workspaceId: userToken.workspaceId,
                createdById: userToken.userId,
                projectId: Number(task.projectId),
                taskId: Number(task.taskId),
                date: new Date(task.date),
                duration: Number(task.duration),
                ticket: task.ticket,
                description: task.description,
                submittedForApproval: task.submittedForApproval,
                resourceAllocationId: task.resourceAllocationId,
                status: timeStatus,
              };
            }),
          }),
          prisma.recordCounts.update({
            where: {
              workspaceId: userToken.workspaceId,
            },
            data: {
              todaysTask: {
                increment: multipleTodaysTaskData.length,
              },
            },
          }),
        ]);

        response({
          res,
          success: true,
          status_code: 200,
          data: [todaysTask],
          message: "Today's Tasks created successfully",
        });
        if (todaysTaskSettings.sendMailForApproval) {
          //don't await for this email function
          sendTimeApprovalEmail({
            userId: userToken.userId,
            workspaceId: userToken.workspaceId,
            multiple: true,
            projectIds: projectIdsForMail,
            isTodaytask: true,
            totalHrs: totalHrs,
            timeEntryData: multipleTodaysTaskData,
          });
        }
        return;
      }

      if (!projectId || !taskId) {
        response({
          res,
          success: false,
          status_code: 400,
          message: "Please provide Project Name, Task Name and Duration",
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
          // approve todays tasks if approval is not enabled
          timeStatus = timeEntryStatus.Approved;
        }
        // send email after returning response
        if (todaysTaskSetting.sendMailForApproval) {
          sendMailForApproval = true;
        }
      }

      const counts = await getRecordCounts(userToken.workspaceId);
      const [todayTask, updateCount] = await prisma.$transaction([
        prisma.todaysTask.create({
          data: {
            id: counts.todaysTask + 1,
            workspaceId: userToken.workspaceId,
            projectId: projectId,
            taskId: taskId,
            duration: duration,
            date: new Date(),
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
            todaysTask: {
              increment: 1,
            },
          },
        }),
      ]);

      response({
        res,
        success: true,
        status_code: 200,
        data: [todayTask],
        message: "Today's task created successfully",
      });
      // send email afetr response for fast response
      if (sendMailForApproval) {
        //don't await for this email function
        sendTimeApprovalEmail({
          projectId,
          userId: userToken.userId,
          workspaceId: userToken.workspaceId,
          isTodaytask: true,
          timeEntryData: multipleTodaysTaskData,
        });
      }
      return;
    } else if (req.method === "PATCH") {
      const { todaysTaskIds, submittedForApproval, projectIds } = req.body;
      if (Array.isArray(todaysTaskIds) && todaysTaskIds.length > 0) {
        let timeStatus = timeEntryStatus.Draft;
        const todaysTaskSettings = await getTodaysTaskSettingsCache(userToken.workspaceId);
        if (submittedForApproval === true) {
          if (todaysTaskSettings.approvalEnabled) {
            timeStatus = timeEntryStatus.Pending;
          } else {
            // approve todays tasks if approval is not enabled
            timeStatus = timeEntryStatus.Approved;
          }
        }
        const todayTask = await prisma.todaysTask.updateMany({
          where: {
            id: { in: todaysTaskIds },
            workspaceId: userToken.workspaceId,
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
          data: [todayTask],
          message: "Today's task updated successfully",
        });
        // if (todaysTaskSettings.sendMailForApproval && Array.isArray(projectIds)) {
        //   //don't await for this email function
        //   sendTimeApprovalEmail({
        //     userId: userToken.userId,
        //     workspaceId: userToken.workspaceId,
        //     multiple: true,
        //     projectIds: projectIds,
        //     isTodaytask: true,
        //   });
        // }
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 400,
          message: "Please provide reportIds, and it should be array",
        });
        return;
      }
    } else {
      response({ res, success: false, status_code: 405, message: "Method Not Allowed" });
    }
  } catch (err) {
    console.log("error in todayTask/index.js", err);
    response({ res, success: false, status_code: 500, message: "Some Internal Error Occured. Please try again later" });
  }
}
