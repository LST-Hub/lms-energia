import React, { useEffect, useState } from "react";
import TkPageHead from "../../../src/components/TkPageHead";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import {
  Button,
  ButtonGroup,
  Form,
  FormGroup,
  Input,
  Label,
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

// const tabs = {
//   directCall: "directCall",
//   email: "email",
//   socialMedia: "socialMedia",
//   portals: "portals",
//   directMarketing: "directMarketing",
//   leadAssigning: "leadAssigning",
//   leadNurutring: "leadNurutring",
// };
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
function AddLead() {
  // const [activeTab, setActiveTab] = useState(tabs.directCall);
  const [rSelected, setRSelected] = useState(0);
  const router = useRouter();
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
  
  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      router.push(`${urls.lead}/add?tab=${tab}`, undefined, {
        scroll: false,
      });
    }
  };

  const [showForm, setShowForm] = useState(false);

  const handleButtonClick = () => {
    setShowForm(true);
  };

  const handleFormSubmit = (event) => {
    // Handle form submission logic here
    event.preventDefault();
    // Reset form state or do any other necessary operations
    setShowForm(false);
  };


  return (
    <TkRow className="mt-3">
      <TkCol>
        <TkCardHeader tag="h5" className="mb-4">
          <h4>Lead Types</h4>
        </TkCardHeader>
        <ButtonGroup style={{ marginBottom: "20px" }}>
          <Button
            color="primary"
            outline
            // onClick={() => setRSelected(1)}
            active={rSelected === 1}
            style={{ marginRight: "10px" }}
          >
            Direct Call
          </Button>
          <Button
            color="primary"
            outline
            onClick={() => setRSelected(2)}
            active={rSelected === 2}
            style={{ marginRight: "10px" }}
          >
            Email
          </Button>
          <Button
            color="primary"
            outline
            onClick={() => setRSelected(3)}
            active={rSelected === 3}
            style={{ marginRight: "10px" }}
          >
            Social Media
          </Button>
          <Button
            color="primary"
            outline
            onClick={() => setRSelected(4)}
            active={rSelected === 4}
            style={{ marginRight: "10px" }}
          >
            Portals
          </Button>
          <Button
            color="primary"
            outline
            onClick={() => setRSelected(5)}
            active={rSelected === 5}
          >
            Direct Marketing
          </Button>
        </ButtonGroup>
      </TkCol>
    </TkRow>




    //  <div>
    //   <Button
    //     color="primary"
    //     outline
    //     onClick={handleButtonClick}
    //     style={{ marginRight: "10px" }}
    //   >
    //     Direct Call
    //   </Button>
    //   {showForm && (
    //     <Form onSubmit={handleFormSubmit}>
    //       <FormGroup>
    //         <Label for="exampleEmail">Email</Label>
    //         <Input
    //           type="email"
    //           name="email"
    //           id="exampleEmail"
    //           placeholder="Enter email"
    //         />
    //       </FormGroup>
    //       {/* Add more form fields as needed */}
    //       <Button color="primary" type="submit">
    //         Submit
    //       </Button>
    //     </Form>
    //   )}
    // </div>




    // <TkContainer>
    //   <Nav className="nav-tabs dropdown-tabs nav-tabs-custom mb-3">
    //     <NavItem>
    //       <NavLink
    //         href="#"
    //         className={classnames({
    //           active: activeTab === tabs.directCall,
    //         })}
    //         onClick={() => {
    //           toggleTab(tabs.directCall);
    //         }}
    //       >
    //         Direct Call
    //       </NavLink>
    //     </NavItem>
    //     <NavItem>
    //       <NavLink
    //         href="#"
    //         className={classnames({ active: activeTab === tabs.email })}
    //         onClick={() => {
    //           toggleTab(tabs.email);
    //         }}
    //       >
    //         Email
    //       </NavLink>
    //     </NavItem>
    //     <NavItem>
    //       <NavLink
    //         href="#"
    //         className={classnames({
    //           active: activeTab === tabs.socialMedia,
    //         })}
    //         onClick={() => {
    //           toggleTab(tabs.socialMedia);
    //         }}
    //       >
    //         Social Media
    //       </NavLink>
    //     </NavItem>
    //     <NavItem>
    //       <NavLink
    //         href="#"
    //         className={classnames({ active: activeTab === tabs.portals })}
    //         onClick={() => {
    //           toggleTab(tabs.portals);
    //         }}
    //       >
    //         Portals
    //       </NavLink>
    //     </NavItem>
    //     <NavItem>
    //       <NavLink
    //         href="#"
    //         className={classnames({
    //           active: activeTab === tabs.directMarketing,
    //         })}
    //         onClick={() => {
    //           toggleTab(tabs.directMarketing);
    //         }}
    //       >
    //         Direct Marketing
    //       </NavLink>
    //     </NavItem>
    //     <NavItem>
    //       <NavLink
    //         href="#"
    //         className={classnames({
    //           active: activeTab === tabs.leadAssigning,
    //         })}
    //         onClick={() => {
    //           toggleTab(tabs.leadAssigning);
    //         }}
    //       >
    //         Lead Assigning
    //       </NavLink>
    //     </NavItem>
    //     <NavItem>
    //       <NavLink
    //         href="#"
    //         className={classnames({
    //           active: activeTab === tabs.leadNurutring,
    //         })}
    //         onClick={() => {
    //           toggleTab(tabs.leadNurutring);
    //         }}
    //       >
    //         Lead Nurturing
    //       </NavLink>
    //     </NavItem>
    //   </Nav>
    //   <TabContent activeTab={activeTab}>
    //     <TabPane tabId={tabs.directCall}>
    //       <TkCardBody>
    //         <DirectCall toggleTab={toggleTab} tabs={tabs} />
    //       </TkCardBody>
    //     </TabPane>
    //     <TabPane tabId={tabs.email}>
    //       <TkCardBody>
    //         <LeadEmail toggleTab={toggleTab} tabs={tabs} />
    //       </TkCardBody>
    //     </TabPane>
    //     <TabPane tabId={tabs.socialMedia}>
    //       <TkCardBody>
    //         <SocialMedia toggleTab={toggleTab} tabs={tabs} />
    //       </TkCardBody>
    //     </TabPane>
    //     <TabPane tabId={tabs.portals}>
    //       <TkCardBody>
    //         <LeadPortals toggleTab={toggleTab} tabs={tabs} />
    //       </TkCardBody>
    //     </TabPane>
    //     <TabPane tabId={tabs.directMarketing}>
    //       <TkCardBody>
    //         <DirectMarketing toggleTab={toggleTab} tabs={tabs} />
    //       </TkCardBody>
    //     </TabPane>
    //     <TabPane tabId={tabs.leadAssigning}>
    //       <TkCardBody>
    //         <LeadAssigning toggleTab={toggleTab} tabs={tabs} />
    //       </TkCardBody>
    //     </TabPane>
    //     <TabPane tabId={tabs.leadNurutring}>
    //       <TkCardBody>
    //         <LeadNurturing />
    //       </TkCardBody>
    //     </TabPane>
    //   </TabContent>
    // </TkContainer>
  );
}

export default AddLead;
