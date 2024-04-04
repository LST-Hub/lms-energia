import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkPageHead from "../../../src/components/TkPageHead";
import AddUser from "../../../src/components/users/AddUser";
import TkContainer from "../../../src/components/TkContainer";
import { urls } from "../../../src/utils/Constants";
import AddPhoneCall from "../../../src/components/phoneCall/AddPhoneCall";
import Role from "../../../src/components/roles/Role";

const RoleDetailsPage = () => {
  return (
    <>
      <TkPageHead>
        <title>{`Add Role`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Add Role"} parentTitle="Roles" parentLink={`${urls.roles}`} />
        <TkContainer>
            <Role />
        </TkContainer>
      </div>
    </>
  );
};

export default RoleDetailsPage;

RoleDetailsPage.options = {
  layout: true,
  auth: false,
};
