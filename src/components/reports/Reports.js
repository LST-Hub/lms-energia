import React, { useReducer } from "react";
import TkAccessDenied from "../TkAccessDenied";
import ReportTasks from "./Tasks";
import ReportsProjects from "./Projects";
import ReportsClients from "./Clients";
import ReportsUsers from "./Users";
import TkContainer from "../TkContainer";
import TopBar from "./TopBar";
import { filterFields } from "../../utils/Constants";
import ReportsResourceAllocation from "./ResourceAllocation";
import ReportTimesheet from "./Timesheet";
import LeadReport from "./LeadReport";

function Reports({ accessLevel }) {
  const [filters, updateFilters] = useReducer((state, newState) => ({ ...state, ...newState }), {
    [filterFields.reports.table]: null, // keep the initial values to null for filters
  });

  return (
    <>
      <TopBar
        onTableChange={(item) => {
          updateFilters({
            [filterFields.reports.table]: item ? item.value : null,
          });
        }}
      />
      <TkContainer>
        {filters.table === null && <LeadReport />}
        {filters.table === "leads" && <LeadReport />}
        {/* {filters.table === "task" && <ReportTasks />}
        {filters.table === "client" && <ReportsClients />}
        {filters.table === "user" && <ReportsUsers />}
        {filters.table === "resourceAllocattion" && <ReportsResourceAllocation />}
        {filters.table === "timesheet" && <ReportTimesheet />} */}
      </TkContainer>
    </>
  );
}

export default Reports;
