import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkPageHead from "../../../src/components/TkPageHead";
import AllUsers from "../../../src/components/users/AllUsers";
import { modes, urls } from "../../../src/utils/Constants";
import TkContainer from "../../../src/components/TkContainer";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import { useRouter } from "next/router";
import useUserAccessLevel from "../../../src/utils/hooks/useUserAccessLevel";

const Users = () => {
  const accessLevel = useUserAccessLevel(permissionTypeIds.users);

  const router = useRouter();
  const handleButtonClick = () => {
    router.push(`${urls.userAdd}`);
  };

  return (
    <>
      <TkPageHead>
        <title>{`Users`}</title>
      </TkPageHead>

      <div className="page-content">
        {/* <BreadCrumb
          pageTitle={"Users"}
          buttonText={"Add User"}
          onButtonClick={handleButtonClick}
        /> */}
        <TkContainer>
          <AllUsers />
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
