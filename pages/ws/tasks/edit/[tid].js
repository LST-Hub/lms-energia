import React from "react";
import { useRouter } from "next/router";
import TaskDetails from "../../../../src/components/tasks/TaskDetails";
import BreadCrumb from "../../../../src/utils/BreadCrumb";

import TkPageHead from "../../../../src/components/TkPageHead";
import TkContainer from "../../../../src/components/TkContainer";
import TkLoader from "../../../../src/components/TkLoader";
import { modes, urls } from "../../../../src/utils/Constants";

const TaskDetailsPage = () => {
  const router = useRouter();
  const { tid } = router.query;

  return (
    <>
      <TkPageHead>
        <title>{`Task Details`}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Tasks Details"} parentTitle="Tasks" parentLink={`${urls.tasks}`} />
        <TkContainer>
          <TaskDetails id={tid} mode={modes.edit} />
        </TkContainer>
      </div>
    </>
  );
};

export default TaskDetailsPage;

TaskDetailsPage.options = {
  layout: true,
  auth: true,
};
