import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkPageHead from "../../../src/components/TkPageHead";
import TkContainer from "../../../src/components/TkContainer";
import { urls } from "../../../src/utils/Constants";
import AddLead from "../../../src/components/leads/AddLead";
import {postRestletScriptDeploymentId } from "../../../src/utils/NsAPIcal";
const LeadDetailsPage = () => {
  return (
    <>
      <TkPageHead>
        <title>{`Add Lead`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Add Lead"} parentTitle="Lead" parentLink={`${urls.lead}`} />
        <TkContainer>
            <AddLead/>
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
