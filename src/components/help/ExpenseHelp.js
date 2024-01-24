import React from "react";
import TkAlert from "../TkAlert";
import Image from "next/future/image";
import expenseSidebar from "../../../public/images/help/expense-sidebar.png";
import expenseFields from "../../../public/images/help/expense-all-fields.png";
import expenseFileUpload from "../../../public/images/help/exepense-upload-files.png";

function ExpenseHelp() {
  return (
    <div className="table-text">
      <span>
        {" "}
        The Expense module is a key feature of the TaskSprint application, designed to facilitate expense tracking and
        management.
      </span>
      <span>Here&#39;s a step-by-step guide on how to use the Expense module within TaskSprint:</span>
      <br />
      <br />

      <h3>
        <strong>Step 1: Accessing the Expense Module</strong>
      </h3>
      <span>
        To begin, navigate to the sidebar of the TaskSprint application. Look for and click on the &quot;Expense&quot;
        option in the sidebar menu.This module is accessible to users with the roles of administrator, project admin, project manager
        and employee within the application.
      </span>
      <br />
      <Image
        src={expenseSidebar}
        alt="Weekly Calender"
        style={{ width: "20%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 2: Adding an Expense</strong>
      </h3>
      <span>
        After accessing the Expense module, you&#39;ll need to add a new expense entry. Click on the option to &quot;Add
        Expense&quot; or a similar button to initiate the process.
      </span>
      <br />
      <br />

      <h3>
        <strong>Step 3: Fields within the Expense Module:</strong>
      </h3>
      <span>
        Once you&#39;re in the expense creation interface, you&#39;ll be presented with various fields to fill out:
      </span>
      <span>
        <ul>
          <li>
            <strong>Date:</strong>
            Select the date of the expense.
          </li>
          <li>
            <strong>Currency:</strong>
            Choose the currency in which the expense was incurred. If the desired currency isn&#39;t available, you need
            to create it first within the &quot;Manage Workspace Settings.&quot;
          </li>
          <li>
            <strong>Amount:</strong>
            Enter the expense amount.
          </li>
          <li>
            <strong>Category:</strong>
            Select the category to which the expense belongs. If the necessary category isn&#39;t available, you should
            create it within the &quot;Manage Workspace Settings.&quot;
          </li>
          <li>
            <strong>Project:</strong>
            Associate the expense with a specific project. If the desired project isn&#39;t listed, you must first
            create it in the project module.
          </li>
          <li>
            <strong>Description:</strong>
            Add any relevant description or notes about the expense.
          </li>
        </ul>
      </span>
      <Image
        src={expenseFields}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />
      <TkAlert color="warning">
        <strong>Currency Selection:</strong>&nbsp;
        <span>
          If the desired currency is not showing in the currency dropdown list, you must create it within the managed
          workspace settings using the currency form.
        </span>
      </TkAlert>
      <TkAlert color="warning">
        <strong>Category Selection:</strong>&nbsp;
        <span>
          If the required category is absent from the category dropdown list, create it within the managed workspace
          settings using the expense category form.
        </span>
      </TkAlert>
      <TkAlert color="warning">
        <strong>Project Selection:</strong>&nbsp;
        <span>
          If the project you intend to associate with the expense is missing from the project dropdown list, create it
          within the project module.
        </span>
      </TkAlert>
      <br />
      <br />

      <h3>
        <strong>Step 4: Uploading Files</strong>
      </h3>
      <span>For expenses that require supporting documentation, you can attach files. Follow these steps:</span>
      <br />
      <span>
        <ul>
          <li>
            <span>Click on the option to attach/upload a file.</span>
          </li>
          <li>
            <span>Choose the file you want to attach from your device.</span>
          </li>
          <li>
            <span>
              Keep in mind that the maximum allowed file size for attachments is 25 MB. Larger files won&#39;t be
              accepted as attachments.
            </span>
          </li>
        </ul>
      </span>
      <br/>
      <Image
        src={expenseFileUpload}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <TkAlert color="warning">
        <span>
          Keep in mind that the maximum file size allowed is 25MB. Files larger than this won&#39;t be uploaded.
        </span>
      </TkAlert>
    </div>
  );
}

export default ExpenseHelp;
