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
    let clientsTime = null;
    if (req.method === "GET") {
      const approved = ApprovalStatus.Approved;
      const pendingApproved = [ApprovalStatus.Approved, ApprovalStatus.Pending];
      const timesheetSetting = await getTimesheetSettingsCache(userToken.workspaceId);

      clientsTime = await prisma.client.findMany({
        where: {
          workspaceId: userToken.workspaceId,
        },
        select: {
          id: true,
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
      perAccessIds.view
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

    function calculateTotalDuration(clientTime) {
      const result = [];
    
      for (let i = 0; i < clientTime.length; i++) {
        const client = clientTime[i];
        const totalDuration = client?.projects?.reduce((acc, project) => {
          const projectTotal = project?.timesheets?.reduce((sum, timesheet) => {
            return sum + timesheet.duration;
          }, 0);
          return acc + projectTotal;
        }, 0);
    
        result.push({ id: client.id, totalDuration: totalDuration });
      }
    
      return result;
    }

    const totalDurations = calculateTotalDuration(clientsTime);
    
    // console.log("clientsTime", clientsTime[2].projects[0].timesheets);
    // const time = clientsTime.map((client, index) => {
    //   let actualTime = 0;
    //   console.log(`timesheets ${index} `, client?.projects[index]);
    //   const timesheets = client?.projects[index]?.timesheets;
    //   timesheets?.forEach((timesheet) => {
    //     actualTime += Number(timesheet.duration);
    //   });
    //   return { id: client.id, actualTime: actualTime };
    // });

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
      data: totalDurations,
      message: "actual time fetched successfully",
    });
    return;
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
