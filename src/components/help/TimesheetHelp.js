import React from "react";
import TkAlert from "../TkAlert";
import Image from "next/future/image";
import timesheetSidebar from "../../../public/images/help/timesheet-sidebar.png";
import timesheetFields from "../../../public/images/help/timesheet-all-fields.png";
import timesheetAll from "../../../public/images/help/timesheet-allocated time-duration-total-hours.png";
import allTimesheet from "../../../public/images/help/all-timesheet.png";
import multipleTimesheetAdd from "../../../public/images/help/multiple-timesheet-add.png";
import deleteTimesheet from "../../../public/images/help/timesheet-delete.png";
import allTimesheetDataFiltering from "../../../public/images/help/all-timesheet-data-filtering.png";
import allTimesheetTotalHours from "../../../public/images/help/all-timesheet-total-hours.png";
import allTimesheetCreatedBy from "../../../public/images/help/all-timesheet-createdBy.png";
import allTimesheetPopupForm from "../../../public/images/help/all-timesheet-popup-form.png";

function TimesheetsHelp() {
  return (
    <div className="table-text">
      <span>
        {" "}
        The timesheet module in the TaskSprint application is accessible to users with roles that include
        administrators, project admins, project managers, and employees. This module is a vital component of the
        TaskSprint app, offering essential functionalities for efficient task management and tracking. Here&#39;s how
        the module operates.
      </span>
      <br />
      <br />

      <h3>
        <strong>Step 1: Accessing the Timesheets Module</strong>
      </h3>
      <span>
        Users initiate their interaction with the timesheet module by selecting the &quot;Timesheet&quot; option from
        the application&#39;s sidebar. This action seamlessly guides them to the interface of the timesheet module.
      </span>
      <br />
      <Image
        src={timesheetSidebar}
        alt="Weekly Calender"
        style={{ width: "20%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 2: Adding a Timesheet</strong>
      </h3>
      <span>After accessing the timesheet module, users can add a new timesheet entry.</span>
      <br />
      <br />
      <h3>
        <strong>Step 3: Fields within the Timesheet Module</strong>
      </h3>
      <span>
        Once users enter the timesheet module, they are presented with a comprehensive set of fields that facilitate the
        management and tracking of tasks:
      </span>
      <span>
        <ul>
          <li>
            <span>
              <strong>Project:</strong>
            </span>
            &nbsp;This field provides a list of available projects for task allocation.
          </li>
          <li>
            <span>
              <strong>Task:</strong>
            </span>
            &nbsp;Users can select specific tasks associated with the chosen project. If tasks are initially absent,
            users should ensure that relevant tasks have been created within the application.
          </li>
          <li>
            <span>
              <strong>Allocated Time:</strong>
            </span>
            &nbsp;This field is dedicated to specifying the expected time duration for completing a particular task. It
            serves as a reference for task scheduling.
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
        src={timesheetFields}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
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
      <h3>
        <strong>Step 4: Allocated Time and Duration</strong>
      </h3>
      <span>
        In Task Sprint&#39;s timesheet module, &quot;Allocated Time&quot; lets users assign expected time to tasks
        during resource allocation. On the timesheet page, this starts at zero. Once a task is allocated, a timesheet
        entry is created with the allocated time shown. Users then input actual time spent in the editable
        &quot;Duration&quot; field. The system calculates &quot;Total Hours&quot; based on allocated time, displaying
        the cumulative effort in the header section. This process ensures accurate task planning and tracking.
      </span>
      <br />
      <br />
      <Image
        src={timesheetAll}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />
      <h3>
        <strong>Step 5: Adding a Multiple Timesheets </strong>
      </h3>
      <span>
        You can create and manage timesheets for multiple projects. If you have multiple projects with the same date,
        the Timesheet module allows you to differentiate and handle them effectively.
      </span>
      <br />
      <Image
        src={multipleTimesheetAdd}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 6: Delete a Timesheet </strong>
      </h3>
      <span>
        The ability to delete timesheets is also provided within the Timesheet module. This functionality helps in
        managing and maintaining accurate records.
      </span>
      <br />
      <Image
        src={deleteTimesheet}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>All Timesheet Page</strong>
      </h3>
      <span>
        The &quot;All Timesheet&quot; page serves as a centralized repository for timesheet data. Accessible exclusively
        by users with authorized roles (administrators, project admin, & project managers), this page harmonizes
        task-related information for convenient viewing and analysis.
      </span>
      <br />
      <br />
      <Image
        src={allTimesheet}
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
        The timesheet page incorporates data filtering functionality, enabling users to refine displayed information.
        Users can apply filters by selecting specific projects, tasks, and a desired date range. Filtered data is then
        neatly presented in tabular format.
      </span>
      <br/>
      <br/>
      <Image
        src={allTimesheetDataFiltering}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />
      <h3>
        <strong>Step 2: Total Hours Calculation</strong>
      </h3>
      <span>
        As users filter data, the &quot;Duration&quot; column of the timesheet table dynamically computes and displays
        the total hours spent on each task within the chosen filters.
      </span>
      <br/>
      <br/>
      <Image
        src={allTimesheetTotalHours}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />
      <h3>
        <strong>Step 3: Viewing Details</strong>
      </h3>
      <span>
        In the &quot;All Timesheet&quot; page, users can access additional information about a timesheet entry by
        clicking on the creator&#39;s name found in the &quot;Created By&quot; column. This action triggers a popup
        window that showcases detailed timesheet details.
      </span>
      <br/>
      <br/>
      <Image
        src={allTimesheetCreatedBy}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br/>
        <br/>
      <Image
        src={allTimesheetPopupForm}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
        />
    </div>
  );
}

export default TimesheetsHelp;
