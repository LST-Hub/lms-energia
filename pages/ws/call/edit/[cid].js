import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import TkPageHead from "../../../../src/components/TkPageHead";
import UserDetails from "../../../../src/components/users/UserDetails";
import { demoPhoneCallData, demoUserData, modes, urls } from "../../../../src/utils/Constants";
import TkContainer from "../../../../src/components/TkContainer";
import EditPhoneCall from "../../../../src/components/phoneCall/EditPhoneCall";
import { useRouter } from "next/router";

const PhoneCallDetailsPage = () => {
  const router = useRouter();
  const { cid } = router.query;
  const user = demoPhoneCallData.find((user) => user.id === parseInt(cid));
  console.log(user)
  return (
    <>
      <TkPageHead>
        <title>{`Phone Call Details`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Phone Call Details"} parentTitle="Phone Call" parentLink={`${urls.phoneCall}`} />
        <TkContainer>
          <EditPhoneCall id={cid} userData={user} mode={modes.edit} />
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
