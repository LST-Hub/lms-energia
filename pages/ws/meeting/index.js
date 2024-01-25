import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkPageHead from "../../../src/components/TkPageHead";
import AllUsers from "../../../src/components/users/AllUsers";
import { modes, urls } from "../../../src/utils/Constants";
import TkContainer from "../../../src/components/TkContainer";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import { useRouter } from "next/router";
import useUserAccessLevel from "../../../src/utils/hooks/useUserAccessLevel";
import AllMeeting from "../../../src/components/meeting/AllMeeting";

const Users = () => {
  const accessLevel = useUserAccessLevel(permissionTypeIds.users);

  const router = useRouter();
  const handleButtonClick = () => {
    router.push(`${urls.meetingAdd}`);
  };

  return (
    <>
      <TkPageHead>
        <title>{`Meeting`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb
          pageTitle={"Meeting"}
          buttonText={"Add Meeting"}
          onButtonClick={handleButtonClick}
        />
        <TkContainer>
          <AllMeeting />
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
