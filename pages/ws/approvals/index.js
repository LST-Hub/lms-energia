import React from "react";
import Approvals from "../../../src/components/approvals";
import BreadCrumb from "../../../src/utils/BreadCrumb";

import TkPageHead from "../../../src/components/TkPageHead";
import TkContainer from "../../../src/components/TkContainer";

const ApprovalsPage = () => {
  return (
    <>
      <TkPageHead>
        <title>{"Approvals"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Approvals"} />
        <TkContainer>
          <Approvals />
        </TkContainer>
      </div>
    </>
  );
};

export default ApprovalsPage;

ApprovalsPage.options = {
  layout: true,
  auth: true,
};
