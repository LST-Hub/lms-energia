import prisma from "../../../../../lib/prisma";
import response from "../../../../../lib/response";
import { authAndGetUserToken } from "../../../../../lib/getSessionData";
import { perAccessIds, permissionTypeIds } from "../../../../../DBConstants";
import { getTimesheetSettingsCache, isUserHasAccess } from "../../../../../lib/backendUtils";
import { ApprovalStatus } from "@prisma/client";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    const id = Number(req.query.pid);
    let projectTime = null;
    if (id) {
      const approved = ApprovalStatus.Approved;
      const pendingApproved = [ApprovalStatus.Approved, ApprovalStatus.Pending];
      const timesheetSetting = await getTimesheetSettingsCache(userToken.workspaceId);

      projectTime = await prisma.project.findUnique({
        where: {
          workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
        },
        select: {
          id: true,
          workspaceId: true,
          createdById: true,
          timesheets: {
            where: {
              status: timesheetSetting?.addPendingInActualTime ? { in: pendingApproved } : approved,
            },
            select: {
              duration: true,
            },
          },
        },
      });
      if (!projectTime) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "The requested project does not exist.",
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "project Id in URL is required",
      });
      return;
    }
    if (req.method === "GET") {
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.projAndTask,
        perAccessIds.view,
        { projectId: id }
      );
      if (!hasAccess) {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You do not have access to this resource",
        });
        return;
      }

      const timesheets = projectTime.timesheets;
      let actualTime = 0;
      timesheets.forEach((timesheet) => {
        actualTime += Number(timesheet.duration);
      });
      const time = { id: projectTime.id, actualTime: actualTime };

      response({
        res,
        success: true,
        status_code: 200,
        data: [time],
        message: "actual time fetched successfully",
      });
      return;
    } else {
      response({
        res,
        success: false,
        status_code: 405,
        message: "Method not allowed",
      });
      return;
    }
  } catch (error) {
    console.log("error in projects actual-time file", error);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some internal error occured. Please try again later.",
    });
  }
}
