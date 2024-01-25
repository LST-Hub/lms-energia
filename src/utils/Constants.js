import Link from "next/link";
import { formatDate } from "./date";
import { convertSecToTime } from "./time";
import TkButton from "../components/TkButton";
import TkIcon from "../components/TkIcon";

const MinEmailLength = 5;
const MaxEmailLength = 100;

const MinPasswordLength = 8;
const MaxPasswordLength = 32;

const MinNameLength = 1;
const MaxNameLength = 50;

const MinTitleLength = 1;
const MaxTitleLength = 50;

const MaxAttachmentSize = 25 * 1024 * 1024; // 25MB

const MaxPhoneNumberLength = 15;
const MinPhoneNumberLength = 4;

const MaxEstimatedHoursLength = 9; // as we dotn want to allow to enter more than 99999 hours, so 100000:00 is 9 characters which is just greater that 99999:59 which is 8 characters
const MaxHoursLimit = 99999;
const MaxAmountLength = 100_00_00_000; // 1 billion

const smallInputMinLength = 1;
const smallInputMaxLength = 50;

const bigInpuMaxLength = 2000;
const bigInpuMinLength = 0;

const length10 = 10;

const minSearchLength = 2;

const perDefinedAdminRoleID = 1;
const perDefinedEmployeeRoleID = 2;
const perDefinedProjectAdminRoleID = 3;
const perDefinedProjectManagerRoleID = 4;

// we have created a enum type for the different epmloyee types in schema.prisma file.
// here we are treating the below values "Contractor", "Employee" as id's in database.
// we are doing this manully (hard coding in UI) as we are saving a api request to DB and backend..
// in future if you want to chnage names of eemployee types then chnage the label of below fields
// if you want to add new employee types thee add it below and make sure to add its id in schema.prisma file also
// types in enum once added cannot be removed so yoou cannot remove below tyypes from DB but add new one
const employeeTypes = [
  { value: "Employee", label: "Employee" },
  { value: "Contractor", label: "Contractor" },
];

// same as above  we have created a enum in Db  for employee type
const genderTypes = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const projectTypes = [
  { value: "fixed", label: "Fixed" },
  { value: "timeAndMaterial", label: "Time and Material" },
  { value: "ongoing", label: "Ongoing" },
  { value: "inhouse", label: "Inhouse" },
];

