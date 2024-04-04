import React, { useLayoutEffect, useState } from "react";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";

import TkAccessDenied from "../TkAccessDenied";
import { useRouter } from "next/router";
import { settingsTab, urls } from "../../utils/Constants";
import RegionSetting from "./region";

const tabValues = Object.values(settingsTab);

function Settings({ accessLevel }) {
  const [activeTab, setActiveTab] = useState(settingsTab.region);
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
      setActiveTab(settingsTab.region);
    }
  }, []);

  return (
    <>
      <Nav className="nav-tabs dropdown-tabs nav-tabs-custom">
        <NavItem>
          <NavLink
            href="#"
            className={classnames({
              active: activeTab === settingsTab.region,
            })}
            onClick={() => {
              toggleTab(settingsTab.region);
            }}
          >
            Region
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId={settingsTab.region} className="py-2 ps-2">
          <RegionSetting mounted={activeTab === settingsTab.region} />
        </TabPane>
      </TabContent>
    </>
  );
}

export default Settings;
