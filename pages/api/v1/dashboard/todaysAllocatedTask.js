import { getProjIdsWherePmis, getRecordCounts, getUserRoleRestrictionId } from "../../../../lib/backendUtils";
import { maxTake, resourceAllocationSelectSome } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { customAlphabet } from "nanoid";
import { repeatType } from "../../../../src/utils/Constants";
import { roleRestrictionIds } from "../../../../DBConstants";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { projectId, allocatedUserId, startDate, endDate } = req.query;
      const idForProject = projectId ? Number(projectId) : undefined;
      const idForUser = allocatedUserId ? Number(allocatedUserId) : undefined;

      const restrictionId = await getUserRoleRestrictionId(userToken.userId, userToken.workspaceId);
      let resourceAllocation = [];
      const date = new Date();
      const formattedDate = date.toISOString().slice(0, 10) + "T00:00:00.000Z";
      switch (restrictionId) {
        case roleRestrictionIds.none:
          resourceAllocation = await prisma.resourceAllocation.findMany({
            where: {
              workspaceId: userToken.workspaceId,
              projectId: idForProject,
              allocatedUserId: userToken.userId,
              //   date: startDate && endDate ? { gte: new Date(startDate), lte: new Date(endDate) } : undefined,
              //   convert new Date() to 2023-04-25T00:00:00.000Z format
              date: formattedDate,
            },
            take: maxTake,
            select: resourceAllocationSelectSome,
          });
          break;
        case roleRestrictionIds.subordinates:
          // get only those resource allocations which have project manager as current user
          // const ProjectIds = await getProjIdsWherePmis(userToken.userId, userToken.workspaceId);
          // console.log("ProjectIds", ProjectIds);
          resourceAllocation = await prisma.resourceAllocation.findMany({
            where: {
              workspaceId: userToken.workspaceId,
              // projectId: { in: ProjectIds },
              allocatedUserId: userToken.userId,
              //   date: startDate && endDate ? { gte: new Date(startDate), lte: new Date(endDate) } : undefined,
              date: formattedDate,
            },
            take: maxTake,
            select: resourceAllocationSelectSome,
          });
          break;
        case roleRestrictionIds.own:
          //  get only those resource allocations which have allocated user as current user
          resourceAllocation = await prisma.resourceAllocation.findMany({
            where: {
              workspaceId: userToken.workspaceId,
              projectId: idForProject,
              allocatedUserId: userToken.userId,
              //   date: startDate && endDate ? { gte: new Date(startDate), lte: new Date(endDate) } : undefined,
              date: formattedDate,
            },
            take: maxTake,
            select: resourceAllocationSelectSome,
          });
          break;
        default:
          resourceAllocation = [];
          break;
      }
      response({
        res,
        success: true,
        status_code: 200,
        data: resourceAllocation,
        message: "Today's allocated task fetched successfully",
      });
      return;
    } else {
      response({ res, success: false, status_code: 405, message: "Method not allowed" });
      return;
    }
  } catch (error) {
    console.log("error while updating project in resource-allocation/index page", error);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
