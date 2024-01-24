import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import TkContainer from "../../../../src/components/TkContainer";
import TkPageHead from "../../../../src/components/TkPageHead";
import { useRouter } from "next/router";
import EditWorkCalendar from "../../../../src/components/workCalender/edit";
import { modes } from "../../../../src/utils/Constants";

function EditCalendar() {
  const router = useRouter();
  const { wid } = router.query;
  
  return (
    <div>
      <TkPageHead>
        <title>{"Edit Work Calendar"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Edit Work Calendar"} />
        <TkContainer>
          <EditWorkCalendar id={wid} mode={modes.edit} />
        </TkContainer>
      </div>
    </div>
  );
}

export default EditCalendar;

EditCalendar.options = {
  layout: true,
  auth: true,
};
