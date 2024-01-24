import React from "react";
import TkAlert from "../TkAlert";
import Image from "next/future/image";
import resourceAllocationSidebar from "../../../public/images/help/resource-allocation-sidebar.png";
import resourceAllocationMytask from "../../../public/images/help/resource-allocation-my-task.png";
import resourceAllocationViewAll from "../../../public/images/help/resource-allocation-view-all.png";
import resourceAllocationViewAllData from "../../../public/images/help/view-all-data.png";
import resourceAllocationDataFilter from "../../../public/images/help/data-filter-allocated-hrs-idle-hrs.png";
import resourceAllocationFillDetails from "../../../public/images/help/complete-allocation-details.png";
import resourceAllocationDontRepeat from "../../../public/images/help/dont-repeat-filter.png";
import resourceAllocationDaily from "../../../public/images/help/daily-repeat-filter.png";
import resourceAllocationWeekly from "../../../public/images/help/weekly-report-filter.png";
import resourceAllocationMonthly from "../../../public/images/help/monthly-repeat-filter.png";

function ResourceAllocationHelp() {
  return (
    <div className="table-text">
      <span>
        {" "}
        The Resource Allocation module in TaskSprint empowers system administrators, project administrators, and project
        managers to effectively manage the allocation of resources to projects and tasks. This feature enables efficient
        distribution of work hours among employees, promoting smoother project execution. Below is a comprehensive guide
        on how to use the Resource Allocation module.
      </span>
      <br />
      <span>Resource Allocation in TaskSprint: Step-by-Step Guide:</span>
      <br />
      <br />

      <h3>
        <strong>Step 1: Accessing Resource Allocation</strong>
      </h3>
      <span>From the sidebar menu, click on &quot;Resource Allocation.&quot;</span>
      <span>
        From the sidebar menu, locate and click on the &quot;Resource Allocation&quot; option. On the main page, locate
        and click on the &quot;My Tasks&quot; button to manage tasks allocated to you, or click on the &quot;View
        All&quot; button to view all resource allocations.
      </span>
      <br />
      <Image
        src={resourceAllocationSidebar}
        alt="Weekly Calender"
        style={{ width: "20%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 2: My Tasks</strong>
      </h3>
      <span>1. Click on the &quot;My Tasks&quot; button.</span>
      <br />
      <span>
        2. A list of tasks allocated specifically to you will be displayed, helping you manage your workload
        efficiently.
      </span>
      <br />
      <br />
      <Image
        src={resourceAllocationMytask}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />
      <br />

      <h3>
        <strong>Step 3: View All Resource Allocations</strong>
      </h3>
      <span>1. Click on the &quot;View All&quot; button.</span>
      <br />
      <br />
      <Image
        src={resourceAllocationViewAll}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />
      <span>2. You will be directed to a new page showing all resource allocations.</span>
      <br />
      <br />
      <Image
        src={resourceAllocationViewAllData}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <span>
        3. If you have the roles of System Admin, Project Admin, or Project Manager, you will see all resource
        allocations. Project Managers will only see allocations related to their projects.
      </span>
      <br />
      <span>4. On the &quot;View All&quot; page, locate the filter options.</span>
      <br />
      <span>
        5. Use the &quot;Employee Filter&quot; to choose a specific employee from the drop-down list and see their
        resource allocations.
      </span>
      <br />
      <span>
        6. Use the &quot;Date Filter&quot; to select a specific date range using the date picker to view allocations
        within that period.
      </span>
      <br />
      <br />
      <Image
        src={resourceAllocationDataFilter}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <TkAlert color="warning">
        <span>
          These hours are calculated based on the assigned employee&#39;s work calendar, helping you understand their
          availability and make informed allocation decisions.
        </span>
      </TkAlert>
      <br />
      <br />

      <h3>
        <strong>Step 4: Adding Resource Allocations</strong>
      </h3>
      <span>
        1. While on the &quot;View All&quot; page, locate and click on the &quot;Add Allocation&quot; button. button.
      </span>
      <br />
      <span>2. A new page for adding resource allocations will open.</span>
      <br />
      <br />

      <h3>
        <strong>Step 5: Fill Allocation Details</strong>
      </h3>
      <span>
        1. On the allocation page, start by selecting the &quot;Project Name&quot; from the available options.
      </span>
      <br />
      <span>2. Choose the &quot;Repetition Type&quot; based on your allocation needs:</span>
      <br />
      <span>
        <ul>
          <li>
            <span>&quot;Don&#39;t Repeat&quot; for a one-time allocation.</span>
          </li>
          <li>
            <span>&quot;Daily&quot; for allocations over a range of days.</span>
          </li>
          <li>
            <span>&quot;Weekly&quot; for allocations on specific days of the week within a range.</span>
          </li>
          <li>
            <span>&quot;Monthly&quot; for allocations on a chosen day of the month within a range.</span>
          </li>
        </ul>
      </span>
      {/* <br/>
      <Image
      src={resourceAllocationFillDetails}
      alt="Weekly Calender"
      style={{ width: "90%", height: "100%", objectFit: "contain" }}
      layout="responsive"
    /> */}

      <br />
      <br />

      <h3>
        <strong>Step 6: Don&#39;t Repeat Allocation</strong>
      </h3>
      <span>If you choose &quot;Don&#39;t Repeat,&quot; select a single &quot;Allocation Date&quot;.</span>
      <br />
      <br />
      <Image
        src={resourceAllocationDontRepeat}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 7: Daily Allocation</strong>
      </h3>
      <span>
        1. If you choose &quot;Daily,&quot; select an &quot;Allocation Start Date&quot; and an &quot;Allocation End
        Date&quot; to define the range.
      </span>
      <br />
      <span>2. Select the &quot;Allocation Date&quot; to specify the date of the allocation.</span>
      <br />
      <br />
      <Image
        src={resourceAllocationDaily}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 8: Weekly Allocation</strong>
      </h3>
      <span>
        1. If you choose &quot;Weekly,&quot; select an **Allocation Start Date** and an **Allocation End Date**.
      </span>
      <br />
      <span>2. Select the &quot;Allocation Day&quot; to specify the day of the week for the allocation.</span>
      <br />
      <br />
      <Image
        src={resourceAllocationWeekly}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 9: Monthly Allocation</strong>
      </h3>
      <span>
        1. If you choose &quot;Monthly,&quot; select an &quot;Allocation Start Date&quot; and an &quot;Allocation End
        Date&quot;.
      </span>
      <br />
      <span>
        2. Enable the &quot;Date of Month&quot; field and choose a date between 1 and 31 for the allocation within the
        chosen range.
      </span>
      <br />
      <br />
      <Image
        src={resourceAllocationMonthly}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 10: Complete Allocation Details</strong>
      </h3>
      <span>
        1. Fill in any remaining allocation details such as &quot;Allocated Hours&quot; and any additional notes.
      </span>
      <br />
      <span>2. Once satisfied, click the &quot;Save&quot; or &quot;Confirm&quot; button to create the allocation.</span>
      <br />
      <br />
      <Image
        src={resourceAllocationFillDetails}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <TkAlert color="warning">
        <span>
          Remember that allocated and idle hours are calculated based on the employee&#39;s assigned work calendar.
        </span>
      </TkAlert>
    </div>
  );
}

export default ResourceAllocationHelp;
