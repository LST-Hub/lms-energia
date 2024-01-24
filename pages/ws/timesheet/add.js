import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkPageHead from "../../../src/components/TkPageHead";
import TkContainer from "../../../src/components/TkContainer";
import { useRouter } from "next/router";
import AddTimeSheet from "../../../src/components/timesheet/AddTimeSheet";
import { urls } from "../../../src/utils/Constants";

const TimeSheetDetailsPage = () => {
  return (
    <>
      <TkPageHead>
        <title>{"Add Time Sheet"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Add Timesheet"} parentTitle="Timesheet" parentLink={`${urls.timesheets}`} />
        <TkContainer>
          <AddTimeSheet />
        </TkContainer>
      </div>
    </>
  );
};

export default TimeSheetDetailsPage;

TimeSheetDetailsPage.options = {
  layout: true,
  auth: true,
};
