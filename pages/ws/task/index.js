import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkPageHead from "../../../src/components/TkPageHead";
import AllUsers from "../../../src/components/users/AllUsers";
import { modes, urls } from "../../../src/utils/Constants";
import TkContainer from "../../../src/components/TkContainer";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import { useRouter } from "next/router";
import useUserAccessLevel from "../../../src/utils/hooks/useUserAccessLevel";
import AllTask from "../../../src/components/task/AllTask";

const Users = () => {
  const accessLevel = useUserAccessLevel(permissionTypeIds.users);

  const router = useRouter();
  const handleButtonClick = () => {
    router.push(`${urls.taskkAdd}`);
  };

  return (
    <>
      <TkPageHead>
        <title>{`Task`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb
          pageTitle={"Task"}
          buttonText={"Add Task"}
          onButtonClick={handleButtonClick}
        />
        <TkContainer>
         <AllTask />
        </TkContainer>
      </div>
    </>
  );
};

export default Users;

Users.options = {
  layout: true,
  auth: false,
};
