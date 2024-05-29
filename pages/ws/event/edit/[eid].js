import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import TkPageHead from "../../../../src/components/TkPageHead";
import { modes, taskData, urls } from "../../../../src/utils/Constants";
import TkContainer from "../../../../src/components/TkContainer";
import { useRouter } from "next/router";
import EditEvent from "../../../../src/components/event/EditEvent";

const EventDetailsPage = () => {
  const router = useRouter();
  const { eid } = router.query;
  return (
    <>
      <TkPageHead>
        <title>{`Event Details`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Event Details"} parentTitle="Event" parentLink={`${urls.event}`} />
        <TkContainer>
          <EditEvent id={eid}  mode={modes.edit} />
        </TkContainer>
      </div>
    </>
  );
};

export default EventDetailsPage;

EventDetailsPage.options = {
  layout: true,
  auth: false,
};
