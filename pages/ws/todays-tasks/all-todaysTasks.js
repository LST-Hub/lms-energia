import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import AllWsTodaysTasks from "../../../src/components/TodaysTasks/AllWsTodaysTask";
import TkPageHead from "../../../src/components/TkPageHead";
import { urls } from "../../../src/utils/Constants";

const TodaysTasksListPage = () => {

  return (
    <>
      <TkPageHead>
        <title>{"All Today's Task"}</title>
      </TkPageHead>
      {/* TODO: add support for dark mode for task rows */}
      <div className="page-content">
        <BreadCrumb pageTitle={"All Today's Task"} parentTitle="Today's Task" parentLink={`${urls.todaysTasks}`} />
        {/* <TkContainer> */}
        <AllWsTodaysTasks />
        {/* </TkContainer> */}
      </div>
    </>
  );
};

export default TodaysTasksListPage;

TodaysTasksListPage.options = {
  layout: true,
  auth: true,
};
