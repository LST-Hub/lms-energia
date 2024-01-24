import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkPageHead from "../../../src/components/TkPageHead";
import AddUser from "../../../src/components/users/AddUser";
import TkContainer from "../../../src/components/TkContainer";
import { urls } from "../../../src/utils/Constants";

const UserDetailsPage = () => {
  return (
    <>
      <TkPageHead>
        <title>{`Add User`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Add User"} parentTitle="Users" parentLink={`${urls.users}`} />
        <TkContainer>
          <AddUser />
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
