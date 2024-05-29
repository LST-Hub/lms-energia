import React from "react";
import Reports from "../../../src/components/reports/Reports";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import { useRouter } from "next/router";
import TkContainer from "../../../src/components/TkContainer";
import TkPageHead from "../../../src/components/TkPageHead";
import useUserAccessLevel from "../../../src/utils/hooks/useUserAccessLevel";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import { urls } from "../../../src/utils/Constants";

const Report = () => {
  const router = useRouter();
  const accessLevel = useUserAccessLevel(permissionTypeIds.roles);
  const handleButtonClick = () => {
    router.push(`${urls.roleAdd}`);
  };

  return (
    <>
      <TkPageHead>
        <title>{"Reports"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Reports"} />
        <TkContainer>
          <Reports />
        </TkContainer>
      </div>
    </>
  );
};

export default Report;

Report.options = {
  layout: true,
  // auth: true,
};
