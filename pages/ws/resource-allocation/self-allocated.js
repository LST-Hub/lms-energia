import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkPageHead from "../../../src/components/TkPageHead";
import TkContainer from "../../../src/components/TkContainer";
import { useRouter } from "next/router";
import { urls } from "../../../src/utils/Constants";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import useUserAccessLevel from "../../../src/utils/hooks/useUserAccessLevel";
import SelfAllocatedTable from "../../../src/components/resourceAllocation/SelfAllocatedTable";

function SelfAllocated() {
  const router = useRouter();

  const accessLevel = useUserAccessLevel(permissionTypeIds.resourceAllocation);

  return (
    <>
      <TkPageHead>
        <title>{`Self Allocated`}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb
          pageTitle={"My Task"} parentTitle="Resource Allocation" parentLink={`${urls.resourceAllocation}`}
          buttonText={accessLevel >= perAccessIds.create ? "Allocate" : undefined}
          onButtonClick={
            accessLevel >= perAccessIds.create
              ? () => {
                  router.push(`${urls.resourceAllocationAdd}`);
                }
              : undefined
          }
        />
        <TkContainer>
          <SelfAllocatedTable />
        </TkContainer>
      </div>
    </>
  );
}

export default SelfAllocated;

SelfAllocated.options = {
  layout: true,
  auth: true,
};
