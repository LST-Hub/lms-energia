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
import TodayAllocatedTask from "../../src/components/dashboard/TodaysAllocatedTask";
// import StackedProjectTime from "../../src/components/dashboard/StackedProjectTime";

const Dashboard = () => {
  const sessionData = useSessionData();
  return (
    <>
      <TkPageHead>
        <title>{"DashBoard"}</title>
      </TkPageHead>
      <div className="page-content">
        {/*IMP: Always add a breadcrumb first, before Container and after page-content class */}
        <BreadCrumb pageTitle="Dashboard" />

        <TkContainer>
          {/* TODO: apply logic to check if account is going to expire then show below component */}
          {/* <UpgradeAccountNotice /> */}
          <div className="project-wrapper">
            {/* <Widgets /> */}
            {sessionData.user.roleId !== perDefinedEmployeeRoleID && (
              <DashboardWidgets role={sessionData.user.roleId} />
            )}

            {/* <ProjectsOverview /> */}
          </div>
          {/* <ActiveProjects /> */}
          {/* <StackedProjectTime /> */}
          {/* <ProjectsStatus /> */}
          {/* <ProjectTime /> */}
          {/* <TkRow>
            <TkCol xl={6}>
              <MyTasks />
            </TkCol>
            <TkCol xl={6}>
              <PendingApprovals />
            </TkCol>
            
          </TkRow> */}
          <TkRow>
            <TkCol xl={6}>
              <DashboardApprovals />
            </TkCol>
            {sessionData.user.roleId !== perDefinedEmployeeRoleID && (
              <TkCol xl={6}>
                <ProjectsStatus />
              </TkCol>
            )}
            <TkCol xl={12}>
              <TodayAllocatedTask />
            </TkCol>
            {sessionData.user.roleId !== perDefinedEmployeeRoleID && (
              <TkCol xl={12}>
                <DashboardProjects />
              </TkCol>
            )}
            {sessionData.user.roleId === perDefinedAdminRoleID ||
            sessionData.user.roleId === perDefinedProjectAdminRoleID ? (
              <TkCol xl={12}>
                <DashboardClients />
              </TkCol>
            ) : null}
            {sessionData.user.roleId !== perDefinedEmployeeRoleID && (
              <TkCol xl={12}>
                <DashboardTasks />
              </TkCol>
            )}
            {sessionData.user.roleId === 1 || sessionData.user.roleId === 3 ? (
              <TkCol xl={12}>
                <DashboardUsers />
              </TkCol>
            ) : null}
          </TkRow>
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
