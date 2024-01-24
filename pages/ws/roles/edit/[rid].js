import React from "react";
import { useRouter } from "next/router";
import EditRole from "../../../../src/components/roles/EditRole";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import TkContainer from "../../../../src/components/TkContainer";
import TkPageHead from "../../../../src/components/TkPageHead";
import TkLoader from "../../../../src/components/TkLoader";
import { modes, urls } from "../../../../src/utils/Constants";

const SingleRole = () => {
  const router = useRouter();
  const { rid } = router.query;

  if (!router.isReady) {
    return (
      <>
        <div className="page-content">
          <BreadCrumb pageTitle={"Role Details"} parentTitle={"Roles"} parentLink={`${urls.roles}`} />
          <TkContainer>
            <TkLoader />
          </TkContainer>
        </div>
      </>
    );
  }

  return (
    <>
      <TkPageHead>
        {/* TODO: get the name of role and set it to title */}
        <title>{"Role Details"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Role Details"} parentTitle={"Roles"} parentLink={`${urls.roles}`} />
        <TkContainer>
          <EditRole id={rid} mode={modes.edit} />
        </TkContainer>
      </div>
    </>
  );
};

export default SingleRole;

SingleRole.options = {
  layout: true,
  auth: true,
};
