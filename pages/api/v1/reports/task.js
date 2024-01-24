import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { maxTake, taskReportSelectSome } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { perAccessIds, permissionTypeIds, roleRestrictionIds } from "../../../../DBConstants";
import { getProjIdsWherePmis, getUserRoleRestrictionId, isUserHasAccess } from "../../../../lib/backendUtils";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { id, projectId } = req.query;
      const idForTask = id ? Number(id) : undefined;
      const idForProject = projectId ? Number(projectId) : undefined;

      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.projAndTask,
        perAccessIds.view
      );
      if (hasAccess) {
        const restrictionId = await getUserRoleRestrictionId(userToken.userId, userToken.workspaceId);
        let task = [];
        switch (restrictionId) {
          case roleRestrictionIds.own:
            task = await prisma.task.findMany({
              where: {
                AND: {
                  workspaceId: userToken.workspaceId,
                  createdById: userToken.userId,
                  id: idForTask,
                  projectId: idForProject,
                },
              },
              // take: maxTake,
              select: taskReportSelectSome,
            });
            break;
          case roleRestrictionIds.subordinates:
            const projectIds = await getProjIdsWherePmis(userToken.userId, userToken.workspaceId);

            task = await prisma.task.findMany({
              where: {
                AND: {
                  id: idForTask,
                  workspaceId: userToken.workspaceId,
                  projectId: { in: projectIds },
                },
              },
              // take: maxTake,
              select: taskReportSelectSome,
            });
            break;
          case roleRestrictionIds.none:
            task = await prisma.task.findMany({
              where: {
                workspaceId: userToken.workspaceId,
                id: idForTask,
                projectId: idForProject,
              },
              // take: maxTake,
              select: taskReportSelectSome,
            });
            break;
          default:
            task = [];
            break;
        }
        response({ res, success: true, status_code: 200, data: task, message: "Tasks reports fetched successfully" });
        return;
      } else {
        response({ res, success: false, status_code: 401, message: "You don't have access to view tasks" });
        return;
      }
    } else {
      response({ res, success: false, status_code: 405, message: "Method not allowed" });
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
