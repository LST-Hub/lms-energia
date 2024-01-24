import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import {
  MaxNameLength,
  bigInpuMaxLength,
  fileAttachmentSizeLimit,
  maxTake,
  taskSelectSome,
} from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { perAccessIds, permissionTypeIds, roleRestrictionIds } from "../../../../DBConstants";
import {
  getAttachmentSize,
  getProjIdsWherePmis,
  getRecordCounts,
  getUserRoleRestrictionId,
  isUserHasAccess,
} from "../../../../lib/backendUtils";
import { minSearchLength } from "../../../../src/utils/Constants";
import { redisSetTask } from "../../../../lib/redis-operations";
import * as yup from "yup";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { active, search, projectId, priorityId, statusId } = req.query;
      let taskActive = undefined;
      if (active) {
        taskActive = active === "true" ? true : false;
      }
      const searchArr =
        search && search.length >= minSearchLength
          ? [
              {
                // db column name
                name: {
                  startsWith: search,
                  // mode: "insensitive",
                },
              },
            ]
          : undefined;
      const idForProject = projectId ? Number(projectId) : undefined;
      const idForPriority = priorityId ? Number(priorityId) : undefined;
      const idForStatus = statusId ? Number(statusId) : undefined;
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
            // the below query will return all tasks who are created by the current user
            task = await prisma.task.findMany({
              where: {
                AND: {
                  workspaceId: userToken.workspaceId,
                  active: taskActive,
                  createdById: userToken.userId,
                  projectId: idForProject,
                  priorityId: idForPriority,
                  statusId: idForStatus,
                },
                OR: searchArr,
              },
              take: maxTake,
              orderBy: {
                project: {
                  name: "asc",
                },
              },
              select: taskSelectSome,
            });
            break;
          case roleRestrictionIds.subordinates:
            const projectIds = await getProjIdsWherePmis(userToken.userId, userToken.workspaceId);
            task = await prisma.task.findMany({
              where: {
                AND: {
                  workspaceId: userToken.workspaceId,
                  active: taskActive,
                  projectId: idForProject,
                  priorityId: idForPriority,
                  statusId: idForStatus,
                  projectId: { in: projectIds },
                },
                OR: searchArr,
              },
              take: maxTake,
              orderBy: {
                project: {
                  name: "asc",
                },
              },
              select: taskSelectSome,
            });
            break;
          case roleRestrictionIds.none:
            // the below query will return all tasks of the current workspace
            task = await prisma.task.findMany({
              where: {
                workspaceId: userToken.workspaceId,
                active: taskActive,
                projectId: idForProject,
                priorityId: idForPriority,
                statusId: idForStatus,
                OR: searchArr,
              },
              take: maxTake,
              orderBy: {
                project: {
                  name: "asc",
                },
              },
              select: taskSelectSome,
            });
            break;
          default:
            task = [];
            break;
        }
        // task = await prisma.task.findMany({
        //   where: {
        //     workspaceId: userToken.workspaceId,
        //   },
        //   take: maxTake,
        //   select: taskSelectSome,
        // });
        response({ res, success: true, status_code: 200, data: task, message: "Task fetched successfully" });
        return;
      } else {
        response({ res, success: false, status_code: 401, message: "You don't have access to view Tasks" });
        return;
      }
    } else if (req.method === "POST") {
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.projAndTask,
        perAccessIds.create
      );
      if (hasAccess) {
        const {
          taskName,
          projectId,
          statusId,
          priorityId,
          startDate,
          endDate,
          estimatedTime,
          billable,
          description,
          assignUsers,
          filesData,
        } = req.body;

        // if (!taskName || !projectId || !statusId) {
        //   response({
        //     res,
        //     success: false,
        //     status_code: 400,
        //     message: "Please provide Task Name and Project Name",
        //   });
        //   return;
        // }

        const schema = yup.object().shape({
          taskName: yup.string().required().trim().max(MaxNameLength),
          projectId: yup.number().required(),
          statusId: yup.number().required(),
          priorityId: yup.number().nullable(),
          startDate: yup.string().nullable(),
          endDate: yup.string().nullable(),
          estimatedTime: yup.number().nullable(),
          billable: yup.boolean(),
          description: yup.string().trim().max(bigInpuMaxLength),
          assignUsers: yup.array().of(
            yup.object().shape({
              id: yup.number().required(),
            })
          ),
        });

        try {
          await schema.validate({
            taskName,
            projectId,
            statusId,
            priorityId,
            startDate,
            endDate,
            estimatedTime,
            billable,
            description,
            assignUsers,
          });
        } catch (error) {
          console.error("error in task validation", error);
          response({
            res,
            success: false,
            status_code: 400,
            message: error.message,
          });
          return;
        }

        const project = await prisma.project.findFirst({
          where: {
            id: projectId,
            workspaceId: userToken.workspaceId,
            active: true,
          },
        });
        if (!project) {
          response({ res, success: false, status_code: 400, message: "Project is inactive" });
          return;
        }

        const status = await prisma.status.findFirst({
          where: {
            id: statusId,
            workspaceId: userToken.workspaceId,
            active: true,
          },
        });
        if (!status) {
          response({ res, success: false, status_code: 400, message: "Status in inactive" });
          return;
        }

        if (!!priorityId) {
          const priority = await prisma.priority.findFirst({
            where: {
              id: priorityId,
              workspaceId: userToken.workspaceId,
              active: true,
            },
          });
          if (!priority) {
            response({ res, success: false, status_code: 400, message: "Priority is inactive" });
            return;
          }
        }

        const assignUserIds = assignUsers.map((user) => user.id);
        const users = await prisma.user.findMany({
          where: {
            id: { in: assignUserIds },
            workspaceId: userToken.workspaceId,
            active: true,
          },
        });
        // if (users.length !== assignUserIds.length) {
        //   response({ res, success: false, status_code: 400, message: "One or more assign users are inactive" });
        //   return;
        // }

        if (filesData?.length > 0) {
          let newFilesSize = 0;
          filesData.forEach((file) => {
            newFilesSize += file.sizeInKb;
          });

          const attachmentSize = await getAttachmentSize(userToken.userId, userToken.workspaceId);
          if (attachmentSize + newFilesSize >= fileAttachmentSizeLimit) {
            response({
              res,
              success: false,
              status_code: 400,
              message: `You have exceeded the attachment limit of ${fileAttachmentSizeLimit}KB`,
            });
            return;
          }
        }

        const taskExists = await prisma.task.findFirst({
          where: {
            workspaceId: userToken.workspaceId,
            name: taskName,
            projectId: projectId,
          },
        });
        if (taskExists) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Task with same name already exists for this project",
          });
          return;
        }

        const counts = await getRecordCounts(userToken.workspaceId);
        const [task, updateCount] = await prisma.$transaction([
          prisma.task.create({
            data: {
              id: counts.task + 1,
              name: taskName,
              billable: billable,
              description: description,
              estimatedTime: Number(estimatedTime),
              statusId: statusId ? statusId : undefined,
              priorityId: priorityId ? priorityId : undefined,
              projectId: projectId,
              taskUsers: assignUsers
                ? {
                    create: assignUsers.map((user) => {
                      return { userId: user.id };
                    }),
                  }
                : undefined,
              createdById: userToken.userId,
              workspaceId: userToken.workspaceId,
              attachments: filesData
                ? {
                    create: filesData.map((file) => {
                      return {
                        key: file.key,
                        name: file.name,
                        sizeInKb: file.sizeInKb,
                        createdById: userToken.userId,
                        workspaceId: userToken.workspaceId,
                      };
                    }),
                  }
                : undefined,
              startDate: startDate ? new Date(startDate) : startDate,
              estimatedEndDate: endDate ? new Date(endDate) : endDate,
            },
          }),
          prisma.recordCounts.update({
            where: {
              workspaceId: userToken.workspaceId,
            },
            data: {
              task: {
                increment: 1,
              },
            },
          }),
        ]);

        redisSetTask(task.id, userToken.workspaceId, { id: task.id, projectId: task.projectId });

        response({ res, success: true, status_code: 200, data: [task], message: "Task created successfully" });
      } else {
        response({ res, success: false, status_code: 401, message: "You don't have access to create Tasks" });
        return;
      }
    } else if (req.method === "PATCH") {
      // we use patcxh for deleting multiple records in batch
      // if deleting task then delete cache also
      // for (id of ids) redisDelTask(task.id, userToken.workspaceId, { id: task.id, createdById: userToken.userId });
    } else {
      response({
        res,
        success: false,
        status_code: 405,
        message: "Method Not Allowed",
      });
    }
  } catch (err) {
    console.log("error in project index file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
