import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { maxTake, todaysTaskReportSelectSome } from "../../../../lib/constants";
import { perAccessIds, permissionTypeIds, roleRestrictionIds } from "../../../../DBConstants";
import { getUserRoleRestrictionId, isUserHasAccess } from "../../../../lib/backendUtils";
import { getProjIdsWherePmis } from "../../../../lib/backendUtils";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { createdById, projectId, taskId, status, startDate, endDate } = req.query;
      const idForProject = projectId ? Number(projectId) : undefined;
      const idForCreatedBy = createdById ? Number(createdById) : undefined;
      // const idForStartDate = startDate ? new Date(startDate) : undefined;
      // const idForEndDate = endDate ? new Date(endDate) : undefined;
      const newEndDate = endDate ? new Date(endDate) : undefined; // Parse the endDate if provided
      const newStartDate = startDate ? new Date(startDate) : undefined; // Parse the startDate if provided
      const idForTask = taskId ? Number(taskId) : undefined;
      const idForStatus = status ? status : undefined;

      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.projAndTask,
        perAccessIds.view
      );
      if (hasAccess) {
        // const date = new Date();
        // const formattedDate = date.toISOString().slice(0, 10) + "T00:00:00.000Z";
        const restrictionId = await getUserRoleRestrictionId(userToken.userId, userToken.workspaceId);
        let todaysTasks = [];
        switch (restrictionId) {
          case roleRestrictionIds.own:
            todaysTasks = await prisma.todaysTask.findMany({
              where: {
                AND: {
                  workspaceId: userToken.workspaceId,
                  createdById: userToken.userId,
                  projectId: idForProject,
                  taskId: idForTask,
                  status: idForStatus,
                  date: {
                    gte: newStartDate, // Use the parsed startDate
                    lte: newEndDate ? new Date(newEndDate.getTime() + 86400000) : undefined, // Add one day to endDate if provided
                  },
                  // date: formattedDate,
                },
              },
              orderBy: [
                {
                  date: "desc",
                },
              ],
              // take: maxTake,
              select: todaysTaskReportSelectSome,
            });
            break;
          case roleRestrictionIds.subordinates:
            const projectIds = await getProjIdsWherePmis(userToken.userId, userToken.workspaceId);

            todaysTasks = await prisma.todaysTask.findMany({
              where: {
                AND: {
                  workspaceId: userToken.workspaceId,
                  createdById: idForCreatedBy,
                  projectId: { in: projectIds },
                  taskId: idForTask,
                  status: idForStatus,
                  date: {
                    gte: newStartDate, // Use the parsed startDate
                    lte: newEndDate ? new Date(newEndDate.getTime() + 86400000) : undefined, // Add one day to endDate if provided
                  },
                  // date: formattedDate,
                },
              },
              orderBy: [
                {
                  date: "desc",
                },
              ],
              // take: maxTake,
              select: todaysTaskReportSelectSome,
            });
            break;
          case roleRestrictionIds.none:
            todaysTasks = await prisma.todaysTask.findMany({
              where: {
                workspaceId: userToken.workspaceId,
                createdById: idForCreatedBy,
                projectId: idForProject,
                taskId: idForTask,
                status: idForStatus,
                date: {
                  gte: newStartDate, // Use the parsed startDate
                  lte: newEndDate ? new Date(newEndDate.getTime() + 86400000) : undefined, // Add one day to endDate if provided
                },
                // date: formattedDate,
              },
              orderBy: [
                {
                  date: "desc",
                },
              ],
              // take: maxTake,
              select: todaysTaskReportSelectSome,
            });
            break;
          default:
            todaysTasks = [];
            break;
        }
        response({
          res,
          success: true,
          status_code: 200,
          data: todaysTasks,
          message: "Todaya task fetched successfully",
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have permission to view this resource",
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
  } catch (err) {
    console.error("error in task index file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
