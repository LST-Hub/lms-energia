import avatar1 from "/public/images/users/avatar-1.jpg";
import avatar2 from "/public/images/users/avatar-2.jpg";
import avatar3 from "/public/images/users/avatar-3.jpg";
import avatar4 from "/public/images/users/avatar-4.jpg";
import avatar5 from "/public/images/users/avatar-5.jpg";
import avatar6 from "/public/images/users/avatar-6.jpg";
import avatar7 from "/public/images/users/avatar-7.jpg";
import avatar8 from "/public/images/users/avatar-8.jpg";

const projectsWidgets = [
  {
    id: 1,
    feaIcon: "briefcase",
    feaIconClass: "primary",
    label: "Active Projects",
    badgeClass: "danger",
    icon: "ri-arrow-down-s-line",
    percentage: "5.02 %",
    caption: "Projects this month",
    subCounter: [{ id: 1, counter: "825", suffix: "" }],
  },
  {
    id: 2,
    feaIcon: "award",
    feaIconClass: "warning",
    label: "Active Clients",
    badgeClass: "success",
    icon: "ri-arrow-up-s-line",
    percentage: "3.58 %",
    caption: "New Clients this Month",
    subCounter: [{ id: 1, counter: "7522", suffix: "", separator: "," }],
  },
  {
    id: 3,
    feaIcon: "clock",
    feaIconClass: "info",
    label: "Active User",
    badgeClass: "danger",
    icon: "ri-arrow-down-s-line",
    percentage: "10.35 %",
    caption: "Work this month",
    subCounter: [
      { id: 1, counter: "168", suffix: "h" },
      { id: 1, counter: "40", suffix: "m" },
    ],
  },
];

const DashboardProjectData = {
  all: [
    {
      data: [34, 65, 46, 68, 49, 61, 42, 44, 78, 52, 63, 67],
      name: "Number of Projects",
      type: "bar",
    },
    {
      data: [89.25, 98.58, 68.74, 108.87, 77.54, 84.03, 51.24, 28.82, 92.82, 47.82, 88.25, 36.93],
      name: "Number of Tasks",
      type: "area",
    },
    {
      data: [8, 12, 7, 17, 21, 11, 5, 9, 7, 29, 12, 35],
      name: "Active Projects",
      type: "bar",
    },
  ],
  month: [
    {
      data: [14, 45, 56, 78, 79, 81, 62, 44, 88, 52, 63, 87],
      name: "Number of Projects",
      type: "bar",
    },
    {
      data: [119.25, 128.58, 148.74, 148.87, 17.54, 154.03, 71.24, 58.82, 92.82, 47.82, 88.25, 36.93],
      name: "Number of Tasks",
      type: "area",
    },
    {
      data: [18, 22, 17, 47, 71, 31, 5, 9, 7, 29, 22, 75],
      name: "Active Projects",
      type: "bar",
    },
  ],
  halfyear: [
    {
      data: [34, 75, 66, 78, 29, 41, 32, 44, 58, 22, 43, 77],
      name: "Number of Projects",
      type: "bar",
    },
    {
      data: [109.25, 48.58, 38.74, 78.87, 57.54, 44.03, 21.24, 18.82, 92.82, 42.82, 48.25, 56.93],
      name: "Number of Tasks",
      type: "area",
    },
    {
      data: [38, 22, 27, 47, 61, 41, 15, 89, 27, 49, 32, 75],
      name: "Active Projects",
      type: "bar",
    },
  ],
  year: [
    {
      data: [14, 45, 16, 38, 29, 21, 12, 14, 58, 22, 23, 47],
      name: "Number of Projects",
      type: "bar",
    },
    {
      data: [59.25, 68.58, 48.74, 78.87, 57.54, 64.03, 21.24, 28.82, 72.82, 42.82, 68.25, 96.93],
      name: "Number of Tasks",
      type: "area",
    },
    {
      data: [38, 32, 27, 37, 41, 51, 35, 29, 17, 59, 32, 45],
      name: "Active Projects",
      type: "bar",
    },
  ],
};

