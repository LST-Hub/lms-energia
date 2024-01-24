import React from "react";
import AddTask from "../../../src/components/tasks/Add";

import Layout from "../../../src/components/layout";
import BreadCrumb from "../../../src/utils/BreadCrumb";

import TkPageHead from "../../../src/components/TkPageHead";
import TkContainer from "../../../src/components/TkContainer";
import { urls } from "../../../src/utils/Constants";
import AddResorceAllocation from "../../../src/components/resourceAllocation/Add";

const AddTaskPage = () => {
  return (
    <>
      <TkPageHead>
        <title>{"Allocate Resource"}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Allocate Resource"} parentTitle="Resource Allocation" parentLink={`${urls.resourceAllocation}`} />
        <TkContainer>
          <AddResorceAllocation />
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