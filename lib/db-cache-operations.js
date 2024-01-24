import prisma from "./prisma";

// we don't select id's of records in prisma queries of this file, as they go in redis cache and
// storing id's is not required in redis cache

const DBgetUserRole = async (userId, workspaceId) => {
  const userRole = await prisma.user.findUnique({
    where: {
      workspaceId_id: { id: userId, workspaceId: workspaceId },
    },
    select: {
      role: {
        select: {
          id: true,
          createdById: true,
          workspaceId: true,
          restrictionId: true,
          isAdmin: true,
          active: true,
          permissions: {
            select: {
              permissionId: true,
              accessLevel: true,
            },
          },
        },
      },
    },
  });

  if (!userRole.role) return null; // user dont have a role

  const role = {
    permissions: {},
    id: userRole.role.id,
    createdById: userRole.role.createdById,
    workspaceId: userRole.role.workspaceId,
    restrictionId: userRole.role.restrictionId,
    isAdmin: userRole.role.isAdmin,
    active: userRole.role.active,
  };
  userRole.role.permissions.forEach((p) => {
    role.permissions[p.permissionId] = { accessLevel: p.accessLevel };
  });

  return role;
};

const DBgetUserRoleRestrictionId = async (userId, workspaceId) => {
  const userRole = await prisma.user.findUnique({
    where: {
      workspaceId_id: { id: userId, workspaceId: workspaceId },
    },
    select: {
      role: {
        select: {
          restrictionId: true,
        },
      },
    },
  });
  return userRole.role.restrictionId;
};

const DBisUserAdmin = async (userId, workspaceId) => {
  const userRole = await prisma.user.findUnique({
    where: {
      workspaceId_id: { id: userId, workspaceId: workspaceId },
    },
    select: {
      role: {
        select: {
          isAdmin: true,
        },
      },
    },
  });
  return userRole ? userRole.role.isAdmin : false;
};

const DBisUserActive = async (userId, workspaceId) => {
  const user = await prisma.user.findUnique({
    where: {
      workspaceId_id: { id: userId, workspaceId: workspaceId },
    },
    select: {
      active: true,
    },
  });
  return user.active;
};

const DBisAdminRole = async (roleId, workspaceId) => {
  if (!roleId) return null;
  const role = await prisma.role.findUnique({
    where: {
      workspaceId_id: { id: roleId, workspaceId: workspaceId },
    },
    select: {
      isAdmin: true,
    },
  });
  return role.isAdmin;
};

const DBgetRole = async (roleId, workspaceId) => {
  if (!roleId) return null;
  const role = await prisma.role.findUnique({
    where: {
      workspaceId_id: { id: roleId, workspaceId: workspaceId },
    },
    select: {
      id: true,
      // createdById: true,
      workspaceId: true,
      restrictionId: true,
      isAdmin: true,
      active: true,
      permissions: {
        select: {
          permissionId: true,
          accessLevel: true,
        },
      },
    },
  });

  if (!role) return null; // role does not exist

  const returnRole = {
    permissions: {},
    id: role.id,
    createdById: role.createdById,
    workspaceId: role.workspaceId,
    restrictionId: role.restrictionId,
    isAdmin: role.isAdmin,
    active: role.active,
  };
  role.permissions.forEach((p) => {
    returnRole.permissions[p.permissionId] = { accessLevel: p.accessLevel };
  });

  return returnRole;
};

const DBgetMultiRoles = async (roleIds, workspaceId) => {
  if (!Array.isArray(roleIds) || roleIds.length === 0) return null;
  const roles = await prisma.role.findMany({
    where: {
      id: { in: roleIds },
      workspaceId: workspaceId,
    },
    select: {
      id: true,
      createdById: true,
      workspaceId: true,
      restrictionId: true,
      isAdmin: true,
      active: true,
      permissions: {
        select: {
          permissionId: true,
          accessLevel: true,
        },
      },
    },
  });
  return roles;
};

