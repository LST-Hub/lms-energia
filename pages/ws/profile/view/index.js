import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import ProfileSetting from "../../../../src/components/profile/ProfileSetting";
import TkPageHead from "../../../../src/components/TkPageHead";
import TkContainer from "../../../../src/components/TkContainer";
import { modes } from "../../../../src/utils/Constants";

const ProfileList = () => {
  return (
    <>
      <TkPageHead>
        <title>{`Profile`}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Profile"} />

        <TkContainer>
          <ProfileSetting mode={modes.view} />
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
