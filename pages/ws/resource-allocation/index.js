import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkPageHead from "../../../src/components/TkPageHead";
import TkContainer from "../../../src/components/TkContainer";
import ResourceAllocationTable from "../../../src/components/resourceAllocation/ResourceAllocationTable";
import { useRouter } from "next/router";
import { urls } from "../../../src/utils/Constants";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import useUserAccessLevel from "../../../src/utils/hooks/useUserAccessLevel";

function ResourceAllocation() {
  const router = useRouter();

  const accessLevel = useUserAccessLevel(permissionTypeIds.resourceAllocation);

  return (
    <>
      <TkPageHead>
        <title>{`Resource Allocation`}</title>
      </TkPageHead>
      <div className="page-content">
      
        <BreadCrumb
          pageTitle={"Resource Allocation"}
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
          <ResourceAllocationTable accessLevel={accessLevel} />
        </TkContainer>
      </div>
    </>
  );
}

export default ResourceAllocation;

ResourceAllocation.options = {
  layout: true,
  auth: true,
};
