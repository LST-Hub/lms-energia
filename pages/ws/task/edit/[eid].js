import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import TkPageHead from "../../../../src/components/TkPageHead";
import UserDetails from "../../../../src/components/users/UserDetails";
import { modes, taskData, urls } from "../../../../src/utils/Constants";
import TkContainer from "../../../../src/components/TkContainer";
import EditPhoneCall from "../../../../src/components/phoneCall/EditPhoneCall";
import EditTask from "../../../../src/components/task/EditTask";
import { useRouter } from "next/router";

const TaskDetailsPage = () => {
  const router = useRouter();
  const { eid } = router.query;
  const user = taskData.find((user) => user.id === parseInt(eid));
  return (
    <>
      <TkPageHead>
        <title>{`Task Details`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Task Details"} parentTitle="Task" parentLink={`${urls.taskk}`} />
        <TkContainer>
          <EditTask id={eid} userData={user} mode={modes.edit} />
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
