import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import TkPageHead from "../../../../src/components/TkPageHead";
import TkContainer from "../../../../src/components/TkContainer";
import { useRouter } from "next/router";
import ViewPendingTodayTask from "../../../../src/components/approvals/ViewPedingTodaysTasks";
import { approvalsTab, urls } from "../../../../src/utils/Constants";

const PendingTodayTaskDetailsPage = () => {
  const router = useRouter();
  const { did } = router.query;
  return (
    <>  
      <TkPageHead>
        <title>{"Today's Task Details"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Today's Task Details"} parentTitle="Approvals" parentLink={`${urls.approvals}?tab=${approvalsTab.todayTask}`} />
        <TkContainer>
          <ViewPendingTodayTask id={did} />
        </TkContainer>
      </div>
    </>
  );
};

export default PendingTodayTaskDetailsPage;

PendingTodayTaskDetailsPage.options = {
  layout: true,
  auth: true,
};
