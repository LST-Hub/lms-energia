import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { maxTake, projectReportSelectSome } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { perAccessIds, permissionTypeIds, roleRestrictionIds } from "../../../../DBConstants";
import {
  getProjIdsWherePmis,
  getUserRoleRestrictionId,
  isUserHasAccess,
} from "../../../../lib/backendUtils";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { id, pmId, clientId, statusId, priorityId } = req.query;
      let projectActive = undefined;
      const idForProject = id ? Number(id) : undefined;
      const idForPm = pmId ? Number(pmId) : undefined; // pmIs is not number, as pm is a user and users have string ids
      const idForClient = clientId ? Number(clientId) : undefined;
      const idForStatus = statusId ? Number(statusId) : undefined;
      const idForPriority = priorityId ? Number(priorityId) : undefined;
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.projAndTask,
        perAccessIds.view
      );
      if (hasAccess) {
        const restrictionId = await getUserRoleRestrictionId(userToken.userId, userToken.workspaceId);
        let project = [];
        switch (restrictionId) {
          case roleRestrictionIds.own:
            // the below query will return all projects who are created by the current user
            project = await prisma.project.findMany({
              where: {
                AND: {
                  id: idForProject,
                  workspaceId: userToken.workspaceId,
                  active: projectActive,
                  createdById: userToken.userId,
                  clientId: idForClient,
                  pmId: idForPm,
                  statusId: idForStatus,
                  priorityId: idForPriority,
                },
              },
              // take: maxTake,
              select: projectReportSelectSome,
            });
            break;
          case roleRestrictionIds.subordinates:
            // the below query will return all projects which are created by the subordinates of the current user and the projects which are created by the current user
            const ProjectIds = await getProjIdsWherePmis(userToken.userId, userToken.workspaceId);
            project = await prisma.project.findMany({
              where: {
                AND: {
                  id: { in: ProjectIds },
                  workspaceId: userToken.workspaceId,
                  active: projectActive,
                  clientId: idForClient,
                  pmId: idForPm,
                  statusId: idForStatus,
                  priorityId: idForPriority,
                },
              },
              // take: maxTake,
              select: projectReportSelectSome,
            });
            break;
          case roleRestrictionIds.none:
            // the below query will return all projects of workspace
            project = await prisma.project.findMany({
              where: {
                id: idForProject,
                workspaceId: userToken.workspaceId,
                active: projectActive,
                clientId: idForClient,
                pmId: idForPm,
                statusId: idForStatus,
                priorityId: idForPriority,
              },
              // take: maxTake,
              select: projectReportSelectSome,
            });
            break;
          default:
            project = [];
            break;
        }
        response({ res, success: true, status_code: 200, data: project, message: "Project reports fetched successfully" });
        return;
      } else {
        response({ res, success: false, status_code: 401, message: "You don't have access to view Projects" });
        return;
      }
    } else {
      response({ res, success: false, status_code: 405, message: "Method not allowed" });
      return;
    }
  } catch (err) {
    console.error("error in project index file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
