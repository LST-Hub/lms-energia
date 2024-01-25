import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import TkPageHead from "../../../../src/components/TkPageHead";
import UserDetails from "../../../../src/components/users/UserDetails";
import { modes, urls } from "../../../../src/utils/Constants";
import TkContainer from "../../../../src/components/TkContainer";
import EditTask from "../../../../src/components/task/EditTask";

const TaskDetailsPage = () => {
  return (
    <>
      <TkPageHead>
        <title>{`Task Details`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Task Details"} parentTitle="Task" parentLink={`${urls.taskk}`} />

        <TkContainer>
          <EditTask mode={modes.view} />
        </TkContainer>
      </div>
    </>
  );
};

export default TaskDetailsPage;

TaskDetailsPage.options = {
  layout: true,
  auth: false,
};
