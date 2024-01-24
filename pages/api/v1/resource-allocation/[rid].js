import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { resourceAllocationSelectAll } from "../../../../lib/constants";
import { isUserHasAccess } from "../../../../lib/backendUtils";
import { perAccessIds, permissionTypeIds } from "../../../../DBConstants";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    const id = Number(req.query.rid);
    let resourceAllocationDetails = null;
    if (id) {
      // resourceAllocationDetails = await prisma.resourceAllocation.findUnique({
      //   where: {
      //     workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
      //   },
      //   select: resourceAllocationSelectAll,
      // });

      // get resource allocated from a project
      resourceAllocationDetails = await prisma.resourceAllocation.findUnique({
        where: {
          workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
        },
        select: {
          id: true,
          projectId: true,
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          taskId: true,
          task: {
            select: {
              id: true,
              name: true,
            },
          },
          date: true,
          duration: true,
        },
      });

      if (!resourceAllocationDetails) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "Resource allocation not found",
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "resource allocation Id in URL is required",
      });
      return;
    }
    if (req.method === "GET") {
      response({
        res,
        success: true,
        status_code: 200,
        data: [resourceAllocationDetails],
        message: "Resource allocation fetched successfully",
      });
      return;
    } else if (req.method === "PUT") {
      const { projectId, taskId, date, startDate, endDate, assignedUsers, hours, repetationType } = req.body;
      if (!projectId || !taskId || !assignedUsers || !hours || (!date && (!startDate || !endDate))) {
        response({ res, success: false, status_code: 400, message: "Please provide required data" });
        return;
      } else {
        const updatedResourceAllocation = await prisma.resourceAllocation.update({
          where: {
            workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
          },
          data: {
            projectId: projectId,
            taskId: taskId,
            date: new Date(date),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            repetationType: repetationType,
            duration: Number(hours),
            resourceAllocationUsers: {
              deleteMany: {},
              createMany: {
                data: assignedUsers.map((user) => {
                  return { userId: user.value };
                }),
              },
            },
          },
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: [updatedResourceAllocation],
          message: "Resource allocation updated successfully",
        });
        return;
      }
    } else if (req.method === "DELETE") {
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.resourceAllocation,
        perAccessIds.resourceAllocation
      );

      if (hasAccess) {
        try {
          // Find the resource allocation to delete
          const resourceAllocationToDelete = await prisma.resourceAllocation.findUnique({
            where: {
              workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
            },
            include: {
              // Include the related TodaysTask and Timesheet records
              todaysTasks: true,
              timesheets: true,
            },
          });

          if (!resourceAllocationToDelete) {
            response({
              res,
              success: false,
              status_code: 404,
              message: "Resource allocation not found",
            });
            return;
          }

          // Remove the relationships between TodaysTask and Timesheet records
          // Disconnect related TodaysTasks and Timesheets
          await prisma.todaysTask.updateMany({
            where: {
              resourceAllocationId: resourceAllocationToDelete.id,
            },
            data: {
              resourceAllocationId: null,
            },
          });

          await prisma.timesheet.updateMany({
            where: {
              resourceAllocationId: resourceAllocationToDelete.id,
            },
            data: {
              resourceAllocationId: null,
            },
          });

          // Delete the ResourceAllocation record
          await prisma.resourceAllocation.delete({
            where: {
              workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
            },
          });

          response({
            res,
            success: true,
            status_code: 200,
            message: "Resource allocation deleted successfully",
          });
          return;
        } catch (error) {
          console.log("error while deleting resource allocation", error);
          response({
            res,
            success: false,
            status_code: 500,
            message: "Some Internal Error Occurred. Please try again later",
          });
          return;
        }
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to delete resource allocation",
        });
        return;
      }
    }
  } catch (error) {
    console.log("error while updating project in resource-allocation/rid page", error);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
    return;
  }
}