const DBgetUser = async (userId, workspaceId) => {
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: {
      workspaceId_id: { id: userId, workspaceId: workspaceId },
    },
    select: {
      id: true,
      // createdById: true,
      workspaceId: true,
      canBePM: true,
      canBeSupervisor: true,
      active: true,
      roleId: true,
    },
  });

  return user;
};

const DBgetUserByGlobalId = async (userGlobalId) => {
  if (!userGlobalId) return null;
  const user = await prisma.user.findUnique({
    where: {
      globalId: userGlobalId,
    },
    select: {
      id: true,
      createdById: true,
      workspaceId: true,
      canBePM: true,
      canBeSupervisor: true,
      active: true,
      roleId: true,
    },
  });

  return user;
};

const DBgetMultiUsers = async (userIds, workspaceId) => {
  if (!Array.isArray(userIds) || userIds.length === 0) return null;
  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
      workspaceId: workspaceId,
    },
    select: {
      id: true,
      createdById: true,
      workspaceId: true,
      canBePM: true,
      canBeSupervisor: true,
      active: true,
      roleId: true,
    },
  });

  return users;
};

const DBisUserPmOrSupervisor = async (userId, workspaceId) => {
  const user = await prisma.user.findUnique({
    where: {
      workspaceId_id: { id: userId, workspaceId: workspaceId },
    },
    select: {
      canBePM: true,
      canBeSupervisor: true,
    },
  });

  return user.canBePM || user.canBeSupervisor;
  // if (user.canBePM || user.canBeSupervisor) {
  //   return true;
  // }
  // return false;
};

const DBisUserPm = async (userId, workspaceId) => {
  const user = await prisma.user.findUnique({
    where: {
      workspaceId_id: { id: userId, workspaceId: workspaceId },
    },
    select: {
      canBePM: true,
    },
  });
  return user.canBePM;
};

const DBisUserSupervisor = async (userId, workspaceId) => {
  const user = await prisma.user.findUnique({
    where: {
      workspaceId_id: { id: userId, workspaceId: workspaceId },
    },
    select: {
      canBeSupervisor: true,
    },
  });
  return user.canBeSupervisor;
};

const DBgetTimesheetSettings = async (workspaceId) => {
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

const DBgetTodaysTaskSettings = async (workspaceId) => {
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

const DBisTodaysTaskEnabled = async (workspaceId) => {
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

const DBgetProject = async (projectId, workspaceId) => {
  const project = await prisma.project.findUnique({
    where: {
      workspaceId_id: { id: projectId, workspaceId: workspaceId },
    },
    select: {
      id: true,
      workspaceId: true,
      name: true,
      pmId: true,
      active: true,
    },
  });
  return project;
};

const DBgetTask = async (taskId, workspaceId) => {
  const task = await prisma.task.findUnique({
    where: {
      workspaceId_id: { id: taskId, workspaceId: workspaceId },
    },
    select: {
      id: true,
      workspaceId: true,
      name: true,
      active: true,
      projectId: true,
    },
  });
  return task;
};

const DBgetProjectPMEmail = async (projectId, workspaceId) => {
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

const DBgetUserNameFromId = async (userId, workspaceId) => {
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

export {
  DBgetUserRole,
  DBgetUserRoleRestrictionId,
  DBisUserAdmin,
  DBgetRole,
  DBgetUser,
  DBisUserPmOrSupervisor,
  DBisUserPm,
  DBisUserSupervisor,
  DBisUserActive,
  DBgetTimesheetSettings,
  DBgetTodaysTaskSettings,
  DBgetProjectPMEmail,
  DBgetUserNameFromId,
  DBisTodaysTaskEnabled,
  DBgetProject,
  DBgetTask,
  DBisAdminRole,
  DBgetMultiRoles,
  DBgetMultiUsers,
  DBgetUserByGlobalId,
};
