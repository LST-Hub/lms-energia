import React from "react";
import AddExpense from "../../../src/components/expense/AddExpense";
import BreadCrumb from "../../../src/utils/BreadCrumb";

import TkPageHead from "../../../src/components/TkPageHead";
import TkContainer from "../../../src/components/TkContainer";
import { urls } from "../../../src/utils/Constants";

const Expense = () => {
  return (
    <>
      <TkPageHead>
        <title>{"Add Expense"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Add Expense"} parentTitle="Expense" parentLink={`${urls.expense}`} />
        {/* <TopBar /> */}
        <TkContainer>
          <AddExpense />
        </TkContainer>
      </div>
    </>
  );
};

export default Expense;

Expense.options = {
  layout: true,
  auth: true,
};
