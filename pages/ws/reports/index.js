import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Container, Row } from "reactstrap";
import Layout from "../../../src/components/layout";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import ReportTasks from "../../../src/components/reports/Tasks";
import ReportsProjects from "../../../src/components/reports/Projects";
import ReportsClients from "../../../src/components/reports/Clients";
import ReportsUsers from "../../../src/components/reports/Users";
import Reports from "../../../src/components/reports/Reports";

import TkPageHead from "../../../src/components/TkPageHead";
import TkContainer from "../../../src/components/TkContainer";

import TkLoader from "../../../src/components/TkLoader";
import useUserAccessLevel from "../../../src/utils/hooks/useUserAccessLevel";
import { permissionTypeIds } from "../../../DBConstants";

const ReportsPage = () => {
  const accessLevel = useUserAccessLevel(permissionTypeIds.reports);

  return (
    <>
      <TkPageHead>
        <title>Reports</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Reports"} />
        {/* <TkContainer> */}
          <Reports accessLevel={accessLevel} />
        {/* </TkContainer> */}
      </div>
    </>
  );
};

export default ReportsPage;

ReportsPage.options = {
  layout: true,
  auth: true,
};
