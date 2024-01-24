import React from "react";
import Layout from "../../../../src/components/layout";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import EditTimeSheet from "../../../../src/components/timesheet/EditTimeSheet";
import TkPageHead from "../../../../src/components/TkPageHead";
import TkContainer from "../../../../src/components/TkContainer";
import { useRouter } from "next/router";
import {modes, urls } from "../../../../src/utils/Constants";

const TimeSheetDetailsPage = () => {
  const router = useRouter();
  const { tid } = router.query;
  return (
    <>
      <TkPageHead>
        <title>{"Time Sheet Details"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Timesheet Details"} parentTitle="Timesheet" parentLink={`${urls.timesheets}`} />
        <TkContainer>
          <EditTimeSheet id={tid} mode={modes.view}/>
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
