import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkContainer from "../../../src/components/TkContainer";
import TkPageHead from "../../../src/components/TkPageHead";
import Settings from "../../../src/components/settings";
import useUserRole from "../../../src/utils/hooks/useUserRole";

function AdminStatusSettings() {
  const accessLevel = useUserRole()?.isAdmin;

  return (
    <>
      <TkPageHead>
        <title>{"Manage Workspace Settings"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Manage Workspace Settings"} />
        <TkContainer>
          <Settings accessLevel={accessLevel} />
        </TkContainer>
      </div>
    </>
  );
}

export default AdminStatusSettings;

AdminStatusSettings.options = {
  layout: true,
  // auth: true,
};
