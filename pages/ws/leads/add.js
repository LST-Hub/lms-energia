import React, { useState } from "react";
import TkPageHead from "../../../src/components/TkPageHead";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import { urls } from "../../../src/utils/Constants";
import { useRouter } from "next/router";
import { TkCardBody } from "../../../src/components/TkCard";
import DirectCall from "./DirectCall";
import LeadAssigning from "./LeadAssigning";
import LeadNurturing from "./LeadNurturing";
import TkContainer from "../../../src/components/TkContainer";
import LeadEmail from "./LeadEmail";
import SocialMedia from "./SocialMedia";
import LeadPortals from "./LeadPortals";
import DirectMarketing from "./DirectMarketing";

const tabs = {
  directCall: "directCall",
  email: "email",
  socialMedia: "socialMedia",
  portals: "portals",
  directMarketing: "directMarketing",
  leadAssigning: "leadAssigning",
  leadNurutring: "leadNurutring",
};

function Add() {
  const [activeTab, setActiveTab] = useState(tabs.directCall);
  const router = useRouter();

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      router.push(`${urls.leads}/add?tab=${tab}`, undefined, {
        scroll: false,
      });
    }
  };

  return (
    <div>
      <TkPageHead>
        <title>{"Leads"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb
          pageTitle="Leads"
          parentTitle="Leads"
          parentLink={urls.leads}
        />
        <TkContainer>
          <Nav className="nav-tabs dropdown-tabs nav-tabs-custom mb-3">
            <NavItem>
              <NavLink
                href="#"
                className={classnames({
                  active: activeTab === tabs.directCall,
                })}
                onClick={() => {
                  toggleTab(tabs.directCall);
                }}
              >
                Direct Call
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                href="#"
                className={classnames({ active: activeTab === tabs.email })}
                onClick={() => {
                  toggleTab(tabs.email);
                }}
              >
                Email
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                href="#"
                className={classnames({
                  active: activeTab === tabs.socialMedia,
                })}
                onClick={() => {
                  toggleTab(tabs.socialMedia);
                }}
              >
                Social Media
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                href="#"
                className={classnames({ active: activeTab === tabs.portals })}
                onClick={() => {
                  toggleTab(tabs.portals);
                }}
              >
                Portals
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                href="#"
                className={classnames({
                  active: activeTab === tabs.directMarketing,
                })}
                onClick={() => {
                  toggleTab(tabs.directMarketing);
                }}
              >
                Direct Marketing
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                href="#"
                className={classnames({
                  active: activeTab === tabs.leadAssigning,
                })}
                onClick={() => {
                  toggleTab(tabs.leadAssigning);
                }}
              >
                Lead Assigning
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                href="#"
                className={classnames({
                  active: activeTab === tabs.leadNurutring,
                })}
                onClick={() => {
                  toggleTab(tabs.leadNurutring);
                }}
              >
                Lead Nurturing
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId={tabs.directCall}>
              <TkCardBody>
                <DirectCall toggleTab={toggleTab} tabs={tabs} />
              </TkCardBody>
            </TabPane>
            <TabPane tabId={tabs.email}>
              <TkCardBody>
                <LeadEmail toggleTab={toggleTab} tabs={tabs} />
              </TkCardBody>
            </TabPane>
            <TabPane tabId={tabs.socialMedia}>
              <TkCardBody>
                <SocialMedia toggleTab={toggleTab} tabs={tabs} />
              </TkCardBody>
            </TabPane>
            <TabPane tabId={tabs.portals}>
              <TkCardBody>
                <LeadPortals toggleTab={toggleTab} tabs={tabs} />
              </TkCardBody>
            </TabPane>
            <TabPane tabId={tabs.directMarketing}>
              <TkCardBody>
                <DirectMarketing toggleTab={toggleTab} tabs={tabs} />
              </TkCardBody>
            </TabPane>
            <TabPane tabId={tabs.leadAssigning}>
              <TkCardBody>
                <LeadAssigning toggleTab={toggleTab} tabs={tabs} />
              </TkCardBody>
            </TabPane>
            <TabPane tabId={tabs.leadNurutring}>
              <TkCardBody>
                <LeadNurturing />
              </TkCardBody>
            </TabPane>
          </TabContent>
        </TkContainer>
      </div>
    </div>
  );
}

export default Add;

Add.options = {
  layout: true,
  auth: false,
};
