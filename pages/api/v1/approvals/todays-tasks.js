import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { todayTaskSelectStatusPending } from "../../../../lib/constants";
import { timeEntryStatus } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { getUserRoleRestrictionId, isTodaysTaskEnabled, isUserHasAccess } from "../../../../lib/backendUtils";
import { ApprovalStatus } from "@prisma/client";
import { perAccessIds, permissionTypeIds, roleRestrictionIds } from "../../../../DBConstants";

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
      const { projectId, createdById, startDate, endDate } = req.query;
      const newEndDate = endDate ? new Date(endDate) : undefined; // Parse the endDate if provided
      const newStartDate = startDate ? new Date(startDate) : undefined; // Parse the startDate if provided
      // const adminAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      // if (adminAccess) {
      //   // console.log("adminAccess", adminAccess);
      //   const todayTask = await prisma.todaysTask.findMany({
      //     where: {
      //       workspaceId: userToken.workspaceId,
      //       status: timeEntryStatus.Pending,
      //       submittedForApproval: true,
      //       projectId: projectId ? Number(projectId) : undefined,
      //       createdById: createdById ? createdById : undefined,
      //       date: startDate && endDate ? { gte: new Date(startDate), lte: new Date(endDate) } : undefined,
      //     },
      //     take: maxTake,
      //     select: todayTaskSelectStatusPending,
      //   });
      //   response({
      //     res,
      //     success: true,
      //     status_code: 200,
      //     data: todayTask,
      //     message: "Today's task fetched successfully",
      //   });
      //   return;
      // }

      // // const hasAccess = await isUserPmOrSupervisor(userToken.userId);
      // const checkUserPm = await isUserPm(userToken.userId, userToken.workspaceId);
      // const checkUserSupervisor = await isUserSupervisor(userToken.userId, userToken.workspaceId);
      // if (checkUserPm || checkUserSupervisor) {
      //   if (checkUserPm && !checkUserSupervisor) {
      //     const todayTask = await prisma.user.findMany({
      //       where: {
      //         id: userToken.userId,
      //         workspaceId: userToken.workspaceId,
      //       },
      //       take: maxTake,
      //       select: {
      //         pmOf: {
      //           select: {
      //             todaysTasks: {
      //               where: {
      //                 status: timeEntryStatus.Pending,
      //                 submittedForApproval: true,
      //                 projectId: projectId ? Number(projectId) : undefined,
      //                 createdById: createdById ? createdById : undefined,
      //                 date: startDate && endDate ? { gte: new Date(startDate), lte: new Date(endDate) } : undefined,
      //               },
      //               select: todayTaskSelectStatusPending,
      //             },
      //           },
      //         },
      //       },
      //     });

      //     const todayTaskData = [];
      //     todayTask.map((user) => {
      //       user.pmOf.map((project) => {
      //         project.todayTasks?.map((todayTask) => {
      //           todayTaskData.push(todayTask);
      //         });
      //       });
      //     });

      //     // get dat start report data from todayTask object and send formated data in response
      //     response({
      //       res,
      //       success: true,
      //       status_code: 200,
      //       data: todayTaskData,
      //       message: "Today's task fetched successfully",
      //     });
      //     return;
      //   } else if (!checkUserPm && checkUserSupervisor) {
      //     const todayTask = await prisma.user.findMany({
      //       where: {
      //         id: userToken.userId,
      //         workspaceId: userToken.workspaceId,
      //       },
      //       take: maxTake,
      //       select: {
      //         supervisorOf: {
      //           select: {
      //             createdTodaysTasks: {
      //               where: {
      //                 status: timeEntryStatus.Pending,
      //                 submittedForApproval: true,
      //                 projectId: projectId ? Number(projectId) : undefined,
      //                 createdById: createdById ? createdById : undefined,
      //                 date: startDate && endDate ? { gte: new Date(startDate), lte: new Date(endDate) } : undefined,

      //                 project: {
      //                   is: {
      //                     canSupervisorApproveTime: true,
      //                   },
      //                 },
      //               },
      //             },
      //           },
      //         },
      //       },
      //     });

      //     const todayTaskData = [];
      //     todayTask.map((user) => {
      //       user.supervisorOf.map((project) => {
      //         project.createdTodaysTasks?.map((todayTask) => {
      //           todayTaskData.push(todayTask);
      //         });
      //       });
      //     });

      //     // get dat start report data from todayTask object and send formated data in response
      //     response({
      //       res,
      //       success: true,
      //       status_code: 200,
      //       data: todayTaskData,
      //       message: "Today's task fetched successfully",
      //     });
      //     return;
      //   } else if (checkUserPm && checkUserSupervisor) {
      //     const todayTask = await prisma.user.findMany({
      //       where: {
      //         id: userToken.userId,
      //         workspaceId: userToken.workspaceId,
      //       },
      //       take: maxTake,
      //       select: {
      //         pmOf: {
      //           select: {
      //             todaysTasks: {
      //               where: {
      //                 status: timeEntryStatus.Pending,
      //                 submittedForApproval: true,
      //                 projectId: projectId ? Number(projectId) : undefined,
      //                 createdById: createdById ? createdById : undefined,
      //                 date: startDate && endDate ? { gte: new Date(startDate), lte: new Date(endDate) } : undefined,
      //               },
      //               select: todayTaskSelectStatusPending,
      //             },
      //           },
      //         },
      //         supervisorOf: {
      //           select: {
      //             createdTodaysTasks: {
      //               where: {
      //                 status: timeEntryStatus.Pending,
      //                 submittedForApproval: true,
      //                 date: startDate && endDate ? { gte: new Date(startDate), lte: new Date(endDate) } : undefined,

      //                 project: {
      //                   is: {
      //                     canSupervisorApproveTime: true,
      //                   },
      //                 },
      //               },
      //               select: todayTaskSelectStatusPending,
      //             },
      //           },
      //         },
      //       },
      //     });

      //     const todayTaskData = [];

      //     const ids = new Set();

      //     todayTask.map((user) => {
      //       user.pmOf.map((project) => {
      //         project.todaysTasks?.map((todayTask) => {
      //           ids.add(todayTask.id);
      //           todayTaskData.push(todayTask);
      //         });
      //       });
      //       user.supervisorOf.map((project) => {
      //         project.createdTodaysTasks?.map((todayTask) => {
      //           if (!ids.has(todayTask.id)) todayTaskData.push(todayTask);
      //         });
      //       });
      //     });

      //     // get dat start report data from todayTask object and send formated data in response
      //     response({
      //       res,
      //       success: true,
      //       status_code: 200,
      //       data: todayTaskData,
      //       message: "Today's task fetched successfully",
      //     });
      //     return;
      //   } else {
      //     response({
      //       res,
      //       success: false,
      //       status_code: 401,
      //       message: "You don't have access to this resource",
      //     });
      //     return;
      //   }
      // } else {
      //   response({
      //     res,
      //     success: false,
      //     status_code: 401,
      //     message: "You don't have access to this resource",
      //   });
      // }

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
        let todayTask = [];
        switch (restrictionId) {
          case roleRestrictionIds.subordinates:
            todayTask = await prisma.todaysTask.findMany({
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
                // OR: [
                //   {
                //     project: {
                //       is: {
                //         canSupervisorApproveTime: true,
                //       },
                //     },
                //   },
                //   {
                //     project: {
                //       is: {
                //         canPmApproveTime: true,
                //       },
                //     },
                //   },
                // ],
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
              select: todayTaskSelectStatusPending,
            });
            break;
          case roleRestrictionIds.none:
            todayTask = await prisma.todaysTask.findMany({
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
                // project: {
                //   is: {
                //     canSupervisorApproveTime: true,
                //   },
                // },
              },
              orderBy: [
                {
                  date: "desc",
                },
              ],
              select: todayTaskSelectStatusPending,
            });
            break;
          default:
            break;
        }
        response({
          res,
          success: true,
          status_code: 200,
          data: todayTask,
          message: "Today's task fetched successfully",
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 401,
          message: "You don't have access to this resource",
        });
        return;
      }
    } else if (req.method === "PATCH") {
      const { id: ids, approved, rejected, rejectionNote } = req.body;
      // const hasAccess = await isUserPmOrSupervisor(userToken.userId, userToken.workspaceId);
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
          let updatedTodayTask = [];
          ids.map(async (id) => {
            updatedTodayTask = await prisma.todaysTask.update({
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
            data: [updatedTodayTask],
            message: "Today's task updated successfully",
          });
        } else {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Please provide all the required fields",
          });
        }
      } else {
        response({
          res,
          success: false,
          status_code: 401,
          message: "You don't have access to this resource",
        });
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "Method not Allowed",
      });
    }
  } catch (err) {
    console.log("error in todays-tasks.js", err);
    response({ res, success: false, status_code: 500, message: "Some Internal Error Occured. Please try again later" });
  }
}
