import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import {
  MaxNameLength,
  bigInpuMaxLength,
  fileAttachmentSizeLimit,
  maxTake,
  projectSelectSome,
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
import { redisSetProject } from "../../../../lib/redis-operations";
import * as yup from "yup";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { active, search, pmId, statusId, priorityId, clientId } = req.query;
      let projectActive = undefined;
      if (active) {
        projectActive = active === "true" ? true : false;
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
              // {
              //   projectUsers: {
              //     some: {
              //       user: {
              //         name: {
              //           startsWith: search,
              //           mode: "insensitive",
              //         },
              //       },
              //     },
              //   },
              // },
            ]
          : undefined;
      const idForPm = pmId ? Number(pmId) : undefined; // pmIs is not number, as pm is a user and users have string ids
      const idForStatus = statusId ? Number(statusId) : undefined;
      const idForPriority = priorityId ? Number(priorityId) : undefined;
      const idForClient = clientId ? Number(clientId) : undefined;
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.projAndTask,
        perAccessIds.view
      );
      if (hasAccess) {
        const restrictionId = await getUserRoleRestrictionId(userToken.userId, userToken.workspaceId);
        let project = [];
        switch (restrictionId) {
          case roleRestrictionIds.own:
            // the below query will return all projects who are created by the current user
            project = await prisma.project.findMany({
              where: {
                AND: {
                  workspaceId: userToken.workspaceId,
                  active: projectActive,
                  createdById: userToken.userId,
                  pmId: idForPm,
                  clientId: idForClient,
                  statusId: idForStatus,
                  priorityId: idForPriority,
                },
                OR: searchArr,
              },
              orderBy: [
                {
                  name: "asc",
                },
              ],
              take: maxTake,
              select: projectSelectSome,
            });
            break;
          case roleRestrictionIds.subordinates:
            // the below query will return all projects which are created by the subordinates of the current user and the projects which are created by the current user
            // const subordinateIds = await getSubordinateIds(userToken.userId, userToken.workspaceId);
            // project = await prisma.project.findMany({
            //   where: {
            //     AND: {
            //       workspaceId: userToken.workspaceId,
            //       active: projectActive,
            //       pmId: idForPm,
            //       statusId: idForStatus,
            //       priorityId: idForPriority,
            //       OR: [
            //         {
            //           createdById: { in: subordinateIds },
            //         },
            //         {
            //           createdById: userToken.userId,
            //         },
            //       ],
            //     },
            //     OR: searchArr,
            //   },
            //   take: maxTake,
            //   select: projectSelectSome,
            // });
            // break;
            const ProjectIds = await getProjIdsWherePmis(userToken.userId, userToken.workspaceId);
            project = await prisma.project.findMany({
              where: {
                AND: {
                  workspaceId: userToken.workspaceId,
                  active: projectActive,
                  pmId: idForPm,
                  clientId: idForClient,
                  statusId: idForStatus,
                  priorityId: idForPriority,
                  id: { in: ProjectIds },
                },
                OR: searchArr,
              },
              orderBy: [
                {
                  name: "asc",
                },
              ],
              take: maxTake,
              select: projectSelectSome,
            });
            break;
          case roleRestrictionIds.none:
            // the below query will return all projects of workspace
            project = await prisma.project.findMany({
              where: {
                workspaceId: userToken.workspaceId,
                active: projectActive,
                pmId: idForPm,
                clientId: idForClient,
                statusId: idForStatus,
                priorityId: idForPriority,
                OR: searchArr,
              },
              orderBy: [
                {
                  name: "asc",
                },
              ],
              take: maxTake,
              select: projectSelectSome,
            });
            break;
          default:
            project = [];
            break;
        }

        response({ res, success: true, status_code: 200, data: project, message: "Project fetched successfully" });
        return;
      } else {
        response({ res, success: false, status_code: 401, message: "You don't have access to view Projects" });
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
          projectName,
          clientId,
          assignUsers,
          estimatedTime,
          description,
          statusId,
          priorityId,
          pmId,
          ticket,
          startDate,
          estimatedEndDate,
          canSupervisorApproveTime,
          attachmentsData,
          projectType,
        } = req.body;
        // console.log("filesData", filesData);
        // if (!projectName || !clientId || !pmId || !statusId || !assignUsers) {
        //   response({
        //     res,
        //     success: false,
        //     status_code: 400,
        //     message: "Please provide Project Name, Client Name, Project Manager, Status, Assign Users",
        //   });
        //   return;
        // }

        const schema = yup.object().shape({
          projectName: yup.string().required().trim().max(MaxNameLength),
          clientId: yup.number().required(),
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
          projectType: yup.string().nullable(),
        });

        try {
          await schema.validate({
            projectName,
            clientId,
            assignUsers,
            estimatedTime,
            description,
            statusId,
            priorityId,
            pmId,
            ticket,
            startDate,
            estimatedEndDate,
            canSupervisorApproveTime,
            attachmentsData,
            projectType,
          });
        } catch (error) {
          console.log("error", error);
          response({ res, success: false, status_code: 400, message: error.message });
          return;
        }

        // check if the clientId, statusId, priorityId, assignUsers is inactive if yes then show the appropriate message
        const client = await prisma.client.findFirst({
          where: {
            id: clientId,
            workspaceId: userToken.workspaceId,
            active: true,
          },
        });
        if (!client) {
          response({ res, success: false, status_code: 400, message: "Client is inactive" });
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

        if (attachmentsData?.length > 0) {
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

        const projectExists = await prisma.project.findFirst({
          where: {
            workspaceId: userToken.workspaceId,
            name: projectName,
            clientId: clientId,
          },
        });
        if (projectExists) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Project with same name already exists for this client",
          });
          return;
        }
        const counts = await getRecordCounts(userToken.workspaceId);
        const [project, updateCount] = await prisma.$transaction([
          prisma.project.create({
            data: {
              id: counts.project + 1,
              name: projectName,
              description: description,
              projectUsers: {
                create: assignUsers?.map((user) => {
                  return { userId: user.id };
                }),
              },
              estimatedTime: Number(estimatedTime),
              pmId: pmId, // project manager is mandatory, hence we pass didn't pass undefined
              clientId: clientId,
              statusId: statusId ? statusId : undefined,
              priorityId: priorityId ? priorityId : undefined,
              workspaceId: userToken.workspaceId,
              createdById: userToken.userId,
              ticket: ticket,
              attachments: attachmentsData
                ? {
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
              startDate: startDate ? new Date(startDate) : startDate,
              canSupervisorApproveTime: canSupervisorApproveTime,
              estimatedEndDate: estimatedEndDate ? new Date(estimatedEndDate) : estimatedEndDate,
              projectType: projectType,
              // emailsCC: emailTimeSheet ? [emailTimeSheet] : emailTimeSheet,
            },
          }),
          prisma.recordCounts.update({
            where: {
              workspaceId: userToken.workspaceId,
            },
            data: {
              project: {
                increment: 1, // increment count by 1, as new project added
              },
            },
          }),
        ]);

        redisSetProject(project.id, userToken.workspaceId, { id: project.id, pmId: project.pmId });

        response({ res, success: true, status_code: 200, data: [project], message: "Project created successfully" });
        return;
      } else {
        response({ res, success: false, status_code: 401, message: "You don't have access to view this Project" });
        return;
      }
    } else if (req.method === "PATCH") {
      // we use patch request to delete multiple records in batch
      // delte all client ids from cache also
      // for (id of ids)
      //   redisDelProject(project.id, userToken.workspaceId, { id: project.id, createdById: userToken.userId });
    } else {
      response({ res, success: false, status_code: 405, message: "Method not allowed" });
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
