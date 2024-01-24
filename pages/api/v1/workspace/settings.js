import { isUserAdmin } from "../../../../lib/backendUtils";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";

export default async function workspaceHandler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
    if (!hasAccess) {
      response({
        res,
        success: false,
        status_code: 403,
        message: "You don't have access to this resource",
      });
      return;
    }
    if (req.method === "GET") {
      const allQueries = await Promise.allSettled([
        prisma.workspace.findUnique({
          where: {
            id: userToken.workspaceId,
          },
          select: {
            name: true,
          },
        }),
        prisma.todaysTaskSettings.findUnique({
          where: {
            workspaceId: userToken.workspaceId,
          },
          select: {
            approvalEnabled: true,
            sendMailForApproval: true,
          },
        }),
        prisma.timesheetSettings.findUnique({
          where: {
            workspaceId: userToken.workspaceId,
          },
          select: {
            approvalEnabled: true,
            sendMailForApproval: true,
            addPendingInActualTime: true,
          },
        }),
        prisma.workspaceSettings.findUnique({
          where: {
            workspaceId: userToken.workspaceId,
          },
          select: {
            todaysTaskEnabled: true,
            defaultWorkCal: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
      ]);

      for (const query of allQueries) {
        if (query.status === "rejected") {
          response({
            res,
            success: false,
            status_code: 500,
            message: "Some Error occured occured while getting the values. Please try again later",
          });
          console.log("Error occured while getting the values", query.reason);
          return;
        }
      }
      const data = {
        workspaceName: allQueries[0].value.name,
        approvalEnabledForTT: allQueries[1].value.approvalEnabled,
        mailToPmForTTApproval: allQueries[1].value.sendMailForApproval,
        mailToPmForTSApproval: allQueries[2].value.sendMailForApproval,
        approvalEnabledForTS: allQueries[2].value.approvalEnabled,
        addPendingInActualTimeForTS: allQueries[2].value.addPendingInActualTime,
        defaultWorkCal: allQueries[3].value.defaultWorkCal,
        todaysTaskEnabled: allQueries[3].value.todaysTaskEnabled,
      };

      response({
        res,
        success: true,
        status_code: 200,
        data: [data],
        message: "Workspace settings fetched successfully",
      });
      return;
    } else if (req.method === "PUT") {
      const {
        workspaceName,
        approvalEnabledForTT,
        approvalEnabledForTS,
        mailToPmForTSApproval,
        mailToPmForTTApproval,
        addPendingInActualTimeForTS,
        defaultWorkCalId,
        todaysTaskEnabled,
      } = req.body;
      if (!workspaceName) {
        response({
          res,
          success: false,
          status_code: 400,
          message: "workspaceName is required",
        });
        return;
      }
      const allQueries = await Promise.allSettled([
        prisma.workspace.update({
          where: {
            id: userToken.workspaceId,
          },
          data: {
            name: workspaceName,
          },
        }),
        prisma.todaysTaskSettings.update({
          where: {
            workspaceId: userToken.workspaceId,
          },
          data: {
            approvalEnabled: approvalEnabledForTT,
            sendMailForApproval: mailToPmForTTApproval,
          },
        }),
        prisma.timesheetSettings.update({
          where: {
            workspaceId: userToken.workspaceId,
          },
          data: {
            approvalEnabled: approvalEnabledForTS,
            sendMailForApproval: mailToPmForTSApproval,
            addPendingInActualTime: addPendingInActualTimeForTS,
          },
        }),
        prisma.workspaceSettings.update({
          where: {
            workspaceId: userToken.workspaceId,
          },
          data: {
            defaultWorkCalId: defaultWorkCalId,
            todaysTaskEnabled: todaysTaskEnabled,
          },
        }),
      ]);

      for (const query of allQueries) {
        if (query.status === "rejected") {
          response({
            res,
            success: false,
            status_code: 500,
            message: "Unable to update some workspace settings. Please try again later",
          });
          return;
        }
      }
      response({
        res,
        success: true,
        status_code: 200,
        message: "workspace Settings Updated successfully",
      });
      return;
    } else {
      response({ res, success: false, status_code: 400, message: "Method not allowed" });
      return;
    }
  } catch (err) {
    console.log("error in workspace settings page", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
