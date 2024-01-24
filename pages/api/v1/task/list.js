import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { taskSelectIdName, maxTake } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { projectId, myTasks, PMtasks, indexFilter } = req.query;
      const task = await prisma.task.findMany({
        where: {
          workspaceId: userToken.workspaceId,
          projectId: projectId ? Number(projectId) : undefined,
          /** we are fetching active true because we want to show only active tasks in the
           * dropdown , because you can only select active tasks for creating or editng and not inactive tasks */
          active: indexFilter ? undefined : true,

          // statusId: { not: 4 },
          taskUsers:
            // by default return all tasks of the current user, and optionally return all tasks if asked
            myTasks === "true"
              ? {
                  some: { userId: userToken.userId },
                }
              : undefined,
          project: {
            pmId: PMtasks === "true" ? userToken.userId : undefined,
          },
        },
        orderBy: {
          name: "asc",
        },
        // return all results, dont return only 100
        select: taskSelectIdName,
      });
      response({ res, success: true, status_code: 200, data: task, message: "Task fetched successfully" });
      return;
    } else {
      response({ res, success: false, status_code: 405, message: "Method not allowed" });
      return;
    }
  } catch (error) {
    console.log("error", error);
    response({ res, success: false, status_code: 500, message: error.message });
  }
}
