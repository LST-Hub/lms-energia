import React from "react";
import TkAlert from "../TkAlert";

function WorkCalendarHelp() {
  return (
    <div className="table-text">
      <span>
        {" "}
        The Manage Workspace module in TaskSprint empowers System Admins with comprehensive control over workspace
        settings. From crafting tailored work calendars, prioritizing tasks, and tracking project statuses to creating
        departments, managing currencies and expense categories, this module enables fine-tuning of workspace dynamics.
        Additionally, users can configure various features, such as task entry, approval cycles, and email
        notifications, ensuring efficient task and project management within a personalized workspace environment.
      </span>
      <br />
      <br />
      <h3>
        <strong>Work Calendar</strong>
      </h3>
      <span>
        The Work Calendar setting allows you to define customized calendars that determine when tasks can be worked on.
        This is particularly useful for managing flexible work hours and non-working days.
      </span>
      <br />
      <br />
      <strong>Steps to Create a Work Calendar:</strong>
      <br />
      <span>
        1. <strong>Navigate: </strong>From the sidebar, go to the &quot;Manage Workspace&quot; module and select
        &quot;Work Calendar&quot;.
      </span>
      <br />
      <span>
        2. <strong>Add Calendar: </strong>Click on the &quot;Add&quot; button to begin.
      </span>
      <br />
      <span>
        3. <strong>Calendar Details: </strong>Provide a descriptive name for the calendar.
      </span>
      <br />
      <span>
        4. <strong>Work Start Time: </strong>Specify the time when work usually starts.
      </span>
      <br />
      <span>
        5. <strong>Working Days and Hours: </strong>Define the days and hours during which tasks can be worked on.
      </span>
      <br />
      <span>
        6. <strong>Non-Working Days: </strong>Indicate holidays or days off when tasks cannot be worked on.
      </span>
      <br />
      <br />
      <h3>
        <strong>Priority</strong>
      </h3>
      <span>
        The Priority setting helps you categorize tasks and projects based on their importance levels, allowing better
        focus on critical items.
      </span>
      <br />
      <br />
      <strong>Steps to Manage Priorities:</strong>
      <br />
      <span>
        1. <strong>Access Priority: </strong>Within the &quot;Manage Workspace &quot; module, select &quot;Priorities.
        &quot;
      </span>
      <br />
      <span>
        2. <strong>Create Priority: </strong> Enter your proproty name click on &quot;Add Priority &quot; to create a
        new priority label.
      </span>
      <br />
      <span>
        3. <strong>Activation Control: </strong> Toggle the switch to activate or deactivate a specific priority.
      </span>
      <br />
      <br />
      <TkAlert color="warning">
        NOTE: Only activated priorities will appear in the priority dropdown while creating or updating tasks or
        projects.
      </TkAlert>
      <br />
      <h3>
        <strong>Status</strong>
      </h3>
      <span>
        Statuses provide a quick snapshot of the progress of tasks and projects, aiding effective project tracking.
      </span>
      <br />
      <br />
      <strong>Steps to Manage Statuses:</strong>
      <br />
      <span>
        1. <strong>Navigate to Status: </strong> From the &quot;Manage Workspace&quot; module, choose
        &quot;Status.&quot;
      </span>
      <br />
      <span>
        2. <strong>Activation: </strong> Toggle the switch to activate or deactivate a status.
      </span>
      <br />
      <span>
        3. <strong>Dashboard Representation: </strong> Active statuses contribute to the pie chart on the dashboard,
        reflecting project progress.
      </span>
      <br />
      <br />
      <TkAlert color="warning">
        NOTE: You cannot Add new Statuses. You can only activate or deactivate existing statuses.
      </TkAlert>
      <br />
      <h3>
        <strong>Department</strong>
      </h3>
      <span>
        Statuses provide a quick snapshot of the progress of tasks and projects, aiding effective project tracking.
      </span>
      <br />
      <br />
      <strong>Steps to Manage Departments:</strong>
      <br />
      <span>
        1. <strong>Access Department: </strong> In the &quot;Manage Workspace&quot; module, select
        &quot;Department.&quot;
      </span>
      <br />
      <span>
        2. <strong>Add Department: </strong> Enter your department name and click on &quot;Add &quot; to create a new
        department.
      </span>
      <br />
      <span>
        3. <strong>Activation Toggle: </strong> Toggle the switch to activate or deactivate a department.
      </span>
      <br />
      <span>
        4. <strong>View Users: </strong> The Users column displays the number of users associated with a department. You
        can click on the number to view the list of users.
      </span>
      <br />
      <br />
      <h3>
        <strong>Currency</strong>
      </h3>
      <span>
        The Currency setting enables precise expense tracking by allowing you to manage different currencies.{" "}
      </span>
      <br />
      <br />
      <strong>Steps to Manage Currency:</strong>
      <br />
      <span>
        1. <strong>Visit Currency: </strong>Navigate to the &quot;Currency &quot; section in the &quot;Manage Workspace
        &quot; module.
      </span>
      <br />
      <span>
        2. <strong>Add Currency: </strong> Select the currencys from the dropdown and click on &quot;Add &quot; to add a
        new currency.
      </span>
      <br />
      <span>
        3. <strong>Activation Control: </strong> Toggle the switch to activate or deactivate a currency.
      </span>
      <br />
      <br />
      <TkAlert color="warning">
        NOTE: Only activated Currency will appear in the currency dropdown while creating or updating expenses.
      </TkAlert>
      <br />
      <h3>
        <strong>Expense Category</strong>
      </h3>
      <span>
        The Currency setting enables precise expense tracking by allowing you to manage different currencies.{" "}
      </span>
      <br />
      <br />
      <strong>Steps to Manage Expense Categories:</strong>
      <br />
      <span>
        1. <strong>Access Categories: </strong>In the &quot;Manage Workspace &quot; module, choose &quot;Expense
        Category. &quot;
      </span>
      <br />
      <span>
        2. <strong>Add Category: </strong>Click on &quot;Add&quot; to create a new category.
      </span>
      <br />
      <span>
        3. <strong>Fill Form: </strong>Enter your category name and description and click on &quot;Save &quot; to create
        a new expense category.
      </span>
      <br />
      <span>
        4. <strong>Activation Toggle: </strong>Toggle the switch to activate or deactivate a category.
      </span>
      <br />
      <br />
      <TkAlert color="warning">
        NOTE: Only activated Expense Category will appear in the expense category dropdown while creating or updating
        expenses.
      </TkAlert>
      <br />
      <h3>
        <strong>Workspace Settings</strong>
      </h3>
      <span>
        The Currency setting enables precise expense tracking by allowing you to manage different currencies.{" "}
      </span>
      <br />
      <br />
      <strong>Steps to Configure Workspace Settings:</strong>
      <br />
      <br />
      <span>
        1. <strong>Access Settings: </strong>To begin, log in to TaskSprint with your System Admin credentials and
        navigate to the &quot;Manage Workspace&quot; module.
      </span>
      <br />
      <br />
      <span>
        2. <strong>Workspace Name: </strong>
        <ul>
          <li>Within the Workspace Settings section, locate the &quot;Workspace Name&quot; field.</li>
          <li>
            Here, you can input the name of your workspace. This name will be displayed across the platform to identify
            your workspace.
          </li>
        </ul>
      </span>
      <span>
        3. <strong>Enable Today&prime;s Task Feature: </strong>
        <ul>
          <li>Find the &quot;Enable Today&prime;s Task Feature&quot; toggle button.</li>
          <li>
            Activating this toggle will introduce a new module in the sidebar, enabling users to add and manage tasks
            specifically for the current day.
          </li>
        </ul>
      </span>
      <span>
        4. <strong>Enable Approval Cycle for Today&prime;s Tasks: </strong>
        <ul>
          <li>This toggle, when enabled, triggers an approval process for tasks added for the current day.</li>
          <li>Upon activation, tasks entered will be sent for approval to the respective project manager.</li>
        </ul>
      </span>
    </div>
  );
}

export default WorkCalendarHelp;
