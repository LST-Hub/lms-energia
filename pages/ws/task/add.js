import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkPageHead from "../../../src/components/TkPageHead";
import TkContainer from "../../../src/components/TkContainer";
import { urls } from "../../../src/utils/Constants";
import AddTask from "../../../src/components/task/AddTask";

const TaskDetailsPage = () => {
  return (
    <>
      <TkPageHead>
        <title>{`Add Task`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Add Task"} parentTitle="Task" parentLink={`${urls.taskk}`} />
        <TkContainer>
            <AddTask />
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
