import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { userSelectIdName } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import {
  perDefinedAdminRoleID,
  perDefinedProjectAdminRoleID,
  perDefinedProjectManagerRoleID,
  permissionTypeIds,
} from "../../../../DBConstants";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { filter, projectId, taskId, PMusers, indexFilter } = req.query;

      // decide top give access of users list to all users irrescpective of their role and permissions,
      // below comments are for reference if we were checking access before returign data
      // can ignore them

      const conditions = {};
      if (filter) {
        //  if you wannt to filter records the call api/v1/user?filter=supervisor,projectmanager
        // comma separeated values
        const filetrs = String(filter).toLowerCase().split(",");
        const supervisor = filetrs.includes("supervisor");
        const pm = filetrs.includes("projectmanager");
        if (!supervisor && !pm) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "please pass supervisor or projectmanager in filter paramater",
          });
          return;
        }
        if (supervisor) {
          // if current user has access (permission) to users then only can see all supervisors, as currently we need supervsior in users page only
          // const hasUsersAccess = await isUserHasAccess(userToken.userId,userToken.workspaceId, permissionTypeIds.users, perAccessIds.view);
          // if (!hasUsersAccess) {
          //   response({ res, success: true, status_code: 403, message: "Users dont have access to this resource." });
          //   return;
          // }
          conditions.canBeSupervisor = true;
        }
        if (pm) {
          // const hasProjectAccess = await isUserHasAccess(
          //   userToken.userId,userToken.workspaceId,
          //   permissionTypeIds.projAndTask,
          //   perAccessIds.view
          // );
          // if (!hasProjectAccess) {
          //   response({ res, success: true, status_code: 403, message: "Users dont have access to this resource." });
          //   return;
          // }
          // conditions.canBePM = true;
          // conditions.roleId = perDefinedProjectManagerRoleID;
          conditions.roleId = {
            in: [perDefinedProjectManagerRoleID, perDefinedProjectAdminRoleID, perDefinedAdminRoleID],
          };
        }
      }

      // currently we require users dropdown list only in tasks and project page, so we are checking if the user has access to tasks or projects
      // const hasProjectAccess = await isUserHasAccess(userToken.userId,userToken.workspaceId, permissionTypeIds.projAndTask, perAccessIds.view);
      // let hasTasksAccess = false;
      // if (!hasProjectAccess) {
      //   hasTasksAccess = await isUserHasAccess(userToken.userId,userToken.workspaceId, permissionTypeIds.projAndTask, perAccessIds.view);
      // }

      // if (hasProjectAccess || hasTasksAccess) {
      // } else {
      //   response({ res, success: true, status_code: 403, message: "You dont have access to this resource." });
      //   return;
      // }
      const users = await prisma.user.findMany({
        where: {
          workspaceId: userToken.workspaceId,
          assignedProjects: projectId
            ? {
                some: {
                  projectId: Number(projectId),
                },
              }
            : undefined,
          // assignedProjects:
          //   PMusers === "true"
          //     ? {
          //         some: {
          //           project: {
          //             pmId: userToken.userId,
          //           },
          //         },
          //       }
          //     : undefined,
          assignedTasks: taskId
            ? {
                some: {
                  taskId: Number(taskId),
                },
              }
            : undefined,
          // always return list of active users
          active: indexFilter ? undefined : true,
          ...conditions,
        },
        orderBy: {
          name: "asc",
        },
        select: userSelectIdName,
      });
      response({ res, success: true, status_code: 200, data: users, message: "Users fetched successfully" });
      return;
    } else {
      response({ res, success: false, status_code: 405, message: "Method Not Allowed" });
      return;
    }
  } catch (err) {
    console.error("error in user index page", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
