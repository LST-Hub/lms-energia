import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkPageHead from "../../../src/components/TkPageHead";
import TkContainer from "../../../src/components/TkContainer";
import { urls } from "../../../src/utils/Constants";
import AddEvent from "../../../src/components/event/AddEvent";

const EventDetailsPage = () => {
  return (
    <>
      <TkPageHead>
        <title>{`Add Event`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Add Event"} parentTitle="Event" parentLink={`${urls.event}`} />
        <TkContainer>
            <AddEvent />
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
