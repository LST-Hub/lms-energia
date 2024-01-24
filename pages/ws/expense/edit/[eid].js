import React from "react";
import EditExpense from "../../../../src/components/expense/EditExpense";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import { useRouter } from "next/router";

import TkContainer from "../../../../src/components/TkContainer";
import TkPageHead from "../../../../src/components/TkPageHead";
import { modes, urls } from "../../../../src/utils/Constants";

const TaskDetailsPage = () => {
  const router = useRouter();
  const { eid } = router.query;

  return (
    <>
      <TkPageHead>
        <title>{"Expense Details"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Expense Details"} parentTitle="Expense" parentLink={`${urls.expense}`} />
        <TkContainer>
          <EditExpense id={eid} mode={modes.edit} />
        </TkContainer>
      </div>
    </>
  );
};

export default TaskDetailsPage;

TaskDetailsPage.options = {
  layout: true,
  auth: true,
};
