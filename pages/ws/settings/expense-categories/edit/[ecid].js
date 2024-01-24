import React, { useState, useEffect } from "react";
import EditExpenseCategories from "../../../../../src/components/expenseCategories/EditExpenseCategories";
import BreadCrumb from "../../../../../src/utils/BreadCrumb";
import { useRouter } from "next/router";

import TkPageHead from "../../../../../src/components/TkPageHead";
import TkContainer from "../../../../../src/components/TkContainer";
import { modes, settingsTab, urls } from "../../../../../src/utils/Constants";

const TaskDetailsPage = () => {
  const router = useRouter();
  const { ecid } = router.query;

  return (
    <>
      <TkPageHead>
        <title>{"Edit Category Details"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb
          pageTitle={"Expense Category Details"}
          parentTitle="Settings"
          parentLink={`${urls.settings}?tab=${settingsTab.expenseCategory}`}
        />
        <TkContainer>
          <EditExpenseCategories id={ecid} mode={modes.edit}/>
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
