import React from "react";

//import Components
import BreadCrumb from "../../src/utils/BreadCrumb";

import TkContainer from "../../src/components/TkContainer";
import TkRow, { TkCol } from "../../src/components/TkRow";
import TkPageHead from "../../src/components/TkPageHead";
import Project from "../../src/components/projects/ProjectListCol";
import DashboardProjects from "../../src/components/dashboard/Projects";
import DashboardClients from "../../src/components/dashboard/Clients";
import DashboardTasks from "../../src/components/dashboard/Tasks";
import DashboardUsers from "../../src/components/dashboard/Users";
import DashboardWidgets from "../../src/components/dashboard/DashboardWidgets";
import DashboardApprovals from "../../src/components/dashboard/DashboardApprovals";
import useSessionData from "../../src/utils/hooks/useSessionData";
import MyTasks from "../../src/components/dashboard/MyTasks";
import PendingApprovals from "../../src/components/dashboard/PendingApprovals";
import UpgradeAccountNotice from "../../src/components/dashboard/UpgradeAccountNotice";
import ProjectsStatus from "../../src/components/dashboard/ProjectsStatus";
// import ProjectTime from "../../src/components/dashboard/ProjectTime";
import {
  perDefinedAdminRoleID,
  perDefinedEmployeeRoleID,
  perDefinedProjectAdminRoleID,
} from "../../src/utils/Constants";
// import TodayAllocatedTask from "../../src/components/dashboard/TodaysAllocatedTask";
import Widget from "../../src/components/dashboard/Widget";
import DashboardCrm from "../../src/components/dashboard/DashboardCrm";
// import SalesForecast from "../../src/components/dashboard/SalesForecast";
// import StackedProjectTime from "../../src/components/dashboard/StackedProjectTime";

const Dashboard = () => {
  const sessionData = useSessionData();
  return (
    <>
      <TkPageHead>
        <title>{"DashBoard"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle="Dashboard" />

        <TkContainer>
          <DashboardCrm />
        </TkContainer>
      </div>
    </>
  );
};

export default Dashboard;

Dashboard.options = {
  layout: true,
  auth: false,
};
