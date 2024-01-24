import { getProjIdsWherePmis, getRecordCounts, getUserRoleRestrictionId } from "../../../../lib/backendUtils";
import { maxTake, resourceAllocationSelectSome } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { roleRestrictionIds } from "../../../../DBConstants";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { projectId, allocatedUserId, startDate, endDate } = req.query;
      const idForProject = projectId ? Number(projectId) : undefined;
      const idForUser = allocatedUserId ? Number(allocatedUserId) : undefined;
      const newEndDate = endDate ? new Date(endDate) : undefined; // Parse the endDate if provided
      const newStartDate = startDate ? new Date(startDate) : undefined; // Parse the startDate if provided
      const restrictionId = await getUserRoleRestrictionId(userToken.userId, userToken.workspaceId);
      let resourceAllocation = [];
      switch (restrictionId) {
        case roleRestrictionIds.none:
          resourceAllocation = await prisma.resourceAllocation.findMany({
            where: {
              workspaceId: userToken.workspaceId,
              projectId: idForProject,
              allocatedUserId: idForUser,
              // date: startDate && endDate ? { gte: new Date(startDate), lte: new Date(endDate) } : undefined,
              date: {
                gte: newStartDate, // Use the parsed startDate
                lte: newEndDate ? new Date(newEndDate.getTime() + 86400000) : undefined, // Add one day to endDate if provided
              },
            },
            // take: maxTake,
            select: resourceAllocationSelectSome,
          });
          break;
        case roleRestrictionIds.subordinates:
          // get only those resource allocations which have project manager as current user
          const ProjectIds = await getProjIdsWherePmis(userToken.userId, userToken.workspaceId);
          resourceAllocation = await prisma.resourceAllocation.findMany({
            where: {
              workspaceId: userToken.workspaceId,
              projectId: { in: ProjectIds },
              allocatedUserId: idForUser,
              // date: startDate && endDate ? { gte: new Date(startDate), lte: new Date(endDate) } : undefined,
              date: {
                gte: newStartDate, // Use the parsed startDate
                lte: newEndDate ? new Date(newEndDate.getTime() + 86400000) : undefined, // Add one day to endDate if provided
              },
            },
            // take: maxTake,
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
              // date: startDate && endDate ? { gte: new Date(startDate), lte: new Date(endDate) } : undefined,
              date: {
                gte: newStartDate, // Use the parsed startDate
                lte: newEndDate ? new Date(newEndDate.getTime() + 86400000) : undefined, // Add one day to endDate if provided
              },
            },
            // take: maxTake,
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
        message: "Resource allocation reports fetched successfully",
      });
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
