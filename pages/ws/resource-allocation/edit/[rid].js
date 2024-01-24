import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import { useRouter } from "next/router";
import TkPageHead from "../../../../src/components/TkPageHead";
import TkContainer from "../../../../src/components/TkContainer";
import { modes, urls } from "../../../../src/utils/Constants";
import EditResourceAllocation from "../../../../src/components/resourceAllocation/Edit";

const AddTaskPage = () => {
  const router = useRouter();
  const { rid } = router.query;
  return (
    <>
      <TkPageHead>
        <title>{"Edit Allocate Resource"}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb
          pageTitle={"Edit Resource Allocation"}
          parentTitle="Resource Allocation"
          parentLink={`${urls.resourceAllocation}`}
        />

        <TkContainer>
          <EditResourceAllocation id={rid} mode={modes.edit} />
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
