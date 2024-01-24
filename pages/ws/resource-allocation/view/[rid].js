import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";

import TkPageHead from "../../../../src/components/TkPageHead";
import TkContainer from "../../../../src/components/TkContainer";
import { modes, urls } from "../../../../src/utils/Constants";
import EditResourceAllocation from "../../../../src/components/resourceAllocation/Edit";
import { useRouter } from "next/router";

const AddTaskPage = () => {

  const router = useRouter();
  const { rid } = router.query;

  return (
    <>
      <TkPageHead>
        <title>{"View Allocate Resource"}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"View Resource Allocation"} parentTitle="Resource Allocation" parentLink={`${urls.resourceAllocation}`} />
        <TkContainer>
          <EditResourceAllocation id={rid} mode={modes.view}/>
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