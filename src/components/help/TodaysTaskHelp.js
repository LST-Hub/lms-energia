import React from "react";
import TkAlert from "../TkAlert";
import Image from "next/future/image";
import todaystaskSidebar from "../../../public/images/help/todays-task-sidebar.png";
import todaystaskAdd from "../../../public/images/help/todays-task-all-fields.png";
import todaysAllocatedTime from "../../../public/images/help/todays-task-allocated-time-total-hrs.png";
import addMultipleTodaystask from "../../../public/images/help/add-multiple-todays-task.png";
import deleteTodaystask from "../../../public/images/help/delete-todays-task.png";
import allTodaystask from "../../../public/images/help/all-todays-task.png";
import todaysDatafilter from "../../../public/images/help/all-todays-task-data-filtering.png";
import todaystaskTotalHrs from "../../../public/images/help/all-todays-task-total-hrs.png";
import todaystaskViewCreatedBy from "../../../public/images/help/all-todays-task-createdBy.png";
import allTodaystaskPopupForm from "../../../public/images/help/all-todays-task-popup-form.png";
function TodaysTaskHelp() {
  return (
    <div className="table-text">
      <span>
        {" "}
        The Today&#39;s Task feature in TaskSprint is designed to help users manage their daily tasks efficiently. To
        begin using this feature, you need to enable it in the application settings.
      </span>
      <br />
      <br />

      <h3>
        <strong>Enabling the Feature</strong>
      </h3>
      <span>Users need to enable the &quot;Today&#39;s Task&quot; feature in the application settings.</span>
      <br />
      <br />

      <h3>
        <strong>Access Roles</strong>
      </h3>
      <span>
        This module is accessible to users with the roles of Administrator, Project Admin, Project Manager, and
        Employee.
      </span>
      <br />
      <br />

      <h3>
        <strong>Step 1: Accessing the Today&#39;s Task Module:</strong>
      </h3>
      <span>Click on the &quot;Today&#39;s Task&quot; option in the application&#39;s sidebar.</span>
      <br />
      <Image
        src={todaystaskSidebar}
        alt="Weekly Calender"
        style={{ width: "20%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 2: Adding a Task:</strong>
      </h3>
      <span>After accessing the timesheet module, users can add a new &quot;Today&#39;s Task&quot; entry.</span>
      <br />
      <br />

      <h3>
        <strong>Step 3: Fields within the Today&#39;s Task Module</strong>
      </h3>
      <span>The following fields are available in the module:</span>
      <span>
        <ul>
          <li>
            <strong>Project:</strong> Select a project for the task. If a project isn&#39;t available, create one within
            the TaskSprint application.
          </li>
          <li>
            <strong>Task:</strong> Select a task associated with the project.
          </li>
          <li>
            <strong>Allocated Time:</strong> This field is dedicated to specifying the expected time duration for
            completing a particular task. It serves as a reference for task scheduling.
          </li>
          <li>
            <span>
              <strong>Tickets:</strong>
            </span>
            &nbsp;Likely referring to task-related references or identifiers.
          </li>
          <li>
            <span>
              <strong>Duration:</strong>
            </span>
            &nbsp;An editable field where users input the actual time they&#39;ve spent on a task. The &quot;Total
            Hours&quot; are automatically calculated based on the allocated time.
          </li>
          <li>
            <span>
              <strong>Description:</strong>
            </span>
            Offers space for users to include additional task-related details.
          </li>
        </ul>
      </span>
      <Image
        src={todaystaskAdd}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />
      <TkAlert color="warning">
        <strong>Project Selection:</strong>&nbsp;
        <span>
          Users are required to select a project from the available options. If no projects are visible, users should
          create a new project within the Task Sprint application. This step is crucial as it establishes the context
          for task allocation and tracking.
        </span>
      </TkAlert>
      <TkAlert color="warning">
        <strong>Task Selection:</strong>&nbsp;
        <span>
          After choosing a project, users can then proceed to select a specific task associated with that project.
          Should the task field appear empty, it&#39;s essential to confirm that tasks have been successfully linked to
          the chosen project.
        </span>
      </TkAlert>
      <TkAlert color="warning">
        <strong>Ticket Requirement:</strong>&nbsp;
        <span>
          If a project is created with the &quot;Ticket&quot; checkbox marked as true, it signifies that tickets are
          associated with this project.
        </span>
        <span>Tickets are mandatory for this project in the Timesheet module.</span>
      </TkAlert>
      <br />
      <br />

      <h3>
        <strong>Step 4: Allocated Time:</strong>
      </h3>
      <span>
        In Task Sprint&#39;s todayt&#39;s task module, &quot;Allocated Time&quot; lets users assign expected time to
        tasks during resource allocation. On the todayt&#39;s task page, this starts at zero. Once a task is allocated,
        a todayt&#39;s task entry is created with the allocated time shown. Users then input actual time spent in the
        editable &quot;Duration&quot; field. The system calculates &quot;Total Hours&quot; based on allocated time,
        displaying the cumulative effort in the header section. This process ensures accurate task planning and
        tracking. F
      </span>
      <span>Allocated time represents the duration allocated for a specific task.</span>
      <br />
      <br />
      <Image
        src={todaysAllocatedTime}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 5: Adding a Multiple Today&#39;s Task </strong>
      </h3>
      <span>
        You can create and manage Today&#39;s Task for multiple projects. If you have multiple projects with the same
        date, the Today&#39;s Task module allows you to differentiate and handle them effectively.
      </span>
      <br />
      <br />
      <Image
        src={addMultipleTodaystask}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 6: Deleting Today&#39;s Task:</strong>
      </h3>
      <span>
        The ability to delete Today&#39;s Task is also provided within the Today&#39;s Task module. This functionality
        helps in managing and maintaining accurate records.
      </span>
      <br />
      <br />
      <Image
        src={deleteTodaystask}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>All Today&#39;s Task Page</strong>
      </h3>
      <span>All &quot;Today&#39;s Task&quot; entries are available on a dedicated page.</span>
      <span>This page is accessible only to users with Administrator, Project Admin, and Project Manager roles.</span>
      <span>
        Data displayed on this page includes columns for Created By, Date, Duration, Project, Task, Ticket, Status,
        Approved By, and Description.
      </span>
      <br />
      <br />
      <Image
        src={allTodaystask}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 1: Data Filtering</strong>
      </h3>
      <span>
        Users can filter data on the &quot;All Today&#39; Task&quot; page by selecting specific projects, tasks, and
        date ranges.
      </span>
      <br />
      <br />
      <Image
        src={todaysDatafilter}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 2: Total Hours Calculation All Today&#39;s Task Page</strong>
      </h3>
      <span>
        The &quot;Duration&quot; column on the &quot;All Today&#39; Task&quot; page displays the total hours calculated
        for the selected data.
      </span>
      <br />
      <br />
      <Image
        src={todaystaskTotalHrs}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 3: Viewing Today&#39;s Task Details</strong>
      </h3>
      <span>Clicking on the &quot;Created By&quot; name in the column opens a popup form.</span>
      <span>The popup form displays the details of the selected task.</span>
      <br />
      <br />
      <Image
        src={todaystaskViewCreatedBy}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <Image
        src={allTodaystaskPopupForm}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
    </div>
  );
}

export default TodaysTaskHelp;
