import React, { useEffect, useState } from "react";
import TkPageHead from "../../../src/components/TkPageHead";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import {
  Button,
  ButtonGroup,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import {
  MaxNameLength,
  MinNameLength,
  createdByNameTypes,
  urls,
} from "../../../src/utils/Constants";
import { useRouter } from "next/router";
import { TkCardBody, TkCardHeader } from "../../../src/components/TkCard";
import DirectCall from "./DirectCall";
import LeadAssigning from "./LeadAssigning";
import LeadNurturing from "./LeadNurturing";
import TkContainer from "../../../src/components/TkContainer";
import LeadEmail from "./LeadEmail";
import SocialMedia from "./SocialMedia";
import LeadPortals from "./LeadPortals";
import DirectMarketing from "./DirectMarketing";
import TkRow, { TkCol } from "../../../src/components/TkRow";
import TkSelect from "../../../src/components/forms/TkSelect";
import TkInput from "../../../src/components/forms/TkInput";
import { Controller, useForm } from "react-hook-form";
import TkLabel from "../forms/TkLabel";
import TkCheckBox from "../forms/TkCheckBox";
import TkIcon from "../TkIcon";
import TkButton from "../TkButton";
import TkDate from "../forms/TkDate";
import TkForm from "../forms/TkForm";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const tabs = {
  directCall: "directCall",
  leadAssigning: "leadAssigning",
  leadNurutring: "leadNurutring",
};
const schema = Yup.object({
  name: Yup.string()
    .min(
      MinNameLength,
      `First name should have at least ${MinNameLength} character.`
    )
    .max(
      MaxNameLength,
      `First name should have at most ${MaxNameLength} characters.`
    )
    .required("First name is required"),
}).required();
function LeadDirectCall() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(tabs.directCall);
  const [directCallCheckbox, setDirectCallCheckbox] = useState(false);
  const [emailCheckbox, setEmailCheckbox] = useState(false);
  const [socialMediaCheckbox, setSocialMediaCheckbox] = useState(false);
  const [portalsCheckbox, setPortalsCheckbox] = useState(false);
  const [directMarketingCheckbox, setDirectMarketingCheckbox] = useState(false);
  const [isLead, setIsLead] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allDurations, setAllDurations] = useState({});
  const [requirementDetailsSections, setRequirementDetailsSections] = useState([
    { id: 1, isVisible: true },
  ]);
  useEffect(() => {
    setIsLead(true);
  }, []);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    formState: { errors, isDirty, dirtyFields },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleAddSection = () => {
    const newId = requirementDetailsSections.length + 1;
    setRequirementDetailsSections([
      ...requirementDetailsSections,
      { id: newId, isVisible: true },
    ]);
  };

  const handleToggleVisibility = (id) => {
    setRequirementDetailsSections((prevSections) =>
      prevSections.map((section) =>
        section.id === id
          ? { ...section, isVisible: !section.isVisible }
          : section
      )
    );
  };

  useEffect(() => {
    setValue("createdDate", new Date());
    setSelectedDate(new Date());
  }, [setValue]);

  return (
    <>
      {isLead && (
        <div>
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
      )}
    </>
  );
}

export default LeadDirectCall;
