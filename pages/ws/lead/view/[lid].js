import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import TkPageHead from "../../../../src/components/TkPageHead";
import UserDetails from "../../../../src/components/users/UserDetails";
import { demoUserData, modes, urls } from "../../../../src/utils/Constants";
import TkContainer from "../../../../src/components/TkContainer";
import EditLead from "../../../../src/components/leads/EditLead";
import { useRouter } from "next/router";

const LeadDetailsPage = () => {
  const router = useRouter();
  const { lid } = router.query;
  const user = demoUserData.find((user) => user.id === parseInt(lid));
  return (
    <>
      <TkPageHead>
        <title>{`Lead Details`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Lead Details"} parentTitle="Lead" parentLink={`${urls.lead}`} />

        <TkContainer>
          <EditLead id={lid} userData={user} mode={modes.view} />
        </TkContainer>
      </div>
    </>
  );
};

export default LeadDetailsPage;

LeadDetailsPage.options = {
  layout: true,
  auth: false,
};
