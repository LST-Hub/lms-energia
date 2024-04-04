import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import TkPageHead from "../../../../src/components/TkPageHead";
import UserDetails from "../../../../src/components/users/UserDetails";
import { meetingData, modes, urls } from "../../../../src/utils/Constants";
import TkContainer from "../../../../src/components/TkContainer";
import EditTask from "../../../../src/components/task/EditTask";
import EditMeeting from "../../../../src/components/meeting/EditMeeting";
import { useRouter } from "next/router";

const MeetingDetailsPage = () => {
  const router = useRouter();
  const { mid } = router.query;
  const user = meetingData.find((user) => user.id === parseInt(mid));
  return (
    <>
      <TkPageHead>
        <title>{`Meeting Details`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Meeting Details"} parentTitle="Meeting" parentLink={`${urls.meeting}`} />

        <TkContainer>
          <EditMeeting id={mid} userData={user} mode={modes.view} />
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
