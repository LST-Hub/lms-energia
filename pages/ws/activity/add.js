import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkPageHead from "../../../src/components/TkPageHead";
import TkContainer from "../../../src/components/TkContainer";
import { urls } from "../../../src/utils/Constants";
import AddLead from "../../../src/components/leads/AddLead";
import AddActivity from "../../../src/components/activity/AddActivity";
const ActivityDetailsPage = () => {
  return (
    <>
      <TkPageHead>
        <title>{`Add Activity`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Add Activity"} parentTitle="Activity" parentLink={`${urls.activity}`} />
        <TkContainer>
            <AddActivity/>
        </TkContainer>
      </div>
    </>
  );
};

export default ActivityDetailsPage;

ActivityDetailsPage.options = {
  layout: true,
  auth: false,
};
