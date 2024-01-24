import { getProjIdsWherePmis, getRecordCounts, getUserRoleRestrictionId } from "../../../../lib/backendUtils";
import { maxTake, resourceAllocationSelectSome, nanoid } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { repeatType } from "../../../../src/utils/Constants";
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
              allocatedUserId: userToken.userId,
              // date: startDate && endDate ? { gte: new Date(startDate), lte: new Date(endDate) } : undefined,
              date: {
                gte: newStartDate, // Use the parsed startDate
                lte: newEndDate ? new Date(newEndDate.getTime() + 86400000) : undefined, // Add one day to endDate if provided
              },
            },
            take: maxTake,
            select: resourceAllocationSelectSome,
          });
          break;
        case roleRestrictionIds.subordinates:
          // get only those resource allocations which have project manager as current user
          // const ProjectIds = await getProjIdsWherePmis(userToken.userId, userToken.workspaceId);
          resourceAllocation = await prisma.resourceAllocation.findMany({
            where: {
              workspaceId: userToken.workspaceId,
              // projectId: { in: ProjectIds },
              allocatedUserId: userToken.userId,
              // date: startDate && endDate ? { gte: new Date(startDate), lte: new Date(endDate) } : undefined,
              date: {
                gte: newStartDate, // Use the parsed startDate
                lte: newEndDate ? new Date(newEndDate.getTime() + 86400000) : undefined, // Add one day to endDate if provided
              },
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
              // date: startDate && endDate ? { gte: new Date(startDate), lte: new Date(endDate) } : undefined,
              date: {
                gte: newStartDate, // Use the parsed startDate
                lte: newEndDate ? new Date(newEndDate.getTime() + 86400000) : undefined, // Add one day to endDate if provided
              },
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
        message: "Resource allocation fetched successfully",
      });
      return;
    }
    if (req.method === "POST") {
      const { projectId, date, daysOfWeek, datesOfMonth, startDate, endDate, tasksData, repetationType } = req.body;
      if (!projectId || !tasksData || !repetationType || (!date && (!startDate || !endDate))) {
        response({ res, success: false, status_code: 400, message: "Please provide required data" });
        return;
      }

      if (repetationType === repeatType.daily) {
        // create resource allocation for each day from start date to end date
        let randomId = nanoid();
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const days = Math.floor((endDateObj - startDateObj) / (1000 * 60 * 60 * 24));
        const resourceAllocation = [];
        const counts = await getRecordCounts(userToken.workspaceId);
        let resourceAlocationCount = counts.resourceAllocation;
        const allTasks = [];
        for (let i = 0; i <= days; i++) {
          const date = new Date(startDateObj);
          date.setDate(date.getDate() + i);
          const tasks = tasksData.map((task) => ({
            id: ++resourceAlocationCount,
            repeatId: randomId,
            projectId: projectId,
            date: date,
            taskId: task.taskId,
            duration: task.duration,
            allocatedUserId: task.employeeId,
            workspaceId: userToken.workspaceId,
            createdById: userToken.userId,
            userGlobalId: userToken.globalId,
            repetationType: repetationType,
          }));
          allTasks.push(...tasks);
        }
        const [resourceAllocationData, updateCount] = await prisma.$transaction([
          prisma.resourceAllocation.createMany({
            data: allTasks,
          }),

          prisma.recordCounts.update({
            where: {
              workspaceId: userToken.workspaceId,
            },
            data: {
              resourceAllocation: {
                increment: allTasks.length,
              },
            },
          }),
        ]);
        resourceAllocation.push(resourceAllocationData);
        response({
          res,
          success: true,
          status_code: 200,
          data: resourceAllocation,
          message: "Resource allocated successfully",
        });
        return;
      }

      if (repetationType === repeatType.weekly) {
        // create resource allocation for each days Of Week from start date to end date
        let randomId = nanoid();
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const days = Math.floor((endDateObj - startDateObj) / (1000 * 60 * 60 * 24));
        const resourceAllocation = [];
        const counts = await getRecordCounts(userToken.workspaceId);
        let resourceAlocationCount = counts.resourceAllocation;
        const allTasks = [];

        for (let i = 0; i <= days; i++) {
          const date = new Date(startDateObj);
          date.setDate(date.getDate() + i);
          if (daysOfWeek.includes(date.getDay())) {
            const tasks = tasksData.map((task) => ({
              id: ++resourceAlocationCount,
              repeatId: randomId,
              projectId: projectId,
              date: date,
              taskId: task.taskId,
              duration: task.duration,
              allocatedUserId: task.employeeId,
              workspaceId: userToken.workspaceId,
              createdById: userToken.userId,
              userGlobalId: userToken.globalId,
              repetationType: repetationType,
            }));
            allTasks.push(...tasks);
          }
        }

        const [resourceAllocationData, updateCount] = await prisma.$transaction([
          prisma.resourceAllocation.createMany({
            data: allTasks,
          }),
          prisma.recordCounts.update({
            where: {
              workspaceId: userToken.workspaceId,
            },
            data: {
              resourceAllocation: {
                increment: allTasks.length,
              },
            },
          }),
        ]);

        resourceAllocation.push(resourceAllocationData);

        response({
          res,
          success: true,
          status_code: 200,
          data: resourceAllocation,
          message: "Resource allocated successfully",
        });
        return;
      }

      if (repetationType === repeatType.monthly) {
        // create resource allocation for each dates Of Month from start date to end date
        let randomId = nanoid();
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const days = Math.floor((endDateObj - startDateObj) / (1000 * 60 * 60 * 24));
        const resourceAllocation = [];
        const counts = await getRecordCounts(userToken.workspaceId);
        let resourceAlocationCount = counts.resourceAllocation;
        const allTasks = [];

        for (let i = 0; i <= days; i++) {
          const date = new Date(startDateObj);
          date.setDate(date.getDate() + i);
          if (datesOfMonth.includes(date.getDate())) {
            const tasks = tasksData.map((task) => ({
              id: ++resourceAlocationCount,
              repeatId: randomId,
              projectId: projectId,
              date: date,
              taskId: task.taskId,
              duration: task.duration,
              allocatedUserId: task.employeeId,
              workspaceId: userToken.workspaceId,
              createdById: userToken.userId,
              userGlobalId: userToken.globalId,
              repetationType: repetationType,
            }));
            allTasks.push(...tasks);
          }
        }

        const [resourceAllocationData, updateCount] = await prisma.$transaction([
          prisma.resourceAllocation.createMany({
            data: allTasks,
          }),
          prisma.recordCounts.update({
            where: {
              workspaceId: userToken.workspaceId,
            },
            data: {
              resourceAllocation: {
                increment: allTasks.length,
              },
            },
          }),
        ]);
        resourceAllocation.push(resourceAllocationData);

        response({
          res,
          success: true,
          status_code: 200,
          data: resourceAllocation,
          message: "Resource allocated successfully",
        });
        return;
      }

      if (repetationType === repeatType.dontRepeat) {
        const counts = await getRecordCounts(userToken.workspaceId);
        let resourceAlocationCount = counts.resourceAllocation;
        const [resourceAllocation, updateCount] = await prisma.$transaction([
          prisma.resourceAllocation.createMany({
            data: tasksData.map((task) => ({
              id: ++resourceAlocationCount,
              projectId: projectId,
              date: new Date(date),
              taskId: task.taskId,
              duration: task.duration,
              allocatedUserId: task.employeeId,
              workspaceId: userToken.workspaceId,
              createdById: userToken.userId,
              userGlobalId: userToken.globalId,
              repetationType: repetationType,
            })),
          }),
          prisma.recordCounts.update({
            where: {
              workspaceId: userToken.workspaceId,
            },
            data: {
              resourceAllocation: {
                increment: tasksData.length,
              },
            },
          }),
        ]);
        response({
          res,
          success: true,
          status_code: 200,
          data: [resourceAllocation],
          message: "Resource allocated successfully",
        });
        return;
      }
    }
    if (req.method === "PUT") {
      const { id, projectId, taskId, date, duration, allocatedUserId } = req.body;
      if (!id || !projectId || !taskId || !date || !duration || !allocatedUserId) {
        response({ res, success: false, status_code: 400, message: "Please provide required data" });
        return;
      } else {
        const resourceAllocation = await prisma.resourceAllocation.update({
          where: {
            workspaceId_id: {
              id: id,
              workspaceId: userToken.workspaceId,
            },
          },
          data: {
            projectId: projectId,
            taskId: taskId,
            date: new Date(date),
            duration: duration,
            allocatedUserId: allocatedUserId,
          },
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: [resourceAllocation],
          message: "Resource allocation updated successfully",
        });
        return;
      }
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
