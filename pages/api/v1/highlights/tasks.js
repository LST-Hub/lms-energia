import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { maxTake, tasksHighlights } from "../../../../lib/constants";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { projectId, userId } = req.query;
      const idForProject = projectId ? Number(projectId) : undefined;
      const idForUser = userId ? Number(userId) : undefined;
      if (userId) {
        const tasks = await prisma.task.findMany({
          where: {
            workspaceId: userToken.workspaceId,
            taskUsers: {
              some: {
                userId: idForUser,
              },
            },
          },
          take: maxTake,
          select: tasksHighlights,
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: tasks,
          message: "Tasks fetched successfully",
        });
        return;
      } else {
        const tasks = await prisma.task.findMany({
          where: {
            workspaceId: userToken.workspaceId,
            // in this api user will see its own timesheets
            projectId: idForProject,
          },
          take: maxTake,

          select: tasksHighlights,
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: tasks,
          message: "Tasks fetched successfully",
        });
        return;
      }
    }
  } catch (err) {
    console.log("error in highlights/task.js", err);
    response({ res, success: false, status_code: 500, message: "Some Internal Error Occured. Please try again later" });
  }
}
