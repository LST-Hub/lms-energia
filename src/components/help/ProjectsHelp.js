import React from "react";
import TkAlert from "../TkAlert";
import Image from "next/future/image";
import projectSidebar from "../../../public/images/help/project-sidebar.png";
import projectForm from "../../../public/images/help/project-add.png";
import projectAttachFiles from "../../../public/images/help/project-attach-files.png";
function ProjectsHelp() {
  return (
    <div className="table-text">
      <span>
        {" "}
        The Project module is a fundamental part of the TaskSprint app and is designed to be utilized by administrators,
        project managers, and other authorized roles. Here&#39;s a step-by-step guide on how the module functions:
      </span>
      <br />
      <br />

      <h3>
        <strong>Step 1: Accessing the Project Module</strong>
      </h3>
      <span>From the sidebar menu, locate and click on the &quot;Project&quot; option.</span>
      <br />
      <Image
        src={projectSidebar}
        alt="Weekly Calender"
        style={{ width: "20%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 2: Adding a New Project</strong>
      </h3>
      <span>
        Within the Project module, you&#39;ll find an &quot;Add Project&quot; button. Click on this button to create a
        new project.
      </span>
      <br />
      <br />

      <h3>
        <strong>Step 3: Filling Out the Project Form</strong>
      </h3>
      <span>Upon clicking the &quot;Add Project&quot; button, a Project form will be presented.</span>
      <br />
      <br />
      <span>Fill out the following details in the form</span>
      <span>
        <ul>
          <li>
            <span>
              <strong>Project Name: </strong>
            </span>
            Enter the name of the project.
          </li>
          <li>
            <span>
              <strong>Client Name: </strong>
            </span>
            Select a client associated with the project.
          </li>
          <li>
            <span>
              <strong>Project Manager: </strong>
            </span>
            Assign a project manager for the project.
          </li>
          <li>
            <span>
              <strong>Status: </strong>
            </span>
            Select the status of the project in dropdown list.
          </li>
          <li>
            <span>
              <strong>Priority: </strong>
            </span>
            Specify the priority level of the project in dropdown list.
          </li>
          <li>
            <span>
              <strong>Start Date: </strong>
            </span>
            Enter the start date of the project.
          </li>
          <li>
            <span>
              <strong>Estimated End Date: </strong>
            </span>
            Provide the projected end date for the project.
          </li>
          <li>
            <span>
              <strong>Estimated Time (HH: MM): </strong>
            </span>
            Estimate the amount of time required for the project.
          </li>
          <li>
            <span>
              <strong>Assign Users: </strong>
            </span>
            Assign team members or users to the project.
          </li>
          <li>
            <span>
              <strong>Description: </strong>
            </span>
            Add a description or brief overview of the project.
          </li>
          <li>
            <span>
              <strong>Ticket (Checkbox): </strong>
            </span>
            If applicable, mark this checkbox. This indicates that the project has a ticket associated with it.
          </li>
        </ul>
      </span>
      <Image
        src={projectForm}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <TkAlert color="warning">
        <span>
          If the &quot;Ticket&quot; checkbox is selected, it signifies that the project has a ticket linked to it.
        </span>
        <span>
          On the timesheet page, the &quot;Ticket&quot; field becomes mandatory for projects that have a ticket. This
          enforces the need to associate the project with a ticket when recording timesheet entries.
        </span>
      </TkAlert>

      <TkAlert color="warning">
        <span>
          If you have selected a client but the client is not showing up in the client field, please make sure to create
          a client first. After creating the client, it should appear in the client field for selection.
        </span>
      </TkAlert>

      <br />
      <h3>
        <strong>Step 4: Selecting and Uploading Files</strong>
      </h3>
      <span>
        If the task requires attaching files, you can use the &quot;Select File&quot; or &quot;Upload File&quot; option
        within the task form.
      </span>
      <br/>
      <Image
        src={projectAttachFiles}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />
      <TkAlert color="warning">
        <span>
          Keep in mind that the maximum file size allowed is 25MB. Files larger than this won&#39;t be uploaded.
        </span>
      </TkAlert>
      <br />
    </div>
  );
}
export default ProjectsHelp;
