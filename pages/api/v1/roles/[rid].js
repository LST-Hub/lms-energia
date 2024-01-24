import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { roleSelectAll } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { perAccessIds, permissionTypeIds } from "../../../../DBConstants";
import { handlePrismaDeleteError, isUserHasAccess, updateRoleCache } from "../../../../lib/backendUtils";
import { redisDelRole, redisSetRole } from "../../../../lib/redis-operations";

export default async function handler(req, res) {
  try {
    const rid = req.query.rid;
    const id = Number(rid);
    const userToken = await authAndGetUserToken(req);
    let roleDetails = null;
    if (id) {
      roleDetails = await prisma.role.findUnique({
        where: {
          workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
        },
        select: roleSelectAll,
      });
      if (!roleDetails) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "The requested role does not exist.",
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "Please provide ID in the url",
      });
      return;
    }

    if (req.method === "GET") {
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.roles,
        perAccessIds.view,
        {}
      );
      if (hasAccess) {
        response({
          res,
          success: true,
          status_code: 200,
          data: [roleDetails],
          message: "Role details fetched successfully",
        });
        // updating cache after response and before return
        // updating role cache just for safe side, if cache ever has wrong values
        // don't await the redisSetRole here
        const roleCache = {
          permissions: {},
          createdById: roleDetails.createdById,
          workspaceId: roleDetails.workspaceId,
          restrictionId: roleDetails.restrictionId,
          isAdmin: roleDetails.isAdmin,
          active: roleDetails.active,
        };
        roleDetails.permissions.forEach((p) => {
          roleCache.permissions[p.permissionId] = { accessLevel: p.accessLevel };
        });
        // redisSetRole(userToken.userId, userToken.workspaceId, roleCache);
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to view this role",
        });
        return;
      }
    } 
    // else if (req.method === "PUT") {
    //   const hasAccess = await isUserHasAccess(
    //     userToken.userId,
    //     userToken.workspaceId,
    //     permissionTypeIds.roles,
    //     perAccessIds.edit,
    //     {}
    //   );
    //   if (hasAccess) {
    //     const { roleName, roleDescription, restrictionId, permissions, active } = req.body;
    //     if (roleDetails.isAdmin) {
    //       response({
    //         res,
    //         success: false,
    //         status_code: 400,
    //         message: "You can't edit admin role",
    //       });
    //       return;
    //     }
    //     if (!roleName) {
    //       response({
    //         res,
    //         success: false,
    //         status_code: 400,
    //         message: "RoleName, it's permissions and restrictionId are required",
    //       });
    //       return;
    //     }

    //     const roleExists = await prisma.role.findFirst({
    //       where: {
    //         name: roleName,
    //         workspaceId: userToken.workspaceId,
    //         id: {
    //           not: id,
    //         },
    //       },
    //     });

    //     if (roleExists) {
    //       response({
    //         res,
    //         success: false,
    //         status_code: 404,
    //         message: "Role With same name already exists",
    //       });
    //       return;
    //     }

    //     if (Array.isArray(permissions)) {
    //       // first delete all role permissions and then create new ones
    //       const role = await prisma.role.update({
    //         where: {
    //           workspaceId_id:{id: id,
    //           workspaceId: userToken.workspaceId,}
    //         },
    //         data: {
    //           name: roleName,
    //           description: roleDescription,
    //           restrictionId: restrictionId,
    //           permissions: {
    //             deleteMany: {},
    //             create: permissions.map((p) => ({
    //               permissionId: p.permissionId,
    //               accessLevel: p.accessId,
    //             })),
    //           },
    //           active: active,
    //         },
    //       });
    //       if (role) {
    //         // update role cache
    //         // it returns a promise but dont await for it here
    //         updateRoleCache(id, userToken.workspaceId);
    //       }
    //       response({
    //         res,
    //         success: true,
    //         status_code: 200,
    //         data: [role],
    //         message: "Role Details updated successfully",
    //       });
    //       return;
    //     } else {
    //       response({
    //         res,
    //         success: false,
    //         status_code: 422,
    //         message: "permissions is not array, please pass array of permissions",
    //       });
    //       return;
    //     }
    //   } else {
    //     response({
    //       res,
    //       success: false,
    //       status_code: 403,
    //       message: "You don't have access to edit this role",
    //     });
    //     return;
    //   }
    // } else if (req.method === "PATCH") {
    //   const hasAccess = await isUserHasAccess(
    //     userToken.userId,
    //     userToken.workspaceId,
    //     permissionTypeIds.roles,
    //     perAccessIds.edit,
    //     {}
    //   );
    //   if (hasAccess) {
    //     if (roleDetails.isAdmin === true) {
    //       response({
    //         res,
    //         success: false,
    //         status_code: 400,
    //         message: "You can't Inactive admin role",
    //       });
    //       return;
    //     }
    //     const { active } = req.body;
    //     const role = await prisma.role.update({
    //       where: {
    //         workspaceId_id:            {id: id,
    //         workspaceId: userToken.workspaceId,}
    //       },
    //       data: {
    //         active: active,
    //       },
    //     });
    //     if (role) {
    //       // update role cache
    //       // it returns a promise but dont await for it here
    //       updateRoleCache(id, userToken.workspaceId);
    //     }
    //     response({
    //       res,
    //       success: true,
    //       status_code: 200,
    //       data: [role],
    //       message: "Role Details updated successfully",
    //     });
    //   } else {
    //     response({
    //       res,
    //       success: false,
    //       status_code: 403,
    //       message: "You don't have access to edit this role",
    //     });
    //     return;
    //   }
    // } else if (req.method === "DELETE") {
    //   const hasAccess = await isUserHasAccess(
    //     userToken.userId,
    //     userToken.workspaceId,
    //     permissionTypeIds.roles,
    //     perAccessIds.all,
    //     {}
    //   );
    //   if (hasAccess) {
    //     try {
    //       const role = await prisma.role.delete({
    //         where: {
    //           workspaceId_id:{id: id,
    //           workspaceId: userToken.workspaceId,}
    //         },
    //       });

    //       // redisDelRole(id, userToken.workspaceId);

    //       response({
    //         res,
    //         success: true,
    //         status_code: 200,
    //         data: [
    //           {
    //             deleted: true,
    //             hasChild: false,
    //             error: false,
    //           },
    //         ],
    //         message: "Role deleted successfully",
    //       });
    //       return;
    //     } catch (e) {
    //       const errRes = handlePrismaDeleteError(e, "Role");
    //       response({
    //         res,
    //         success: false,
    //         status_code: 400,
    //         data: [
    //           {
    //             deleted: false,
    //             ...errRes,
    //           },
    //         ],
    //         message: errRes.message,
    //       });
    //       return;
    //     }
    //   } else {
    //     response({
    //       res,
    //       success: false,
    //       status_code: 403,
    //       message: "You don't have access to delete this user",
    //     });
    //     return;
    //   }
    // } 
    else {
      response({
        res,
        success: false,
        status_code: 405,
        message: "Method not allowed",
      });
      return;
    }
  } catch (err) {
    console.error("error in the role details id file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
