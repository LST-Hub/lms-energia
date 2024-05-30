import React, { useReducer } from "react";
import TkContainer from "../TkContainer";
import TopBar from "./TopBar";
import { filterFields } from "../../utils/Constants";
import LeadReport from "./LeadReport";
import PhoneCallreport from "./PhoneCallreport";
import TaskReport from "./TaskReport";
import Eventreport from "./EventReport";

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
        {filters.table === "phoneCall" && <PhoneCallreport />}
        {filters.table === "task" && <TaskReport />}
        {filters.table === "event" && <Eventreport />}
        {/* {filters.table === "user" && <ReportsUsers />}
        {filters.table === "resourceAllocattion" && <ReportsResourceAllocation />}
        {filters.table === "timesheet" && <ReportTimesheet />} */}
      </TkContainer>
    </>
  );
}

export default Reports;
