import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import TkPageHead from "../../../../src/components/TkPageHead";
import UserDetails from "../../../../src/components/users/UserDetails";
import { modes, urls } from "../../../../src/utils/Constants";
import TkContainer from "../../../../src/components/TkContainer";

const UserDetailsPage = () => {
  return (
    <>
      <TkPageHead>
        <title>{`User Details`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"User Details"} parentTitle="Users" parentLink={`${urls.users}`} />
        <TkContainer>
          <UserDetails mode={modes.edit} />
        </TkContainer>
      </div>
    </>
  );
};

export default UserDetailsPage;

UserDetailsPage.options = {
  layout: true,
  auth: false,
};
