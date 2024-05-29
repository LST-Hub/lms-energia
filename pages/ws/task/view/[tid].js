import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import TkPageHead from "../../../../src/components/TkPageHead";
import UserDetails from "../../../../src/components/users/UserDetails";
import { modes, taskData, urls } from "../../../../src/utils/Constants";
import TkContainer from "../../../../src/components/TkContainer";
import EditTask from "../../../../src/components/task/EditTask";
import { useRouter } from "next/router";

const TaskDetailsPage = () => {
  const router = useRouter();
  const { tid } = router.query;
  
  return (
    <>
      <TkPageHead>
        <title>{`Task Details`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Task Details"} parentTitle="Task" parentLink={`${urls.taskk}`} />

        <TkContainer>
          <EditTask id={tid}  mode={modes.view} />
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
