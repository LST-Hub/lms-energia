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
        let projectCount = [{ count: 0 }];
        switch (restrictionId) {
          case roleRestrictionIds.own:
            projectCount[0].count = await prisma.project.count({
              where: {
                workspaceId: userToken.workspaceId,
                active: true,
                createdBy: userToken.userId,
              },
            });
            break;
          case roleRestrictionIds.subordinates:
            const projectPmIds = await getProjIdsWherePmis(userToken.userId, userToken.workspaceId);
            projectCount[0].count = await prisma.project.count({
              where: {
                workspaceId: userToken.workspaceId,
                active: true,
                id: { in: projectPmIds },
              },
            });
            break;
          case roleRestrictionIds.none:
            projectCount[0].count = await prisma.project.count({
              where: {
                workspaceId: userToken.workspaceId,
                active: true,
              },
            });
            break;
          default:
            projectCount[0].count = 0;
            break;
        }

        response({
          res,
          success: true,
          status_code: 200,
          message: "Project count fetched successfully",
          data: projectCount,
        });
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
      response({
        res,
        success: false,
        status_code: 405,
        message: "Method Not Allowed",
      });
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
