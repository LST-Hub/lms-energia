import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkPageHead from "../../../src/components/TkPageHead";
import TkContainer from "../../../src/components/TkContainer";
import { urls } from "../../../src/utils/Constants";
import AddTask from "../../../src/components/task/AddTask";
import AddMeeting from "../../../src/components/meeting/AddMeeting";

const MeetingDetailsPage = () => {
  return (
    <>
      <TkPageHead>
        <title>{`Add Meeting`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Add Meeting"} parentTitle="Meeting" parentLink={`${urls.meeting}`} />
        <TkContainer>
            <AddMeeting/>
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
