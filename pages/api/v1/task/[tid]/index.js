import prisma from "../../../../../lib/prisma";
import response from "../../../../../lib/response";
import { MaxNameLength, bigInpuMaxLength, fileAttachmentSizeLimit, taskSelectAll } from "../../../../../lib/constants";
import { authAndGetUserToken } from "../../../../../lib/getSessionData";
import {
  getAttachmentSize,
  getTaskCache,
  handlePrismaDeleteError,
  isDataExists,
} from "../../../../../lib/backendUtils";
import { perAccessIds, permissionTypeIds } from "../../../../../DBConstants";
import { isUserHasAccess } from "../../../../../lib/backendUtils";
import { redisDelTask } from "../../../../../lib/redis-operations";
import * as yup from "yup";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    const id = Number(req.query.tid);
    let taskDetails = null;
    if (id) {
      taskDetails = await prisma.task.findUnique({
        where: {
          workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
        },
        select: taskSelectAll,
      });
      if (!taskDetails) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "The requested task does not exist.",
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "task Id in URL is required",
      });
      return;
    }
    if (req.method === "GET") {
      const taskCatche = await getTaskCache(id, userToken.workspaceId);
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.projAndTask,
        perAccessIds.view,
        { projectId: taskCatche ? taskCatche.projectId : null }
      );
      if (hasAccess) {
        response({
          res,
          success: true,
          status_code: 200,
          data: [taskDetails],
          message: "Task details fetched successfully",
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You do not have access to view this task",
        });
        return;
      }
    } else if (req.method === "PUT") {
      const taskCatche = await getTaskCache(id, userToken.workspaceId);

      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.projAndTask,
        perAccessIds.edit,
        { projectId: taskCatche ? taskCatche.projectId : null }
      );
      if (hasAccess) {
        const {
          taskName,
          description,
          priorityId,
          statusId,
          startDate,
          estimatedEndDate,
          actualEndDate,
          estimatedTime,
          assignedUsers,
          billable,
          active,
          attachmentsData,
          deleteAttachment,
        } = req.body;
        // console.log("attachmentsData", attachmentsData);

        // we are checking if all the values are empty except attachments,
        // because when we edit a task and only update the attachments and no values then we check if other values does nto exist and only attachmeents exist
        // IF you added new values in the future then add them in the below array to check for empty values
        const allValuesButAttachments = [
          taskName,
          description,
          priorityId,
          statusId,
          startDate,
          estimatedEndDate,
          actualEndDate,
          estimatedTime,
          billable,
          active,
          assignedUsers,
        ];

        // if (!taskName || !statusId) {
        //   response({
        //     res,
        //     success: false,
        //     status_code: 400,
        //     message: "Please provide task Name, Status",
        //   });
        //   return;
        // }

        const schema = yup.object().shape({
          taskName: yup.string().required().trim().max(MaxNameLength),
          description: yup.string().trim().max(bigInpuMaxLength),
          priorityId: yup.number().nullable(),
          statusId: yup.number().required(),
          startDate: yup.string().nullable(),
          estimatedEndDate: yup.string().nullable(),
          actualEndDate: yup.string().nullable(),
          estimatedTime: yup.number().nullable(),
          billable: yup.boolean(),
          active: yup.boolean(),
          assignUsers: yup.array().of(
            yup.object().shape({
              id: yup.number().required(),
            })
          ),
        });

        try {
          await schema.validate({
            taskName,
            description,
            priorityId,
            statusId,
            startDate,
            estimatedEndDate,
            actualEndDate,
            estimatedTime,
            billable,
            active,
            assignedUsers,
          });
        } catch (error) {
          console.log("error in task validation", error);
          response({
            res,
            success: false,
            status_code: 400,
            message: error.message,
          });
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

        const assignUserIds = assignedUsers.map((user) => user.id);
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

        if (attachmentsData?.length > 0 && deleteAttachment !== true) {
          let newFilesSize = 0;
          attachmentsData.forEach((file) => {
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

        if (!isDataExists(allValuesButAttachments) && attachmentsData) {
          const updatedTask = await prisma.task.update({
            where: {
              workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
            },
            data: {
              attachments: attachmentsData
                ? {
                    deleteMany: {},
                    create: attachmentsData.map((file) => {
                      return {
                        key: file?.key,
                        name: file?.name,
                        sizeInKb: file?.sizeInKb,
                        createdById: userToken.userId,
                        workspaceId: userToken.workspaceId,
                      };
                    }),
                  }
                : attachmentsData,
            },
          });
          response({
            res,
            success: true,
            status_code: 200,
            data: [updatedTask],
            message: "Task updated attachment successfully",
          });
          return;
        } else if (!taskName) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Task Name and Project Id are required",
          });
          return;
        }
        const taskExists = await prisma.task.findFirst({
          where: {
            name: taskName,
            workspaceId: userToken.workspaceId,
            projectId: taskDetails.projectId,
            id: {
              not: id,
            },
          },
        });
        if (taskExists) {
          response({
            res,
            success: false,
            status_code: 404,
            message: "Task with same name already exists for this project.",
          });
          return;
        }
        const updatedTask = await prisma.task.update({
          where: {
            workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
          },
          data: {
            name: taskName,
            description: description,
            priorityId: priorityId,
            statusId: statusId,
            startDate: startDate ? new Date(startDate) : startDate,
            estimatedEndDate: estimatedEndDate ? new Date(estimatedEndDate) : estimatedEndDate,
            actualEndDate: actualEndDate ? new Date(actualEndDate) : actualEndDate,
            estimatedTime: Number(estimatedTime),
            taskUsers: assignedUsers
              ? {
                  deleteMany: {},
                  createMany: {
                    data: assignedUsers.map((user) => {
                      return {
                        userId: user.value,
                      };
                    }),
                  },
                }
              : undefined,
            attachments: attachmentsData
              ? {
                  deleteMany: {},
                  create: attachmentsData.map((file) => {
                    return {
                      key: file.key,
                      name: file.name,
                      sizeInKb: file.sizeInKb,
                      createdById: userToken.userId,
                      workspaceId: userToken.workspaceId,
                    };
                  }),
                }
              : attachmentsData,
            billable: billable,
            active: active,
          },
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: [updatedTask],
          message: "Task Updated Successfully",
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You do not have access to edit this task",
        });
        return;
      }
    } else if (req.method === "PATCH") {
      const taskCatche = await getTaskCache(id, userToken.workspaceId);

      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.projAndTask,
        perAccessIds.edit,
        { projectId: taskCatche ? taskCatche.projectId : id }
      );
      if (hasAccess) {
        const { active } = req.body;
        const task = await prisma.task.update({
          where: {
            workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
          },
          data: {
            active: active,
          },
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: [task],
          message: "Task Updated Successfully",
        });
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You do not have access to edit this task",
        });
        return;
      }
    } else if (req.method === "DELETE") {
      const taskCatche = await getTaskCache(id, userToken.workspaceId);

      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.projAndTask,
        perAccessIds.all,
        { projectId: taskCatche ? taskCatche.projectId : id }
      );
      if (hasAccess) {
        try {
          const taskDelete = await prisma.task.delete({
            where: {
              workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
            },
          });
          redisDelTask(id, userToken.workspaceId);

          response({
            res,
            success: true,
            status_code: 200,
            data: [
              {
                deleted: true,
                hasChild: false,
                error: false,
              },
            ],
            message: "Task deleated successfully",
          });
          return;
        } catch (e) {
          const errRes = handlePrismaDeleteError(e, "Task");
          response({
            res,
            success: false,
            status_code: 400,
            data: [
              {
                deleted: false,
                ...errRes,
              },
            ],
            message: errRes.message,
          });
          return;
        }
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to delete this user",
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 405,
        message: "Method not allowed",
      });
      return;
    }
  } catch (error) {
    console.log("error in tasks [tid] file", error);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some internal error occured. Please try again later.",
    });
  }
}
