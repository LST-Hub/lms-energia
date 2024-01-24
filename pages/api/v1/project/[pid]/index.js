import prisma from "../../../../../lib/prisma";
import response from "../../../../../lib/response";
import {
  MaxNameLength,
  bigInpuMaxLength,
  fileAttachmentSizeLimit,
  projectSelectAll,
} from "../../../../../lib/constants";
import { authAndGetUserToken } from "../../../../../lib/getSessionData";
import { getAttachmentSize, handlePrismaDeleteError, isDataExists } from "../../../../../lib/backendUtils";
import { perAccessIds, permissionTypeIds } from "../../../../../DBConstants";
import { isUserHasAccess } from "../../../../../lib/backendUtils";
import { redisDelProject, redisSetProject } from "../../../../../lib/redis-operations";
import * as yup from "yup";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    const id = Number(req.query.pid);
    let projectDetails = null;
    if (id) {
      projectDetails = await prisma.project.findUnique({
        where: {
          workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
        },
        select: projectSelectAll,
      });
      if (!projectDetails) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "The requested project does not exist.",
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "project Id in URL is required",
      });
      return;
    }
    if (req.method === "GET") {
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.projAndTask,
        perAccessIds.view,
        { projectId: id }
      );
      if (hasAccess) {
        response({
          res,
          success: true,
          status_code: 200,
          data: [projectDetails],
          message: "Project details fetched successfully",
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to view this project.",
        });
        return;
      }
    } else if (req.method === "PUT") {
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.projAndTask,
        perAccessIds.view,
        { projectId: id }
      );
      if (hasAccess) {
        const {
          projectName,
          assignUsers,
          estimatedTime,
          description,
          statusId,
          priorityId,
          pmId,
          emailTimeSheet,
          startDate,
          estimatedEndDate,
          actualEndDate,
          active,
          attachmentsData,
          deleteAttachment,
          canSupervisorApproveTime,
          ticket,
          projectType,
        } = req.body;

        // we are checking if all the values are empty except attachments,
        // because when we edit a project and only update the attachments and no values then we check if other values does nto exist and only attachmeents exist
        // IF you added new values in the future then add them in the below array to check for empty values
        const allValuesButAttachments = [
          projectName,
          assignUsers,
          estimatedTime,
          description,
          statusId,
          priorityId,
          pmId,
          emailTimeSheet,
          startDate,
          estimatedEndDate,
          active,
          actualEndDate,
          canSupervisorApproveTime,
          projectType,
        ];

        const schema = yup.object().shape({
          projectName: yup.string().required().trim().max(MaxNameLength),
          assignUsers: yup
            .array()
            .of(yup.object().shape({ id: yup.number().required() }))
            .min(1, "Assign at least one user"),
          estimatedTime: yup.number().nullable(),
          description: yup.string().trim().max(bigInpuMaxLength).nullable(),
          statusId: yup.number().required(),
          priorityId: yup.number().nullable(),
          pmId: yup.number().required(),
          ticket: yup.boolean().nullable(),
          startDate: yup.string().nullable(),
          estimatedEndDate: yup.string().nullable(),
          canSupervisorApproveTime: yup.boolean(),
          projectType: yup.string().nullable(),
        });

        try {
          await schema.validate({
            projectName,
            assignUsers,
            estimatedTime,
            description,
            statusId,
            priorityId,
            pmId,
            emailTimeSheet,
            startDate,
            estimatedEndDate,
            actualEndDate,
            active,
            canSupervisorApproveTime,
            projectType,
          });
        } catch (error) {
          console.log("error while validating project data in project/pid page", error);
          response({
            res,
            success: false,
            status_code: 400,
            message: "Validation error",
            errors: error.errors,
          });
        }

        // check if the clientId, statusId, priorityId, assignUsers is inactive if yes then show the appropriate message
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

        const pm = await prisma.user.findFirst({
          where: {
            id: pmId,
            workspaceId: userToken.workspaceId,
            active: true,
          },
        });
        if (!pm) {
          response({ res, success: false, status_code: 400, message: "Project Manager is inactive" });
          return;
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
          const updatedProject = await prisma.project.update({
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
                : undefined,
            },
          });
          response({
            res,
            success: true,
            status_code: 200,
            data: [updatedProject],
            message: "Project updated successfully",
          });
          return;
        } else if (!projectName) {
          response({
            res,
            success: false,
            status_code: 404,
            message: "Please provide Project Name and Client Name.",
          });
          return;
        }
        const projectExists = await prisma.project.findFirst({
          // we are checking if the project name already exists in the workspace for same client
          where: {
            AND: {
              name: projectName,
              workspaceId: userToken.workspaceId,
              clientId: projectDetails.client.id,
              id: { not: id },
            },
          },
        });
        if (projectExists) {
          response({
            res,
            success: false,
            status_code: 404,
            message: "Project with same name already exists for this client.",
          });
          return;
        }
        const updatedProject = await prisma.project.update({
          where: {
            workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
          },
          data: {
            name: projectName,
            description: description,
            // we are doing create meany because we are having third table between project and user
            projectUsers:
              //TODO: check if all users are removed and does it removes all users or throw error
              assignUsers
                ? {
                    //TODO: romove only those users which are not in the new list and add the new users
                    deleteMany: {},
                    createMany: {
                      data: assignUsers.map((user) => {
                        return { userId: user.id };
                      }),
                    },
                    // set: {data:u},
                  }
                : undefined,
            estimatedTime: Number(estimatedTime),
            pmId: pmId,
            statusId: statusId,
            priorityId: priorityId,
            startDate: startDate ? new Date(startDate) : startDate, // if this date is null or undefined, then pass that else pass date
            estimatedEndDate: estimatedEndDate ? new Date(estimatedEndDate) : estimatedEndDate, // if this date is null or undefined, then pass that else pass date
            actualEndDate: actualEndDate ? new Date(actualEndDate) : actualEndDate, // if this date is null or undefined, then pass that else pass date
            // emailsCC: emailTimeSheet ? [emailTimeSheet] : emailTimeSheet,
            projectType: projectType,
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
              : undefined,
            active: active,
            canSupervisorApproveTime: canSupervisorApproveTime,
            ticket: ticket,
          },
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: [updatedProject],
          message: "Project updated successfully",
        });
        redisSetProject(updatedProject.id, userToken.workspaceId, { id: updatedProject.id, pmId: updatedProject.pmId });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to edit this project.",
        });
        return;
      }
    } else if (req.method === "PATCH") {
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.projAndTask,
        perAccessIds.edit,
        { projectId: id }
      );
      if (hasAccess) {
        const { active } = req.body;
        const project = await prisma.project.update({
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
          data: [project],
          message: "Project Updated Successfully",
        });
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to edit this project.",
        });
        return;
      }
    } else if (req.method === "DELETE") {
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.projAndTask,
        perAccessIds.all,
        { projectId: id }
      );
      if (hasAccess) {
        try {
          const projectDelete = await prisma.project.delete({
            where: {
              workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
            },
          });

          redisDelProject(id, userToken.workspaceId);

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
            message: "Project deleted successfully",
          });
          return;
        } catch (e) {
          const errRes = handlePrismaDeleteError(e, "Project");
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
          message: "You don't have access to delete this project.",
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
    console.log("error while updating project in project/pid page", error);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
    return;
  }
}
