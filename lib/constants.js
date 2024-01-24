//TODO: optimize below select statements, so we only select the required fields to imporove performance and time

import { customAlphabet } from "nanoid";

const every = {
  createdById: true,
  workspaceId: true,
  id: true,
};

const userSelectSome = {
  ...every,
  name: true,
  email: true,
  image: true,
  firstName: true,
  lastName: true,
  designation: true,
  active: true,
  canBePM: true,
  canBeSupervisor: true,
  supervisorId: true,
  supervisor: true,
  roleId: true,
  role: true,
};

const userSelectIdName = {
  // ...every,
  //dont spread every here
  id: true,
  name: true,
  // if first name and last is used insted of name then the below two are used
  firstName: true,
  lastName: true,
  roleId: true,
};

const userSelectAll = {
  ...every,
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  createdAt: true,
  updatedAt: true,
  firstName: true,
  lastName: true,
  designation: true,
  phoneNumber: true,
  supervisorId: true,
  departmentId: true,
  type: true,
  workCalendarId: true,
  acceptedinvite: true,
  invited: true,
  roleId: true,
  zipCode: true,
  country: true,
  address: true,
  gender: true,
  notes: true,
  canBePM: true,
  canBeSupervisor: true,
  active: true,
  createdById: true,
  //TODO: see if you require the below values, becuase they are heavy to compute
  assignedProjects: true,
  assignedTasks: true,
};

const verifyTokenSelectAll = {
  // don't spread every here
  // and don't return token
  // dont return expires also
  identifier: true,
};

const deptSelectSome = {
  ...every,
  name: true,
  active: true,
  users: {
    select: {
      name: true,
      id: true,
      image: true,
      firstName: true,
      lastName: true,
    },
  },
};

const deptSelectIdName = {
  id: true,
  name: true,
  active: true,
};

const deptSelectAll = {
  ...every,
  name: true,
  active: true,
  users: {
    select: {
      name: true,
      id: true,
      image: true,
    },
  },
};

const roleSelectSome = {
  ...every,
  name: true,
  description: true,
  active: true,
  isAdmin: true,
  restrictionId: true,
};

const roleSelectList = {
  id: true,
  name: true,
  // we require isAdmin in role list
  isAdmin: true,
  active: true,
};

const roleSelectAll = {
  ...every,
  name: true,
  description: true,
  permissions: true,
  restrictionId: true,
  createdById: true,
  active: true,
  isAdmin: true,
};

const workCalSelectSome = {
  ...every,
  name: true,
  description: true,
  startTime: true,
  active: true,
};

const workCalSelectAll = {
  ...every,
  name: true,
  description: true,
  startTime: true,
  active: true,
  nonWorkingDays: true,
  weeklyWorkingDays: true,
};

const clientSelectSome = {
  ...every,
  id: true,
  name: true,
  createdBy: {
    select: {
      name: true,
      id: true,
    },
  },
  createdAt: true,
  active: true,
};

const clientSelectIdName = {
  id: true,
  name: true,
  active: true,
};

const clientSelectAll = {
  ...every,
  id: true,
  name: true,
  createdBy: {
    select: {
      name: true,
      id: true,
    },
  },
  createdAt: true,
  email: true,
  phone: true,
  active: true,
  notes: true,
};

const prioritySelectSome = {
  ...every,
  id: true,
  name: true,
  // color: true,
  active: true,
};

const statusSelectSome = {
  ...every,
  id: true,
  name: true,
  // color: true,
  active: true,
};

const projectSelectSome = {
  ...every,
  id: true,
  name: true,
  description: true,
  estimatedEndDate: true,
  statusId: true,
  status: true,
  priorityId: true,
  priority: true,
  pmId: true,
  active: true,
  // projectUsers: {
  //   select: {
  //     user: {
  //       select: {
  //         name: true,
  //         id: true,
  //       },
  //     },
  //   },
  // },
  pm: {
    select: {
      name: true,
      id: true,
    },
  },
  clientId: true,
  client: {
    select: {
      name: true,
      id: true,
    },
  },
};

const projectSelectIdName = {
  id: true,
  name: true,
  ticket: true,
};

