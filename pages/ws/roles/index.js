import React from "react";
import AllRoles from "../../../src/components/roles/AllRoles";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import { useRouter } from "next/router";
import TkContainer from "../../../src/components/TkContainer";
import TkPageHead from "../../../src/components/TkPageHead";
import useUserAccessLevel from "../../../src/utils/hooks/useUserAccessLevel";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import { urls } from "../../../src/utils/Constants";

const Roles = () => {
  const router = useRouter();
  const accessLevel = useUserAccessLevel(permissionTypeIds.roles);
  const handleButtonClick = () => {
    router.push(`${urls.roleAdd}`);
  };

  return (
    <>
      <TkPageHead>
        <title>{"Roles"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb
          pageTitle={"Roles And Permisssions"}
          // buttonText={"Add Role"}
          // onButtonClick={handleButtonClick}
        />
        <TkContainer>
          <AllRoles />
        </TkContainer>
      </div>
    </>
  );
};

export default Roles;

Roles.options = {
  layout: true,
  // auth: true,
};
