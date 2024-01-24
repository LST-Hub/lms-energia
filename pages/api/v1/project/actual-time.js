import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { perAccessIds, permissionTypeIds } from "../../../../DBConstants";
import { getTimesheetSettingsCache, isUserHasAccess } from "../../../../lib/backendUtils";
import { ApprovalStatus } from "@prisma/client";

// api to get actual time of all projects
export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    let projectsTime = null;
    if (req.method === "GET") {
      const approved = ApprovalStatus.Approved;
      const pendingApproved = [ApprovalStatus.Approved, ApprovalStatus.Pending];
      const timesheetSetting = await getTimesheetSettingsCache(userToken.workspaceId);

      projectsTime = await prisma.project.findMany({
        where: {
          workspaceId: userToken.workspaceId,
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
    } else {
      response({
        res,
        success: false,
        status_code: 405,
        message: "Method not allowed",
      });
      return;
    }

    const hasAccess = await isUserHasAccess(
      userToken.userId,
      userToken.workspaceId,
      permissionTypeIds.projAndTask,
      perAccessIds.view,
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
    const time = projectsTime.map((project) => {
      const timesheets = project.timesheets;
      let actualTime = 0;
      timesheets.forEach((timesheet) => {
        actualTime += Number(timesheet.duration);
      });
      return { id: project.id, actualTime: actualTime };
    });

    // const timesheets = projectsTime[0].timesheets;
    // console.log("timesheets", timesheets);
    // let actualTime = 0;
    // timesheets.forEach((timesheet) => {
    //   actualTime += Number(timesheet.duration);
    // });
    // const time = { id: projectsTime.id, actualTime: actualTime };

    response({
      res,
      success: true,
      status_code: 200,
      data: time,
      message: "actual time fetched successfully",
    });
    return;
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
