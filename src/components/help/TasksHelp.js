import React from "react";
import TkAlert from "../TkAlert";
import Image from "next/future/image";
import taskSidebar from "../../../public/images/help/task-sidebar.png";
import taskForm from "../../../public/images/help/task-add.png";
import taskAttachFile from "../../../public/images/help/task-attach-files.png";
function TasksHelp() {
  return (
    <div className="table-text">
      <span>
        {" "}
        The Task module is a fundamental part of the TaskSprint app and is designed to be utilized by administrators,
        project managers, and other authorized roles. Here&#39;s a step-by-step guide on how the module functions:
      </span>
      <br />
      <Image
        src={taskSidebar}
        alt="Weekly Calender"
        style={{ width: "20%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 1: Accessing the Task Module</strong>
      </h3>
      <span>In the sidebar, click on &quot;Tasks&quot; to access the Tasks module.</span>
      <br />
      <br />

      <h3>
        <strong>Step 2: Adding a New Task</strong>
      </h3>
      <span>Within the Tasks module, locate and click on the &quot;Add Task&quot; button.</span>
      <br />
      <br />

      <h3>
        <strong>Step 3: Filling Out the Task Form</strong>
      </h3>

      <span>A task form will appear with various fields that need to be filled out:</span>
      <span>
        <ul>
          <li>
            <span>
              <strong>Task Name:</strong>
            </span>
            Enter the name of the task.
          </li>
          <li>
            <span>
              <strong>Project Name: </strong>
            </span>
            Choose the relevant project for this task. Make sure you&#39;ve created the project beforehand.
          </li>
          <li>
            <span>
              <strong>Status: </strong>
            </span>
            Select the current status of the task.
          </li>
          <li>
            <span>
              <strong>Priority: </strong>
            </span>
            Set the priority level of the task (e.g., High, Medium, Low).
          </li>
          <li>
            <span>
              <strong>Start Date: </strong>
            </span>
            Enter the start date of the task.
          </li>
          <li>
            <span>
              <strong>Estimated End Date: </strong>
            </span>
            Provide the expected completion date for the task.
          </li>
          <li>
            <span>
              <strong>Estimated Time (HH: MM): </strong>
            </span>
            Input the estimated time required to complete the task.
          </li>
          <li>
            <span>
              <strong>Assign Users: </strong>
            </span>
            Specify the users or team members assigned to this task.
          </li>

          <li>
            <span>
              <strong>Description: </strong>
            </span>
            Add a detailed description of the task.
          </li>
        </ul>

        <Image
        src={taskForm}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />
        <TkAlert color="warning">
          <span>
            If you&#39;ve assigned users in the project module, those assigned users can be selected for a task.
            However, if you haven&#39;t assigned users in the project module, that user will not be available in task
            module.
          </span>
        </TkAlert>
        
        <TkAlert color="warning">
          <span>
            If you&#39;ve selected a project for the task but haven&#39;t created it yet, you need to create the project
            before proceeding with task creation.
          </span>
        </TkAlert>
      </span>
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
        src={taskAttachFile}
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

      <h3>
        <strong>Step 5: Managing Tasks</strong>
      </h3>

      <span>
        After tasks have been created, you can manage and track them within the Tasks module. Update their status, track
        progress, and communicate with team members regarding the tasks.
      </span>
      <br />
    </div>
  );
}
export default TasksHelp;
