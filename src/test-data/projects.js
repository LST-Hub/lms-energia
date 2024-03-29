

const projectWidgets = [
    {
        id: 1,
        label: "Total Projects",
        counter: "12",
        badge: "ri-arrow-up-line",
        badgeClass: "success",
        percentage: "7.32 %",
        icon: "ri-ticket-2-line",
        iconClass: "info",
        decimals: 1,
        prefix: "",
        suffix: "k",
    },
    // {
    //     id: 2,
    //     label: "Ongoing Projects",
    //     counter: "4.3",
    //     badge: "ri-arrow-up-line",
    //     badgeClass: "success",
    //     percentage: "1.5 %",
    //     icon: "mdi mdi-timer-sand",
    //     iconClass: "warning",
    //     decimals: 1,
    //     prefix: "",
    //     suffix: "k",
    // },
    // {
    //     id: 3,
    //     label: "Completed Projects",
    //     counter: "7.6",
    //     badge: "ri-arrow-down-line",
    //     badgeClass: "danger",
    //     percentage: "5.2 %",
    //     icon: "ri-checkbox-circle-line",
    //     iconClass: "success",
    //     decimals: 2,
    //     prefix: "",
    //     suffix: "K",
    // },
    // {
    //     id: 4,
    //     label: "Deleted Tasks",
    //     counter: "14.84",
    //     badge: "ri-arrow-up-line",
    //     badgeClass: "success",
    //     percentage: "0.63 %",
    //     icon: "ri-delete-bin-line",
    //     iconClass: "danger",
    //     decimals: 2,
    //     prefix: "$",
    //     suffix: "%",
    // },
];

const allProjects = [
    {
        id: '1',
        taskId: "#PRZ632",
        project: "Velzon - v1.0.0",
        task: "Error message when placing an orders?",
        creater: "Robert McMahon",
        // subItem: [avatar3, avatar1],
        subItem: [{ id: 1, img: "avatar3" }, { id: 2, img: "avatar1" }],
        dueDate: "25 Jan, 2022",
        status: "Inprogress",
        statusClass: "secondary",
        priority: "High",
        priorityClass: "danger",
    },
    {
        id: '2',
        taskId: "#PRZ453",
        project: "Skote - v1.0.0",
        task: "Profile Page Satructure",
        creater: "Mary Cousar",
        // subItem: [avatar10, avatar9, avatar5],
        subItem: [{ id: 1, img: "avatar10" }, { id: 2, img: "avatar9" }, { id: 3, img: "avatar5" }],
        dueDate: "20 Dec, 2021",
        status: "New",
        statusClass: "info",
        priority: "Low",
        priorityClass: "success",
    },
    {
        id: '3',
        taskId: "#PRZ454",
        project: "Skote - v2.3.0",
        task: "Apologize for shopping Error!",
        creater: "Nathan Cole",
        // subItem: [avatar5, avatar6, avatar7, avatar8],
        subItem: [{ id: 1, img: "avatar5" }, { id: 2, img: "avatar6" }, { id: 3, img: "avatar7" }, { id: 4, img: "avatar8" }],
        dueDate: "23 Oct, 2021",
        status: "Completed",
        statusClass: "success",
        priority: "Medium",
        priorityClass: "warning",
    },
    {
        id: '4',
        taskId: "#PRZ455",
        project: "Minia - v1.4.0",
        task: "Post launch reminder/ post list",
        creater: "Joseph Parker",
        // subItem: [avatar2],
        subItem: [{ id: 1, img: "avatar2" }],
        dueDate: "05 Oct, 2021",
        status: "Pending",
        statusClass: "warning",
        priority: "High",
        priorityClass: "danger",
    },
    {
        id: '5',
        taskId: "#PRZ456",
        project: "Minia - v1.2.0",
        task: "Make a creating an account profile",
        creater: "Henry Baird",
        // subItem: [avatar3, avatar10, avatar9],
        subItem: [{ id: 1, img: "avatar3" }, { id: 2, img: "avatar10" }, { id: 3, img: "avatar9" }],
        dueDate: "17 Oct, 2021",
        status: "Inprogress",
        statusClass: "secondary",
        priority: "Medium",
        priorityClass: "warning",
    },
    {
        id: '6',
        taskId: "#PRZ657",
        project: "Minimal - v2.1.0",
        task: "Change email option process",
        creater: "Tonya Noble",
        // subItem: [avatar6, avatar7],
        subItem: [{ id: 1, img: "avatar6" }, { id: 2, img: "avatar7" }],
        dueDate: "04 Dec, 2021",
        status: "Completed",
        statusClass: "success",
        priority: "High",
        priorityClass: "danger",
    },
    {
        id: '7',
        taskId: "#PRZ458",
        project: "Dason - v1.1.0",
        task: "User research",
        creater: "Donald Palmer",
        // subItem: [avatar10, avatar9, avatar8, avatar1],
        subItem: [{ id: 1, img: "avatar10" }, { id: 2, img: "avatar9" }, { id: 3, img: "avatar8" }, { id: 4, img: "avatar1" }],
        dueDate: "11 Oct, 2021",
        status: "New",
        statusClass: "info",
        priority: "Low",
        priorityClass: "success",
    },
    {
        id: '8',
        taskId: "#PRZ459",
        project: "Dorsin - Landing Page",
        task: "Benner design for FB & Twitter",
        creater: "Carter",
        // subItem: [avatar5, avatar4],
        subItem: [{ id: 1, img: "avatar5" }, { id: 2, img: "avatar4" }],
        dueDate: "16 Dec, 2021",
        status: "Pending",
        statusClass: "warning",
        priority: "Medium",
        priorityClass: "warning",
    },
    {
        id: '9',
        taskId: "#PRZ460",
        project: "Qexal - Landing Page",
        task: "Brand logo design",
        creater: "David Nichols",
        // subItem: [avatar6, avatar7, avatar8],
        subItem: [{ id: 1, img: "avatar6" }, { id: 2, img: "avatar7" }, { id: 3, img: "avatar8" }],
        dueDate: "29 Dec, 2021",
        status: "Pending",
        statusClass: "warning",
        priority: "High",
        priorityClass: "danger",
    },
    {
        id: '10',
        taskId: "#PRZ461",
        project: "Doot - Chat App Template",
        task: "Additional Calendar",
        creater: "Diana Kohler",
        // subItem: [avatar4],
        subItem: [{ id: 1, img: "avatar4" }],
        dueDate: "13 Oct, 2021",
        status: "New",
        statusClass: "info",
        priority: "Low",
        priorityClass: "success",
    },
    {
        id: '11',
        taskId: "#PRZ462",
        project: "Skote - v2.1.0",
        task: "Edit customer testimonial",
        creater: "Nathan Cole",
        // subItem: [avatar7, avatar8],
        subItem: [{ id: 1, img: "avatar7" }, { id: 2, img: "avatar9" }],
        dueDate: "02 Jan, 2021",
        status: "Inprogress",
        statusClass: "secondary",
        priority: "Medium",
        priorityClass: "warning",
    },
];



export { projectWidgets, allProjects };