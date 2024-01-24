const allRoles = [
  // FIXME: the data below is shown in reverse order ,ie. lat item first and first item last, see why this happens
  {
    id: 4,
    name: "Employee",
    permissions: [],
    description: "Access to entries and reports from their team only",
  },
  {
    id: 1,
    name: "Owner",
    permissions: [],
    description: "Full access to view and manage this workspace",
  },
  {
    id: 2,
    name: "Admin",
    permissions: [],
    description: "Access to entries, reports, and resource management",
  },
  {
    id: 3,
    name: "Manager",
    permissions: [],
    description: "Access to entries, create tasks,projects, and reports",
  },
];

const roleName = [
  {
    id: 1,
    option: "Role Name",
  },
];
const roleDescription = [
  {
    id: 1,
    option: "Role Description",
  },
];

const workspaceSettings = [
  {
    id: 1,
    option: "Create, edit, and delete clients",
  },
  {
    id: 2,
    option: "Create, edit, and delete projects",
  },
];

const usersSettings = [
  {
    id: 1,
    option: "Create, edit, and delete teams",
  },
  {
    id: 2,
    option: "Invite, edit, deactivate, and remove workspace Users",
  },
  {
    id: 3,
    option: "Edit and assign workspace roles",
  },
];

const tasksSettings = [
  {
    id: 1,
    option: "Create, edit, and delete their own tasks",
  },
  {
    id: 2,
    option: "View the tasks of all members of their team",
  },
  {
    id: 3,
    option: "View the tasks of all members of all workspace teams",
  },
  {
    id: 4,
    option: "Create, edit, and delete tasks for other users they have access to",
  },
];

const reportsSettings = [
  {
    id: 1,
    option: "Export Reports",
  },
];

const accountSettings = [
  {
    id: 1,
    option: "Edit workspace name, icon, and account status, and access full data export",
  },
  {
    id: 2,
    option: "Manage workspace billing and subscription",
  },
];

const timeSheetApproval = [
  {
    id: 1,
    option: "Project Manager can approve timesheets",
  },
  {
    id: 2,
    option: "Project Manager and supervisor can approve timesheets",
  },
];

const timesheetTodayTask = [
  {
    id: 1,
    option: "Approve Timesheet and Today's Task",
  },
];

export {
  allRoles,
  roleName,
  roleDescription,
  workspaceSettings,
  usersSettings,
  tasksSettings,
  reportsSettings,
  accountSettings,
  timeSheetApproval,
  timesheetTodayTask,
};
