import { permissionTypeIds } from "../../../../DBConstants";
import { urls } from "../../../utils/Constants";

export default sidebarOptions;

function sidebarOptions(user, sessionData) {
  // const role = user?.role;
  // if (!user || !role) return [];

  // const menuItemsAdmin = [
  //   {
  //     id: "dashboard",
  //     label: "Dashboard",
  //     icon: "ri-dashboard-fill",
  //     link: `${urls.dashboard}`,
  //   },
  // ];

  // if (sessionData?.todaysTaskEnabled) {
  //   menuItemsAdmin.push({
  //     id: "todays-tasks",
  //     label: "Today's Tasks",
  //     icon: "ri-sun-line",
  //     link: `${urls.todaysTasks}`,
  //   });
  // }

  // const restAdminOptions = [
  //   {
  //     id: "timesheet",
  //     label: "Timesheet",
  //     icon: "ri-history-line",
  //     link: `${urls.timesheets}`,
  //   },
  //   {
  //     id: "resource-allocation",
  //     label: "Resource Allocation",
  //     icon: "ri-open-source-line",
  //     link: `${urls.resourceAllocation}`,
  //   },
  //   {
  //     id: "projects",
  //     label: "Projects",
  //     icon: "ri-folder-open-line",
  //     link: `${urls.projects}`,
  //   },
  //   {
  //     id: "tasks",
  //     label: "Tasks",
  //     icon: "ri-article-line",
  //     link: `${urls.tasks}`,
  //   },
  //   {
  //     id: "clients",
  //     label: "Clients",
  //     icon: "ri-group-2-fill",
  //     link: `${urls.clients}`,
  //   },
  //   {
  //     id: "approvals",
  //     label: "Approvals",
  //     icon: "ri-calendar-check-line",
  //     link: `${urls.approvals}`,
  //   },
  //   {
  //     id: "expense",
  //     label: "Expense",
  //     icon: "ri-wallet-3-fill",
  //     link: `${urls.expense}`,
  //   },
  //   {
  //     id: "users",
  //     label: "Users",
  //     icon: "ri-group-line",
  //     link: `${urls.users}`,
  //   },
  //   {
  //     id: "reports",
  //     label: "Reports",
  //     icon: "ri-file-chart-line",
  //     link: `${urls.reports}`,
  //   },
  //   // {
  //   //   id: "teams",
  //   //   label: "Teams",
  //   //   icon: "ri-group-line",
  //   //   link: "/teams",
  //   // },
  //   {
  //     id: "roles",
  //     label: "Roles",
  //     icon: "ri-shield-user-line",
  //     link: `${urls.roles}`,
  //   },
  //   // {
  //   //   id: "expense-categories",
  //   //   label: "Expense Categories",
  //   //   icon: "ri-file-text-line",
  //   //   link: "/expense-categories",
  //   // },
  //   // {
  //   //   id: "departments",
  //   //   label: "Departments",
  //   //   icon: "ri-building-4-line",
  //   //   link: "/departments",
  //   // },
  //   // {
  //   //   id: "currency",
  //   //   label: "Currency",
  //   //   icon: "ri-money-dollar-circle-line",
  //   //   link: "/currency",
  //   // },
  //   {
  //     id: "settings",
  //     label: "Manage Workspace",
  //     icon: "ri-settings-4-fill",
  //     link: `${urls.settings}`,
  //   },
  // ];

  // menuItemsAdmin.push(...restAdminOptions);
  // if (role.isAdmin) return menuItemsAdmin;

  // const menuItemsForAll = [
  //   {
  //     id: "dashboard",
  //     label: "Dashboard",
  //     icon: "ri-dashboard-fill",
  //     link: `${urls.dashboard}`,
  //   },
  // ];

  // if (sessionData?.todaysTaskEnabled) {
  //   menuItemsForAll.push({
  //     id: "todays-tasks",
  //     label: "Today's Tasks",
  //     icon: "ri-sun-line",
  //     link: `${urls.todaysTasks}`,
  //   });
  // }

  // menuItemsForAll.push({
  //   id: "timesheet",
  //   label: "Timesheet",
  //   icon: "ri-history-line",
  //   link: `${urls.timesheets}`,
  // });

  // if (!role.permissions) {
  //   const data = [...menuItemsForAll];
  //   data.push({
  //     id: "expense",
  //     label: "Expense",
  //     icon: "ri-wallet-3-fill",
  //     link: `${urls.expense}`,
  //   });
  //   // data.push({
  //   //   id: "teams",
  //   //   label: "Teams",
  //   //   icon: "ri-group-line",
  //   //   link: "/teams",
  //   // });
  //   return data;
  // }

  // // if (user.canBePM) {
  // //   menuItemsForAll.push({
  // //     id: "resource-allocation",
  // //     label: "Resource Allocation",
  // //     icon: "ri-open-source-line",
  // //     link: "/resource-allocation",
  // //   });
  // // }

  // if (role.permissions[permissionTypeIds.resourceAllocation]) {
  //   menuItemsForAll.push({
  //     id: "resource-allocation",
  //     label: "Resource Allocation",
  //     icon: "ri-open-source-line",
  //     link: `${urls.resourceAllocation}`,
  //   });
  // }

  // if (role.permissions[permissionTypeIds.projAndTask]) {
  //   menuItemsForAll.push({
  //     id: "projects",
  //     label: "Projects",
  //     icon: "ri-folder-open-line",
  //     link: `${urls.projects}`,
  //   });
  //   menuItemsForAll.push({
  //     id: "tasks",
  //     label: "Tasks",
  //     icon: "ri-article-line",
  //     link: `${urls.tasks}`,
  //   });
  // }

  // // if (role.permissions[permissionTypeIds.projAndTask]) {
  // // }

  // if (role.permissions[permissionTypeIds.clients]) {
  //   menuItemsForAll.push({
  //     id: "clients",
  //     label: "Clients",
  //     icon: "ri-group-line",
  //     link: `${urls.clients}`,
  //   });
  // }

  // // if (user.canBePM || user.canBeSupervisor) {
  // //   menuItemsForAll.push({
  // //     id: "approvals",
  // //     label: "Approvals",
  // //     icon: "ri-folder-transfer-line",
  // //     link: `${urls.approvals}`,
  // //   });
  // // }

  // if (role.permissions[permissionTypeIds.approvals]) {
  //   menuItemsForAll.push({
  //     id: "approvals",
  //     label: "Approvals",
  //     icon: "ri-calendar-check-line",
  //     link: `${urls.approvals}`,
  //   });
  // }

  // menuItemsForAll.push({
  //   id: "expense",
  //   label: "Expense",
  //   icon: "ri-currency-line",
  //   link: `${urls.expense}`,
  // });

  // if (role.permissions[permissionTypeIds.users]) {
  //   menuItemsForAll.push({
  //     id: "users",
  //     label: "Users",
  //     icon: "ri-user-line",
  //     link: `${urls.users}`,
  //   });
  // }

  // if (role.permissions[permissionTypeIds.reports]) {
  //   menuItemsForAll.push({
  //     id: "reports",
  //     label: "Reports",
  //     icon: "ri-file-chart-line",
  //     link: `${urls.reports}`,
  //   });
  // }

  // // menuItemsForAll.push({
  // //   id: "teams",
  // //   label: "Teams",
  // //   icon: "ri-group-line",
  // //   link: "/teams",
  // // });

  // if (role.permissions[permissionTypeIds.roles]) {
  //   menuItemsForAll.push({
  //     id: "roles",
  //     label: "Roles",
  //     icon: "ri-shield-user-line",
  //     link: `${urls.roles}`,
  //   });
  // }

  const menuItemsForAll = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "ri-dashboard-fill",
      link: `${urls.dashboard}`,
    },
    {
      id: "users",
      label: "Users",
      icon: "ri-group-line",
      link: `${urls.users}`,
    },
  ];

  return menuItemsForAll;
}
