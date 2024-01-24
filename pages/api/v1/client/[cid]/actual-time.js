import prisma from "../../../../../lib/prisma";
import response from "../../../../../lib/response";
import { authAndGetUserToken } from "../../../../../lib/getSessionData";
import { perAccessIds, permissionTypeIds } from "../../../../../DBConstants";
import { getTimesheetSettingsCache, isUserHasAccess } from "../../../../../lib/backendUtils";
import { ApprovalStatus } from "@prisma/client";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    const id = Number(req.query.cid);
    let clientTime = null;
    if (id) {
      const approved = ApprovalStatus.Approved;
      const pendingApproved = [ApprovalStatus.Approved, ApprovalStatus.Pending];
      const timesheetSetting = await getTimesheetSettingsCache(userToken.workspaceId);

      clientTime = await prisma.client.findUnique({
        where: {
          workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
        },
        select: {
          id: true,
          workspaceId: true,
          // createdById: true,
          projects: {
            select: {
              timesheets: {
                where: {
                  status: timesheetSetting?.addPendingInActualTime ? { in: pendingApproved } : approved,
                },
                select: {
                  duration: true,
                },
              },
            },
          },
        },
      });
      if (!clientTime) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "The requested client does not exist.",
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "client Id in URL is required",
      });
      return;
    }
    if (req.method === "GET") {
      const hasAccess = await isUserHasAccess(userToken.userId,userToken.workspaceId, permissionTypeIds.clients, perAccessIds.view, {});
      if (!hasAccess) {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You do not have access to this resource",
        });
        return;
      }

      const projects = clientTime.projects;
      let actualTime = 0;
      projects.forEach((project) => {
        project.timesheets.forEach((timesheet) => {
          actualTime += Number(timesheet.duration);
        });
      });
      const time = { id: clientTime.id, actualTime: actualTime };

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
    console.log("error in client actual-time file", error);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some internal error occured. Please try again later.",
    });
  }
}
