import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import AllWsTimeSheets from "../../../src/components/timesheet/AllWsTimesheets";
import TkPageHead from "../../../src/components/TkPageHead";
import { urls } from "../../../src/utils/Constants";

const TimeSheetListPage = () => {

  return (
    <>
      <TkPageHead>
        <title>{"Timesheet"}</title>
      </TkPageHead>
      {/* TODO: add support for dark mode for task rows */}
      <div className="page-content">
        <BreadCrumb pageTitle={"All Timesheet"} parentTitle="Timesheet" parentLink={`${urls.timesheets}`} />
        {/* <TkContainer> */}
        <AllWsTimeSheets />
        {/* </TkContainer> */}
      </div>
    </>
  );
};

export default TimeSheetListPage;

TimeSheetListPage.options = {
  layout: true,
  auth: true,
};
