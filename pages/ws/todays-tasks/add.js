import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";

import TkContainer from "../../../src/components/TkContainer";

import TkPageHead from "../../../src/components/TkPageHead";

import AddTodayTask from "../../../src/components/TodaysTasks/AddTodaysTasks";
import { urls } from "../../../src/utils/Constants";

const AddTodayTaskPage = () => {
  return (
    <>
      <TkPageHead>
        <title>{"Add Today's Task"}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Add Today's Task"} parentTitle="Today's Task" parentLink={`${urls.todaysTasks}`} />
        <TkContainer>
          <AddTodayTask />
        </TkContainer>
      </div>
    </>
  );
};

export default AddTodayTaskPage;

AddTodayTaskPage.options = {
  layout: true,
  auth: true,
};
