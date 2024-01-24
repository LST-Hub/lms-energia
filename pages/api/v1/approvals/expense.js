import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { expenseSelectStatusPending, maxTake } from "../../../../lib/constants";
import { timeEntryStatus } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { getUserRoleRestrictionId, isUserAdmin, isUserHasAccess, isUserSupervisor } from "../../../../lib/backendUtils";
import { ApprovalStatus } from "@prisma/client";
import { perAccessIds, permissionTypeIds, roleRestrictionIds } from "../../../../DBConstants";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { createdById, startDate, endDate, projectId } = req.query;
      const newEndDate = endDate ? new Date(endDate) : undefined; // Parse the endDate if provided
      const newStartDate = startDate ? new Date(startDate) : undefined; // Parse the startDate if provided
      const adminAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (adminAccess) {
        const expense = await prisma.expense.findMany({
          where: {
            workspaceId: userToken.workspaceId,
            status: timeEntryStatus.Pending,
            submittedForApproval: true,
            createdById: createdById ? Number(createdById) : undefined,
            // date: startDate && endDate ? { gte: new Date(startDate), lte: new Date(endDate) } : undefined,
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
          select: expenseSelectStatusPending,
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: expense,
          message: "Expense fetched successfully",
        });
        return;
      }

      // const hasAccess = await isUserSupervisor(userToken.userId, userToken.workspaceId);
      // if (hasAccess) {
      //   const expense = await prisma.user.findMany({
      //     where: {
      //       id: userToken.userId,
      //       workspaceId: userToken.workspaceId,
      //     },
      //     select: {
      //       supervisorOf: {
      //         select: {
      //           createdExpenses: {
      //             where: {
      //               status: timeEntryStatus.Pending,
      //               submittedForApproval: true,
      //               createdById: createdById ? createdById : undefined,
      //               date: startDate && endDate ? { gte: new Date(startDate), lte: new Date(endDate) } : undefined,
      //             },
      //             select: expenseSelectStatusPending,
      //           },
      //         },
      //       },
      //     },
      //   });

      //   const expenseData = [];
      //   expense.map((user) => {
      //     user.supervisorOf.map((project) => {
      //       project.createdExpenses.map((expense) => {
      //         expenseData.push(expense);
      //       });
      //     });
      //   });

      //   response({
      //     res,
      //     success: true,
      //     status_code: 200,
      //     data: expenseData,
      //     message: "Expense fetched successfully",
      //   });
      // } else {
      //   response({
      //     res,
      //     success: false,
      //     status_code: 400,
      //     message: "You don't have access to this page",
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
        let expense = [];
        switch (restrictionId) {
          case roleRestrictionIds.subordinates:
            // select all expenses in which project contains pmId as current user
            expense = await prisma.expense.findMany({
              where: {
                workspaceId: userToken.workspaceId,
                status: timeEntryStatus.Pending,
                submittedForApproval: true,
                createdById: createdById ? createdById : undefined,
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
              take: maxTake,
              select: expenseSelectStatusPending,
            });
            break;
          case roleRestrictionIds.none:
            expense = await prisma.expense.findMany({
              where: {
                workspaceId: userToken.workspaceId,
                status: timeEntryStatus.Pending,
                submittedForApproval: true,
                createdById: createdById ? createdById : undefined,
                // date: startDate && endDate ? { gte: new Date(startDate), lte: new Date(endDate) } : undefined,
                date: {
                  gte: newStartDate, // Use the parsed startDate
                  lte: newEndDate ? new Date(newEndDate.getTime() + 86400000) : undefined, // Add one day to endDate if provided
                },
                projectId: projectId ? Number(projectId) : undefined,
              },
              orderBy: [
                {
                  date: "desc",
                },
              ],
              take: maxTake,
              select: expenseSelectStatusPending,
            });
            break;
          default:
            break;
        }
        response({
          res,
          success: true,
          status_code: 200,
          data: expense,
          message: "Expense fetched successfully",
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 401,
          message: "You don't have access to view Expense",
        });
        return;
      }
    } else if (req.method === "PATCH") {
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
          let updatedExpense = [];
          ids.map(async (id) => {
            updatedExpense = await prisma.expense.update({
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
            data: updatedExpense,
            message: "Expense updated successfully",
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
          status_code: 400,
          message: "You don't have access to this page",
        });
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "Method not allowed",
      });
      return;
    }
  } catch (err) {
    console.log("error in approvals/index.js", err);
    response({ res, success: false, status_code: 500, message: "Some Internal Error Occured. Please try again later" });
  }
}
