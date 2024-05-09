import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkPageHead from "../../../src/components/TkPageHead";
import {  urls } from "../../../src/utils/Constants";
import TkContainer from "../../../src/components/TkContainer";
import { useRouter } from "next/router";
import AllActivity from "../../../src/components/activity/AllActivity";

const Activity = () => {

  const router = useRouter();
  const handleButtonClick = () => {
    router.push(`${urls.activityAdd}`);
  };

  return (
    <>
      <TkPageHead>
        <title>{`Activity`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb
          pageTitle={"Activity"}
          buttonText={"Add Activity"}
          onButtonClick={handleButtonClick}
        />
        <TkContainer>
         <AllActivity />
        </TkContainer>
      </div>
    </>
  );
};

export default Activity;

Activity.options = {
  layout: true,
  auth: false,
};
