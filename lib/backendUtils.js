import { Prisma } from "@prisma/client";
import { permissionTypeIds, roleRestrictionIds } from "../DBConstants";
import {
  DBgetMultiRoles,
  DBgetMultiUsers,
  DBgetProject,
  DBgetRole,
  DBgetTask,
  DBgetUser,
  DBgetUserRole,
  DBisAdminRole,
  DBisUserActive,
  DBisUserPm,
  DBisUserPmOrSupervisor,
  DBisUserSupervisor,
} from "./db-cache-operations";
import prisma from "./prisma";
import {
  redisDelRole,
  redisDelUser,
  redisGetProject,
  redisGetRole,
  redisGetTask,
  redisGetUser,
  redisSetRole,
  redisSetTask,
  redisSetUser,
} from "./redis-operations";

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

const isDataExists = (dataArr) => {
  let flag = false;
  for (let i = 0; i < dataArr.length; i++) {
    if (dataArr[i]) {
      flag = true;
      break;
    }
  }
  return flag;
};

const getUserRoleCache = async (userId, workspaceId) => {
  const user = await redisGetUser(userId, workspaceId);
  if (user?.roleId) {
    const role = await redisGetRole(user.roleId, workspaceId);
    if (role) return role;
  }

  const role = await DBgetUserRole(userId, workspaceId);
  if (!role) return null;
  redisSetRole(role.id, workspaceId, role);
  return role;
};

const getTaskCache = async (taskId, workspaceId) => {
  const redisTask = await redisGetTask(taskId, workspaceId);
  if (redisTask) return redisTask;

  const DBtask = await DBgetTask(taskId, workspaceId);
  if (!DBtask) return null;
  redisSetTask(DBtask.id, workspaceId, DBtask);
  return DBtask;
};

// TODO: find some altenative to cache or increase performance of this query
// TODO: need to find some good implementation, as in below query we are getting all the subordinates of user,
// but we only take a subset of it to the ned user, we are applyign pagination to api return data
// which has page size of 100 at the time of writing this comment
// suppose a user has 2000 subordinates, then we pass this 2000 subordinates to database query but only take 100, as that is the limit
// to avoid that we need to pass a limit in below query like say only get first 100 suborinates,
// but we cant do that currenlty, and other prisma queries depend on this query, like
// other prisma queryis also so search and filters from data coming in API,
// so if I return only 100 or subset of subordinates from here the queries will search in them only and not all subordinates
// to resolve this issue, what we can do is apply the below function with limit, search and filters in below query only,
// but that quwry will be called directly insted of calling getUserSubordinates or getUserSubordinatesIds function and then filterign and serahcing
// wha will do is we will call the raw query in insted of prisma query in API directly with subordinates limit , search and filers
// const getUserSubordinates = async (userId, workspaceId) => {
//   // find recursively all the subordinates of current user
//   const subordinates = await prisma.$queryRaw`WITH RECURSIVE subordinates AS(
//     SELECT ${userId} as id
//     UNION
//     SELECT "public"."User".id FROM subordinates, "public"."User"
//     WHERE "public"."User"."supervisorId" = subordinates.id AND "public"."User"."workspaceId"=${workspaceId}
//     ) SELECT * FROM subordinates;`;

//   return subordinates;
// };

const getUserSubordinates = async (userId, workspaceId) => {
  // find recursively all the subordinates of current user
  const subordinates = await prisma.$queryRaw`
  WITH RECURSIVE subordinates AS (
    SELECT ${userId} as id
    UNION
    SELECT "public"."User".id FROM subordinates JOIN "public"."User"
    ON "public"."User"."supervisorId" = subordinates.id AND "public"."User"."workspaceId"=${workspaceId}
    ) SELECT * FROM subordinates;`;

  return subordinates;
};

// const getUserSubordinates = async (userId, workspaceId) => {
//   // find recursively all the subordinates of current user
//   const subordinates = await prisma.$queryRaw`
//   WITH RECURSIVE subordinates AS (
//     SELECT ${userId} as id
//     UNION
//     SELECT \`public\`.\`User\`.id FROM subordinates, \`public\`.\`User\`
//     WHERE \`public\`.\`User\`.\`supervisorId\` = subordinates.id AND \`public\`.\`User\`.\`workspaceId\`=${workspaceId}
//   )
//   SELECT * FROM subordinates;
// `;

//   return subordinates;
// };

// TODO: find some altenative to cache or increase performance of this query
/**
 *
 * @param {*} userId user id for which we are finding supervisors
 * @returns all supervisors of user, including user's supervisor, supervisor's supervisor and so on, recursively
 */
