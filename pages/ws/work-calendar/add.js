import React from "react";
import AddWorkCalendar from "../../../src/components/workCalender/add";

import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkContainer from "../../../src/components/TkContainer";
import TkPageHead from "../../../src/components/TkPageHead";

function AddCalendar() {
  return (
    <div>
      <TkPageHead>
        <title>{"Add Work Calendar"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Add Work Calendar"} />
        <TkContainer>
          <AddWorkCalendar />
        </TkContainer>
      </div>
    </div>
  );
}

export default AddCalendar;

AddCalendar.options = {
  layout: true,
  auth: true,
};
