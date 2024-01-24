import React from "react";
import TkAlert from "../TkAlert";
import Image from "next/future/image";
import reportsSidebar from "../../../public/images/help/reports-sidebar.png";
import reportsSelected from "../../../public/images/help/report-select.png";
import reportsFiltering from "../../../public/images/help/report-date-project-select.png";
import reportsExport from "../../../public/images/help/report-export.png";
import reportTypes from "../../../public/images/help/report-types.png";
import reportTable from "../../../public/images/help/report-table.png";

function ReportsHelp() {
  return (
    <div className="table-text">
      <span>
        {" "}
        In the TaskSprint application, I fulfill the roles of administrator, project admin, and project manager. One of
        the essential modules within this application is the Reports module, which I will explain how it functions.
      </span>
      <br />
      <br />

      <h3>
        <strong>Step 1: Accessing the Reports Module</strong>
      </h3>
      <span>
      From the sidebar menu, locate and click on the &quot;Reports&quot; option.
      </span>
      <br />
      <Image
        src={reportsSidebar}
        alt="Weekly Calender"
        style={{ width: "20%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 2: Available Reports</strong>
      </h3>
      <span>
        After clicking on &quot;Reports&quot; the module will load, and you&#39;ll be presented with various report
        options. These options include:
      </span>
      <span>
        <ul>
          <li>
            <span>
              <strong>Projects Report</strong>
            </span>
          </li>
          <li>
            <span>
              <strong>Timesheets Report </strong>
            </span>
          </li>
          <li>
            <span>
              <strong>Task Report </strong>
            </span>
          </li>
          <li>
            <span>
              <strong>Client Report </strong>
            </span>
          </li>
          <li>
            <span>
              <strong>User Report </strong>
            </span>
          </li>
          <li>
            <span>
              <strong>Resource Allocation Report </strong>
            </span>
          </li>
        </ul>
      </span>
      <Image
        src={reportTypes}
        alt="Weekly Calender"
        style={{ width: "30%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 3: Selecting a Report</strong>
      </h3>
      <span>
        Choose the type of report you want to generate by clicking on the corresponding option. For example, if you want
        to generate a report on projects, go to &quot;Timesheet&quot; option. and click on Export button.
      </span>
      <br />
      <br />
      <Image
        src={reportsSelected}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 4: Filtering Data</strong>
      </h3>
      <span>
        After selecting a specific report type, the interface will likely provide you with filtering options to narrow
        down the data you want to include in the report.
      </span>
      <span>
        In this case, you mentioned a &quot;Select Report Filter.&quot; Choose a project from this filter to specify
        which project&#39;s data you want to include in the report.
      </span>
      <br />
      <br />
      <Image
        src={reportsFiltering}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 5: Viewing Data in Table Format</strong>
      </h3>
      <span>
        Once you&#39;ve selected a project and applied any necessary filters, the report module will display the
        relevant data in a tabular format. This table will likely include columns with information related to the chosen
        report type (e.g., project details, task details, user information, etc.).
      </span>
      <br />
      <br />
      <Image
        src={reportTable}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />

      <h3>
        <strong>Step 6: Exporting Data</strong>
      </h3>
      <span>If you want to export the displayed data, look for an &quot;Export&quot; button on the report page.</span>
      <span>
        Clicking this &quot;Export&quot; button will initiate the process of exporting the data. The data will be
        exported in CSV (Comma-Separated Values) format, which is a common format for tabular data.
      </span>
      <br />
      <br />
      <Image
        src={reportsExport}
        alt="Weekly Calender"
        style={{ width: "90%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <TkAlert color="warning">
        <span>
          Once the export process is initiated, the system will generate a CSV file containing the data from the report.
        </span>
        <span>
          You will likely be prompted to choose a location on your device where you want to save the CSV file.
        </span>
      </TkAlert>
    </div>
  );
}

export default ReportsHelp;
