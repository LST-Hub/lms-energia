import React, { useState, useCallback } from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import AllClients from "../../../src/components/client/AllClients";

import TkContainer from "../../../src/components/TkContainer";
import TkPageHead from "../../../src/components/TkPageHead";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import useUserAccessLevel from "../../../src/utils/hooks/useUserAccessLevel";

const ClientListPage = () => {
  // const handleButtonClick = () => {};
  const [modal, setModal] = useState(false);

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
    } else {
      setModal(true);
    }
  }, [modal]);

  const accessLevel = useUserAccessLevel(permissionTypeIds.clients);

  return (
    <>
      <TkPageHead>
        <title>{`Client Details`}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb
          pageTitle="Clients"
          buttonText={accessLevel >= perAccessIds.create ? "Add Client" : undefined}
          onButtonClick={accessLevel >= perAccessIds.create ? toggle : undefined}
        />
        <TkContainer>
          <AllClients
            modal={modal}
            setModal={setModal}
            toggle={toggle}
            perAccessIds={perAccessIds}
            accessLevel={accessLevel}
          />
        </TkContainer>
      </div>
    </>
  );
};

export default ClientListPage;

ClientListPage.options = {
  layout: true,
  auth: true,
};
