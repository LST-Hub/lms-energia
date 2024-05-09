import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import TkPageHead from "../../../../src/components/TkPageHead";
import {  modes, urls } from "../../../../src/utils/Constants";
import TkContainer from "../../../../src/components/TkContainer";
import { useRouter } from "next/router";
import EditActivity from "../../../../src/components/activity/EditActivity";

const ActivityDetailsPage = () => {
  const router = useRouter();
  const { aid } = router.query;
  return (
    <>
      <TkPageHead>
        <title>{`Activity Details`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb
          pageTitle={"Activity Details"}
          parentTitle="Activity"
          parentLink={`${urls.activity}`}
        />
        <TkContainer>
          <EditActivity id={aid}  mode={modes.edit} />
        </TkContainer>
      </div>
    </>
  );
};

export default ActivityDetailsPage;

ActivityDetailsPage.options = {
  layout: true,
  auth: false,
};
