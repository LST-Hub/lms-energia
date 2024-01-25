import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkPageHead from "../../../src/components/TkPageHead";
import AddUser from "../../../src/components/users/AddUser";
import TkContainer from "../../../src/components/TkContainer";
import { urls } from "../../../src/utils/Constants";
import AddPhoneCall from "../../../src/components/phoneCall/AddPhoneCall";

const PhoneCallDetailsPage = () => {
  return (
    <>
      <TkPageHead>
        <title>{`Add Phone Call`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Add Phone Call"} parentTitle="Phone Call" parentLink={`${urls.phoneCall}`} />
        <TkContainer>
            <AddPhoneCall />
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
