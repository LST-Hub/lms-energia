import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { maxTake, userReportSelectSome } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { perAccessIds, permissionTypeIds, roleRestrictionIds } from "../../../../DBConstants";
import {
  getRecordCounts,
  getSubordinateIds,
  getUserRoleRestrictionId,
  isUserHasAccess,
} from "../../../../lib/backendUtils";
import { minSearchLength } from "../../../../src/utils/Constants";
import { redisDelProject, redisSetProject } from "../../../../lib/redis-operations";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { id, roleId } = req.query;
      
      const idForUser = id ? Number(id) : undefined;
      const idForRole = roleId ? Number(roleId) : undefined;

      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.users,
        perAccessIds.view
      );
      
      if (hasAccess) {
        const restrictionId = await getUserRoleRestrictionId(userToken.userId, userToken.workspaceId);
        let user = [];
        switch (restrictionId) {
          case roleRestrictionIds.own:
            // the below query will return all clients who are created by the current user
            user = await prisma.user.findMany({
              where: {
                AND: {
                  workspaceId: userToken.workspaceId,
                  id: idForUser,
                  createdById: userToken.userId,
                  roleId: idForRole,
                },
              },
              take: maxTake,
              select: userReportSelectSome,
            });
            break;
          case roleRestrictionIds.subordinates:
            // the below query will return all projects which are created by the subordinates of the current user and the projects which are created by the current user
            // const subordinateIds = await getSubordinateIds(userToken.userId, userToken.workspaceId);
            user = await prisma.user.findMany({
              where: {
                AND: {
                  workspaceId: userToken.workspaceId,
                  id: idForUser,
                  roleId: idForRole,
                },
              },
              take: maxTake,
              select: userReportSelectSome,
            });
            break;
          case roleRestrictionIds.none:
            // the below query will return all projects of workspace
            user = await prisma.user.findMany({
              where: {
                workspaceId: userToken.workspaceId,
                id: idForUser,
                roleId: idForRole,
              },
              take: maxTake,
              select: userReportSelectSome,
            });
            break;
          default:
            user = [];
            break;
        }

        response({ res, success: true, status_code: 200, data: user, message: "Users reports fetched successfully" });
        return;
      } else {
        response({ res, success: false, status_code: 401, message: "You don't have access to view users" });
        return;
      }
    } else {
      response({ res, success: false, status_code: 405, message: "Method not allowed" });
      return;
    }
  } catch (err) {
    console.error("error in user index file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
