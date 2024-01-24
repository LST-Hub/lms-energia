import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { perAccessIds, permissionTypeIds, roleRestrictionIds } from "../../../../DBConstants";
import { getProjIdsWherePmis, getUserRoleRestrictionId, isUserHasAccess } from "../../../../lib/backendUtils";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.projAndTask,
        perAccessIds.view
      );
      if (hasAccess) {
        const restrictionId = await getUserRoleRestrictionId(userToken.userId, userToken.workspaceId);
        // create and arrya of ojects with keys as the project status and value as the count of project status
        let projectCount = [
          { status: "Completed", count: 0 },
          { status: "Inprogress", count: 0 },
          { status: "Not Started", count: 0 },
          { status: "Cancelled", count: 0 },
          { status: "Open", count: 0 },
          { status: "Halted", count: 0 },
          { status: "Closed", count: 0 },
        ];
        switch (restrictionId) {
          case roleRestrictionIds.own:
            await Promise.all(
              projectCount.map(async (project) => {
                project.count = await prisma.project.count({
                  where: {
                    workspaceId: userToken.workspaceId,
                    active: true,
                    createdBy: userToken.userId,
                    status: {
                      name: project.status,
                    },
                  },
                });
              })
            );
            break;
          case roleRestrictionIds.subordinates:
            const projectPmIds = await getProjIdsWherePmis(userToken.userId, userToken.workspaceId);
            await Promise.all(
              projectCount.map(async (project) => {
                project.count = await prisma.project.count({
                  where: {
                    workspaceId: userToken.workspaceId,
                    active: true,
                    id: { in: projectPmIds },
                    status: {
                      name: project.status,
                    },
                  },
                });
              })
            );
            break;
          case roleRestrictionIds.none:
            await Promise.all(
              projectCount.map(async (project) => {
                project.count = await prisma.project.count({
                  where: {
                    workspaceId: userToken.workspaceId,
                    active: true,
                    status: {
                      name: project.status,
                    },
                  },
                });
              })
            );
            break;
          default:
            projectCount[0].count = 0;
            break;
        }
        response({ res, success: true, status_code: 200, message: "Project status count fetched successfully", data: projectCount });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to view projects",
        });
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
