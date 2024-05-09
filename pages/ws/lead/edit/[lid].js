import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import TkPageHead from "../../../../src/components/TkPageHead";
import {  modes, urls } from "../../../../src/utils/Constants";
import TkContainer from "../../../../src/components/TkContainer";
import EditLead from "../../../../src/components/leads/EditLead";
import { useRouter } from "next/router";

const LeadDetailsPage = () => {
  const router = useRouter();
  const { lid } = router.query;
  return (
    <>
      <TkPageHead>
        <title>{`Lead Details`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb
          pageTitle={"Lead Details"}
          parentTitle="Lead"
          parentLink={`${urls.lead}`}
        />
        <TkContainer>
          <EditLead id={lid}  mode={modes.edit} />
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
