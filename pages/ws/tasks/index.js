import React from "react";
import AllTasks from "../../../src/components/tasks/AllTasks";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import { useRouter } from "next/router";
import TkPageHead from "../../../src/components/TkPageHead";
import TkContainer from "../../../src/components/TkContainer";
import useUserAccessLevel from "../../../src/utils/hooks/useUserAccessLevel";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import { urls } from "../../../src/utils/Constants";

const TaskList = () => {
  const router = useRouter();
  const handleButtonClick = () => {
    router.push(`${urls.taskAdd}`);
  };

  const accessLevel = useUserAccessLevel(permissionTypeIds.projAndTask);

  return (
    <React.Fragment>
      <TkPageHead>
        <title>{"Tasks List"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb
          pageTitle={"Tasks"}
          buttonText={accessLevel >= perAccessIds.create ? "Add Task" : undefined}
          onButtonClick={accessLevel >= perAccessIds.create ? handleButtonClick : undefined}
        />
        <TkContainer>
          <AllTasks accessLevel={accessLevel} />
        </TkContainer>
      </div>
    </React.Fragment>
  );
};

export default TaskList;

TaskList.options = {
  layout: true,
  auth: true,
};
