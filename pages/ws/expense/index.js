import React, { useState, useEffect } from "react";
import AllExpenses from "../../../src/components/expense/AllExpenses";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TopBar from "../../../src/components/expense/TopBar";
import { useRouter } from "next/router";

import TkPageHead from "../../../src/components/TkPageHead";
import TkContainer from "../../../src/components/TkContainer";
import { urls } from "../../../src/utils/Constants";

const Expense = () => {
  const router = useRouter();

  const handleButtonClick = () => {
    router.push(`${urls.expenseAdd}`);
  };

  return (
    <>
      <TkPageHead>
        <title>{"Expense"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Expense"} buttonText="Add Expense" onButtonClick={handleButtonClick} />
        {/* <TopBar /> */}
        {/* <TkContainer> */}
          <AllExpenses />
        {/* </TkContainer> */}
      </div>
    </>
  );
};

export default Expense;

Expense.options = {
  layout: true,
  auth: true,
};
