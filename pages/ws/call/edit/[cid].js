import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import TkPageHead from "../../../../src/components/TkPageHead";
import UserDetails from "../../../../src/components/users/UserDetails";
import { modes, urls } from "../../../../src/utils/Constants";
import TkContainer from "../../../../src/components/TkContainer";
import EditPhoneCall from "../../../../src/components/phoneCall/EditPhoneCall";

const PhoneCallDetailsPage = () => {
  return (
    <>
      <TkPageHead>
        <title>{`Phone Call Details`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Phone Call Details"} parentTitle="Phone Call" parentLink={`${urls.phoneCall}`} />
        <TkContainer>
          <EditPhoneCall mode={modes.edit} />
        </TkContainer>
      </div>
    </>
  );
};

export default PhoneCallDetailsPage;

PhoneCallDetailsPage.options = {
  layout: true,
  auth: false,
};
