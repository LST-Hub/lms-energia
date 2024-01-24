import React from "react";
import AddTask from "../../../src/components/tasks/Add";

import Layout from "../../../src/components/layout";
import BreadCrumb from "../../../src/utils/BreadCrumb";

import TkPageHead from "../../../src/components/TkPageHead";
import TkContainer from "../../../src/components/TkContainer";
import { urls } from "../../../src/utils/Constants";

const AddTaskPage = () => {
  return (
    <>
      <TkPageHead>
        <title>{"Add Task"}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Add Task"} parentTitle="Tasks" parentLink={`${urls.tasks}`} />
        <TkContainer>
          <AddTask />
        </TkContainer>
      </div>
    </>
  );
};

export default AddTaskPage;

AddTaskPage.options = {
  layout: true,
  auth: true,
};