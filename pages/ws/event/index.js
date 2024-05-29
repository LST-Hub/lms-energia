import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkPageHead from "../../../src/components/TkPageHead";
import AllUsers from "../../../src/components/users/AllUsers";
import { modes, urls } from "../../../src/utils/Constants";
import TkContainer from "../../../src/components/TkContainer";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import { useRouter } from "next/router";
import useUserAccessLevel from "../../../src/utils/hooks/useUserAccessLevel";
import AllEvent from "../../../src/components/event/AllEvent";

const Events = () => {
  const accessLevel = useUserAccessLevel(permissionTypeIds.users);

  const router = useRouter();
  const handleButtonClick = () => {
    router.push(`${urls.eventAdd}`);
  };

  return (
    <>
      <TkPageHead>
        <title>{`Event`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb
          pageTitle={"Event"}
          buttonText={"Add Event"}
          onButtonClick={handleButtonClick}
        />
        <TkContainer>
         <AllEvent />
        </TkContainer>
      </div>
    </>
  );
};

export default Events;

Events.options = {
  layout: true,
  auth: false,
};
