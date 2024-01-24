import React from "react";
import AddProject from "../../../src/components/projects/Add";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkPageHead from "../../../src/components/TkPageHead";
import TkContainer from "../../../src/components/TkContainer";
import { urls } from "../../../src/utils/Constants";

function AddProjectPage() {
  return (
    <>
      <TkPageHead>
        <title>{"Create Project"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Add Project"} parentTitle="Projects" parentLink={`${urls.projects}`} />
        <TkContainer className="mb-3">
          <AddProject />
        </TkContainer>
      </div>
    </>
  );
}

export default AddProjectPage;

AddProjectPage.options = {
  layout: true,
  auth: true,
};
