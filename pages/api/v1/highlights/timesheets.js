import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { maxTake, timesheetHighlights } from "../../../../lib/constants";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { projectId, taskId, clientId, userId } = req.query;
      const idForProject = projectId ? Number(projectId) : undefined;
      const idForTask = taskId ? Number(taskId) : undefined;
      const idForClient = clientId ? Number(clientId) : undefined;
      const idForUser = userId ? Number(userId) : undefined;
      if (clientId) {
        const timesheets = await prisma.timesheet.findMany({
          // get timesheets where project is associated with client
          where: {
            workspaceId: userToken.workspaceId,
            project: {
              is: {
                client: {
                  id: idForClient,
                },
              },
            },
          },
          take: maxTake,
          select: timesheetHighlights,
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: timesheets,
          message: "Timesheet fetched successfully",
        });
        return;
      } else {
        const timesheets = await prisma.timesheet.findMany({
          where: {
            workspaceId: userToken.workspaceId,
            // in this api user will see its own timesheets
            projectId: idForProject,
            taskId: idForTask,
            createdById: idForUser,
          },
          take: maxTake,
          orderBy: {
            date: "desc",
          },
          select: timesheetHighlights,
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: timesheets,
          message: "Timesheet fetched successfully",
        });
      }

      return;
    }
  } catch (err) {
    console.log("error in highlights/timesheet.js", err);
    response({ res, success: false, status_code: 500, message: "Some Internal Error Occured. Please try again later" });
  }
}
