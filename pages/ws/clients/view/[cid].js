import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import ClientDetails from "../../../../src/components/client/ClientDetails";
import { useRouter } from "next/router";

import TkContainer from "../../../../src/components/TkContainer";
import TkRow, { TkCol } from "../../../../src/components/TkRow";
import TkPageHead from "../../../../src/components/TkPageHead";
import TkLoader from "../../../../src/components/TkLoader";
import { modes, urls } from "../../../../src/utils/Constants";

const ClientDetailsPage = () => {
  const router = useRouter();
  const { cid } = router.query;

  if (!router.isReady) {
    return (
      <>
        <div className="page-content">
          <BreadCrumb pageTitle={"Client Details"} parentTitle="Clients" parentLink={`${urls.clients}`} />
          <TkContainer>
            <TkRow>
              <TkCol>
                <TkLoader />
              </TkCol>
            </TkRow>
          </TkContainer>
        </div>
      </>
    );
  }

  return (
    <>
      <TkPageHead>
        <title>{`Client Details`}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Client Details"} parentTitle="Clients" parentLink={`${urls.clients}`} />
        <TkContainer>
          <TkRow>
            <TkCol>
              <ClientDetails id={cid} mode={modes.view} />
            </TkCol>
          </TkRow>
        </TkContainer>
      </div>
    </>
  );
};

export default ClientDetailsPage;

ClientDetailsPage.options = {
  layout: true,
  auth: true,
};