const countries = [
  { label: "Afghanistan", value: "Afghanistan" },
  { label: "Åland Islands", value: "Åland Islands" },
  { label: "Albania", value: "Albania" },
  { label: "Algeria", value: "Algeria" },
  { label: "American Samoa", value: "American Samoa" },
  { label: "Andorra", value: "Andorra" },
  { label: "Angola", value: "Angola" },
  { label: "Anguilla", value: "Anguilla" },
  { label: "Antarctica", value: "Antarctica" },
  { label: "Antigua & Barbuda", value: "Antigua & Barbuda" },
  { label: "Argentina", value: "Argentina" },
  { label: "Armenia", value: "Armenia" },
  { label: "Aruba", value: "Aruba" },
  { label: "Australia", value: "Australia" },
  { label: "Austria", value: "Austria" },
  { label: "Azerbaijan", value: "Azerbaijan" },
  { label: "Bahamas", value: "Bahamas" },
  { label: "Bahrain", value: "Bahrain" },
  { label: "Bangladesh", value: "Bangladesh" },
  { label: "Barbados", value: "Barbados" },
  { label: "Belarus", value: "Belarus" },
  { label: "Belgium", value: "Belgium" },
  { label: "Belize", value: "Belize" },
  { label: "Benin", value: "Benin" },
  { label: "Bermuda", value: "Bermuda" },
  { label: "Bhutan", value: "Bhutan" },
  { label: "Bolivia", value: "Bolivia" },
  { label: "Caribbean Netherlands", value: "Caribbean Netherlands" },
  { label: "Bosnia & Herzegovina", value: "Bosnia & Herzegovina" },
  { label: "Botswana", value: "Botswana" },
  { label: "Bouvet Island", value: "Bouvet Island" },
  { label: "Brazil", value: "Brazil" },
  {
    label: "British Indian Ocean Territory",
    value: "British Indian Ocean Territory",
  },
  { label: "Brunei", value: "Brunei" },
  { label: "Bulgaria", value: "Bulgaria" },
  { label: "Burkina Faso", value: "Burkina Faso" },
  { label: "Burundi", value: "Burundi" },
  { label: "Cambodia", value: "Cambodia" },
  { label: "Cameroon", value: "Cameroon" },
  { label: "Canada", value: "Canada" },
  { label: "Cape Verde", value: "Cape Verde" },
  { label: "Cayman Islands", value: "Cayman Islands" },
  { label: "Central African Republic", value: "Central African Republic" },
  { label: "Chad", value: "Chad" },
  { label: "Chile", value: "Chile" },
  { label: "China", value: "China" },
  { label: "Christmas Island", value: "Christmas Island" },
  { label: "Cocos (Keeling) Islands", value: "Cocos (Keeling) Islands" },
  { label: "Colombia", value: "Colombia" },
  { label: "Comoros", value: "Comoros" },
  { label: "Congo - Brazzaville", value: "Congo - Brazzaville" },
  { label: "Congo - Kinshasa", value: "Congo - Kinshasa" },
  { label: "Cook Islands", value: "Cook Islands" },
  { label: "Costa Rica", value: "Costa Rica" },
  { label: "Côte d’Ivoire", value: "Côte d’Ivoire" },
  { label: "Croatia", value: "Croatia" },
  { label: "Cuba", value: "Cuba" },
  { label: "Curaçao", value: "Curaçao" },
  { label: "Cyprus", value: "Cyprus" },
  { label: "Czechia", value: "Czechia" },
  { label: "Denmark", value: "Denmark" },
  { label: "Djibouti", value: "Djibouti" },
  { label: "Dominica", value: "Dominica" },
  { label: "Dominican Republic", value: "Dominican Republic" },
  { label: "Ecuador", value: "Ecuador" },
  { label: "Egypt", value: "Egypt" },
  { label: "El Salvador", value: "El Salvador" },
  { label: "Equatorial Guinea", value: "Equatorial Guinea" },
  { label: "Eritrea", value: "Eritrea" },
  { label: "Estonia", value: "Estonia" },
  { label: "Ethiopia", value: "Ethiopia" },
  {
    label: "Falkland Islands (Islas Malvinas)",
    value: "Falkland Islands (Islas Malvinas)",
  },
  { label: "Faroe Islands", value: "Faroe Islands" },
  { label: "Fiji", value: "Fiji" },
  { label: "Finland", value: "Finland" },
  { label: "France", value: "France" },
  { label: "French Guiana", value: "French Guiana" },
  { label: "French Polynesia", value: "French Polynesia" },
  {
    label: "French Southern Territories",
    value: "French Southern Territories",
  },
  { label: "Gabon", value: "Gabon" },
  { label: "Gambia", value: "Gambia" },
  { label: "Georgia", value: "Georgia" },
  { label: "Germany", value: "Germany" },
  { label: "Ghana", value: "Ghana" },
  { label: "Gibraltar", value: "Gibraltar" },
  { label: "Greece", value: "Greece" },
  { label: "Greenland", value: "Greenland" },
  { label: "Grenada", value: "Grenada" },
  { label: "Guadeloupe", value: "Guadeloupe" },
  { label: "Guam", value: "Guam" },
  { label: "Guatemala", value: "Guatemala" },
  { label: "Guernsey", value: "Guernsey" },
  { label: "Guinea", value: "Guinea" },
  { label: "Guinea-Bissau", value: "Guinea-Bissau" },
  { label: "Guyana", value: "Guyana" },
  { label: "Haiti", value: "Haiti" },
  { label: "Heard & McDonald Islands", value: "Heard & McDonald Islands" },
  { label: "Vatican City", value: "Vatican City" },
  { label: "Honduras", value: "Honduras" },
  { label: "Hong Kong", value: "Hong Kong" },
  { label: "Hungary", value: "Hungary" },
  { label: "Iceland", value: "Iceland" },
  { label: "India", value: "India" },
  { label: "Indonesia", value: "Indonesia" },
  { label: "Iran", value: "Iran" },
  { label: "Iraq", value: "Iraq" },
  { label: "Ireland", value: "Ireland" },
  { label: "Isle of Man", value: "Isle of Man" },
  { label: "Israel", value: "Israel" },
  { label: "Italy", value: "Italy" },
  { label: "Jamaica", value: "Jamaica" },
  { label: "Japan", value: "Japan" },
  { label: "Jersey", value: "Jersey" },
  { label: "Jordan", value: "Jordan" },
  { label: "Kazakhstan", value: "Kazakhstan" },
  { label: "Kenya", value: "Kenya" },
  { label: "Kiribati", value: "Kiribati" },
  { label: "North Korea", value: "North Korea" },
  { label: "South Korea", value: "South Korea" },
  { label: "Kosovo", value: "Kosovo" },
  { label: "Kuwait", value: "Kuwait" },
  { label: "Kyrgyzstan", value: "Kyrgyzstan" },
  { label: "Laos", value: "Laos" },
  { label: "Latvia", value: "Latvia" },
  { label: "Lebanon", value: "Lebanon" },
  { label: "Lesotho", value: "Lesotho" },
  { label: "Liberia", value: "Liberia" },
  { label: "Libya", value: "Libya" },
  { label: "Liechtenstein", value: "Liechtenstein" },
  { label: "Lithuania", value: "Lithuania" },
  { label: "Luxembourg", value: "Luxembourg" },
  { label: "Macao", value: "Macao" },
  { label: "North Macedonia", value: "North Macedonia" },
  { label: "Madagascar", value: "Madagascar" },
  { label: "Malawi", value: "Malawi" },
  { label: "Malaysia", value: "Malaysia" },
  { label: "Maldives", value: "Maldives" },
  { label: "Mali", value: "Mali" },
  { label: "Malta", value: "Malta" },
  { label: "Marshall Islands", value: "Marshall Islands" },
  { label: "Martinique", value: "Martinique" },
  { label: "Mauritania", value: "Mauritania" },
  { label: "Mauritius", value: "Mauritius" },
  { label: "Mayotte", value: "Mayotte" },
  { label: "Mexico", value: "Mexico" },
  { label: "Micronesia", value: "Micronesia" },
  { label: "Moldova", value: "Moldova" },
  { label: "Monaco", value: "Monaco" },
  { label: "Mongolia", value: "Mongolia" },
  { label: "Montenegro", value: "Montenegro" },
  { label: "Montserrat", value: "Montserrat" },
  { label: "Morocco", value: "Morocco" },
  { label: "Mozambique", value: "Mozambique" },
  { label: "Myanmar (Burma)", value: "Myanmar (Burma)" },
  { label: "Namibia", value: "Namibia" },
  { label: "Nauru", value: "Nauru" },
  { label: "Nepal", value: "Nepal" },
  { label: "Netherlands", value: "Netherlands" },
  { label: "Curaçao", value: "Curaçao" },
  { label: "New Caledonia", value: "New Caledonia" },
  { label: "New Zealand", value: "New Zealand" },
  { label: "Nicaragua", value: "Nicaragua" },
  { label: "Niger", value: "Niger" },
  { label: "Nigeria", value: "Nigeria" },
  { label: "Niue", value: "Niue" },
  { label: "Norfolk Island", value: "Norfolk Island" },
  { label: "Northern Mariana Islands", value: "Northern Mariana Islands" },
  { label: "Norway", value: "Norway" },
  { label: "Oman", value: "Oman" },
  { label: "Pakistan", value: "Pakistan" },
  { label: "Palau", value: "Palau" },
  { label: "Palestine", value: "Palestine" },
  { label: "Panama", value: "Panama" },
  { label: "Papua New Guinea", value: "Papua New Guinea" },
  { label: "Paraguay", value: "Paraguay" },
  { label: "Peru", value: "Peru" },
  { label: "Philippines", value: "Philippines" },
  { label: "Pitcairn Islands", value: "Pitcairn Islands" },
  { label: "Poland", value: "Poland" },
  { label: "Portugal", value: "Portugal" },
  { label: "Puerto Rico", value: "Puerto Rico" },
  { label: "Qatar", value: "Qatar" },
  { label: "Réunion", value: "Réunion" },
  { label: "Romania", value: "Romania" },
  { label: "Russia", value: "Russia" },
  { label: "Rwanda", value: "Rwanda" },
  { label: "St. Barthélemy", value: "St. Barthélemy" },
  { label: "St. Helena", value: "St. Helena" },
  { label: "St. Kitts & Nevis", value: "St. Kitts & Nevis" },
  { label: "St. Lucia", value: "St. Lucia" },
  { label: "St. Martin", value: "St. Martin" },
  { label: "St. Pierre & Miquelon", value: "St. Pierre & Miquelon" },
  { label: "St. Vincent & Grenadines", value: "St. Vincent & Grenadines" },
  { label: "Samoa", value: "Samoa" },
  { label: "San Marino", value: "San Marino" },
  { label: "São Tomé & Príncipe", value: "São Tomé & Príncipe" },
  { label: "Saudi Arabia", value: "Saudi Arabia" },
  { label: "Senegal", value: "Senegal" },
  { label: "Serbia", value: "Serbia" },
  { label: "Seychelles", value: "Seychelles" },
  { label: "Sierra Leone", value: "Sierra Leone" },
  { label: "Singapore", value: "Singapore" },
  { label: "Sint Maarten", value: "Sint Maarten" },
  { label: "Slovakia", value: "Slovakia" },
  { label: "Slovenia", value: "Slovenia" },
  { label: "Solomon Islands", value: "Solomon Islands" },
  { label: "Somalia", value: "Somalia" },
  { label: "South Africa", value: "South Africa" },
  {
    label: "South Georgia & South Sandwich Islands",
    value: "South Georgia & South Sandwich Islands",
  },
  { label: "South Sudan", value: "South Sudan" },
  { label: "Spain", value: "Spain" },
  { label: "Sri Lanka", value: "Sri Lanka" },
  { label: "Sudan", value: "Sudan" },
  { label: "Surivalue", value: "Surivalue" },
  { label: "Svalbard & Jan Mayen", value: "Svalbard & Jan Mayen" },
  { label: "Eswatini", value: "Eswatini" },
  { label: "Sweden", value: "Sweden" },
  { label: "Switzerland", value: "Switzerland" },
  { label: "Syria", value: "Syria" },
  { label: "Taiwan", value: "Taiwan" },
  { label: "Tajikistan", value: "Tajikistan" },
  { label: "Tanzania", value: "Tanzania" },
  { label: "Thailand", value: "Thailand" },
  { label: "Timor-Leste", value: "Timor-Leste" },
  { label: "Togo", value: "Togo" },
  { label: "Tokelau", value: "Tokelau" },
  { label: "Tonga", value: "Tonga" },
  { label: "Trinidad & Tobago", value: "Trinidad & Tobago" },
  { label: "Tunisia", value: "Tunisia" },
  { label: "Turkey", value: "Turkey" },
  { label: "Turkmenistan", value: "Turkmenistan" },
  { label: "Turks & Caicos Islands", value: "Turks & Caicos Islands" },
  { label: "Tuvalu", value: "Tuvalu" },
  { label: "Uganda", value: "Uganda" },
  { label: "Ukraine", value: "Ukraine" },
  { value: "United Arab Emirates", value: "United Arab Emirates" },
  { label: "United Kingdom", value: "United Kingdom" },
  { label: "United States", value: "United States" },
  { label: "U.S. Outlying Islands", value: "U.S. Outlying Islands" },
  { label: "Uruguay", value: "Uruguay" },
  { label: "Uzbekistan", value: "Uzbekistan" },
  { label: "Vanuatu", value: "Vanuatu" },
  { label: "Venezuela", value: "Venezuela" },
  { label: "Vietnam", value: "Vietnam" },
  { label: "British Virgin Islands", value: "British Virgin Islands" },
  { label: "U.S. Virgin Islands", value: "U.S. Virgin Islands" },
  { label: "Wallis & Futuna", value: "Wallis & Futuna" },
  { label: "Western Sahara", value: "Western Sahara" },
  { label: "Yemen", value: "Yemen" },
  { label: "Zambia", value: "Zambia" },
  { label: "Zimbabwe", value: "Zimbabwe" },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const PUBLIC_BUCKET_BASE_URL = process.env.NEXT_PUBLIC_BUCKET_BASE_URL; // for public files

const RQ = {
  user: "user",
  workspace: "workspace",
  allUsers: "allUsers",
  project: "project",
  allProjects: "allProjects",
  todaysAllocatedTask: "todaysAllocatedTask",
  projectStatus: "projectStatus",
  allProjectCount: "allProjectCount",
  allTaskCount: "allTaskCount",
  allUserCount: "allUserCount",
  task: "task",
  allTasks: "allTasks",
  client: "client",
  allClients: "allClients",
  supervisor: "supervisor",
  allSupervisors: "allSupervisors",
  allProjectManager: "allProjectManager",
  allPMs: "allPMs",
  department: "department",
  allDepts: "allDepartments",
  attachment: "attachment",
  expense: "expense",
  employee: "employee",
  role: "role",
  allRoles: "allRoles",
  permission: "permission",
  allWorkCals: "allWorkCals",
  workCal: "workCal",
  allPriority: "allPriority",
  allStatus: "allStatus",
  allExpenseStatus: "allExpenseStatus",
  allTimesheets: "allTimesheet",
  allPendingTimesheets: "allPendingTimesheet",
  allApprovedTimesheets: "allApprovedTimesheet",
  allRejectedTimesheets: "allRejectedTimesheet",
  allPendinTodayTask: "allPendindTodayTask",
  allApprovedTodayTask: "allApprovedTodayTask",
  allRejectedTodayTask: "allRejectedTodayTask",
  allPendingExpenses: "allPendingExpenses",
  allApprovedExpenses: "allApprovedExpenses",
  allRejectedExpenses: "allRejectedExpenses",
  timesheet: "timesheet",
  allTodayTask: "allTodayTask",
  allSelfAllocatedTask: "allSelfAllocatedTask",
  TodayTask: "TodayTask",
  allExpenseCategories: "allExpenseCategories",
  expenseCategory: "expenseCategory",
  expense: "expense",
  allExpenses: "allExpenses",
  currencyCode: "currencyCode",
  allCurrencyCode: "allCurrencyCode",
  allCurriencies: "allCurriencies",
  allProjectList: "allProjectList",
  allTaskList: "allTaskList",
  allClientList: "allClientList",
  allUsersList: "allUsersList",
  allRolesList: "allRolesList",
  allPriorityList: "allPriorityList",
  allStatusList: "allStatusList",
  allCurrenciesList: "allCurrenciesList",
  myProjects: "myProjects",
  myTasks: "myTasks",
  profileData: "profileData",
  changePassword: "changePassword",
  workspaceSettings: "workspaceSettings",
  workspaceApprovalSettings: "WorkspaceApprovalsSettings",
  workspaceDefaults: "workspaceDefaults",
  actualTime: "actualTime",
  timesheetHighlights: "timesheetHighlights",
  todaysTaskHighlights: "todaysTaskHighlights",
  taskHighlights: "taskHighlights",
  projecthighlights: "projecthighlights",
  usersHighlights: "usersHighlights",
  expensesHighlights: "expensesHighlights",
  resourceAllocation: "resourceAllocation",
  timsheetCount: "timsheetCount",
  todaysTaskCount: "todaysTaskCount",
  expenseCount: "expenseCount",
  allProjectsActualTime: "allProjectsActualTime",
  allClientsActualTime: "allClientsActualTime",
  allTaskActualTime: "allTaskActualTime",
  reportResourceAllocation: "reportResourceAllocation",
  reportTimesheet: "reportTimesheet",
  reportTodaysTask: "reportTodaysTask",
  allProjectListForReportTimesheeet: "allProjectListForReportTimesheeet",
  workCalendar: "workCalendar",
};

const ws = "/ws";

const urls = {
  dashboard: `${ws}/dashboard`,
  workCalendar: `${ws}/work-calendar`,
  workCalendarView: `${ws}/work-calendar/view`,
  workCalendarEdit: `${ws}/work-calendar/edit`,
  workCalendarAdd: `${ws}/work-calendar/add`,
  settings: `${ws}/settings`,
  expenseCategoryEdit: `${ws}/settings/expense-categories/edit`,
  expenseCategoryAdd: `${ws}/settings/expense-categories/add`,
  expenseCategoryView: `${ws}/settings/expense-categories/view`,
  todaysTaskAdd: `${ws}/todays-tasks/add`,
  todaysTaskEdit: `${ws}/todays-tasks/edit`,
  todaysTaskView: `${ws}/todays-tasks/view`,
  todaysTasks: `${ws}/todays-tasks`,
  timesheets: `${ws}/timesheet`,
  timesheetAdd: `${ws}/timesheet/add`,
  timesheetView: `${ws}/timesheet/view`,
  timesheetEdit: `${ws}/timesheet/edit`,
  allTimesheets: `${ws}/timesheet/all-timesheets`,
  allTodayTask: `${ws}/todays-tasks/all-todaysTasks`,
  resourceAllocation: `${ws}/resource-allocation`,
  resourceAllocationAdd: `${ws}/resource-allocation/add`,
  resourceAllocationView: `${ws}/resource-allocation/view`,
  resourceAllocationEdit: `${ws}/resource-allocation/edit`,
  selfAllocatedTasks: `${ws}/resource-allocation/self-allocated`,
  allResourceAllocationView: `${ws}/resource-allocation/resource-allocation-view`,
  projects: `${ws}/projects`,
  projectAdd: `${ws}/projects/add`,
  projectEdit: `${ws}/projects/edit`,
  projectView: `${ws}/projects/view`,
  tasks: `${ws}/tasks`,
  taskAdd: `${ws}/tasks/add`,
  taskEdit: `${ws}/tasks/edit`,
  taskView: `${ws}/tasks/view`,
  clients: `${ws}/clients`,
  clientAdd: `${ws}/clients/add`,
  clientEdit: `${ws}/clients/edit`,
  clientView: `${ws}/clients/view`,
  approvals: `${ws}/approvals`,
  approvalExpense: `${ws}/approvals/expense`,
  approvalTimesheet: `${ws}/approvals/timesheet`,
  approvalTodaysTask: `${ws}/approvals/todays-tasks`,
  help: `${ws}/help`,
  expense: `${ws}/expense`,
  expenseAdd: `${ws}/expense/add`,
  expenseEdit: `${ws}/expense/edit`,
  expenseView: `${ws}/expense/view`,
  users: `${ws}/users`,
  userAdd: `${ws}/users/add`,
  userEdit: `${ws}/users/edit`,
  userView: `${ws}/users/view`,
  reports: `${ws}/reports`,
  roles: `${ws}/roles`,
  roleAdd: `${ws}/roles/add`,
  roleEdit: `${ws}/roles/edit`,
  roleView: `${ws}/roles/view`,
  settings: `${ws}/settings`,
  settingsExpenseCategories: `${ws}/settings/expense-categories`,
  profile: `${ws}/profile`,
  profileView: `${ws}/profile/view`,
  profileEdit: `${ws}/profile/edit`,
  login: "/login",
  logout: "/logout",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  signup: "/signup",
  start: "/start",
  inviteSignup: "/invite-signup",
  inviteUserDetails: "/invite-user-details",
  idleHours: "/idle-hours",
  leads: `${ws}/leads`,
  leadAdd: `${ws}/leads/add`,
};

const SSNames = {
  project: {
    search: "projectSearch",
    filters: "projectFilters",
  },
};

const dropZone = {
  maxFiles: 10,
  maxFileSize: 25 * 1024 * 1024, // 25MB
  maxFileSizeMb: 25,
};

const roleRestrictionLabels = {
  own: "Own",
  none: "None",
  subordinates: "Subordinates",
};

const permissionAccessLabels = {
  view: "View",
  create: "Create",
  edit: "Edit",
  all: "All",
};

const modes = {
  create: "create",
  view: "view",
  edit: "edit",
};

const statusOptions = [
  { value: "open", label: "Open" },
  { value: "not started", label: "Not Started" },
  { value: "incomplete", label: "Incomplete" },
  { value: "compeleted", label: "Completed" },
  { value: "halted", label: "Halted" },
  { value: "closed", label: "Closed" },
  { value: "cancled", label: "Cancled" },
];

const statusFilterDropdownOptions = [
  { value: "Draft", label: "Draft" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

const repeatOptions = [
  { value: "DontRepeat", label: "Don't Repeat" },
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
];

const repeatType = {
  dontRepeat: "DontRepeat",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

// we take maxTake as 100 from database for all queries, but here I have set it to 99 to be safe from any future changes
const maxDataLengthForUISearch = 99;

// I have made debounce time 500 intentionally, to reduce database calls if happenned in a short time
// later if you have more database and backend resources then you can reduce this time
const backendDebounceTime = 500;

//made UI debounce time 200ms, as we are searchi on UI and no api calls, so search feels faster
const UIDebounceTime = 200;

const environment = process.env.NODE_ENV;

// used below vars in search fucntion so made a separte variable for them
const projectUserFieldname = "projectUsers";
const taskUserFieldname = "taskUsers";
const searchParamName = "search";

const serachFields = {
  users: ["name", "firstName", "lastName"],
  projects: ["name"],
  tasks: ["name"],
  clients: ["name"],
  roles: ["name"],
  expense: ["amount"],
};

const filterFields = {
  users: {
    supervisor: "supervisorId",
    workCal: "workCalendarId",
    role: "roleId",
    active: "active",
  },
  projects: {
    pm: "pmId",
    status: "statusId",
    priority: "priorityId",
    client: "clientId",
    active: "active",
  },
  tasks: {
    project: "projectId",
    status: "statusId",
    priority: "priorityId",
    active: "active",
  },
  clients: {
    active: "active",
  },
  roles: {
    restriction: "restrictionId",
    active: "active",
  },
  expense: {
    expenseCategory: "expenseCategoryId",
    status: "status",
  },
  approveTimeSheet: {
    project: "projectId",
    user: "createdById",
    status: "status",
    startDate: "startDate",
    endDate: "endDate",
  },
  approveTodaysTask: {
    project: "projectId",
    user: "createdById",
    status: "status",
    startDate: "startDate",
    endDate: "endDate",
  },
  approveExpense: {
    user: "createdById",
    startDate: "startDate",
    endDate: "endDate",
  },
  todaysTask: {
    project: "projectId",
    task: "taskId",
    status: "status",
    startDate: "startDate",
    endDate: "endDate",
  },
  timesheet: {
    project: "projectId",
    task: "taskId",
    status: "status",
    startDate: "startDate",
    endDate: "endDate",
  },
  workCalendar: {
    active: "active",
  },
  resourceAllocation: {
    project: "projectId",
    allocatedUser: "allocatedUserId",
    repetation: "repetationType",
    startDate: "startDate",
    endDate: "endDate",
  },
  projectReport: {
    project: "id",
    pm: "pmId",
    client: "clientId",
  },
  taskReport: {
    task: "id",
    project: "projectId",
  },
  clientReport: {
    client: "id",
  },
  userReport: {
    user: "id",
    role: "roleId",
  },
  timesheetReport: {
    user: "createdById",
    project: "projectId",
    task: "taskId",
    status: "status",
    startDate: "startDate",
    endDate: "endDate",
  },
  reports: {
    table: "table",
  },

  idleHrsFilter: {
    resource: "resourceId",
    startDate: "startDate",
    endDate: "endDate",
  },
};

//status active and inactive
const filterStatusOptions = [
  {
    value: true,
    label: "Active",
  },
  {
    value: false,
    label: "Inactive",
  },
];

const projectHighlightColumn = [
  {
    Header: "Project Name",
    accessor: "name",
    filterable: false,
    Cell: (cellProps) => {
      return (
        <>
          <Link href={`${urls.projectView}/${cellProps.row.original.id}`}>
            <a className="flex-grow-1 fw-medium text-primary">
              <div className="flex-grow-1 projects_name">{cellProps.value}</div>
            </a>
          </Link>
          {/* <span>{cellProps.value}</span> */}
        </>
      );
    },
  },
  {
    Header: "Project Manager",
    accessor: "pm.name",
    filterable: false,
    Cell: (cellProps) => {
      return (
        <>
          <span>{cellProps.value}</span>
        </>
      );
    },
  },
  {
    Header: "Start Date",
    accessor: "startDate",
    filterable: false,
    Cell: (cellProps) => {
      return (
        <>
          <span>{cellProps.value ? formatDate(cellProps.value) : "NA"}</span>
        </>
      );
    },
  },
];

const taskHighlightColumn = [
  {
    Header: "Task Name",
    accessor: "name",
    filterable: false,
    Cell: (cellProps) => {
      return (
        <>
          <Link href={`${urls.taskView}/${cellProps.row.original.id}`}>
            <a className="flex-grow-1 fw-medium text-primary">
              <div className="flex-grow-1 tasks_name">{cellProps.value}</div>
            </a>
          </Link>
        </>
      );
    },
  },
  {
    Header: "Estimated Time",
    accessor: "estimatedTime",
    filterable: false,
    Cell: (cellProps) => {
      return <>{convertSecToTime(cellProps?.value)}</>;
    },
  },
  {
    Header: "Estimated End Date",
    accessor: "estimatedEndDate",
    filterable: false,
    Cell: (cellProps) => {
      return <>{cellProps?.value ? formatDate(cellProps?.value) : "NA"}</>;
    },
  },
];

const timesheetHighlightColumn = [
  {
    Header: "View",
    accessor: "view",
    filterable: false,
    Cell: (cellProps) => {
      return (
        <div className="d-flex align-items-center">
          <ul className="ps-0 mb-0">
            <li className="list-inline-item">
              <Link href={`${urls.timesheetView}/${cellProps.row.original.id}`}>
                <a>
                  <TkButton color="none">
                    <TkIcon className="ri-eye-fill align-bottom text-muted"></TkIcon>
                  </TkButton>
                </a>
              </Link>
            </li>
          </ul>
        </div>
      );
    },
  },
  {
    Header: "Created By",
    accessor: "createdBy.name",
    filterable: false,
    Cell: (cellProps) => {
      return (
        <>
          <span>{cellProps.value}</span>
        </>
      );
    },
  },
  {
    Header: "Date",
    accessor: "date",
    filterable: false,
    Cell: (cellProps) => {
      return <>{formatDate(cellProps?.value)}</>;
    },
  },
  {
    Header: "Duration",
    accessor: "duration",
    filterable: false,
    Cell: (cellProps) => {
      return <>{convertSecToTime(cellProps?.value)}</>;
    },
  },
  {
    Header: "Task",
    accessor: "task.name",
    filterable: false,
    Cell: (cellProps) => {
      return <>{cellProps.value}</>;
    },
  },
];

const todaysTaskHighlightColumn = [
  {
    Header: "View",
    accessor: "view",
    filterable: false,
    Cell: (cellProps) => {
      return (
        <div className="d-flex align-items-center">
          <ul className="ps-0 mb-0">
            <li className="list-inline-item">
              <Link href={`${urls.todaysTaskView}/${cellProps.row.original.id}`}>
                <a>
                  <TkButton color="none">
                    <TkIcon className="ri-eye-fill align-bottom text-muted"></TkIcon>
                  </TkButton>
                </a>
              </Link>
            </li>
          </ul>
        </div>
      );
    },
  },

  {
    Header: "Created By",
    accessor: "createdBy.name",
    filterable: false,
    Cell: (cellProps) => {
      return (
        <>
          <span>{cellProps.value}</span>
        </>
      );
    },
  },
  {
    Header: "Date",
    accessor: "date",
    filterable: false,
    Cell: (cellProps) => {
      return <>{formatDate(cellProps?.value)}</>;
    },
  },
  {
    Header: "Duration",
    accessor: "duration",
    filterable: false,
    Cell: (cellProps) => {
      return <>{convertSecToTime(cellProps?.value)}</>;
    },
  },
  {
    Header: "Task",
    accessor: "task.name",
    filterable: false,
    Cell: (cellProps) => {
      return <>{cellProps.value}</>;
    },
  },
];

const expensesHighlightColumn = [
  {
    Header: "View",
    accessor: "view",
    filterable: false,
    Cell: (cellProps) => {
      console.log("cellProps", cellProps.row);
      return (
        <div className="d-flex align-items-center">
          <ul className="ps-0 mb-0">
            <li className="list-inline-item">
              <Link href={`${urls.expenseView}/${cellProps.row.original.id}`}>
                <a>
                  <TkButton color="none">
                    <TkIcon className="ri-eye-fill align-bottom text-muted"></TkIcon>
                  </TkButton>
                </a>
              </Link>
            </li>
          </ul>
        </div>
      );
    },
  },
  {
    Header: "Expense Caregory",
    accessor: "expenseCategory.name",
    filterable: false,
    Cell: (cellProps) => {
      return (
        <>
          <span>{cellProps.value}</span>
        </>
      );
    },
  },
  {
    Header: "Amount",
    accessor: "amount",
    filterable: false,
    Cell: (cellProps) => {
      return (
        <>
          <span>{cellProps.value}</span>
        </>
      );
    },
  },
  {
    Header: "Date",
    accessor: "date",
    filterable: false,
    Cell: (cellProps) => {
      return (
        <>
          <span>{formatDate(cellProps?.value)}</span>
        </>
      );
    },
  },
];

const userHighlightColumn = [
  {
    Header: "Name",
    accessor: "name",
    filterable: false,
    Cell: (cellProps) => {
      return (
        <>
          <Link href={`${urls.userView}/${cellProps.row.original.id}`}>
            <a className="flex-grow-1 fw-medium text-primary">
              <div className="flex-grow-1 users_name">{cellProps.value}</div>
            </a>
          </Link>
          {/* <span>{cellProps.value}</span> */}
        </>
      );
    },
  },
  {
    Header: "Email",
    accessor: "email",
    filterable: false,
    Cell: (cellProps) => {
      return (
        <>
          <span>{cellProps.value}</span>
        </>
      );
    },
  },
  {
    Header: "Supervisor",
    accessor: "supervisor.name",
    filterable: false,
    Cell: (cellProps) => {
      return (
        <>
          <span>{cellProps.value ? cellProps.value : "—"}</span>
        </>
      );
    },
  },
];

const settingsTab = {
  priorities: "priorities",
  status: "status",
  workCalendar: "workCalendar",
  departments: "departments",
  currency: "currency",
  expenseCategory: "expenseCategory",
  workspace: "workspace",
};

const approvalsTab = {
  timesheet: "timesheet",
  todayTask: "todayTask",
  expense: "expense",
};

const daysOfWeek = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const datesOfMonth = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
  { value: 8, label: "8" },
  { value: 9, label: "9" },
  { value: 10, label: "10" },
  { value: 11, label: "11" },
  { value: 12, label: "12" },
  { value: 13, label: "13" },
  { value: 14, label: "14" },
  { value: 15, label: "15" },
  { value: 16, label: "16" },
  { value: 17, label: "17" },
  { value: 18, label: "18" },
  { value: 19, label: "19" },
  { value: 20, label: "20" },
  { value: 21, label: "21" },
  { value: 22, label: "22" },
  { value: 23, label: "23" },
  { value: 24, label: "24" },
  { value: 25, label: "25" },
  { value: 26, label: "26" },
  { value: 27, label: "27" },
  { value: 28, label: "28" },
  { value: 29, label: "29" },
  { value: 30, label: "30" },
  { value: 31, label: "31" },
];

export {
  MinEmailLength,
  MaxEmailLength,
  MinPasswordLength,
  MaxPasswordLength,
  MinNameLength,
  MaxNameLength,
  MinTitleLength,
  MaxTitleLength,
  MaxAttachmentSize,
  MaxPhoneNumberLength,
  MinPhoneNumberLength,
  bigInpuMaxLength,
  bigInpuMinLength,
  employeeTypes,
  genderTypes,
  projectTypes,
  countries,
  MaxEstimatedHoursLength,
  MaxHoursLimit,
  MaxAmountLength,
  smallInputMinLength,
  smallInputMaxLength,
  API_BASE_URL,
  RQ,
  length10,
  dropZone,
  roleRestrictionLabels,
  permissionAccessLabels,
  modes,
  PUBLIC_BUCKET_BASE_URL,
  statusOptions,
  statusFilterDropdownOptions,
  repeatOptions,
  repeatType,
  maxDataLengthForUISearch,
  backendDebounceTime,
  UIDebounceTime,
  environment,
  minSearchLength,
  serachFields,
  filterFields,
  projectUserFieldname,
  taskUserFieldname,
  searchParamName,
  urls,
  SSNames,
  allTimezones,
  filterStatusOptions,
  projectHighlightColumn,
  taskHighlightColumn,
  timesheetHighlightColumn,
  todaysTaskHighlightColumn,
  expensesHighlightColumn,
  userHighlightColumn,
  settingsTab,
  approvalsTab,
  daysOfWeek,
  datesOfMonth,
  perDefinedAdminRoleID,
  perDefinedEmployeeRoleID,
  perDefinedProjectAdminRoleID,
  perDefinedProjectManagerRoleID,
};

const allTimezones = [
  {
    value: "America/New_York",
    label: "(GMT-05:00) Eastern Time (US & Canada)",
  },
  { value: "America/Chicago", label: "(GMT-06:00) Central Time (US & Canada)" },
  { value: "America/Denver", label: "(GMT-07:00) Mountain Time (US & Canada)" },
  {
    value: "America/Los_Angeles",
    label: "(GMT-08:00) Pacific Time (US & Canada)",
  },
  { value: "Europe/London", label: "(GMT-00:00) London" },
  { value: "Pacific/Midway", label: "(GMT-11:00) Midway Island" },
  { value: "Pacific/Pago_Pago", label: "(GMT-11:00) Samoa" },
  { value: "Pacific/Honolulu", label: "(GMT-10:00) Hawaii" },
  { value: "America/Anchorage", label: "(GMT-09:00) Alaska" },
  { value: "America/Tijuana", label: "(GMT-08:00) Tijuana" },
  { value: "America/Phoenix", label: "(GMT-07:00) Arizona" },
  { value: "America/Chihuahua", label: "(GMT-07:00) Chihuahua" },
  { value: "America/Mazatlan", label: "(GMT-07:00) Mazatlan" },
  { value: "America/Mexico_City", label: "(GMT-06:00) Mexico City" },
  { value: "America/Monterrey", label: "(GMT-06:00) Monterrey" },
  { value: "Canada/Saskatchewan", label: "(GMT-06:00) Saskatchewan" },
  {
    value: "America/Indiana/Indianapolis",
    label: "(GMT-05:00) Indiana (East)",
  },
  { value: "America/Bogota", label: "(GMT-05:00) Bogota" },
  { value: "America/Lima", label: "(GMT-05:00) Lima" },
  { value: "America/Caracas", label: "(GMT-04:30) Caracas" },
  { value: "Canada/Atlantic", label: "(GMT-04:00) Atlantic Time (Canada)" },
  { value: "America/La_Paz", label: "(GMT-04:00) La Paz" },
  { value: "America/Santiago", label: "(GMT-04:00) Santiago" },
  { value: "Canada/Newfoundland", label: "(GMT-03:30) Newfoundland" },
  { value: "America/Buenos_Aires", label: "(GMT-03:00) Buenos Aires" },
  { value: "America/Godthab", label: "(GMT-03:00) Greenland" },
  { value: "Atlantic/Stanley", label: "(GMT-02:00) Stanley" },
  { value: "Atlantic/Azores", label: "(GMT-01:00) Azores" },
  { value: "Atlantic/Cape_Verde", label: "(GMT-01:00) Cape Verde Is." },
  { value: "Africa/Casablanca", label: "(GMT-00:00) Casablanca" },
  { value: "Europe/Dublin", label: "(GMT-00:00) Dublin" },
  { value: "Europe/Lisbon", label: "(GMT-00:00) Lisbon" },
  { value: "Africa/Monrovia", label: "(GMT-00:00) Monrovia" },
  { value: "Europe/Amsterdam", label: "(GMT+01:00) Amsterdam" },
  { value: "Europe/Belgrade", label: "(GMT+01:00) Belgrade" },
  { value: "Europe/Berlin", label: "(GMT+01:00) Berlin" },
  { value: "Europe/Bratislava", label: "(GMT+01:00) Bratislava" },
  { value: "Europe/Brussels", label: "(GMT+01:00) Brussels" },
  { value: "Europe/Budapest", label: "(GMT+01:00) Budapest" },
  { value: "Europe/Copenhagen", label: "(GMT+01:00) Copenhagen" },
  { value: "Europe/Ljubljana", label: "(GMT+01:00) Ljubljana" },
  { value: "Europe/Madrid", label: "(GMT+01:00) Madrid" },
  { value: "Europe/Paris", label: "(GMT+01:00) Paris" },
  { value: "Europe/Prague", label: "(GMT+01:00) Prague" },
  { value: "Europe/Rome", label: "(GMT+01:00) Rome" },
  { value: "Europe/Sarajevo", label: "(GMT+01:00) Sarajevo" },
  { value: "Europe/Skopje", label: "(GMT+01:00) Skopje" },
  { value: "Europe/Stockholm", label: "(GMT+01:00) Stockholm" },
  { value: "Europe/Vienna", label: "(GMT+01:00) Vienna" },
  { value: "Europe/Warsaw", label: "(GMT+01:00) Warsaw" },
  { value: "Europe/Zagreb", label: "(GMT+01:00) Zagreb" },
  { value: "Europe/Athens", label: "(GMT+02:00) Athens" },
  { value: "Europe/Bucharest", label: "(GMT+02:00) Bucharest" },
  { value: "Africa/Cairo", label: "(GMT+02:00) Cairo" },
  { value: "Africa/Harare", label: "(GMT+02:00) Harare" },
  { value: "Europe/Helsinki", label: "(GMT+02:00) Helsinki" },
  { value: "Europe/Istanbul", label: "(GMT+02:00) Istanbul" },
  { value: "Asia/Jerusalem", label: "(GMT+02:00) Jerusalem" },
  { value: "Europe/Kiev", label: "(GMT+02:00) Kyiv" },
  { value: "Europe/Minsk", label: "(GMT+02:00) Minsk" },
  { value: "Europe/Riga", label: "(GMT+02:00) Riga" },
  { value: "Europe/Sofia", label: "(GMT+02:00) Sofia" },
  { value: "Europe/Tallinn", label: "(GMT+02:00) Tallinn" },
  { value: "Europe/Vilnius", label: "(GMT+02:00) Vilnius" },
  { value: "Asia/Baghdad", label: "(GMT+03:00) Baghdad" },
  { value: "Asia/Kuwait", label: "(GMT+03:00) Kuwait" },
  { value: "Africa/Nairobi", label: "(GMT+03:00) Nairobi" },
  { value: "Asia/Riyadh", label: "(GMT+03:00) Riyadh" },
  { value: "Asia/Tehran", label: "(GMT+03:30) Tehran" },
  { value: "Europe/Moscow", label: "(GMT+03:00) Moscow" },
  { value: "Asia/Baku", label: "(GMT+04:00) Baku" },
  { value: "Europe/Volgograd", label: "(GMT+04:00) Volgograd" },
  { value: "Asia/Muscat", label: "(GMT+04:00) Muscat" },
  { value: "Asia/Tbilisi", label: "(GMT+04:00) Tbilisi" },
  { value: "Asia/Yerevan", label: "(GMT+04:00) Yerevan" },
  { value: "Asia/Kabul", label: "(GMT+04:30) Kabul" },
  { value: "Asia/Karachi", label: "(GMT+05:00) Karachi" },
  { value: "Asia/Tashkent", label: "(GMT+05:00) Tashkent" },
  { value: "Asia/Calcutta", label: "(GMT+05:30) Calcutta" },
  { value: "Asia/Kathmandu", label: "(GMT+05:45) Kathmandu" },
  { value: "Asia/Yekaterinburg", label: "(GMT+06:00) Ekaterinburg" },
  { value: "Asia/Almaty", label: "(GMT+06:00) Almaty" },
  { value: "Asia/Dhaka", label: "(GMT+06:00) Dhaka" },
  { value: "Asia/Novosibirsk", label: "(GMT+07:00) Novosibirsk" },
  { value: "Asia/Bangkok", label: "(GMT+07:00) Bangkok" },
  { value: "Asia/Jakarta", label: "(GMT+07:00) Jakarta" },
  { value: "Asia/Krasnoyarsk", label: "(GMT+08:00) Krasnoyarsk" },
  { value: "Asia/Chongqing", label: "(GMT+08:00) Chongqing" },
  { value: "Asia/Hong_Kong", label: "(GMT+08:00) Hong Kong" },
  { value: "Asia/Kuala_Lumpur", label: "(GMT+08:00) Kuala Lumpur" },
  { value: "Australia/Perth", label: "(GMT+08:00) Perth" },
  { value: "Asia/Singapore", label: "(GMT+08:00) Singapore" },
  { value: "Asia/Taipei", label: "(GMT+08:00) Taipei" },
  { value: "Asia/Ulaanbaatar", label: "(GMT+08:00) Ulaan Bataar" },
  { value: "Asia/Urumqi", label: "(GMT+08:00) Urumqi" },
  { value: "Asia/Irkutsk", label: "(GMT+09:00) Irkutsk" },
  { value: "Asia/Seoul", label: "(GMT+09:00) Seoul" },
  { value: "Asia/Tokyo", label: "(GMT+09:00) Tokyo" },
  { value: "Australia/Adelaide", label: "(GMT+09:30) Adelaide" },
  { value: "Australia/Darwin", label: "(GMT+09:30) Darwin" },
  { value: "Asia/Yakutsk", label: "(GMT+10:00) Yakutsk" },
  { value: "Australia/Brisbane", label: "(GMT+10:00) Brisbane" },
  { value: "Australia/Canberra", label: "(GMT+10:00) Canberra" },
  { value: "Pacific/Guam", label: "(GMT+10:00) Guam" },
  { value: "Australia/Hobart", label: "(GMT+10:00) Hobart" },
  { value: "Australia/Melbourne", label: "(GMT+10:00) Melbourne" },
  { value: "Pacific/Port_Moresby", label: "(GMT+10:00) Port Moresby" },
  { value: "Australia/Sydney", label: "(GMT+10:00) Sydney" },
  { value: "Asia/Vladivostok", label: "(GMT+11:00) Vladivostok" },
  { value: "Asia/Magadan", label: "(GMT+12:00) Magadan" },
  { value: "Pacific/Auckland", label: "(GMT+12:00) Auckland" },
  { value: "Pacific/Fiji", label: "(GMT+12:00) Fiji" },
];
