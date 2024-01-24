import React, { useLayoutEffect, useState } from "react";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";

import PrioritySetting from "./PrioritySetting";
import StatusSetting from "./StatusSetting";
import AllExpenseCategories from "../expenseCategories/AllExpensesCategories";
import AllWorkCals from "../workCalender/All";
import TkAccessDenied from "../TkAccessDenied";
import DepartmentSetting from "./DepartmentSetting";
import AllCurrency from "./currency/AllCurrency";
import WorkspaceSetting from "./WorkspaceSettings";
import { useRouter } from "next/router";
import { settingsTab, urls } from "../../utils/Constants";

const tabValues = Object.values(settingsTab);

function Settings({ accessLevel }) {
  const [activeTab, setActiveTab] = useState(settingsTab.workCalendar);
  const router = useRouter();
  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      router.push(`${urls.settings}?tab=${tab}`, undefined, { shallow: true });
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
      setActiveTab(settingsTab.workCalendar);
    }
  }, []);

  if (!accessLevel) {
    return <TkAccessDenied />;
  }

  return (
    <>
      <Nav className="nav-tabs dropdown-tabs nav-tabs-custom">
        <NavItem>
          <NavLink
            href="#"
            className={classnames({ active: activeTab === settingsTab.workCalendar })}
            onClick={() => {
              toggleTab(settingsTab.workCalendar);
            }}
          >
            Work Calendar
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            href="#"
            className={classnames({ active: activeTab === settingsTab.priorities })}
            onClick={() => {
              toggleTab(settingsTab.priorities);
            }}
          >
            Priorities
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            href="#"
            className={classnames({ active: activeTab === settingsTab.status })}
            onClick={() => {
              toggleTab(settingsTab.status);
            }}
          >
            Status
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            href="#"
            className={classnames({ active: activeTab === settingsTab.departments })}
            onClick={() => {
              toggleTab(settingsTab.departments);
            }}
          >
            Department
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            href="#"
            className={classnames({ active: activeTab === settingsTab.currency })}
            onClick={() => {
              toggleTab(settingsTab.currency);
            }}
          >
            Currency
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            href="#"
            className={classnames({ active: activeTab === settingsTab.expenseCategory })}
            onClick={() => {
              toggleTab(settingsTab.expenseCategory);
            }}
          >
            Expense Category
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            href="#"
            className={classnames({ active: activeTab === settingsTab.workspace })}
            onClick={() => {
              toggleTab(settingsTab.workspace);
            }}
          >
            Workspace Settings
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId={settingsTab.workCalendar} className="py-2 ps-2">
          <AllWorkCals mounted={activeTab === settingsTab.workCalendar} />
          {/* <SimpleBar className="pe-2">
          </SimpleBar> */}
        </TabPane>

        <TabPane tabId={settingsTab.priorities} className="py-2 ps-2">
          <PrioritySetting mounted={activeTab === settingsTab.priorities} />
          {/* <SimpleBar className="pe-2">
          </SimpleBar> */}
        </TabPane>

        <TabPane tabId={settingsTab.status} className="py-2 ps-2">
          <StatusSetting mounted={activeTab === settingsTab.status} />
        </TabPane>

        <TabPane tabId={settingsTab.departments} className="py-2 ps-2">
          <DepartmentSetting mounted={activeTab === settingsTab.departments} />
        </TabPane>

        <TabPane tabId={settingsTab.currency} className="py-2 ps-2">
          <AllCurrency mounted={activeTab === settingsTab.currency} />
        </TabPane>

        <TabPane tabId={settingsTab.expenseCategory} className="py-2 ps-2">
          <AllExpenseCategories mounted={activeTab === settingsTab.expenseCategory} />
        </TabPane>

        <TabPane tabId={settingsTab.workspace} className="py-2 ps-2">
          <WorkspaceSetting mounted={activeTab === settingsTab.workspace} />
        </TabPane>
      </TabContent>
    </>
  );
}

export default Settings;
