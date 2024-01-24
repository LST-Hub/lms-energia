import React from "react";
import TkAlert from "../TkAlert";
import Image from "next/future/image";
import approvalsSidebar from "../../../public/images/help/approvals-sidebar.png";
import approvalsTimesheet from "../../../public/images/help/approvals-timesheet.png";
import approvalsTimesheetApprove from "../../../public/images/help/approvals-timesheet-approve.png";
import approvalsTimesheetReject from "../../../public/images/help/approvals-timesheet-reject.png";
import approvalsBulk from "../../../public/images/help/bulk-approvals.png";
import approvalsBulkApprove from "../../../public/images/help/approvals-bulk-approvals-approve-all.png";
import approvalsBulkReject from "../../../public/images/help/approvals-bulk-approvals-reject-all.png";
import approvalsTodayTask from "../../../public/images/help/approvals-todays-tak.png";
import approvalsExpense from "../../../public/images/help/approvals-expense.png";

function ApprovalsHelp() {
  return (
    <div className="table-text">
      <span>
        {" "}
        The Approvals module is a key feature of the TaskSprint application, designed to facilitate approvals tracking
        and management.Timesheet Approval section of TaskSprint, where you can review and manage submitted timesheets,
        today&#39;s tasks, and expenses. This guide will walk you through the approval process for timesheets, providing
        step-by-step instructions on how to approve or reject them.
      </span>
      <br />
      <br />

      <h3>
        <strong>Step 1: Accessing Timesheet Approval</strong>
      </h3>
      <span>From the sidebar menu, click on &quot;Approvals.&quot;</span>
      <br />
      <span>Navigate to the Timesheet Approval section, usually found in the main menu or dashboard.</span>
      <br />
      <Image
        src={approvalsSidebar}
        alt="Weekly Calender"
        style={{ width: "20%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 2: Reviewing and Approving Timesheets</strong>
      </h3>
      <span>1. In the Timesheet Approval section, you will see a list of submitted timesheets.</span>
      <br />
      <span>2. For each timesheet entry, there will be two buttons: &quot;Approve&quot; and &quot;Reject&quot;.</span>
      <br />
      <br />
      <Image
        src={approvalsTimesheet}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 3: Approving a Timesheet</strong>
      </h3>
      <span>1. Click the &quot;Approve&quot; button next to the timesheet you wish to approve.</span>
      <br />
      <span>2. Upon approval, the timesheet&#39;s duration will be added to the actual time.</span>
      <br />
      <br />
      <Image
        src={approvalsTimesheetApprove}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 4: Rejecting a Timesheet</strong>
      </h3>
      <span>1. Click the &quot;Reject&quot; button next to the timesheet you wish to reject.</span>
      <br />
      <span>2. A pop-up window will appear, asking for a &quot;Rejection Note&quot;.</span>
      <br />
      <span>3. Provide a mandatory rejection note explaining the reason for rejection.</span>
      <br />
      <span>4. Click &quot;Submit&quot; to reject the timesheet.</span>
      <br />
      <br />
      <Image
        src={approvalsTimesheetReject}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 5: Role-Based Access</strong>
      </h3>
      <span>System Admin and Project Admin roles have access to approve or reject all timesheets for approval.</span>
      <br />
      <span>Project Manager role users will only see timesheets where they are assigned as the project manager.</span>
      <br />
      <br />

      <h3>
        <strong>Step 6: Bulk Approvals and Rejections</strong>
      </h3>
      <span>
        1. To perform bulk approvals or rejections, select the checkbox beside each timesheet you want to act on.
      </span>
      <br />
      <span>2. After selecting, two buttons will appear: &quot;Approve All&quot; and &quot;Reject All.&quot;</span>
      <br />
      <br />
      <Image
        src={approvalsBulk}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 7: Approving All Selected Timesheets</strong>
      </h3>
      <span>1. After selecting timesheets, click on the &quot;Approve All&quot; button.</span>
      <br />
      <span>
        2. All the selected timesheets will be approved simultaneously, and their durations will be added to the actual
        time.
      </span>
      <br />
      <br />
      <Image
        src={approvalsBulkApprove}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 8: Rejecting All Selected Timesheets</strong>
      </h3>
      <span>1. After selecting timesheets, click on the &quot;Reject All&quot; button.</span>
      <br />
      <span>2. A popup will appear, allowing you to add a rejection note.</span>
      <br />
      <span>3. The rejection note you provide will apply to all the selected timesheets.</span>
      <br />
      <span>4. Click &quot;Submit&quot; to reject all the selected timesheets with the same rejection note.</span>
      <br />
      <br />
      <Image
        src={approvalsBulkReject}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 9: Reviewing Today&#39;s Tasks and Expenses</strong>
      </h3>
      <span>
        1. Similar to timesheets, you will also see today&#39;s tasks and expenses that require approval in this
        section.
      </span>
      <br />
      <span>
        2. Follow the same approval and rejection process for these entries, using the &quot;Approve&quot; and
        &quot;Reject&quot; buttons.
      </span>

      <br />
      <br />
      <Image
        src={approvalsTodayTask}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <Image
        src={approvalsExpense}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <TkAlert color="warning">
        <span>
          Today&#39;s task approval section only appears when the &quot;Enable Approval Cycle for Today&#39;s
          Tasks&quot; is enabled from workspace management settings.
        </span>
      </TkAlert>
      <br />
      <br />
    </div>
  );
}

export default ApprovalsHelp;
