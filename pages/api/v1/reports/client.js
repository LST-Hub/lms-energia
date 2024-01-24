import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { clientReportSelectSome } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { perAccessIds, permissionTypeIds, roleRestrictionIds } from "../../../../DBConstants";
import { getUserRoleRestrictionId, isUserHasAccess } from "../../../../lib/backendUtils";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { id } = req.query;

      const idForClient = id ? Number(id) : undefined;

      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.clients,
        perAccessIds.view
      );
      if (hasAccess) {
        const restrictionId = await getUserRoleRestrictionId(userToken.userId, userToken.workspaceId);
        let client = [];
        switch (restrictionId) {
          case roleRestrictionIds.own:
            // the below query will return all clients who are created by the current user
            client = await prisma.client.findMany({
              where: {
                AND: {
                  workspaceId: userToken.workspaceId,
                  id: idForClient,
                  createdById: userToken.userId,
                },
              },
              // take: maxTake,
              select: clientReportSelectSome,
            });
            break;
          case roleRestrictionIds.subordinates:
            // the below query will return all projects which are created by the subordinates of the current user and the projects which are created by the current user
            // const subordinateIds = await getSubordinateIds(userToken.userId, userToken.workspaceId);
            client = await prisma.client.findMany({
              where: {
                AND: {
                  workspaceId: userToken.workspaceId,
                  id: idForClient,
                },
              },
              // take: maxTake,
              select: clientReportSelectSome,
            });
            break;
          case roleRestrictionIds.none:
            // the below query will return all projects of workspace
            client = await prisma.client.findMany({
              where: {
                workspaceId: userToken.workspaceId,
                id: idForClient,
              },
              // take: maxTake,
              select: clientReportSelectSome,
            });
            break;
          default:
            client = [];
            break;
        }

        response({ res, success: true, status_code: 200, data: client, message: "Client reports fetched successfully" });
        return;
      } else {
        response({ res, success: false, status_code: 401, message: "You don't have access to view clients" });
        return;
      }
    } else {
      response({ res, success: false, status_code: 405, message: "Method not allowed" });
      return;
    }
  } catch (err) {
    console.error("error in client index file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
