import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import TkPageHead from "../../../src/components/TkPageHead";
import {  urls } from "../../../src/utils/Constants";
import TkContainer from "../../../src/components/TkContainer";
import { useRouter } from "next/router";
import AllLead from "../../../src/components/leads/AllLead";

const Leads = () => {

  const router = useRouter();
  const handleButtonClick = () => {
    router.push(`${urls.leadAdd}`);
  };

  return (
    <>
      <TkPageHead>
        <title>{`Lead`}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb
          pageTitle={"Lead"}
          buttonText={"Add Lead"}
          onButtonClick={handleButtonClick}
        />
        <TkContainer>
         <AllLead />
        </TkContainer>
      </div>
    </>
  );
};

export default Leads;

Leads.options = {
  layout: true,
  auth: false,
};