const getUserSupervisors = async (userId, workspaceId) => {
  // find recursively all the subordinates of current user
  const supervisor = await prisma.$queryRaw`WITH RECURSIVE supervisor AS(
    SELECT supervisorId as id FROM "public"."User" WHERE "public"."User"."id" = ${userId}
    UNION
    SELECT "public"."User"."supervisorId" as id FROM supervisor, "public"."User" 
    WHERE "public"."User"."id" = supervisor.id AND "public"."User"."workspaceId"=${workspaceId}
    ) SELECT * FROM supervisor;`;

  return supervisor;
};

/**
 *
 * @param {*} userId  id of the user who is logged in and called the API,relative to workspace, ( mnormally user from usertoken.userid)
 * @param {*} workspaceId workspaceId of the user
 * @param {*} permissionTypeId Id of permission type for which we are checking access
 * @param {*} accessTypeId Id of access type for which we are checking access
 * @param {*} resource (optional) Resource for which we are checking access, it should be a object
 * @returns true if user has access, false otherwise
 */
const isUserHasAccess = async (userId, workspaceId, permissionTypeId, accessTypeId, resource) => {
  const userRole = await getUserRoleCache(userId, workspaceId);

  const userActive = await isUserActive(userId, workspaceId);
  if (!userActive) return false;

  // if role is inactive then dont give access
  if (!userRole.active) {
    return false;
  }

  if (userRole.isAdmin) {
    // Admin has all access
    return true;
  }

  // Check if user has access to the resource
  if (userRole.permissions[permissionTypeId]) {
    // Check what type of access user has,(view, create, edit, all)
    // if user can create he can view, if edit then can creatre, if all then everything
    // if (accessTypeId && !userRole.permissions[permissionTypeId].accessLevel >= accessTypeId) {
    //   return false;
    // }

    if (!resource) {
      // If resource is not provided, then this function is called to check if user has access to resourceType with particular access level, which he has at this level
      return true;
    }
    // check for restrictions of role
    if (userRole.restrictionId === roleRestrictionIds.none) {
      return true;
    }
    // if (permissionTypeId === permissionTypeIds.users) {
    //   // for the resourec fo user type, we need to treat them differently, becuase users have supervisore which make subordtnate users different
    //   // as no other resource has supervisor, only PM or they have self access
    //   // and also in users case he has not created himself, but he can view himself with own restriction
    //   if (
    //     userRole.restrictionId === roleRestrictionIds.own &&
    //     (resource.createdById === userId || resource.id === userId)
    //   ) {
    //     return true;
    //   }
    //   if (userRole.restrictionId === roleRestrictionIds.subordinates) {
    //     // this resource is a user, check if given resource is a subordinate of current user, if yes then return true
    //     const supervisors = await getUserSupervisors(resource.id, workspaceId);
    //     const supervisor = supervisors.find((s) => s.id === userId);
    //     if (supervisor) {
    //       return true;
    //     }
    //   }

    //   return false;
    // }
    // if (userRole.restrictionId === roleRestrictionIds.own && resource.createdById === userId) {
    //   return true;
    // }

    if (userRole.restrictionId === roleRestrictionIds.subordinates) {
      if (permissionTypeId === permissionTypeIds.approvals && Array.isArray(resource.projectIds)) {
        // if resource is array, then check if any of the resource has access
        // TODO: find a better way to do access check for multple resources
        for (let i = 0; i < resource.projectIds.length; i += 1) {
          const hasAccess = await isUserHasAccess(userId, workspaceId, permissionTypeId, accessTypeId, resource[i]);
          if (hasAccess) return true;
        }
        return false;
      }

      // TODO: we need ti create a finction for first getting data from redis and if not found then from db
      // const project = await redisGetProject(resource.projectId, workspaceId);
      const project = await DBgetProject(resource.projectId, workspaceId);
      if (project.pmId === userId) return true;
      // // see craetedbyid of this resouce and if the creater is subordinate of current user then return true
      // const supervisors = await getUserSupervisors(resource.createdById, workspaceId);

      // const supervisor = supervisors.find((s) => s.id === userId);
      // if (supervisor) {
      //   return true;
      // }
    }
  }

  return false;
};

const getUserRoleRestrictionId = async (userId, workspaceId) => {
  const role = await getUserRoleCache(userId, workspaceId);
  return role?.restrictionId;
};

const getSubordinateIds = async (userId, workspaceId) => {
  const subordinates = await getUserSubordinates(userId, workspaceId);
  return subordinates.map((s) => s.id);
};

const getSupervisorIds = async (userId, workspaceId) => {
  const supervisors = await getUserSupervisors(userId, workspaceId);
  return supervisors.map((s) => s.id);
};

