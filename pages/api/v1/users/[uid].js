import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import {
  MaxEmailLength,
  MaxNameLength,
  MaxPhoneNumberLength,
  bigInpuMaxLength,
  userSelectAll,
} from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import {
  perAccessIds,
  perDefinedAdminRoleID,
  perDefinedProjectAdminRoleID,
  perDefinedProjectManagerRoleID,
  permissionTypeIds,
} from "../../../../DBConstants";
import {
  getRoleCache,
  handlePrismaDeleteError,
  isAdminRole,
  isUserAdmin,
  isUserHasAccess,
  updateUserCache,
} from "../../../../lib/backendUtils";
import { redisDelUser } from "../../../../lib/redis-operations";
import * as yup from "yup";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    const id = Number(req.query.uid);
    let user = null;
    if (id) {
      user = await prisma.user.findUnique({
        where: {
          workspaceId_id: {
            id: id,
            workspaceId: userToken.workspaceId,
          },
        },
        select: userSelectAll,
      });
      if (!user) {
        response({ res, success: false, status_code: 404, message: "The requested user does not exist." });
        return;
      }
    } else {
      response({ res, success: false, status_code: 400, message: "User Id in URl is required" });
      return;
    }

    if (req.method === "GET") {
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.users,
        perAccessIds.view,
        {}
      );
      if (hasAccess) {
        // updating user cache just for safe side, if cache ever has wrong values
        // don't await the redisSetUser here
        // redisSetUser(userToken.userId, userToken.workspaceId, {
        //   createdById: user.createdById,
        //   workspaceId: user.workspaceId,
        //   canBePM: user.canBePM,
        //   canBeSupervisor: user.canBeSupervisor,
        //   active: user.active,
        //   roleId: user.roleId,
        // });
        response({ res, success: true, status_code: 200, data: [user], message: "Users fetched successfully" });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to view this user",
        });
        return;
      }
    } else if (req.method === "PUT") {
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.users,
        perAccessIds.edit,
        {}
      );
      if (hasAccess) {
        const {
          firstName,
          lastName,
          name,
          designation,
          phoneNumber,
          zipCode,
          country,
          address,
          notes,
          active,
          canBePM,
          canBeSupervisor,
          supervisorId,
          departmentId,
          workCalendarId,
          roleId,
          type,
          gender,
          image,
        } = req.body;

        if (supervisorId === id) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "User cannot become supervisor of himself.",
          });
          return;
        }

        // WE ARE NOT MAKGIN SUPERVISOR MANDATORY FOR NOW, SO COMMENTING THIS CODE

        // I have done it considering that data comes from UI, as whendata comes froom UI role and supeervisorId both comes from there currently,
        // but if we are going to use this with not getting all data and will get only some data from request, like only roleID and not supervisorId
        // then we need to check if the role is admin or not, if admin then we need to check if the supervisorId is there or not  for thst user
        // if (!supervisorId) {
        //   // supervisor for Admin role is not mandatory
        //   const adminRole = await isAdminRole(roleId, userToken.workspaceId);
        //   if (!adminRole) {
        //     // if the assigned role is not admin then supervisor is mandatory
        //     return {
        //       success: false,
        //       status_code: 400,
        //       message: "SupervisorId is required.",
        //     };
        //   }
        // }

        const schema = yup.object().shape({
          firstName: yup.string().required().trim().max(MaxNameLength),
          lastName: yup.string().required().trim().max(MaxNameLength),
          designation: yup.string().trim().max(MaxNameLength).nullable(),
          phoneNumber: yup.string().trim().max(MaxPhoneNumberLength).nullable(),
          supervisorId: yup.number().nullable(),
          departmentId: yup.number().nullable(),
          type: yup.string().nullable(),
          roleId: yup.number().required(),
          zipCode: yup.string().max(MaxPhoneNumberLength).nullable(),
          country: yup.string().nullable(),
          gender: yup.string().nullable(),
          notes: yup.string().trim().max(bigInpuMaxLength).nullable(),
          workCalendarId: yup.number().required(),
          canBePM: yup.boolean(),
          canBeSupervisor: yup.boolean(),
          address: yup.string().max(bigInpuMaxLength).nullable(),
          image: yup.string(),
        });

        try {
          await schema.validate({
            firstName,
            lastName,
            designation,
            phoneNumber,
            supervisorId,
            departmentId,
            type,
            roleId,
            zipCode,
            country,
            gender,
            notes,
            workCalendarId,
            canBePM,
            canBeSupervisor,
            address,
            image,
          });
        } catch (error) {
          console.error("error in user validation", error);
          response({
            res,
            success: false,
            status_code: 400,
            message: error.message,
          });
          return;
        }

        // see if the user thst is beign geting edited, is admin or not
        // if admin then check if the role is being chnaged from admin to some other role
        // then check if that workspace has atlest on admin user, because at least  one admin user is required in a workspace
        const isEditUserAdmin = await isUserAdmin(id, userToken.workspaceId);
        if (isEditUserAdmin) {
          // user is trying to inactve the admin
          if (active === false) {
            const workspaceAdmins = await prisma.user.findMany({
              where: {
                workspaceId: userToken.workspaceId,
                role: {
                  isAdmin: true,
                },
              },
              select: {
                id: true,
              },
            });
            if (workspaceAdmins.length < 2) {
              response({
                res,
                success: false,
                status_code: 400,
                message:
                  "This user is the only admin of the workspace, so you cannot make him inactive. Please make someone else admin first.",
              });
              return;
            }
          }
          // get the role Info of the role that is being assigned to this editing user
          const adminRole = await isAdminRole(roleId, userToken.workspaceId);
          // if admin role is gettting assigned to the editing user then dont check further conditions for admin role check, and got ahead with other checks
          // because if admin role is gettign assigned to the editing user then obsiously there will be atlest one admin in the workspace
          // the changed role is not admin then check the further condtion that does some other admin exists in the workspace or not
          if (!adminRole) {
            // get all the admin users of the workspace
            const workspaceAdmins = await prisma.user.findMany({
              where: {
                workspaceId: userToken.workspaceId,
                role: {
                  isAdmin: true,
                },
              },
              select: {
                id: true,
              },
            });
            // if there is only one admin in the workspace then dont allow to change the role of the editing user to some other role,
            // as this editing user is the only admin in the workspace
            if (workspaceAdmins.length < 2) {
              response({
                res,
                success: false,
                status_code: 400,
                message:
                  "At least one admin is mandatory in a workspace,This user is only admin in the workspace, To remove his admin role make someone else admin first.",
              });
              return;
            }
          }
        }

        if (canBePM === true) {
          const role = await getRoleCache(roleId, userToken.workspaceId);
          if (!role || role.workspaceId !== userToken.workspaceId) {
            response({
              res,
              success: false,
              status_code: 400,
              message: "Role not found",
            });
            return;
          }

          let havePermission = false;
          if (typeof role.permissions === "object") {
            if (
              role.permissions[permissionTypeIds.projAndTask] &&
              role.permissions[permissionTypeIds.projAndTask]?.accessLevel
            ) {
              havePermission = true;
            }
          } else {
            return {
              success: false,
              status_code: 400,
              message: "Some error occured while getting permissions of role. Please try again later.",
            };
          }

          if (!havePermission) {
            response({
              res,
              success: false,
              status_code: 400,
              message:
                "The Role of user does not have permission to create projects, so he cannot become Project Manager. Please select a different role for user to make him Project Manager.",
            });
            return;
          }
        }
        // check if user is PM or supervisor of any user or project, if yes then his permission cannot be removed as PM or supervisor
        // if (canBePM === false || canBeSupervisor === false) {
        //   // didnt included this below data in above query , where I am getting data of user, as there are more get request than put request and
        //   // for every get request we would have queried database, that will go waste for get request
        //   const userDependency = await prisma.user.findUnique({
        //     where: {
        //       workspaceId_id: {
        //         id: id,
        //         workspaceId: userToken.workspaceId,
        //       },
        //     },
        //     select: {
        //       supervisorOf: {
        //         select: {
        //           id: true,
        //         },
        //       },
        //       pmOf: {
        //         select: {
        //           id: true,
        //         },
        //       },
        //     },
        //   });
        //   if (canBePM === false && userDependency.pmOf.length > 0) {
        //     response({
        //       res,
        //       success: false,
        //       status_code: 400,
        //       message:
        //         "The user is a Project Manager of some projects, to remove it's Project Manager permission, change project manager of the projects where this user is project manager.",
        //     });
        //     return;
        //   }

        //   if (canBeSupervisor === false && userDependency.supervisorOf.length > 0) {
        //     response({
        //       res,
        //       success: false,
        //       status_code: 400,
        //       message:
        //         "The user is a supervisor of some users, to remove it's supervisor permission, change supervisors of the users where this user is supervisor.",
        //     });
        //     return;
        //   }
        // }

        // check if the role is being changed from project manager OR project admin or system admin to employee role then check if that user is PM of any project or not
        if (
          roleId !== perDefinedProjectManagerRoleID &&
          roleId !== perDefinedProjectAdminRoleID &&
          roleId !== perDefinedAdminRoleID
        ) {
          // didnt included this below data in above query , where I am getting data of user, as there are more get request than put request and
          // for every get request we would have queried database, that will go waste for get request
          const userDependency = await prisma.user.findUnique({
            where: {
              workspaceId_id: {
                id: id,
                workspaceId: userToken.workspaceId,
              },
            },
            select: {
              pmOf: {
                select: {
                  id: true,
                },
              },
            },
          });
          if (userDependency.pmOf.length > 0) {
            response({
              res,
              success: false,
              status_code: 400,
              message:
                "The user is a Project Manager of some projects, to change it's role, change project manager of the projects where this user is project manager.",
            });
            return;
          }
        }

        // check if the role is being changed from project manager to some other role then check if that user is PM of any project or not
        // if (roleId === perDefinedProjectManagerRoleID && user.roleId !== roleId) {
        //   // didnt included this below data in above query , where I am getting data of user, as there are more get request than put request and
        //   // for every get request we would have queried database, that will go waste for get request
        //   const userDependency = await prisma.user.findUnique({
        //     where: {
        //       workspaceId_id: {
        //         id: id,
        //         workspaceId: userToken.workspaceId,
        //       },
        //     },
        //     select: {
        //       pmOf: {
        //         select: {
        //           id: true,
        //         },
        //       },
        //     },
        //   });
        //   if (userDependency.pmOf.length > 0) {
        //     response({
        //       res,
        //       success: false,
        //       status_code: 400,
        //       message:
        //         "The user is a Project Manager of some projects, to change it's role, change project manager of the projects where this user is project manager.",
        //     });
        //     return;
        //   }
        // }

        // never update email
        const fullName = name || (firstName && lastName ? `${firstName} ${lastName}` : undefined);
        // TODO: upadte user redis cache here
        const userUpdate = await prisma.user.update({
          where: {
            workspaceId_id: {
              id: id,
              workspaceId: userToken.workspaceId,
            },
          },
          data: {
            firstName: firstName,
            lastName: lastName,
            name: fullName,
            image: image,
            designation: designation,
            phoneNumber: phoneNumber,
            zipCode: zipCode,
            country: country,
            address: address,
            notes: notes,
            active: active,
            canBePM: canBePM,
            canBeSupervisor: canBeSupervisor,
            supervisorId: supervisorId,
            departmentId: departmentId,
            roleId: roleId,
            type: type,
            gender: gender,
            workCalendarId: workCalendarId,
          },
        });
        if (userUpdate) {
          // update user cache
          // dont await this upadte cache function as it is not important to wait for this function to complete
          updateUserCache(id, userToken.workspaceId);
        }
        response({
          res,
          success: true,
          status_code: 200,
          data: [userUpdate],
          message: "User updated succesfully",
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to update this user",
        });
        return;
      }
    } else if (req.method === "PATCH") {
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.users,
        perAccessIds.view,
        {}
      );
      if (hasAccess) {
        const { image } = req.body;
        // only upadting image, so not upadting user cache
        const userData = await prisma.user.update({
          where: {
            workspaceId_id: {
              id: id,
              workspaceId: userToken.workspaceId,
            },
          },
          data: {
            image: image,
          },
        });
        response({
          res,
          success: true,
          status_code: 200,
          message: "User Image Updated",
          data: [userData],
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to update this user",
        });
        return;
      }
    } else if (req.method === "DELETE") {
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.users,
        perAccessIds.all,
        {}
      );
      if (hasAccess) {
        try {
          const userDelete = await prisma.user.delete({
            where: {
              workspaceId_id: {
                id: id,
                workspaceId: userToken.workspaceId,
              },
            },
          });
          if (userDelete) {
            // this will delete user cache
            redisDelUser(id, userToken.workspaceId);
          }
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
            message: "User deleted succesfully",
          });
          return;
        } catch (e) {
          const errRes = handlePrismaDeleteError(e, "User");
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
        message: "method is not allowed",
      });
    }
  } catch (err) {
    console.error("error in user [uid] file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
