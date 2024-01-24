import React, { useCallback, useState } from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkPageHead from "../../../src/components/TkPageHead";
import TkContainer from "../../../src/components/TkContainer";
import { urls } from "../../../src/utils/Constants";
import AllAllocatedResources from "../../../src/components/resourceAllocation/AllAllocatedResources";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import useUserAccessLevel from "../../../src/utils/hooks/useUserAccessLevel";

function AllAllocations() {
  const [modal, setModal] = useState(false);

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
    } else {
      setModal(true);
    }
  }, [modal]);

  const accessLevel = useUserAccessLevel(permissionTypeIds.resourceAllocation);

  return (
    <>
      <TkPageHead>
        <title>{`All Allocation`}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb
          pageTitle={"All Allocation"}
          parentTitle="Resource Allocation"
          parentLink={`${urls.resourceAllocation}`}
          buttonText={accessLevel >= perAccessIds.create ? "Idle Hrs" : undefined}
          onButtonClick={accessLevel >= perAccessIds.create ? toggle : undefined}
        />
        <TkContainer>
          <AllAllocatedResources accessLevel={accessLevel} modal={modal} setModal={setModal} toggle={toggle} />
        </TkContainer>
      </div>
    </>
  );
}

export default AllAllocations;

AllAllocations.options = {
  layout: true,
  auth: true,
};