const getProjIdsWherePmis = async (userId, workspaceId) => {
  const ids = await prisma.user.findUnique({
    where: {
      workspaceId_id: {
        id: userId,
        workspaceId: workspaceId,
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
  // return arrays of ids
  return ids.pmOf.map((p) => p.id);
  // return ids;
};

const isUserAdmin = async (userId, workspaceId) => {
  const role = await getUserRoleCache(userId, workspaceId);
  return role?.isAdmin;
};

const isUserActiveAdmin = async (userId, workspaceId) => {
  const role = await getUserRoleCache(userId, workspaceId);
  return role?.isAdmin && role?.active;
};

const isUserActive = async (userId, workspaceId) => {
  const user = await redisGetUser(userId, workspaceId);
  // checked undefined here as active can be false
  if (user?.active !== undefined) return user.active;

  return await DBisUserActive(userId, workspaceId);
  // cannot set redis user cache here as we dont have all the data, only have active
};

const isAdminRole = async (roleId, workspaceId) => {
  const role = await redisGetRole(roleId, workspaceId);
  if (role?.isAdmin) return role.isAdmin;

  return await DBisAdminRole(roleId, workspaceId);
};

const getRoleCache = async (roleId, workspaceId) => {
  const role = await redisGetRole(roleId, workspaceId);
  if (role) return role;

  const dbrole = await DBgetRole(roleId, workspaceId);
  redisSetRole(roleId, workspaceId, dbrole);
  return dbrole;
};

const getUserCache = async (userId, workspaceId) => {
  const user = await redisGetUser(userId, workspaceId);
  if (user) return user;

  const dbuser = await DBgetUser(userId, workspaceId);
  redisSetUser(userId, workspaceId, dbuser);
  return dbuser;
};

const isUserPmOrSupervisor = async (userId, workspaceId) => {
  const user = await redisGetUser(userId, workspaceId);
  if (user) return user.canBePM || user.canBeSupervisor;

  return await DBisUserPmOrSupervisor(userId, workspaceId);
};

const isUserPm = async (userId, workspaceId) => {
  const user = await redisGetUser(userId, workspaceId);
  if (user) return user.canBePM;

  return await DBisUserPm(userId, workspaceId);
};

const isUserSupervisor = async (userId, workspaceId) => {
  const user = await redisGetUser(userId, workspaceId);
  if (user) return user.canBeSupervisor;

  return await DBisUserSupervisor(userId, workspaceId);
};

/**
 * whenever this function is called it updates the user cache in redis
 *
 * @param {*} userId userId of the user
 * @returns void
 */
const updateUserCache = async (userId, workspaceId) => {
  try {
    // if dbgetuser throws error the delete user, or if it return no user then also delete
    const user = await DBgetUser(userId, workspaceId);
    if (user) {
      await redisSetUser(userId, workspaceId, user);
    } else {
      await redisDelUser(userId, workspaceId);
    }
  } catch {
    await redisDelUser(userId, workspaceId);
  }
};

/**
 * whenever this function is called it updates the role cache in redis
 *
 * @param {*} roleId roleId for the role
 * @returns void
 */
const updateRoleCache = async (roleId, workspaceId) => {
  try {
    // if DBgetRole throws error the delete role, or if it return no role then also delete
    const role = await DBgetRole(roleId, workspaceId);
    if (role) {
      await redisSetRole(roleId, workspaceId, role);
    } else {
      await redisDelRole(roleId, workspaceId);
    }
  } catch {
    await redisDelRole(roleId, workspaceId);
  }
};

/**
 * whenever this function is called it updates the user cache in redis, for all users in userIds
 *
 * @param {*} userIds user Ids for all users which needs to be upadted, it should be array of user ids
 * @returns void
 */
const updateMultipUsersCache = async (userIds, workspaceId) => {
  const users = await DBgetMultiUsers(userIds, workspaceId);
  if (Array.isArray(users)) {
    for (let i = 0; i < users.length; i++) {
      // adding try catch to avoid breaking the loop if any error occurs, just to complete invaliadte all the users cache
      const user = users[i];
      try {
        await redisSetUser(user.id, workspaceId, { ...user, id: undefined });
      } catch (err) {
        //TODO: upadte to error reporting service
        console.error(
          "error occured while upadyting user cache in updateMultipUserCache function",
          err,
          "user id",
          user.id
        );
      }
    }
  }
};

/**
 * whenever this function is called it updates the role cache in redis, for all roles in roleids
 *
 * @param {*} roleIds roleIds for all roles which needs to be upadted, it should be array of role ids
 * @returns void
 */
const updateMultipRolesCache = async (roleIds, workspaceId) => {
  const roles = await DBgetMultiRoles(roleIds, workspaceId);
  if (Array.isArray(roles)) {
    for (let i = 0; i < roles.length; i++) {
      // adding try catch to avoid breaking the loop if any error occurs, just to complete invaliadte all the roles cache
      const role = roles[i];
      try {
        await redisSetRole(role.id, workspaceId, { ...role, id: undefined });
      } catch (err) {
        //TODO: upadte to error reporting service
        console.error(
          "error occured while upadting role cache in updateMultipRolesCache function",
          err,
          "role id",
          role.id
        );
      }
    }
  }
};

const handlePrismaDeleteError = (error, recordName) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2003") {
      return {
        hasChild: true,
        error: false,
        message: `${recordName} has dependent records. Please delete them first to delete ${recordName}.`,
      };
    }
    if (error.code === "P2025") {
      return {
        error: true,
        hasChild: null,
        message: `${recordName} to delete does not exist.`,
      };
    }
  }

  //TODO: report below error to error reporting service as it is not expected error ( expected errors are foreig keys, that is handled above)
  return {
    error: true,
    hasChild: null,
    message: `Error while deleting ${recordName}. Try again later.`,
  };
};

const getTimesheetSettingsCache = async (workspaceId) => {
  const timesheetSettings = await prisma.timesheetSettings.findUnique({
    where: {
      workspaceId: workspaceId,
    },
    select: {
      approvalEnabled: true,
      sendMailForApproval: true,
      addPendingInActualTime: true,
    },
  });
  return timesheetSettings;
};

const getTodaysTaskSettingsCache = async (workspaceId) => {
  const todaysTaskSettings = await prisma.todaysTaskSettings.findUnique({
    where: {
      workspaceId: workspaceId,
    },
    select: {
      approvalEnabled: true,
      sendMailForApproval: true,
    },
  });
  return todaysTaskSettings;
};

const isTodaysTaskEnabled = async (workspaceId) => {
  const workspaceSettings = await prisma.workspaceSettings.findUnique({
    where: {
      workspaceId: workspaceId,
    },
    select: {
      todaysTaskEnabled: true,
    },
  });
  return workspaceSettings?.todaysTaskEnabled;
};

const getProjectPMEmail = async (projectId, workspaceId) => {
  const project = await prisma.project.findUnique({
    where: {
      workspaceId_id: { id: projectId, workspaceId: workspaceId },
    },
    select: {
      pm: {
        select: {
          email: true,
        },
      },
    },
  });
  return project?.pm?.email;
};

const getProjectNameFromId = async (projectId, workspaceId) => {
  const project = await prisma.project.findUnique({
    where: {
      workspaceId_id: { id: projectId, workspaceId: workspaceId },
    },
    select: {
      name: true,
    },
  });
  return project?.name;
};

const getTaskNameFromId = async (taskId, workspaceId) => {
  const task = await prisma.task.findUnique({
    where: {
      workspaceId_id: { id: taskId, workspaceId: workspaceId },
    },
    select: {
      name: true,
    },
  });
  return task?.name;
};

const getUserNameFromId = async (userId, workspaceId) => {
  const user = await prisma.user.findUnique({
    where: {
      workspaceId_id: { id: userId, workspaceId: workspaceId },
    },
    select: {
      name: true,
    },
  });
  return user?.name;
};

const getRecordCounts = async (workspaceId) => {
  const counts = await prisma.recordCounts.findUnique({
    where: {
      workspaceId: workspaceId,
    },
    select: {
      user: true,
      project: true,
      task: true,
      client: true,
      role: true,
      department: true,
      workCalendar: true,
      timesheet: true,
      todaysTask: true,
      expense: true,
      expenseCategory: true,
      status: true,
      priority: true,
      currency: true,
      resourceAllocation: true,
    },
  });
  return counts;
};

const getAttachmentSize = async (userId, workspaceId) => {
  const attachmentSize = await prisma.attachment.aggregate({
    where: {
      createdById: userId,
      workspaceId: workspaceId,
    },
    _sum: {
      sizeInKb: true,
    },
  });
  return attachmentSize._sum.sizeInKb;
};

export {
  isValidDate,
  isDataExists,
  getUserRoleCache,
  getTaskCache,
  isUserHasAccess,
  getUserRoleRestrictionId,
  getSubordinateIds,
  getSupervisorIds,
  getProjIdsWherePmis,
  isUserAdmin,
  isUserActiveAdmin,
  getRoleCache,
  getUserCache,
  isAdminRole,
  isUserPmOrSupervisor,
  isUserPm,
  isUserSupervisor,
  isUserActive,
  handlePrismaDeleteError,
  getTimesheetSettingsCache,
  getTodaysTaskSettingsCache,
  getProjectPMEmail,
  getProjectNameFromId,
  getTaskNameFromId,
  getUserNameFromId,
  isTodaysTaskEnabled,
  updateUserCache,
  updateRoleCache,
  updateMultipUsersCache,
  updateMultipRolesCache,
  getRecordCounts,
  getAttachmentSize,
};