const projectSelectAll = {
  ...every,
  id: true,
  name: true,
  description: true,
  ticket: true,
  client: {
    select: {
      name: true,
      id: true,
      active: true,
    },
  },
  pm: {
    select: {
      name: true,
      id: true,
      image: true,
    },
  },
  // statusId: true,
  status: {
    select: {
      name: true,
      id: true,
      active: true,
    },
  },
  // priorityId: true,
  priority: {
    select: {
      name: true,
      id: true,
      active: true,
    },
  },
  startDate: true,
  estimatedTime: true,
  estimatedEndDate: true,
  actualEndDate: true,
  active: true,
  // emailsCC: true,
  projectUsers: {
    select: {
      user: {
        select: {
          name: true,
          id: true,
          active: true,
        },
      },
    },
  },
  canSupervisorApproveTime: true,
  attachments: true,
  projectType: true,
};

const taskSelectSome = {
  ...every,
  id: true,
  name: true,
  projectId: true,
  project: {
    select: {
      name: true,
      id: true,
    },
  },
  estimatedEndDate: true,
  statusId: true,
  status: true,
  priorityId: true,
  priority: true,
  active: true,
  taskUsers: {
    select: {
      user: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  },
};

const taskSelectIdName = {
  id: true,
  name: true,
};

const taskSelectAll = {
  ...every,
  id: true,
  name: true,
  projectId: true,
  project: {
    select: {
      name: true,
      id: true,
      active: true,
    },
  },
  priorityId: true,
  priority: {
    select: {
      name: true,
      id: true,
      active: true,
    },
  },
  statusId: true,
  status: {
    select: {
      name: true,
      id: true,
      active: true,
    },
  },
  startDate: true,
  estimatedEndDate: true,
  actualEndDate: true,
  estimatedTime: true,
  taskUsers: {
    select: {
      user: {
        select: {
          name: true,
          id: true,
          active: true,
        },
      },
    },
  },
  description: true,
  billable: true,
  active: true,
  attachments: true,
};

const timesheetSelectSome = {
  ...every,
  projectId: true,
  project: true,
  taskId: true,
  task: true,
};

const timesheetSelectAll = {
  ...every,
  createdBy: {
    select: {
      name: true,
    },
  },
  createdById: true,
  projectId: true,
  ticket: true,
  project: {
    select: {
      name: true,
      id: true,
      ticket: true,
    },
  },
  taskId: true,
  task: {
    select: {
      name: true,
      id: true,
    },
  },
  resourceAllocation: {
    select: {
      id: true,
      duration: true,
    },
  },
  approvedBy: {
    select: {
      name: true,
      id: true,
    },
  },
  duration: true,
  date: true,
  status: true,
  description: true,
  rejectionNote: true,
  submittedForApproval: true,
};

const timesheetSelectStatusPending = {
  ...every,
  id: true,
  duration: true,
  date: true,
  ticket: true,
  createdBy: {
    select: {
      name: true,
      id: true,
    },
  },
  description: true,
  task: {
    select: {
      name: true,
      id: true,
    },
  },
  projectId: true,
  project: {
    select: {
      id: true,
      name: true,
    },
  },
  resourceAllocation: {
    select: {
      id: true,
      duration: true,
    },
  },
  status: true,
  description: true,
};

const todayTaskSelectSome = {
  ...every,
  id: true,
  duration: true,
  date: true,
  projectId: true,
  taskId: true,
  status: true,
  ticket: true,
  description: true,
  approvedBy: {
    select: {
      id: true,
      name: true,
    },
  },
  project: {
    select: {
      name: true,
      id: true,
    },
  },
  task: {
    select: {
      name: true,
      id: true,
    },
  },
};

const todayTaskSelectAll = {
  ...every,
  id: true,
  duration: true,
  ticket: true,
  createdBy: {
    select: {
      id: true,
      name: true,
    },
  },
  project: {
    select: {
      id: true,
      name: true,
      ticket: true,
    },
  },
  task: {
    select: {
      id: true,
      name: true,
    },
  },
  resourceAllocation: {
    select: {
      id: true,
      duration: true,
    },
  },
  approvedBy: {
    select: {
      id: true,
      name: true,
    },
  },
  date: true,
  description: true,
  status: true,
  rejectionNote: true,
  convertedToTimesheet: true,
  submittedForApproval: true,
};

const todayTaskSelectStatusPending = {
  ...every,
  id: true,
  duration: true,
  date: true,
  ticket: true,
  description: true,
  createdBy: {
    select: {
      name: true,
      id: true,
    },
  },
  description: true,
  taskId: true,
  task: {
    select: {
      name: true,
      id: true,
    },
  },
  projectId: true,
  project: {
    select: {
      id: true,
      name: true,
    },
  },
  resourceAllocation: {
    select: {
      id: true,
      duration: true,
    },
  },
  status: true,
};

const expenseCategorySelectSome = {
  ...every,
  id: true,
  name: true,
  description: true,
  active: true,
};

const expenseCategorySelectList = {
  id: true,
  name: true,
  active: true,
};

const expenseCategorySelectAll = {
  ...every,
  id: true,
  name: true,
  description: true,
  active: true,
};

const expenseSelectSome = {
  ...every,
  id: true,
  expenseCategoryId: true,
  expenseCategory: {
    select: {
      name: true,
    },
  },
  approvedBy: {
    select: {
      name: true,
      id: true,
    },
  },
  status: true,
  date: true,
  amount: true,
};

const expenseSelectAll = {
  ...every,
  id: true,
  expenseCategory: {
    select: {
      id: true,
      name: true,
    },
  },
  currency: {
    select: {
      id: true,
      currency: true,
    },
  },
  project: {
    select: {
      id: true,
      name: true,
    },
  },
  approvedBy: {
    select: {
      name: true,
      id: true,
    },
  },
  date: true,
  amount: true,
  memo: true,
  rejectionNote: true,
  status: true,
  attachments: true,
};

const countryCodeSelectAll = {
  id: true,
  code: true,
  country: true,
};

const currencySelectSome = {
  ...every,
  currencyId: true,
  active: true,
  currency: true,
};

const currencySelectList = {
  id: true,
  currencyId: true,
  active: true,
  currency: true,
};

const expenseSelectStatusPending = {
  ...every,
  amount: true,
  date: true,
  status: true,
  memo: true,
  createdBy: {
    select: {
      name: true,
      id: true,
    },
  },
  memo: true,
  expenseCategory: {
    select: {
      id: true,
      name: true,
    },
  },
};

const profileDetailsSelectAll = {
  ...every,
  firstName: true,
  lastName: true,
  name: true,
  image: true,
  phoneNumber: true,
  gender: true,
  email: true,
  country: true,
  zipCode: true,
  designation: true,
  department: {
    select: {
      id: true,
      name: true,
    },
  },
  supervisor: {
    select: {
      id: true,
      name: true,
    },
  },
  role: {
    select: {
      id: true,
      name: true,
    },
  },
  workCalendar: {
    select: {
      id: true,
      name: true,
    },
  },
  type: true,
  canBePM: true,
  canBeSupervisor: true,
  notes: true,
  address: true,
};

const timesheetHighlights = {
  id: true,
  duration: true,
  date: true,
  createdBy: {
    select: {
      name: true,
      id: true,
    },
  },
  task: {
    select: {
      name: true,
      id: true,
    },
  },
};

const todaysTasksHighlights = {
  id: true,
  duration: true,
  date: true,
  createdBy: {
    select: {
      name: true,
      id: true,
    },
  },
  task: {
    select: {
      name: true,
      id: true,
    },
  },
};

const tasksHighlights = {
  id: true,
  name: true,
  estimatedTime: true,
  estimatedEndDate: true,
};

const projectsHighlights = {
  id: true,
  name: true,
  startDate: true,
  pm: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

const usersHighlights = {
  id: true,
  name: true,
  email: true,
  supervisor: {
    select: {
      id: true,
      name: true,
    },
  },
};

const expenseHighlights = {
  id: true,
  date: true,
  amount: true,
  expenseCategory: {
    select: {
      name: true,
    },
  },
};

const taskReportSelectSome = {
  ...every,
  id: true,
  name: true,
  startDate: true,
  estimatedTime: true,
  estimatedEndDate: true,
  projectId: true,
  project: {
    select: {
      id: true,
      name: true,
    },
  },
  statusId: true,
  status: {
    select: {
      id: true,
      name: true,
    },
  },
  priorityId: true,
  priority: {
    select: {
      id: true,
      name: true,
    },
  },
  taskUsers: {
    select: {
      user: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  },
  billable: true,
};

const timesheetReportSelectSome = {
  id: true,
  duration: true,
  date: true,
  createdById: true,
  status: true,
  description: true,
  ticket: true,
  createdBy: {
    select: {
      name: true,
      id: true,
    },
  },
  approvedBy: {
    select: {
      name: true,
      id: true,
    },
  },
  taskId: true,
  task: {
    select: {
      name: true,
      id: true,
    },
  },

  projectId: true,
  project: {
    select: {
      id: true,
      name: true,
    },
  },
  resourceAllocation: {
    select: {
      id: true,
      duration: true,
    },
  },
};

const todaysTaskReportSelectSome = {
  id: true,
  duration: true,
  date: true,
  createdById: true,
  status: true,
  description: true,
  createdBy: {
    select: {
      name: true,
      id: true,
    },
  },
  taskId: true,
  task: {
    select: {
      name: true,
      id: true,
    },
  },
  resourceAllocation: {
    select: {
      id: true,
      duration: true,
    },
  },
  ticket: true,
  projectId: true,
  project: {
    select: {
      id: true,
      name: true,
    },
  },
  // allocatedTime: true,
  approvedBy: {
    select: {
      name: true,
      id: true,
    },
  },
};

const clientReportSelectSome = {
  ...every,
  id: true,
  name: true,
  email: true,
  phone: true,
  active: true,
  projects: {
    select: {
      id: true,
      name: true,
    },
  },
};
const projectReportSelectSome = {
  ...every,
  id: true,
  name: true,
  estimatedTime: true,
  estimatedEndDate: true,
  statusId: true,
  status: true,
  priorityId: true,
  priority: true,
  pmId: true,
  active: true,
  projectUsers: {
    select: {
      user: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  },
  pm: {
    select: {
      name: true,
      id: true,
    },
  },
  clientId: true,
  client: {
    select: {
      name: true,
      id: true,
    },
  },
};

const userReportSelectSome = {
  ...every,
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
  supervisor: {
    select: {
      name: true,
      id: true,
    },
  },
  roleId: true,
  role: {
    select: {
      name: true,
      id: true,
    },
  },
};

const DashBoardProjectSelectSome = {
  ...every,
  id: true,
  name: true,
  estimatedTime: true,
  estimatedEndDate: true,
  statusId: true,
  status: true,
  priorityId: true,
  priority: true,
  pmId: true,
  active: true,
  projectUsers: {
    select: {
      user: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  },
  pm: {
    select: {
      name: true,
      id: true,
    },
  },
  client: {
    select: {
      name: true,
      id: true,
    },
  },
};

const DashBoardClientSelectSome = {
  ...every,
  id: true,
  name: true,
  email: true,
  phone: true,
  active: true,
  projects: {
    select: {
      id: true,
      name: true,
    },
  },
};

const DashBoardTaskSelectSome = {
  ...every,
  id: true,
  name: true,
  startDate: true,
  estimatedTime: true,
  estimatedEndDate: true,
  project: {
    select: {
      id: true,
      name: true,
    },
  },
};

const DashBoardUserSelectSome = {
  ...every,
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
  supervisor: {
    select: {
      name: true,
      id: true,
    },
  },
  role: {
    select: {
      name: true,
      id: true,
    },
  },
};
const resourceAllocationSelectSome = {
  id: true,
  repeatId: true,
  projectId: true,
  taskId: true,
  allocatedUserId: true,
  duration: true,
  date: true,
  startDate: true,
  endDate: true,
  repetationType: true,
  allocatedUser: {
    select: {
      id: true,
      name: true,
    },
  },
  project: {
    select: {
      name: true,
      id: true,
    },
  },
  task: {
    select: {
      name: true,
      id: true,
    },
  },
};

const resourceAllocationSelectAll = {
  id: true,
  project: true,
  task: true,
  duration: true,
  date: true,
  startDate: true,
  endDate: true,
  repetationType: true,
  allocatedUser: {
    select: {
      id: true,
      name: true,
    },
  },
  project: {
    select: {
      name: true,
      id: true,
    },
  },
  task: {
    select: {
      name: true,
      id: true,
    },
  },
};

const allTimesheetsSelectSome = {
  id: true,
  duration: true,
  date: true,
  createdById: true,
  status: true,
  description: true,
  createdBy: {
    select: {
      name: true,
      id: true,
    },
  },
  taskId: true,
  task: {
    select: {
      name: true,
      id: true,
    },
  },
  ticket: true,
  projectId: true,
  project: {
    select: {
      id: true,
      name: true,
    },
  },
};

const numOfSaltRounds = 8; //IMP: does not increase it more than 10, as it make take much much time to compute and make the server busy

// don't chnage below timeentry values, because they are used in the database, if you want to chnage them, then change them in the database enum (named ApprovalStatus) as well
const timeEntryStatus = {
  Draft: "Draft",
  Pending: "Pending",
  Approved: "Approved",
  Rejected: "Rejected",
};

// this is the maximum number of records that can be fetched in one go, in API's
// before changing this, check that if you need to change the maxDataLengthForUISearch in the client side constants, because we choose to search on UI based on that value
const maxTake = 100;

const presignedUrlExpSec = 3600; // 1 hour

const fileAttachmentSizeLimit = 300000; // 300000KB for testing purpose, in production it will be 1GB

// constants for validating API inputs
const MinNameLength = 1;
const MaxNameLength = 50;

const bigInpuMaxLength = 2000;
const bigInpuMinLength = 0;

const MinEmailLength = 5;
const MaxEmailLength = 100;

const MaxPhoneNumberLength = 15;
const MinPhoneNumberLength = 4;

const MaxAmountLength = 100_00_00_000; // 1 billion

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz");

export {
  userSelectSome,
  userSelectIdName,
  userSelectAll,
  deptSelectSome,
  deptSelectIdName,
  deptSelectAll,
  roleSelectSome,
  roleSelectList,
  roleSelectAll,
  workCalSelectSome,
  workCalSelectAll,
  clientSelectSome,
  clientSelectIdName,
  clientSelectAll,
  projectSelectSome,
  projectSelectIdName,
  projectSelectAll,
  taskSelectSome,
  taskSelectIdName,
  taskSelectAll,
  verifyTokenSelectAll,
  timesheetSelectSome,
  timesheetSelectAll,
  timeEntryStatus,
  timesheetSelectStatusPending,
  todayTaskSelectSome,
  todayTaskSelectAll,
  todayTaskSelectStatusPending,
  expenseCategorySelectSome,
  expenseCategorySelectAll,
  expenseSelectSome,
  prioritySelectSome,
  statusSelectSome,
  expenseSelectAll,
  countryCodeSelectAll,
  currencySelectSome,
  expenseSelectStatusPending,
  profileDetailsSelectAll,
  timesheetHighlights,
  todaysTasksHighlights,
  tasksHighlights,
  projectsHighlights,
  usersHighlights,
  expenseHighlights,
  taskReportSelectSome,
  timesheetReportSelectSome,
  todaysTaskReportSelectSome,
  clientReportSelectSome,
  projectReportSelectSome,
  userReportSelectSome,
  DashBoardProjectSelectSome,
  DashBoardClientSelectSome,
  DashBoardTaskSelectSome,
  DashBoardUserSelectSome,
  resourceAllocationSelectSome,
  resourceAllocationSelectAll,
  allTimesheetsSelectSome,
  numOfSaltRounds,
  maxTake,
  presignedUrlExpSec,
  fileAttachmentSizeLimit,
  expenseCategorySelectList,
  currencySelectList,
  MinNameLength,
  MaxNameLength,
  bigInpuMaxLength,
  bigInpuMinLength,
  MinEmailLength,
  MaxEmailLength,
  MaxPhoneNumberLength,
  MinPhoneNumberLength,
  MaxAmountLength,
  nanoid,
};
