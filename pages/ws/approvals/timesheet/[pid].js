import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import ViewTimesheetApprovals from "../../../../src/components/approvals/ViewTimesheetApprovals";
import TkPageHead from "../../../../src/components/TkPageHead";
import TkContainer from "../../../../src/components/TkContainer";
import { useRouter } from "next/router";
import { urls } from "../../../../src/utils/Constants";

const PendingTimesheetsDetailsPage = () => {
  const router = useRouter();
  const { pid } = router.query;
  return (
    <>
      <TkPageHead>
        <title>{"Approvals Details"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Timesheet Details"} parentTitle="Approvals" parentLink={`${urls.approvals}`} />
        <TkContainer>
          <ViewTimesheetApprovals id={pid} />
        </TkContainer>
      </div>
    </>
  );
};

export default PendingTimesheetsDetailsPage;

PendingTimesheetsDetailsPage.options = {
  layout: true,
  auth: true,
};
