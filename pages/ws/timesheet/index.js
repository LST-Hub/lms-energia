import React, { useState, useCallback } from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import AllTimeSheet from "../../../src/components/timesheet/AllTimeSheet";
import TkContainer from "../../../src/components/TkContainer";
import TkPageHead from "../../../src/components/TkPageHead";
import TopBar from "../../../src/components/timesheet/TopBar";
import { useRouter } from "next/router";
import { urls } from "../../../src/utils/Constants";

const TimeSheetListPage = () => {
  const router = useRouter();

  return (
    <>
      <TkPageHead>
        <title>{"Timesheet"}</title>
      </TkPageHead>
      {/* TODO: add support for dark mode for task rows */}
      <div className="page-content">
        <BreadCrumb
          pageTitle={"Timesheet"}
          buttonText={"Add Time"}
          onButtonClick={() => {
            router.push(`${urls.timesheetAdd}`);
          }}
        />
        {/* <TkContainer> */}
        <AllTimeSheet />
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
