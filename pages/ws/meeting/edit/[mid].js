import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import TkPageHead from "../../../../src/components/TkPageHead";
import UserDetails from "../../../../src/components/users/UserDetails";
import { modes, urls } from "../../../../src/utils/Constants";
import TkContainer from "../../../../src/components/TkContainer";
import EditPhoneCall from "../../../../src/components/phoneCall/EditPhoneCall";
import EditTask from "../../../../src/components/task/EditTask";
import EditMeeting from "../../../../src/components/meeting/EditMeeting";

const MeetingDetailsPage = () => {
  return (
    <>
      <TkPageHead>
        <title>{`Meeting Details`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Meeting Details"} parentTitle="Meeting" parentLink={`${urls.meeting}`} />
        <TkContainer>
          <EditMeeting mode={modes.edit} />
        </TkContainer>
      </div>
    </>
  );
};

export default MeetingDetailsPage;

MeetingDetailsPage.options = {
  layout: true,
  auth: false,
};
