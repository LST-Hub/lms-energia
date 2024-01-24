import React from "react";
import TkAlert from "../TkAlert";

function AccessRightsHelp() {
  const modules = [
    {
      id: 1,
      name: "Dashboard",
      description: "Gain a comprehensive overview of all ongoing projects and tasks.",
    },
    {
      id: 2,
      name: "Today's Task",
      description: "Access and manage tasks scheduled for the current day.",
    },
    {
      id: 3,
      name: "Timesheet",
      description: "Monitor and review timesheets submitted by employees.",
    },
    {
      id: 4,
      name: "Resource Allocation",
      description: "Optimize resource allocation across projects.",
    },
    {
      id: 5,
      name: "Project",
      description: "Create, edit, and delete projects, overseeing their progress.",
    },
    {
      id: 6,
      name: "Tasks",
      description: "Manage tasks within projects, ensuring they align with project goals.",
    },
    {
      id: 7,
      name: "Clients",
      description: "Handle client details and interactions.",
    },
    {
      id: 8,
      name: "Approvals",
      description: "Review and approve timesheets and expenses.",
    },
    {
      id: 9,
      name: "Expense",
      description: "Access and manage expense records.",
    },
    {
      id: 10,
      name: "Users",
      description: " Administer user accounts and roles",
    },
    {
      id: 11,
      name: "Reports",
      description: "Generate reports on project progress, resource allocation, and more.",
    },
    {
      id: 12,
      name: "Manage Workspace",
      description: " Configure and customize your workspace settings.",
    },
  ];
  
  return (
    <div className="table-text">
      <span>
        {" "}
        TaskSprint&#39;s access control system is designed to empower your team with the right level of access to the
        various modules within the application. This ensures that each role has the necessary tools to contribute
        effectively to projects, while maintaining security and privacy. Here&#39;s a comprehensive breakdown of how
        access is managed for each role:
      </span>
      {/* create bullet points */}
      <br />
      <br />
      <h3>
        <strong>System Admin</strong>
      </h3>
      <span>
        {" "}
        As a System Admin, you wield the highest level of control within TaskSprint. Your responsibilities extend across
        all modules, enabling you to create, edit, delete, and manage every aspect of your workspace. Your access
        includes:
      </span>
      <ul>
        {modules.map((module, index) => {
          return (
            <li key={index}>
              <span>
                <strong>{module.name} : </strong>
                {module.description}
              </span>
            </li>
          );
        })}
      </ul>
      <br />
      <h3>
        <strong>Project Admin</strong>
      </h3>
      <span>
        {" "}
        As a Project Admin, your role focuses on project-level management, with the ability to oversee various modules:
      </span>
      <ul>
        {modules.map((module, index) => {
          if (
            module.id === 1 ||
            module.id === 2 ||
            module.id === 3 ||
            module.id === 4 ||
            module.id === 5 ||
            module.id === 6 ||
            module.id === 7 ||
            module.id === 8 ||
            module.id === 9 ||
            module.id === 11
          ) {
            return (
              <li key={index}>
                <span>
                  <strong>{module.name} : </strong>
                  {module.description}
                </span>
              </li>
            );
          }
          return null;
        })}
      </ul>
      <br />
      <h3>
        <strong>Project Manager</strong>
      </h3>
      <span>
        {" "}
        Project Managers hold pivotal roles in overseeing project execution and facilitating team collaboration. Project
        Manager can only access the project they are assigned as Project Manager:
      </span>
      <ul>
        {modules.map((module, index) => {
          if (
            module.id === 1 ||
            module.id === 2 ||
            module.id === 3 ||
            module.id === 4 ||
            module.id === 5 ||
            module.id === 6 ||
            module.id === 7 ||
            module.id === 8 ||
            module.id === 9
          ) {
            return (
              <li key={index}>
                <span>
                  <strong>{module.name} : </strong>
                  {module.description}
                </span>
              </li>
            );
          }
          return null;
        })}
      </ul>
      <br />
      <h3>
        <strong>Employee</strong>
      </h3>
      <span> Employees are crucial contributors to project execution:</span>
      <ul>
        {modules.map((module, index) => {
          if (module.id === 1 || module.id === 2 || module.id === 3 || module.id === 4 || module.id === 9) {
            return (
              <li key={index}>
                <span>
                  <strong>{module.name} : </strong>
                  {module.description}
                </span>
              </li>
            );
          }
          return null;
        })}
      </ul>
      <TkAlert color="info">
        TaskSprint&#39;s access control framework ensures that each role has the appropriate level of access to modules,
        promoting efficient collaboration while safeguarding sensitive data. By defining role-based permissions, your
        team can work seamlessly, contributing to the success of projects and achieving organizational goals.
      </TkAlert>
    </div>
  );
}

export default AccessRightsHelp;
