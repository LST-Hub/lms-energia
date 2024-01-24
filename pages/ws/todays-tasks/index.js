import React from "react";
import { useRouter } from "next/router";
import BreadCrumb from "../../../src/utils/BreadCrumb";

import TkContainer from "../../../src/components/TkContainer";
import TkPageHead from "../../../src/components/TkPageHead";

import TodayTaskList from "../../../src/components/TodaysTasks/TodaysTasksList";
import { urls } from "../../../src/utils/Constants";

const TodayTaskPage = () => {
  const router = useRouter();
  const handleButtonClick = () => {
    router.push(`${urls.todaysTaskAdd}`);
  };

  return (
    <>
      <TkPageHead>
        <title>{"Today's Tasks"}</title>
      </TkPageHead>
      {/* TODO: add support for dark mode for task rows */}
      <div className="page-content">
        <BreadCrumb pageTitle={"Today's Task"} buttonText="Add Today's Task" onButtonClick={handleButtonClick} />

        {/* <TkContainer> */}
        <TodayTaskList />
        {/* </TkContainer> */}
      </div>
    </>
  );
};

export default TodayTaskPage;

TodayTaskPage.options = {
  layout: true,
  auth: true,
};