const activeProjects = [
  {
    id: 1,
    projectName: "Brand Logo Design",
    img: avatar1,
    projectLead: "Donald Risher",
    percentage: "53%",
    subItem: [
      { id: 1, assImg: avatar1 },
      { id: 2, assImg: avatar2 },
      { id: 3, assImg: avatar3 },
    ],
    badge: "Inprogress",
    badgeClass: "warning",
    dueDate: "06 Sep 2021",
  },
  {
    id: 2,
    projectName: "Redesign - Landing Page",
    img: avatar2,
    projectLead: "Prezy William",
    percentage: "0%",
    subItem: [
      { id: 1, assImg: avatar5 },
      { id: 2, assImg: avatar6 },
    ],
    badge: "Pending",
    badgeClass: "danger",
    dueDate: "13 Nov 2021",
  },
  {
    id: 3,
    projectName: "Multipurpose Landing Template",
    img: avatar3,
    projectLead: "Boonie Hoynas",
    percentage: "100%",
    subItem: [
      { id: 1, assImg: avatar7 },
      { id: 2, assImg: avatar8 },
    ],
    badge: "Completed",
    badgeClass: "success",
    dueDate: "26 Nov 2021",
  },
  {
    id: 4,
    projectName: "Chat Application",
    img: avatar5,
    projectLead: "Pauline Moll",
    percentage: "64%",
    subItem: [{ id: 1, assImg: avatar2 }],
    badge: "Progress",
    badgeClass: "warning",
    dueDate: "15 Dec 2021",
  },
  {
    id: 5,
    projectName: "Create Wireframe",
    img: avatar6,
    projectLead: "James Bangs",
    percentage: "77%",
    subItem: [
      { id: 1, assImg: avatar1 },
      { id: 2, assImg: avatar6 },
      { id: 3, assImg: avatar4 },
    ],
    badge: "Progress",
    badgeClass: "warning",
    dueDate: "21 Dec 2021",
  },
];

const projectTasks = [
  {
    id: 1,
    forId: "checkTask1",
    label: "Create new Admin Template",
    dedline: "03 Nov 2023",
    status: "Completed",
    statusClass: "success",
    time: "2h 30m",
    img: avatar2,
  },
  {
    id: 2,
    forId: "checkTask2",
    label: "Marketing Coordinator",
    dedline: "17 Nov 2023",
    status: "Progress",
    statusClass: "warning",
    time: "1h 30m",
    img: avatar7,
  },
  {
    id: 3,
    forId: "checkTask3",
    label: "Administrative Analyst",
    dedline: "26 Nov 2023",
    status: "Completed",
    statusClass: "success",
    time: "3h 30m",
    img: avatar6,
  },
  {
    id: 4,
    forId: "checkTask4",
    label: "E-commerce Landing Page",
    dedline: "10 Dec 2023",
    status: "Pending",
    statusClass: "danger",
    time: "2h 30m",
    img: avatar5,
  },
  {
    id: 5,
    forId: "checkTask5",
    label: "UI/UX Design",
    dedline: "22 Dec 2023",
    status: "Progress",
    statusClass: "warning",
    time: "1h 30m",
    img: avatar1,
  },
  {
    id: 6,
    forId: "checkTask6",
    label: "Projects Design",
    dedline: "31 Dec 2023",
    status: "Pending",
    statusClass: "danger",
    time: "2h 30m",
    img: avatar4,
  },
];

const teamMembers = [
  {
    id: 1,
    img: avatar1,
    name: "Donald Risher",
    position: "Product Manager",
    hours: "110",
    tasks: "258",
    series: "50",
    chartsColor: "#405189",
  },
  {
    id: 2,
    img: avatar2,
    name: "Jansh Brown",
    position: "Lead Developer",
    hours: "83",
    tasks: "105",
    series: "45",
    chartsColor: "#405189",
  },
  {
    id: 3,
    img: avatar7,
    name: "Carroll Adams",
    position: "Lead Designer",
    hours: "58",
    tasks: "75",
    series: "75",
    chartsColor: "#405189",
  },
  {
    id: 4,
    img: avatar4,
    name: "William Pinto",
    position: "UI/UX Designer",
    hours: "96",
    tasks: "85",
    series: "25",
    chartsColor: "#f7b84b",
  },
  {
    id: 5,
    img: avatar6,
    name: "Garry Fournier",
    position: "Web Designer",
    hours: "76",
    tasks: "69",
    series: "60",
    chartsColor: "#405189",
  },
  {
    id: 6,
    img: avatar5,
    name: "Susan Denton",
    position: "Lead Designer",
    hours: "123",
    tasks: "658",
    series: "85",
    chartsColor: "#0ab39c",
  },
  {
    id: 7,
    img: avatar3,
    name: "Joseph Jackson",
    position: "React Developer",
    hours: "117",
    tasks: "125",
    series: "70",
    chartsColor: "#405189",
  },
];

// Project Status
const projectStatus = {
  all: [225, 152, 178, 189, 222, 238, 270],
  week: [145, 62, 68, 79, 102, 118, 150],
  month: [155, 82, 78, 99, 122, 138, 170],
  quarter: [185, 142, 158, 149, 172, 188, 220],
};

const projectStatusOptions = {
  all: "All Time",
  week: "Last 7 Days",
  month: "Last 30 Days",
  quarter: "Last 90 Days",
};

export {
  projectsWidgets,
  activeProjects,
  projectTasks,
  teamMembers,
  DashboardProjectData,
  projectStatus,
  projectStatusOptions,
};
