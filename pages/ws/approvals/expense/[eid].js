import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import ViewPendingExpense from "../../../../src/components/approvals/ViewPendingExpense";
import TkPageHead from "../../../../src/components/TkPageHead";
import TkContainer from "../../../../src/components/TkContainer";
import { useRouter } from "next/router";
import { approvalsTab, urls } from "../../../../src/utils/Constants";

const PendingExpenseDetailsPage = () => {
  const router = useRouter();
  const { eid } = router.query;
  return (
    <>
      <TkPageHead>
        <title>{"Approvals Details"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Expense Details"} parentTitle="Approvals" parentLink={`${urls.approvals}?tab=${approvalsTab.expense}`}/>
        <TkContainer>
          <ViewPendingExpense id={eid} />
        </TkContainer>
      </div>
    </>
  );
};

export default PendingExpenseDetailsPage;

PendingExpenseDetailsPage.options = {
  layout: true,
  auth: true,
};
