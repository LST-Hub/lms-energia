import React from "react";
import AddExpenseCategories from "../../../../src/components/expenseCategories/AddExpenseCategories";
import BreadCrumb from "../../../../src/utils/BreadCrumb";

import TkPageHead from "../../../../src/components/TkPageHead";
import TkContainer from "../../../../src/components/TkContainer";
import { settingsTab, urls } from "../../../../src/utils/Constants";

const ExpenseCategories = () => {
  return (
    <>
      <TkPageHead>
        <title>{"Add Expense Categories"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb
          pageTitle={"Add Expense Category"}
          parentTitle={"Settings"}
          parentLink={`${urls.settings}?tab=${settingsTab.expenseCategory}`}
        />
        {/* <TopBar /> */}
        <TkContainer>
          <AddExpenseCategories />
        </TkContainer>
      </div>
    </>
  );
};

export default ExpenseCategories;

ExpenseCategories.options = {
  layout: true,
  auth: true,
};
