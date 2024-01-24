import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { maxTake, timeEntryStatus, todaysTasksHighlights } from "../../../../lib/constants";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { projectId, taskId, userId } = req.query;
      const idForProject = projectId ? Number(projectId) : undefined;
      const idForTask = taskId ? Number(taskId) : undefined;
      const idForUser = userId ? Number(userId) : undefined;
      const todaysTask = await prisma.todaysTask.findMany({
        where: {
          workspaceId: userToken.workspaceId,
          projectId: idForProject,
          taskId: idForTask,
          createdById: idForUser,
        },
        take: maxTake,
        orderBy: {
          date: "desc",
        },
        select: todaysTasksHighlights,
      });
      response({
        res,
        success: true,
        status_code: 200,
        data: todaysTask,
        message: "Todays task fetched successfully",
      });
    }
  } catch (err) {
    console.log("error in highlights/todays task.js", err);
    response({ res, success: false, status_code: 500, message: "Some Internal Error Occured. Please try again later" });
  }
}
