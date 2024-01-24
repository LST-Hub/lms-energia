import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkPageHead from "../../../src/components/TkPageHead";
import TkContainer from "../../../src/components/TkContainer";
import HelpAccordion from "../../../src/components/help/HelpAccordion";

const ProfileList = () => {
  return (
    <>
      <TkPageHead>
        <title>{`Help`}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Help"} />

        <TkContainer>
          <HelpAccordion />
        </TkContainer>
      </div>
    </>
  );
};

export default ProfileList;

ProfileList.options = {
  layout: true,
  auth: true,
};
