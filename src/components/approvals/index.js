import React, { useEffect, useLayoutEffect, useState } from "react";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import AllPendingTimesheets from "./AllTimesheetApprovals";
import AllTodaysTaskApprovals from "./AllTodaysTasksApprovals";
import AllExpenseApprovals from "./AllExpenseApprovals";
import useUser from "../../utils/hooks/useUser";
import { useRouter } from "next/router";
import useSessionData from "../../utils/hooks/useSessionData";
import { approvalsTab, urls } from "../../utils/Constants";

const tabValues = Object.values(approvalsTab);

function Approvals() {
  const userData = useUser();
  const isUserAdmin = userData.role.isAdmin;
  const router = useRouter();
  const sessionData = useSessionData();

  const [activeTab, setActiveTab] = useState(approvalsTab.timesheet);

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      router.push(`${urls.approvals}?tab=${tab}`, undefined, { shallow: true });
    }
  };

  //IMP: if readign fr reference, then try not to use useLayoutEffect, try always using useEffect instead
  // used layout effect because we need to get the tab from url, and settab before rendering the component
  useLayoutEffect(() => {
    // did not use router.query.tab because it was not updating the state, before component is rendered
    // const tab = router.query.tab;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tabValues.includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab(approvalsTab.timesheet);
    }
  }, []);

  // if (!isUserAdmin && !userData.canBePM && !userData.canBeSupervisor) {
  //   return <TkAccessDenied />;
  // }

  return (
    <div>
      <div>
        <Nav className="nav-tabs dropdown-tabs nav-tabs-custom">
          <NavItem>
            <NavLink
              href="#"
              className={classnames({ active: activeTab === approvalsTab.timesheet })}
              onClick={() => {
                toggleTab(approvalsTab.timesheet);
              }}
            >
              Timesheet
            </NavLink>
          </NavItem>
          {sessionData?.todaysTaskEnabled ? (
            <NavItem>
              <NavLink
                href="#"
                className={classnames({ active: activeTab === approvalsTab.todayTask })}
                onClick={() => {
                  toggleTab(approvalsTab.todayTask);
                }}
              >
                Today&apos;s Task
              </NavLink>
            </NavItem>
          ) : null}
          <NavItem>
            <NavLink
              href="#"
              className={classnames({ active: activeTab === approvalsTab.expense })}
              onClick={() => {
                toggleTab(approvalsTab.expense);
              }}
            >
              Expense
            </NavLink>
          </NavItem>
        </Nav>
      </div>
      <TabContent activeTab={activeTab}>
        <TabPane tabId={approvalsTab.timesheet}>
          <AllPendingTimesheets mounted={activeTab === approvalsTab.timesheet} />
        </TabPane>

        {sessionData?.todaysTaskEnabled ? (
          <TabPane tabId={approvalsTab.todayTask}>
            <AllTodaysTaskApprovals mounted={activeTab === approvalsTab.todayTask} />
          </TabPane>
        ) : null}

        <TabPane tabId={approvalsTab.expense}>
          <AllExpenseApprovals mounted={activeTab === approvalsTab.expense} />
        </TabPane>
      </TabContent>
    </div>
  );
}

export default Approvals;
