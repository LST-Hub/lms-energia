import React, { useCallback, useEffect, useState } from "react";
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
  MaxEmailLength,
  MaxNameLength,
  MaxPhoneNumberLength,
  MinEmailLength,
  MinNameLength,
  bigInpuMaxLength,
  createdByNameTypes,
  smallInputMaxLength,
  urls,
} from "../../../src/utils/Constants";
import TkModal, { TkModalHeader } from "../TkModal";
import { useRouter } from "next/router";
import { TkCardBody, TkCardHeader } from "../../../src/components/TkCard";
import TkRow, { TkCol } from "../../../src/components/TkRow";
import TkSelect from "../../../src/components/forms/TkSelect";
import TkInput from "../../../src/components/forms/TkInput";
import { Controller, useForm } from "react-hook-form";
import TkButton from "../TkButton";
import TkDate from "../forms/TkDate";
import TkForm from "../forms/TkForm";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import TkContainer from "../TkContainer";
import TkIcon from "../TkIcon";
import ActivityPopup from "./ActivityPopup";
import FormErrorText from "../forms/ErrorText";
import { convertTimeToSec, convertToTimeFotTimeSheet } from "../../utils/time";

const tabs = {
  directCall: "primary",
  email: "email",
  socialMedia: "socialMedia",
  portals: "portals",
  directMarketing: "directMarketing",
  leadAssigning: "lead",
  leadNurutring: "nurturing",
};

const schema = Yup.object({
  createdBy: Yup.string()
    .min(
      MinNameLength,
      `Created By should have at least ${MinNameLength} character.`
    )
    .max(
      MaxNameLength,
      `Created By should have at most ${MaxNameLength} characters.`
    )
    .required("Created By is required"),

  name: Yup.string()
    .min(MinNameLength, `Name should have at least ${MinNameLength} character.`)
    .max(MaxNameLength, `Name should have at most ${MaxNameLength} characters.`)
    .required("Name is required"),

  mobileNo: Yup.string()
    .nullable()
    .required("Mobile Number is Required")
    .matches(/^[0-9+() -]*$/, "Mobile number must be number.")
    .max(
      MaxPhoneNumberLength,
      `Mobile number must be at most ${MaxPhoneNumberLength} numbers.`
    ),

  email: Yup.string()
    .nullable()
    .required("Email is Required")
    .email("Email must be valid.")
    .min(
      MinEmailLength,
      `Email should have at least ${MinEmailLength} characters.`
    )
    .max(
      MaxEmailLength,
      `Email should have at most ${MaxEmailLength} characters.`
    ),

  note: Yup.string().max(
    bigInpuMaxLength,
    `Note should have at most ${bigInpuMaxLength} characters.`
  ),

  companyName: Yup.string()
    .nullable()
    .max(
      smallInputMaxLength,
      `Company name should have at most ${smallInputMaxLength} characters.`
    ),

  contactNo: Yup.string()
    .nullable()
    .required("Contact Number is Required")
    .matches(/^[0-9+() -]*$/, "Contact number must be number.")
    .max(
      MaxPhoneNumberLength,
      `Contact number must be at most ${MaxPhoneNumberLength} numbers.`
    ),

  companyEmail: Yup.string()
    .nullable()
    .email("Company Email must be valid.")
    .min(
      MinEmailLength,
      `Company Email should have at least ${MinEmailLength} characters.`
    )
    .max(
      MaxEmailLength,
      `Company Email should have at most ${MaxEmailLength} characters.`
    ),

  companyAddress: Yup.string()
    .nullable()
    .max(
      smallInputMaxLength,
      `Company address should have at most ${smallInputMaxLength} characters.`
    ),

  projectName: Yup.string()
    .min(
      MinNameLength,
      `Project Name should have at least ${MinNameLength} character.`
    )
    .max(
      MaxNameLength,
      `Project Name should have at most ${MaxNameLength} characters.`
    ),

  duration: Yup.string()
    .matches(/^\d+(:[0-5][0-9]){0,2}$/, "duration cannot contain characters")
    .test(
      "duration",
      "Duration should be less than 24 hours",
      function (value) {
        if (convertTimeToSec(value) > 86400 || value > 24) {
          return false;
        }
        return true;
      }
    ),

  location: Yup.string()
    .min(
      MinNameLength,
      `Location should have at least ${MinNameLength} character.`
    )
    .max(
      MaxNameLength,
      `Location should have at most ${MaxNameLength} characters.`
    ),

  locationContactPerson: Yup.string()
    .min(
      MinNameLength,
      `Location contact person should have at least ${MinNameLength} character.`
    )
    .max(
      MaxNameLength,
      `Location contact person should have at most ${MaxNameLength} characters.`
    ),

  notes: Yup.string().max(
    bigInpuMaxLength,
    `Notes should have at most ${bigInpuMaxLength} characters.`
  ),

  leadValue: Yup.string()
    .nullable()
    .matches(/^[0-9]*([.:][0-9]+)?$/, "Lead Value must be a number")
    .min(0, "Lead Value must be greater than or equal to 0"),

  reason: Yup.string()
    .min(
      MinNameLength,
      `Reason should have at least ${MinNameLength} character.`
    )
    .max(
      MaxNameLength,
      `Reason should have at most ${MaxNameLength} characters.`
    ),
}).required();
function AddLead() {
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
  const router = useRouter();
  const [activityModal, setActivityModal] = useState(false);
  const [selectedButton, setSelectedButton] = useState("directCall");
  const [isLead, setIsLead] = useState(false);
  const [rSelected, setRSelected] = useState(0);
  const [activeTab, setActiveTab] = useState(tabs.directCall);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [requirementDetailsSections, setRequirementDetailsSections] = useState([
    { id: 1, isVisible: true },
  ]);

  const leadActivityToggle = useCallback(() => {
    if (activityModal) {
      setActivityModal(false);
    } else {
      setActivityModal(true);
    }
  }, [activityModal]);

  useEffect(() => {
    setIsLead(true);
  }, []);

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

  // const handleButtonClick = () => {
  //   setShowForm(true);
  // };

  // const handleButtonClick = (button) => {
  //   setSelectedButton(button);
  //   setShowForm(true);
  //   setButtonsDisabled(true);
  // };

  const handleButtonClick = (button) => {
    setSelectedButton(button);
    setShowForm(true);
    setButtonsDisabled(true);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setShowForm(false);
  };

  // const toggleTab = (tab) => {
  //   if (activeTab !== tab) {
  //     setActiveTab(tab);
  //     router.push(`${urls.lead}/add?tab=${tab}`, undefined, {
  //       scroll: false,
  //     });
  //   }
  // };

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      router.push(
        `${urls.lead}/add?tab=${tab}&button=${selectedButton}`,
        undefined,
        {
          scroll: false,
        }
      );
    }
  };
  return (
    <>
      {isLead && (
        <div>
          <TkRow className="mt-3">
            <TkCol>
              <TkCardHeader tag="h5" className="mb-4">
                <h4>Lead Types</h4>
              </TkCardHeader>
              <div>
                {/* <Button
                  color="primary"
                  outline
                  style={{ marginRight: "20px", marginBottom: "20px" }}
                  active={selectedButton === "directCall"}
                  onClick={() => handleButtonClick("directCall")}
                >
                  Direct Call
                </Button>
                <Button
                  color="primary"
                  outline
                  style={{ marginRight: "20px", marginBottom: "20px" }}
                  active={selectedButton === "email"}
                  onClick={() => handleButtonClick("email")}
                >
                  Email
                </Button>

                <Button
                  color="primary"
                  outline
                  style={{ marginRight: "20px", marginBottom: "20px" }}
                  active={selectedButton === "socialMedia"}
                  onClick={() => handleButtonClick("socialMedia")}
                >
                  SocialMedia
                </Button>

                <Button
                  color="primary"
                  outline
                  style={{ marginRight: "20px", marginBottom: "20px" }}
                  active={selectedButton === "portals"}
                  onClick={() => handleButtonClick("portals")}
                >
                  Portals
                </Button>

                <Button
                  color="primary"
                  outline
                  style={{ marginRight: "20px", marginBottom: "20px" }}
                  active={selectedButton === "directMarketing"}
                  onClick={() => handleButtonClick("directMarketing")}
                >
                  Direct Marketing
                </Button> */}

                <Button
                  color="primary"
                  outline
                  style={{ marginRight: "20px", marginBottom: "20px" }}
                  active={selectedButton === "directCall"}
                  onClick={() => handleButtonClick("directCall")}
                  disabled={buttonsDisabled} // Disable the button if buttonsDisabled is true
                >
                  Direct Call
                </Button>
                <Button
                  color="primary"
                  outline
                  style={{ marginRight: "20px", marginBottom: "20px" }}
                  active={selectedButton === "email"}
                  onClick={() => handleButtonClick("email")}
                  disabled={buttonsDisabled} // Disable the button if buttonsDisabled is true
                >
                  Email
                </Button>

                <Button
                  color="primary"
                  outline
                  style={{ marginRight: "20px", marginBottom: "20px" }}
                  active={selectedButton === "socialMedia"}
                  onClick={() => handleButtonClick("socialMedia")}
                  disabled={buttonsDisabled} // Disable the button if buttonsDisabled is true
                >
                  SocialMedia
                </Button>

                <Button
                  color="primary"
                  outline
                  style={{ marginRight: "20px", marginBottom: "20px" }}
                  active={selectedButton === "portals"}
                  onClick={() => handleButtonClick("portals")}
                  disabled={buttonsDisabled} // Disable the button if buttonsDisabled is true
                >
                  Portals
                </Button>

                <Button
                  color="primary"
                  outline
                  style={{ marginRight: "20px", marginBottom: "20px" }}
                  active={selectedButton === "directMarketing"}
                  onClick={() => handleButtonClick("directMarketing")}
                  disabled={buttonsDisabled} // Disable the button if buttonsDisabled is true
                >
                  Direct Marketing
                </Button>
                {showForm && (
                  <Form onSubmit={handleFormSubmit}>
                    <TkContainer>
                      <Nav className="nav-tabs dropdown-tabs nav-tabs-custom mb-3">
                        <NavItem>
                          <NavLink
                            href="#"
                            className={classnames({
                              active:
                                activeTab === tabs.directCall &&
                                selectedButton === "directCall",
                            })}
                            onClick={() => toggleTab(tabs.directCall)}
                          >
                            Primary Information
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            href="#"
                            className={classnames({
                              active:
                                activeTab === tabs.leadAssigning &&
                                selectedButton === "directCall",
                            })}
                            onClick={() => toggleTab(tabs.leadAssigning)}
                          >
                            Lead Assigning
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            href="#"
                            className={classnames({
                              active:
                                activeTab === tabs.leadNurutring &&
                                selectedButton === "directCall",
                            })}
                            onClick={() => toggleTab(tabs.leadNurutring)}
                          >
                            Lead Nurturing
                          </NavLink>
                        </NavItem>
                      </Nav>
                    </TkContainer>

                    {selectedButton === "directCall" && (
                      <div>
                        {activeTab === "primary" && (
                          <div>
                            {/* <TkRow className="mt-3"> */}
                            <TkRow className="mt-4 mb-5">
                              <TkCol>
                                <div>
                                  <TkRow className="g-3">
                                    <TkCol lg={4}>
                                      <Controller
                                        name="leadSource"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="leadSource"
                                            name="leadSource"
                                            labelName="Lead Source"
                                            placeholder="Select Source"
                                            requiredStarOnLabel="true"
                                            options={[
                                              { value: "1", label: "Refferal" },
                                              { value: "2", label: "New" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.leadSource && (
                                        <FormErrorText>
                                          {errors.leadSource.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                    {/* <TkCol lg={4}>
                                  <TkSelect
                                    id="createdBy"
                                    name="createdBy"
                                    labelName="Created By"
                                    placeholder="Select Created By"
                                    requiredStarOnLabel="true"
                                    options={createdByNameTypes}
                                  />
                                </TkCol> */}
                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("createdBy")}
                                        id="createdBy"
                                        type="text"
                                        labelName="Created By"
                                        placeholder="Enter Created By"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.createdBy && (
                                        <FormErrorText>
                                          {errors.createdBy.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                    <TkCol lg={4}>
                                      <Controller
                                        name="createdDate"
                                        control={control}
                                        render={({ field }) => (
                                          <TkDate
                                            {...field}
                                            labelName="Created Date"
                                            id={"createdDate"}
                                            placeholder="Enter Created Date"
                                            options={{
                                              altInput: true,
                                              dateFormat: "d M, Y",
                                            }}
                                            onChange={(e) => {
                                              field.onChange(e);
                                              setSelectedDate(e);
                                              setAllDurations({});
                                            }}
                                            disabled={true}
                                            requiredStarOnLabel={true}
                                          />
                                        )}
                                      />
                                      {errors.createdDate && (
                                        <FormErrorText>
                                          {errors.createdDate.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                  </TkRow>
                                </div>
                              </TkCol>
                            </TkRow>

                            <TkRow className="mt-3">
                              <TkCol>
                                <TkCardHeader tag="h5" className="mb-4">
                                  <h4>Personal Details</h4>
                                </TkCardHeader>
                                <div>
                                  <TkRow className="g-3">
                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("name")}
                                        id="name"
                                        type="text"
                                        labelName="Name"
                                        placeholder="Enter Name"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.name && (
                                        <FormErrorText>
                                          {errors.name.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("mobileNo")}
                                        id="mobileNo"
                                        name="mobileNo"
                                        type="text"
                                        labelName="Phone No"
                                        placeholder="Enter Phone No"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.mobileNo && (
                                        <FormErrorText>
                                          {errors.mobileNo.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("email")}
                                        id="email"
                                        name="email"
                                        type="text"
                                        labelName="Email"
                                        placeholder="Enter Email"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.email && (
                                        <FormErrorText>
                                          {errors.email.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="enquiryBy"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="enquiryBy"
                                            name="enquiryBy"
                                            labelName="Enquiry By"
                                            placeholder="Enquiry By"
                                            requiredStarOnLabel="true"
                                            options={[
                                              { value: "1", label: "Direct" },
                                              {
                                                value: "2",
                                                label: "Consultant",
                                              },
                                              { value: "3", label: "Other" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.enquiryBy && (
                                        <FormErrorText>
                                          {errors.enquiryBy.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                    <TkCol lg={8}>
                                      <TkInput
                                        {...register("note")}
                                        id="note"
                                        type="text"
                                        labelName="Note"
                                        placeholder="Enter Note"
                                      />
                                      {errors.note && (
                                        <FormErrorText>
                                          {errors.note.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                  </TkRow>
                                </div>
                              </TkCol>
                            </TkRow>

                            <TkRow className="mt-5">
                              <TkCol>
                                <TkCardHeader tag="h5" className="mb-4">
                                  <h4>Company Details</h4>
                                </TkCardHeader>
                                <div>
                                  <TkRow className="g-3">
                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("companyName")}
                                        id="companyName"
                                        type="text"
                                        labelName="Company Name"
                                        placeholder="Enter Company Name"
                                      />
                                      {errors.companyName && (
                                        <FormErrorText>
                                          {errors.companyName.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("contactNo")}
                                        id="contactNo"
                                        name="contactNo"
                                        type="text"
                                        labelName="Contact No"
                                        placeholder="Enter Contact No"
                                      />
                                      {errors.contactNo && (
                                        <FormErrorText>
                                          {errors.contactNo.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("companyEmail")}
                                        id="companyEmail"
                                        name="companyEmail"
                                        type="text"
                                        labelName="Email"
                                        placeholder="Enter Email"
                                      />
                                      {errors.companyEmail && (
                                        <FormErrorText>
                                          {errors.companyEmail.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("companyAddress")}
                                        id="companyAddress"
                                        name="companyAddress"
                                        type="text"
                                        labelName="Address"
                                        placeholder="Enter Address"
                                      />
                                      {errors.companyAddress && (
                                        <FormErrorText>
                                          {errors.companyAddress.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("region")}
                                        id="region"
                                        name="region"
                                        type="text"
                                        labelName="Region"
                                        placeholder="Enter Region"
                                      />
                                      {errors.region && (
                                        <FormErrorText>
                                          {errors.region.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("crno")}
                                        id="crno"
                                        name="crno"
                                        type="text"
                                        labelName="CR No"
                                        placeholder="Enter CR No"
                                      />
                                      {errors.crno && (
                                        <FormErrorText>
                                          {errors.crno.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("vatNo")}
                                        id="vatNo"
                                        name="vatNo"
                                        type="text"
                                        labelName="VAT No"
                                        placeholder="Enter VAT No"
                                      />
                                      {errors.vatNo && (
                                        <FormErrorText>
                                          {errors.vatNo.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                    <TkCol lg={4}>
                                      <Controller
                                        name="clientType"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="clientType"
                                            name="clientType"
                                            labelName="Client Type"
                                            placeholder="Select Client Type"
                                            options={[
                                              { value: "1", label: "Gov" },
                                              { value: "2", label: "Semi Gov" },
                                              { value: "3", label: "Privet" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.clientType && (
                                        <FormErrorText>
                                          {errors.clientType.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                    <TkCol lg={4}>
                                      <Controller
                                        name="segment"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="segment"
                                            name="segment"
                                            labelName="Segment"
                                            placeholder="Select Segment"
                                            options={[
                                              { value: "1", label: "O&G" },
                                              {
                                                value: "2",
                                                label: "Construction",
                                              },
                                              { value: "3", label: "Industry" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.segment && (
                                        <FormErrorText>
                                          {errors.segment.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                  </TkRow>
                                </div>
                              </TkCol>
                            </TkRow>

                            <TkRow className="mt-5">
                              <TkCol>
                                <TkCardHeader tag="h5" className="mb-3">
                                  <h4>Requirement Details</h4>
                                </TkCardHeader>
                              </TkCol>
                            </TkRow>
                            {requirementDetailsSections.map((section) => (
                              <div key={section.id}>
                                {section.isVisible && (
                                  <TkRow className=" mb-4">
                                    <TkCol>
                                      <div>
                                        <>
                                          <TkRow className="g-3">
                                            <TkCol lg={4}>
                                              <Controller
                                                name="division"
                                                control={control}
                                                render={({ field }) => (
                                                  <TkSelect
                                                    {...field}
                                                    id="division"
                                                    name="division"
                                                    labelName="Division"
                                                    placeholder="Select Division"
                                                    options={[
                                                      {
                                                        value: "1",
                                                        label: "Energy",
                                                      },
                                                      {
                                                        value: "2",
                                                        label: "Cooling",
                                                      },
                                                      {
                                                        value: "3",
                                                        label: "Welding",
                                                      },
                                                    ]}
                                                  />
                                                )}
                                              />
                                              {errors.division && (
                                                <FormErrorText>
                                                  {errors.division.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <Controller
                                                name="requirement"
                                                control={control}
                                                render={({ field }) => (
                                                  <TkSelect
                                                    {...field}
                                                    id="requirement"
                                                    name="requirement"
                                                    labelName="Requirement"
                                                    placeholder="Select Requirement"
                                                    options={[]}
                                                  />
                                                )}
                                              />
                                              {errors.requirement && (
                                                <FormErrorText>
                                                  {errors.requirement.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register("projectName")}
                                                id="projectName"
                                                name="projectName"
                                                type="text"
                                                labelName="Project Name"
                                                placeholder="Enter Project Name"
                                              />
                                              {errors.projectName && (
                                                <FormErrorText>
                                                  {errors.projectName.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(`duration`, {
                                                  validate: (value) => {
                                                    if (
                                                      value &&
                                                      !/^[0-9]*([.:][0-9]+)?$/.test(
                                                        value
                                                      )
                                                    ) {
                                                      return "Invalid duration";
                                                    }
                                                    if (
                                                      convertTimeToSec(value) <=
                                                        86400 ||
                                                      value > 24
                                                    ) {
                                                      return "Duration should be less than 24 hours";
                                                    }
                                                  },
                                                })}
                                                id="duration"
                                                name="duration"
                                                type="text"
                                                placeholder="Enter Duration"
                                                labelName="Duration"
                                                onBlur={(e) => {
                                                  setValue(
                                                    `duration`,
                                                    convertToTimeFotTimeSheet(
                                                      e.target.value
                                                    )
                                                  );
                                                }}
                                              />
                                              {errors.duration && (
                                                <FormErrorText>
                                                  {errors.duration.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register("unitOfMeasure")}
                                                id="unitOfMeasure"
                                                name="unitOfMeasure"
                                                type="text"
                                                labelName="Unit Of Measure"
                                                placeholder="Enter Unit Of Measure"
                                              />
                                              {errors.unitOfMeasure && (
                                                <FormErrorText>
                                                  {errors.unitOfMeasure.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <Controller
                                                name="delivery"
                                                control={control}
                                                render={({ field }) => (
                                                  <TkDate
                                                    {...field}
                                                    id="delivery"
                                                    name="delivery"
                                                    type="text"
                                                    labelName="Expected Delivery Date"
                                                    placeholder="Enter Expected Delivery Date"
                                                  />
                                                )}
                                              />
                                              {errors.delivery?.message ? (
                                                <FormErrorText>
                                                  {errors.delivery?.message}
                                                </FormErrorText>
                                              ) : null}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register("location")}
                                                id="location"
                                                name="location"
                                                type="text"
                                                labelName="Location"
                                                placeholder="Enter Location"
                                              />
                                              {errors.location && (
                                                <FormErrorText>
                                                  {errors.location.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "locationContactPerson"
                                                )}
                                                id="locationContactPerson"
                                                name="locationContactPerson"
                                                type="text"
                                                labelName="Location Contact Person"
                                                placeholder="Enter Location Contact Person"
                                              />
                                              {errors.locationContactPerson && (
                                                <FormErrorText>
                                                  {
                                                    errors.locationContactPerson
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "contactPersonName"
                                                )}
                                                id="contactPersonName"
                                                name="contactPersonName"
                                                type="text"
                                                labelName="Contact Person Name"
                                                placeholder="Enter Contact Person Name"
                                              />
                                              {errors.contactPersonName && (
                                                <FormErrorText>
                                                  {
                                                    errors.contactPersonName
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "contactPersonNumber"
                                                )}
                                                id="contactPersonNumber"
                                                name="contactPersonNumber"
                                                type="text"
                                                labelName="Contact Person Number"
                                                placeholder="Enter Contact Person Number"
                                              />
                                              {errors.contactPersonNumber && (
                                                <FormErrorText>
                                                  {
                                                    errors.contactPersonNumber
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "contactPersonEmail"
                                                )}
                                                id="contactPersonEmail"
                                                name="contactPersonEmail"
                                                type="text"
                                                labelName="Contact Person Email"
                                                placeholder="Enter Contact Person Email"
                                              />
                                              {errors.contactPersonEmail && (
                                                <FormErrorText>
                                                  {
                                                    errors.contactPersonEmail
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "contactPersonDesignation"
                                                )}
                                                id="contactPersonDesignation"
                                                name="contactPersonDesignation"
                                                type="text"
                                                labelName="Contact Person Designation"
                                                placeholder="Enter Contact Person Designation"
                                              />
                                              {errors.contactPersonDesignation && (
                                                <FormErrorText>
                                                  {
                                                    errors
                                                      .contactPersonDesignation
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={12}>
                                              <TkInput
                                                {...register("notes")}
                                                id="note"
                                                name="note"
                                                type="textarea"
                                                labelName="Notes"
                                                placeholder="Enter Note"
                                              />
                                              {errors.notes && (
                                                <FormErrorText>
                                                  {errors.notes.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>
                                          </TkRow>
                                        </>
                                      </div>

                                      <TkRow className="mt-3">
                                        <TkCol>
                                          <TkButton
                                            type="button"
                                            onClick={() =>
                                              handleToggleVisibility(section.id)
                                            }
                                            className="bg-transparent border-0 ps-0 ms-0 text-center"
                                          >
                                            {section.isVisible ? (
                                              <span className="ms-auto badge p-1 rounded-circle badge-soft-danger fs-4 me-3">
                                                <TkIcon className="ri-delete-bin-6-line"></TkIcon>
                                              </span>
                                            ) : (
                                              <TkIcon className="ri-add-line"></TkIcon>
                                            )}
                                          </TkButton>
                                        </TkCol>
                                      </TkRow>
                                    </TkCol>
                                  </TkRow>
                                )}
                              </div>
                            ))}

                            <TkRow className="justify-content-center">
                              <TkCol lg={2} className="text-center">
                                <TkButton
                                  type="button"
                                  color="primary"
                                  onClick={handleAddSection}
                                >
                                  Add
                                </TkButton>
                              </TkCol>
                            </TkRow>
                            {/* <TkCol
                              md={1}
                              lg={5}
                              className="text-center text-md-end"
                            >
                              <TkButton
                                type="button"
                                className="bg-transparent border-0 ps-0 ms-0 text-center"
                                onClick={handleAddSection}
                              >
                                <span className="add-timsheet-btn badge p-1 rounded-circle badge-soft-dark fs-4">
                                  <TkIcon className="ri-add-line"></TkIcon>
                                </span>
                              </TkButton>
                            </TkCol> */}

                            <div className="d-flex mt-4 space-childern">
                              <div className="ms-auto" id="update-form-btns">
                                <TkButton
                                  type="button"
                                  color="primary"
                                  onClick={() => {
                                    toggleTab(tabs.leadAssigning);
                                  }}
                                >
                                  Next
                                </TkButton>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "lead" && (
                          <div>
                            <TkRow className="g-3">
                              <TkCol lg={4}>
                                <Controller
                                  name="region"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="region"
                                      name="region"
                                      labelName="Region"
                                      placeholder="Select Region"
                                      options={[
                                        { value: "1", label: "Region 1" },
                                        { value: "2", label: "Region 2" },
                                        { value: "3", label: "Region 3" },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.region && (
                                  <FormErrorText>
                                    {errors.region.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <Controller
                                  name="salesTeam"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="salesTeam"
                                      name="salesTeam"
                                      labelName="Sales Team Name"
                                      placeholder="Select Sales Team"
                                      options={[
                                        {
                                          value: "1",
                                          label: "Sales Team 1",
                                        },
                                        {
                                          value: "2",
                                          label: "Sales Team 2",
                                        },
                                        {
                                          value: "3",
                                          label: "Sales Team 3",
                                        },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.salesTeam && (
                                  <FormErrorText>
                                    {errors.salesTeam.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <div className="d-flex mt-4 space-childern">
                                <div className="ms-auto" id="update-form-btns">
                                  <TkButton
                                    type="button"
                                    color="primary"
                                    onClick={() => {
                                      toggleTab(tabs.leadNurutring);
                                    }}
                                  >
                                    Next
                                  </TkButton>
                                </div>
                              </div>
                            </TkRow>
                          </div>
                        )}

                        {activeTab === "nurturing" && (
                          <div>
                            <TkRow className="g-3">
                              <TkCol lg={4}>
                                <Controller
                                  name="primaryAction"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="primaryAction"
                                      name="primaryAction"
                                      labelName="Primary Action"
                                      placeholder="Select Primary Action"
                                      options={[
                                        { value: "1", label: "Replied" },
                                        { value: "2", label: "Call" },
                                        {
                                          value: "3",
                                          label: "Meeting appointment fixed",
                                        },
                                        { value: "4", label: "Meeting done" },
                                        {
                                          value: "5",
                                          label: "Waiting for the reply",
                                        },
                                        {
                                          value: "6",
                                          label: "Meeting postponed",
                                        },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.primaryAction && (
                                  <FormErrorText>
                                    {errors.primaryAction.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <Controller
                                  name="date"
                                  control={control}
                                  render={({ field }) => (
                                    <TkDate
                                      {...field}
                                      labelName="Date"
                                      id={"date"}
                                      placeholder="Enter Date"
                                      options={{
                                        altInput: true,
                                        dateFormat: "d M, Y",
                                      }}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        setSelectedDate(e);
                                        setAllDurations({});
                                      }}
                                      disabled={true}
                                      requiredStarOnLabel={true}
                                    />
                                  )}
                                />
                                {errors.date && (
                                  <FormErrorText>
                                    {errors.date.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <TkInput
                                  {...register(`time`, {
                                    required: "Time is required",
                                    validate: (value) => {
                                      if (
                                        value &&
                                        !/^[0-9]*([.:][0-9]+)?$/.test(value)
                                      ) {
                                        return "Invalid Time";
                                      }
                                      if (
                                        convertTimeToSec(value) > 86400 ||
                                        value > 24
                                      ) {
                                        return "Time should be less than 24 hours";
                                      }
                                    },
                                  })}
                                  onBlur={(e) => {
                                    setValue(
                                      `time`,
                                      convertToTimeFotTimeSheet(e.target.value)
                                    );
                                  }}
                                  labelName="Time (HH:MM)"
                                  id={"time"}
                                  name="time"
                                  type="text"
                                  placeholder="Enter Time"
                                  requiredStarOnLabel={true}
                                />
                                {errors.time && (
                                  <FormErrorText>
                                    {errors.time.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <TkInput
                                  {...register("leadValue")}
                                  id="leadValue"
                                  name="leadValue"
                                  labelName="Lead Value"
                                  type="text"
                                  placeholder="Enter Lead Value"
                                />
                                {errors.leadValue && (
                                  <FormErrorText>
                                    {errors.leadValue.message}
                                  </FormErrorText>
                                )}
                              </TkCol>
                              <TkCol lg={4}>
                                <Controller
                                  name="leadUpdate"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="leadUpdate"
                                      name="leadUpdate"
                                      labelName="Lead Update"
                                      placeholder="Select Lead Update"
                                      options={[
                                        {
                                          value: "1",
                                          label: "Qualified",
                                        },
                                        {
                                          value: "2",
                                          label: "Unqualified",
                                        },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.leadUpdate && (
                                  <FormErrorText>
                                    {errors.leadUpdate.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <TkInput
                                  {...register("reason")}
                                  id="reason"
                                  name="reason"
                                  labelName="Reason if unqualified lead"
                                  type="text"
                                  placeholder="Enter Reason"
                                />
                                {errors.reason && (
                                  <FormErrorText>
                                    {errors.reason.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <Controller
                                  name="prospectNurturing"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="prospectNurturing"
                                      name="prospectNurturing"
                                      labelName="Prospect Nurturing"
                                      placeholder="Select Prospect Nurturing"
                                      options={[
                                        {
                                          value: "1",
                                          label: "Quotation Issued",
                                        },
                                        {
                                          value: "2",
                                          label: "Waiting fro the approval",
                                        },
                                        {
                                          value: "3",
                                          label: "Waiting for document",
                                        },
                                        {
                                          value: "3",
                                          label: "Waiting for the PO",
                                        },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.prospectNurturing && (
                                  <FormErrorText>
                                    {errors.prospectNurturing.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <TkButton
                                  type="button"
                                  color="primary"
                                  className="mt-4"
                                  onClick={leadActivityToggle}
                                >
                                  Add Activity
                                </TkButton>
                              </TkCol>

                              <div className="d-flex mt-4 space-childern">
                                <div className="ms-auto" id="update-form-btns">
                                  <TkButton type="button" color="primary">
                                    Submit
                                  </TkButton>
                                </div>
                              </div>
                            </TkRow>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedButton === "email" && (
                      <div>
                        {activeTab === "primary" && (
                          <div>
                            <TkRow className="mt-4 mb-5">
                              <TkCol>
                                <div>
                                  <TkRow className="g-3">
                                    <TkCol lg={4}>
                                      <Controller
                                        name="leadSource"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="leadSource"
                                            name="leadSource"
                                            labelName="Lead Source"
                                            placeholder="Select Source"
                                            requiredStarOnLabel="true"
                                            options={[
                                              { value: "1", label: "Refferal" },
                                              { value: "2", label: "New" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.leadSource && (
                                        <FormErrorText>
                                          {errors.leadSource.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("createdBy")}
                                        id="createdBy"
                                        type="text"
                                        labelName="Created By"
                                        placeholder="Enter Created By"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.createdBy && (
                                        <FormErrorText>
                                          {errors.createdBy.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="createdDate"
                                        control={control}
                                        render={({ field }) => (
                                          <TkDate
                                            {...field}
                                            labelName="Created Date"
                                            id={"createdDate"}
                                            placeholder="Enter Created Date"
                                            options={{
                                              altInput: true,
                                              dateFormat: "d M, Y",
                                            }}
                                            onChange={(e) => {
                                              field.onChange(e);
                                              setSelectedDate(e);
                                              setAllDurations({});
                                            }}
                                            disabled={true}
                                            requiredStarOnLabel={true}
                                          />
                                        )}
                                      />
                                      {errors.createdDate && (
                                        <FormErrorText>
                                          {errors.createdDate.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                  </TkRow>
                                </div>
                              </TkCol>
                            </TkRow>

                            <TkRow className="mt-3">
                              <TkCol>
                                <TkCardHeader tag="h5" className="mb-4">
                                  <h4>Personal Details</h4>
                                </TkCardHeader>
                                <div>
                                  <TkRow className="g-3">
                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("name")}
                                        id="name"
                                        type="text"
                                        labelName="Name"
                                        placeholder="Enter Name"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.name && (
                                        <FormErrorText>
                                          {errors.name.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("mobileNo")}
                                        id="mobileNo"
                                        name="mobileNo"
                                        type="text"
                                        labelName="Phone No"
                                        placeholder="Enter Phone No"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.mobileNo && (
                                        <FormErrorText>
                                          {errors.mobileNo.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("email")}
                                        id="email"
                                        name="email"
                                        type="text"
                                        labelName="Email"
                                        placeholder="Enter Email"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.email && (
                                        <FormErrorText>
                                          {errors.email.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    {/* <TkCol lg={4}>
                                      <TkSelect
                                        id="createdBy"
                                        name="createdBy"
                                        labelName="Created By"
                                        placeholder="Select Created By"
                                        requiredStarOnLabel="true"
                                        options={createdByNameTypes}
                                      />
                                    </TkCol> */}
                                    {/* </TkRow>
                                  <TkRow className="mt-3 mb-4"> */}
                                    <TkCol lg={4}>
                                      <Controller
                                        name="enquiryBy"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="enquiryBy"
                                            name="enquiryBy"
                                            labelName="Enquiry By"
                                            placeholder="Enquiry By"
                                            requiredStarOnLabel="true"
                                            options={[
                                              { value: "1", label: "Direct" },
                                              {
                                                value: "2",
                                                label: "Consultant",
                                              },
                                              { value: "3", label: "Other" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.enquiryBy && (
                                        <FormErrorText>
                                          {errors.enquiryBy.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={8}>
                                      <TkInput
                                        {...register("note")}
                                        id="note"
                                        type="text"
                                        labelName="Note"
                                        placeholder="Enter Note"
                                      />
                                      {errors.note && (
                                        <FormErrorText>
                                          {errors.note.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                  </TkRow>
                                </div>
                              </TkCol>
                            </TkRow>

                            <TkRow className="mt-5">
                              <TkCol>
                                <TkCardHeader tag="h5" className="mb-4">
                                  <h4>Company Details</h4>
                                </TkCardHeader>
                                <div>
                                  <TkRow className="g-3">
                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("companyName")}
                                        id="companyName"
                                        type="text"
                                        labelName="Company Name"
                                        placeholder="Enter Company Name"
                                      />
                                      {errors.companyName && (
                                        <FormErrorText>
                                          {errors.companyName.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("contactNo")}
                                        id="contactNo"
                                        name="contactNo"
                                        type="text"
                                        labelName="Contact No"
                                        placeholder="Enter Contact No"
                                      />
                                      {errors.contactNo && (
                                        <FormErrorText>
                                          {errors.contactNo.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("companyEmail")}
                                        id="companyEmail"
                                        name="companyEmail"
                                        type="text"
                                        labelName="Email"
                                        placeholder="Enter Email"
                                      />
                                      {errors.companyEmail && (
                                        <FormErrorText>
                                          {errors.companyEmail.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("companyAddress")}
                                        id="companyAddress"
                                        name="companyAddress"
                                        type="text"
                                        labelName="Address"
                                        placeholder="Enter Address"
                                      />
                                      {errors.companyAddress && (
                                        <FormErrorText>
                                          {errors.companyAddress.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("region")}
                                        id="region"
                                        name="region"
                                        type="text"
                                        labelName="Region"
                                        placeholder="Enter Region"
                                      />
                                      {errors.region && (
                                        <FormErrorText>
                                          {errors.region.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("crno")}
                                        id="crno"
                                        name="crno"
                                        type="text"
                                        labelName="CR No"
                                        placeholder="Enter CR No"
                                      />
                                      {errors.crno && (
                                        <FormErrorText>
                                          {errors.crno.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("vatNo")}
                                        id="vatNo"
                                        name="vatNo"
                                        type="text"
                                        labelName="VAT No"
                                        placeholder="Enter VAT No"
                                      />
                                      {errors.vatNo && (
                                        <FormErrorText>
                                          {errors.vatNo.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="clientType"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="clientType"
                                            name="clientType"
                                            labelName="Client Type"
                                            placeholder="Select Client Type"
                                            options={[
                                              { value: "1", label: "Gov" },
                                              { value: "2", label: "Semi Gov" },
                                              { value: "3", label: "Privet" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.clientType && (
                                        <FormErrorText>
                                          {errors.clientType.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="segment"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="segment"
                                            name="segment"
                                            labelName="Segment"
                                            placeholder="Select Segment"
                                            options={[
                                              { value: "1", label: "O&G" },
                                              {
                                                value: "2",
                                                label: "Construction",
                                              },
                                              { value: "3", label: "Industry" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.segment && (
                                        <FormErrorText>
                                          {errors.segment.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                  </TkRow>
                                </div>
                              </TkCol>
                            </TkRow>

                            <TkRow className="mt-5">
                              <TkCol>
                                <TkCardHeader tag="h5" className="mb-3">
                                  <h4>Requirement Details</h4>
                                </TkCardHeader>
                              </TkCol>
                            </TkRow>
                            {requirementDetailsSections.map((section) => (
                              <div key={section.id}>
                                {section.isVisible && (
                                  <TkRow className=" mb-4">
                                    <TkCol>
                                      <div>
                                        <>
                                          <TkRow className="g-3">
                                            <TkCol lg={4}>
                                              <Controller
                                                name="division"
                                                control={control}
                                                render={({ field }) => (
                                                  <TkSelect
                                                    {...field}
                                                    id="division"
                                                    name="division"
                                                    labelName="Division"
                                                    placeholder="Select Division"
                                                    options={[
                                                      {
                                                        value: "1",
                                                        label: "Energy",
                                                      },
                                                      {
                                                        value: "2",
                                                        label: "Cooling",
                                                      },
                                                      {
                                                        value: "3",
                                                        label: "Welding",
                                                      },
                                                    ]}
                                                  />
                                                )}
                                              />
                                              {errors.division && (
                                                <FormErrorText>
                                                  {errors.division.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <Controller
                                                name="requirement"
                                                control={control}
                                                render={({ field }) => (
                                                  <TkSelect
                                                    {...field}
                                                    id="requirement"
                                                    name="requirement"
                                                    labelName="Requirement"
                                                    placeholder="Select Requirement"
                                                    options={[]}
                                                  />
                                                )}
                                              />
                                              {errors.requirement && (
                                                <FormErrorText>
                                                  {errors.requirement.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register("projectName")}
                                                id="projectName"
                                                name="projectName"
                                                type="text"
                                                labelName="Project Name"
                                                placeholder="Enter Project Name"
                                              />
                                              {errors.projectName && (
                                                <FormErrorText>
                                                  {errors.projectName.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(`duration`, {
                                                  validate: (value) => {
                                                    if (
                                                      value &&
                                                      !/^[0-9]*([.:][0-9]+)?$/.test(
                                                        value
                                                      )
                                                    ) {
                                                      return "Invalid duration";
                                                    }
                                                    if (
                                                      convertTimeToSec(value) <=
                                                        86400 ||
                                                      value > 24
                                                    ) {
                                                      return "Duration should be less than 24 hours";
                                                    }
                                                  },
                                                })}
                                                id="duration"
                                                name="duration"
                                                type="text"
                                                placeholder="Enter Duration"
                                                labelName="Duration"
                                                onBlur={(e) => {
                                                  setValue(
                                                    `duration`,
                                                    convertToTimeFotTimeSheet(
                                                      e.target.value
                                                    )
                                                  );
                                                }}
                                              />
                                              {errors.duration && (
                                                <FormErrorText>
                                                  {errors.duration.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register("unitOfMeasure")}
                                                id="unitOfMeasure"
                                                name="unitOfMeasure"
                                                type="text"
                                                labelName="Unit Of Measure"
                                                placeholder="Enter Unit Of Measure"
                                              />
                                              {errors.unitOfMeasure && (
                                                <FormErrorText>
                                                  {errors.unitOfMeasure.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <Controller
                                                name="delivery"
                                                control={control}
                                                render={({ field }) => (
                                                  <TkDate
                                                    {...field}
                                                    id="delivery"
                                                    name="delivery"
                                                    type="text"
                                                    labelName="Expected Delivery Date"
                                                    placeholder="Enter Expected Delivery Date"
                                                  />
                                                )}
                                              />
                                              {errors.delivery?.message ? (
                                                <FormErrorText>
                                                  {errors.delivery?.message}
                                                </FormErrorText>
                                              ) : null}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register("location")}
                                                id="location"
                                                name="location"
                                                type="text"
                                                labelName="Location"
                                                placeholder="Enter Location"
                                              />
                                              {errors.location && (
                                                <FormErrorText>
                                                  {errors.location.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "locationContactPerson"
                                                )}
                                                id="locationContactPerson"
                                                name="locationContactPerson"
                                                type="text"
                                                labelName="Location Contact Person"
                                                placeholder="Enter Location Contact Person"
                                              />
                                              {errors.locationContactPerson && (
                                                <FormErrorText>
                                                  {
                                                    errors.locationContactPerson
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "contactPersonName"
                                                )}
                                                id="contactPersonName"
                                                name="contactPersonName"
                                                type="text"
                                                labelName="Contact Person Name"
                                                placeholder="Enter Contact Person Name"
                                              />
                                              {errors.contactPersonName && (
                                                <FormErrorText>
                                                  {
                                                    errors.contactPersonName
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "contactPersonNumber"
                                                )}
                                                id="contactPersonNumber"
                                                name="contactPersonNumber"
                                                type="text"
                                                labelName="Contact Person Number"
                                                placeholder="Enter Contact Person Number"
                                              />
                                              {errors.contactPersonNumber && (
                                                <FormErrorText>
                                                  {
                                                    errors.contactPersonNumber
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "contactPersonEmail"
                                                )}
                                                id="contactPersonEmail"
                                                name="contactPersonEmail"
                                                type="text"
                                                labelName="Contact Person Email"
                                                placeholder="Enter Contact Person Email"
                                              />
                                              {errors.contactPersonEmail && (
                                                <FormErrorText>
                                                  {
                                                    errors.contactPersonEmail
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "contactPersonDesignation"
                                                )}
                                                id="contactPersonDesignation"
                                                name="contactPersonDesignation"
                                                type="text"
                                                labelName="Contact Person Designation"
                                                placeholder="Enter Contact Person Designation"
                                              />
                                              {errors.contactPersonDesignation && (
                                                <FormErrorText>
                                                  {
                                                    errors
                                                      .contactPersonDesignation
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={12}>
                                              <TkInput
                                                {...register("notes")}
                                                id="note"
                                                name="note"
                                                type="textarea"
                                                labelName="Notes"
                                                placeholder="Enter Note"
                                              />
                                              {errors.notes && (
                                                <FormErrorText>
                                                  {errors.notes.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>
                                          </TkRow>
                                        </>
                                      </div>

                                      <TkRow className="mt-3">
                                        <TkCol>
                                          <TkButton
                                            type="button"
                                            onClick={() =>
                                              handleToggleVisibility(section.id)
                                            }
                                            className="bg-transparent border-0 ps-0 ms-0 text-center"
                                          >
                                            {section.isVisible ? (
                                              <span className="ms-auto badge p-1 rounded-circle badge-soft-danger fs-4 me-3">
                                                <TkIcon className="ri-delete-bin-6-line"></TkIcon>
                                              </span>
                                            ) : (
                                              <TkIcon className="ri-add-line"></TkIcon>
                                            )}
                                          </TkButton>
                                        </TkCol>
                                      </TkRow>
                                    </TkCol>
                                  </TkRow>
                                )}
                              </div>
                            ))}

                            <TkRow className="justify-content-center">
                              <TkCol lg={2} className="text-center">
                                <TkButton
                                  type="button"
                                  color="primary"
                                  onClick={handleAddSection}
                                >
                                  Add
                                </TkButton>
                              </TkCol>
                            </TkRow>
                            {/* <TkCol
                              md={1}
                              lg={5}
                              className="text-center text-md-end"
                            >
                              <TkButton
                                type="button"
                                className="bg-transparent border-0 ps-0 ms-0 text-center"
                                onClick={handleAddSection}
                              >
                                <span className="add-timsheet-btn badge p-1 rounded-circle badge-soft-dark fs-4">
                                  <TkIcon className="ri-add-line"></TkIcon>
                                </span>
                              </TkButton>
                            </TkCol> */}

                            <div className="d-flex mt-4 space-childern">
                              <div className="ms-auto" id="update-form-btns">
                                <TkButton
                                  type="button"
                                  color="primary"
                                  onClick={() => {
                                    toggleTab(tabs.leadAssigning);
                                  }}
                                >
                                  Next
                                </TkButton>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "lead" && (
                          <div>
                            <TkRow className="g-3">
                              <TkCol lg={4}>
                                <Controller
                                  name="region"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="region"
                                      name="region"
                                      labelName="Region"
                                      placeholder="Select Region"
                                      options={[
                                        { value: "1", label: "Region 1" },
                                        { value: "2", label: "Region 2" },
                                        { value: "3", label: "Region 3" },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.region && (
                                  <FormErrorText>
                                    {errors.region.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <Controller
                                  name="salesTeam"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="salesTeam"
                                      name="salesTeam"
                                      labelName="Sales Team Name"
                                      placeholder="Select Sales Team"
                                      options={[
                                        {
                                          value: "1",
                                          label: "Sales Team 1",
                                        },
                                        {
                                          value: "2",
                                          label: "Sales Team 2",
                                        },
                                        {
                                          value: "3",
                                          label: "Sales Team 3",
                                        },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.salesTeam && (
                                  <FormErrorText>
                                    {errors.salesTeam.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <div className="d-flex mt-4 space-childern">
                                <div className="ms-auto" id="update-form-btns">
                                  <TkButton
                                    type="button"
                                    color="primary"
                                    onClick={() => {
                                      toggleTab(tabs.leadNurutring);
                                    }}
                                  >
                                    Next
                                  </TkButton>
                                </div>
                              </div>
                            </TkRow>
                          </div>
                        )}

                        {activeTab === "nurturing" && (
                          <div>
                            <TkRow className="g-3">
                              <TkCol lg={4}>
                                <Controller
                                  name="primaryAcleadtion"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="primaryAcleadtion"
                                      name="primaryAction"
                                      labelName="Primary Action"
                                      placeholder="Select Primary Action"
                                      options={[
                                        { value: "1", label: "Replied" },
                                        { value: "2", label: "Call" },
                                        {
                                          value: "3",
                                          label: "Meeting appointment fixed",
                                        },
                                        {
                                          value: "3",
                                          label: "Meeting done",
                                        },
                                        {
                                          value: "3",
                                          label: "Waiting for the reply",
                                        },
                                        {
                                          value: "3",
                                          label: "Meeting postponed",
                                        },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.primaryAcleadtion && (
                                  <FormErrorText>
                                    {errors.primaryAcleadtion.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <Controller
                                  name="date"
                                  control={control}
                                  render={({ field }) => (
                                    <TkDate
                                      {...field}
                                      labelName="Date"
                                      id={"date"}
                                      placeholder="Enter Date"
                                      options={{
                                        altInput: true,
                                        dateFormat: "d M, Y",
                                      }}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        setSelectedDate(e);
                                        setAllDurations({});
                                      }}
                                      disabled={true}
                                      requiredStarOnLabel={true}
                                    />
                                  )}
                                />
                                {errors.date && (
                                  <FormErrorText>
                                    {errors.date.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <TkInput
                                  {...register(`time`, {
                                    required: "Time is required",
                                    validate: (value) => {
                                      if (
                                        value &&
                                        !/^[0-9]*([.:][0-9]+)?$/.test(value)
                                      ) {
                                        return "Invalid Time";
                                      }
                                      if (
                                        convertTimeToSec(value) > 86400 ||
                                        value > 24
                                      ) {
                                        return "Time should be less than 24 hours";
                                      }
                                    },
                                  })}
                                  onBlur={(e) => {
                                    setValue(
                                      `time`,
                                      convertToTimeFotTimeSheet(e.target.value)
                                    );
                                  }}
                                  labelName="Time (HH:MM)"
                                  id={"time"}
                                  name="time"
                                  type="text"
                                  placeholder="Enter Time"
                                  requiredStarOnLabel={true}
                                />
                                {errors.time && (
                                  <FormErrorText>
                                    {errors.time.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <TkInput
                                  {...register("leadValue")}
                                  id="leadValue"
                                  name="leadValue"
                                  labelName="Lead Value"
                                  type="text"
                                  placeholder="Enter Lead Value"
                                />
                                {errors.leadValue && (
                                  <FormErrorText>
                                    {errors.leadValue.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <Controller
                                  name="leadUpdate"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="leadUpdate"
                                      name="leadUpdate"
                                      labelName="Lead Update"
                                      placeholder="Select Lead Update"
                                      options={[
                                        {
                                          value: "1",
                                          label: "Qualified",
                                        },
                                        {
                                          value: "2",
                                          label: "Unqualified",
                                        },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.leadUpdate && (
                                  <FormErrorText>
                                    {errors.leadUpdate.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <TkInput
                                  {...register("reason")}
                                  id="reason"
                                  name="reason"
                                  labelName="Reason if unqualified lead"
                                  type="text"
                                  placeholder="Enter Reason"
                                />
                                {errors.reason && (
                                  <FormErrorText>
                                    {errors.reason.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <Controller
                                  name="prospectNurturing"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="prospectNurturing"
                                      name="prospectNurturing"
                                      labelName="Prospect Nurturing"
                                      placeholder="Select Prospect Nurturing"
                                      options={[
                                        {
                                          value: "1",
                                          label: "Quotation Issued",
                                        },
                                        {
                                          value: "2",
                                          label: "Waiting fro the approval",
                                        },
                                        {
                                          value: "3",
                                          label: "Waiting for document",
                                        },
                                        {
                                          value: "3",
                                          label: "Waiting for the PO",
                                        },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.prospectNurturing && (
                                  <FormErrorText>
                                    {errors.prospectNurturing.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <TkButton
                                  type="button"
                                  color="primary"
                                  className="mt-4"
                                  onClick={leadActivityToggle}
                                >
                                  Add Activity
                                </TkButton>
                              </TkCol>
                              <div className="d-flex mt-4 space-childern">
                                <div className="ms-auto" id="update-form-btns">
                                  <TkButton type="button" color="primary">
                                    Submit
                                  </TkButton>
                                </div>
                              </div>
                            </TkRow>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedButton === "socialMedia" && (
                      <div>
                        {activeTab === "primary" && (
                          <div>
                            <TkRow className="mt-4 mb-5">
                              <TkCol>
                                <div>
                                  <TkRow className="g-3">
                                    <TkCol lg={4}>
                                      <Controller
                                        name="leadSource"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="leadSource"
                                            name="leadSource"
                                            labelName="Lead Source"
                                            placeholder="Select Source"
                                            requiredStarOnLabel="true"
                                            options={[
                                              { value: "1", label: "Refferal" },
                                              { value: "2", label: "New" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.leadSource && (
                                        <FormErrorText>
                                          {errors.leadSource.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="platformType"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="platformType"
                                            name="platformType"
                                            labelName="Name Of Platform"
                                            placeholder="Select Platform"
                                            requiredStarOnLabel="true"
                                            options={[
                                              { value: "1", label: "Linkedin" },
                                              { value: "2", label: "Facebook" },
                                              {
                                                value: "3",
                                                label: "Instagram",
                                              },
                                              { value: "4", label: "Twitter" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.platformType && (
                                        <FormErrorText>
                                          {errors.platformType.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("campaignName")}
                                        id="campaignName"
                                        name="campaignName"
                                        type="text"
                                        labelName="Campaign Name"
                                        placeholder="Enter Campaign Name"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.campaignName && (
                                        <FormErrorText>
                                          {errors.campaignName.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="visitUpdate"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="visitUpdate"
                                            name="visitUpdate"
                                            labelName="Visit Update"
                                            options={[]}
                                            placeholder="Select Visit Update"
                                            requiredStarOnLabel="true"
                                          />
                                        )}
                                      />
                                      {errors.visitUpdate && (
                                        <FormErrorText>
                                          {errors.visitUpdate.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("createdBy")}
                                        id="createdBy"
                                        type="text"
                                        labelName="Created By"
                                        placeholder="Enter Created By"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.createdBy && (
                                        <FormErrorText>
                                          {errors.createdBy.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="createdDate"
                                        control={control}
                                        render={({ field }) => (
                                          <TkDate
                                            {...field}
                                            labelName="Created Date"
                                            id={"createdDate"}
                                            placeholder="Enter Created Date"
                                            options={{
                                              altInput: true,
                                              dateFormat: "d M, Y",
                                            }}
                                            onChange={(e) => {
                                              field.onChange(e);
                                              setSelectedDate(e);
                                              setAllDurations({});
                                            }}
                                            disabled={true}
                                            requiredStarOnLabel={true}
                                          />
                                        )}
                                      />
                                      {errors.createdDate && (
                                        <FormErrorText>
                                          {errors.createdDate.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                  </TkRow>
                                </div>
                              </TkCol>
                            </TkRow>

                            <TkRow className="mt-3">
                              <TkCol>
                                <TkCardHeader tag="h5" className="mb-4">
                                  <h4>Personal Details</h4>
                                </TkCardHeader>
                                <div>
                                  <TkRow className="g-3">
                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("name")}
                                        id="name"
                                        type="text"
                                        labelName="Name"
                                        placeholder="Enter Name"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.name && (
                                        <FormErrorText>
                                          {errors.name.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("mobileNo")}
                                        id="mobileNo"
                                        name="mobileNo"
                                        type="text"
                                        labelName="Phone No"
                                        placeholder="Enter Phone No"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.mobileNo && (
                                        <FormErrorText>
                                          {errors.mobileNo.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("email")}
                                        id="email"
                                        name="email"
                                        type="text"
                                        labelName="Email"
                                        placeholder="Enter Email"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.email && (
                                        <FormErrorText>
                                          {errors.email.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="enquiryBy"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="enquiryBy"
                                            name="enquiryBy"
                                            labelName="Enquiry By"
                                            placeholder="Enquiry By"
                                            requiredStarOnLabel="true"
                                            options={[
                                              { value: "1", label: "Direct" },
                                              {
                                                value: "2",
                                                label: "Consultant",
                                              },
                                              { value: "3", label: "Other" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.enquiryBy && (
                                        <FormErrorText>
                                          {errors.enquiryBy.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={8}>
                                      <TkInput
                                        {...register("note")}
                                        id="note"
                                        type="text"
                                        labelName="Note"
                                        placeholder="Enter Note"
                                      />
                                      {errors.note && (
                                        <FormErrorText>
                                          {errors.note.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                  </TkRow>
                                </div>
                              </TkCol>
                            </TkRow>
                            <TkRow className="mt-5">
                              <TkCol>
                                <TkCardHeader tag="h5" className="mb-4">
                                  <h4>Company Details</h4>
                                </TkCardHeader>
                                <div>
                                  <TkRow className="g-3">
                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("companyName")}
                                        id="companyName"
                                        type="text"
                                        labelName="Company Name"
                                        placeholder="Enter Company Name"
                                      />
                                      {errors.companyName && (
                                        <FormErrorText>
                                          {errors.companyName.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("contactNo")}
                                        id="contactNo"
                                        name="contactNo"
                                        type="text"
                                        labelName="Contact No"
                                        placeholder="Enter Contact No"
                                      />
                                      {errors.contactNo && (
                                        <FormErrorText>
                                          {errors.contactNo.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("companyEmail")}
                                        id="companyEmail"
                                        name="companyEmail"
                                        type="text"
                                        labelName="Email"
                                        placeholder="Enter Email"
                                      />
                                      {errors.companyEmail && (
                                        <FormErrorText>
                                          {errors.companyEmail.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("companyAddress")}
                                        id="companyAddress"
                                        name="companyAddress"
                                        type="text"
                                        labelName="Address"
                                        placeholder="Enter Address"
                                      />
                                      {errors.companyAddress && (
                                        <FormErrorText>
                                          {errors.companyAddress.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("region")}
                                        id="region"
                                        name="region"
                                        type="text"
                                        labelName="Region"
                                        placeholder="Enter Region"
                                      />
                                      {errors.region && (
                                        <FormErrorText>
                                          {errors.region.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("crno")}
                                        id="crno"
                                        name="crno"
                                        type="text"
                                        labelName="CR No"
                                        placeholder="Enter CR No"
                                      />
                                      {errors.crno && (
                                        <FormErrorText>
                                          {errors.crno.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("vatNo")}
                                        id="vatNo"
                                        name="vatNo"
                                        type="text"
                                        labelName="VAT No"
                                        placeholder="Enter VAT No"
                                      />
                                      {errors.vatNo && (
                                        <FormErrorText>
                                          {errors.vatNo.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="clientType"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="clientType"
                                            name="clientType"
                                            labelName="Client Type"
                                            placeholder="Select Client Type"
                                            options={[
                                              { value: "1", label: "Gov" },
                                              { value: "2", label: "Semi Gov" },
                                              { value: "3", label: "Privet" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.clientType && (
                                        <FormErrorText>
                                          {errors.clientType.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="segment"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="segment"
                                            name="segment"
                                            labelName="Segment"
                                            placeholder="Select Segment"
                                            options={[
                                              { value: "1", label: "O&G" },
                                              {
                                                value: "2",
                                                label: "Construction",
                                              },
                                              { value: "3", label: "Industry" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.segment && (
                                        <FormErrorText>
                                          {errors.segment.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                  </TkRow>
                                </div>
                              </TkCol>
                            </TkRow>

                            <TkRow className="mt-5">
                              <TkCol>
                                <TkCardHeader tag="h5" className="mb-3">
                                  <h4>Requirement Details</h4>
                                </TkCardHeader>
                              </TkCol>
                            </TkRow>
                            {requirementDetailsSections.map((section) => (
                              <div key={section.id}>
                                {section.isVisible && (
                                  <TkRow className=" mb-4">
                                    <TkCol>
                                      <div>
                                        <>
                                          <TkRow className="g-3">
                                            <TkCol lg={4}>
                                              <Controller
                                                name="division"
                                                control={control}
                                                render={({ field }) => (
                                                  <TkSelect
                                                    {...field}
                                                    id="division"
                                                    name="division"
                                                    labelName="Division"
                                                    placeholder="Select Division"
                                                    options={[
                                                      {
                                                        value: "1",
                                                        label: "Energy",
                                                      },
                                                      {
                                                        value: "2",
                                                        label: "Cooling",
                                                      },
                                                      {
                                                        value: "3",
                                                        label: "Welding",
                                                      },
                                                    ]}
                                                  />
                                                )}
                                              />
                                              {errors.division && (
                                                <FormErrorText>
                                                  {errors.division.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <Controller
                                                name="requirement"
                                                control={control}
                                                render={({ field }) => (
                                                  <TkSelect
                                                    {...field}
                                                    id="requirement"
                                                    name="requirement"
                                                    labelName="Requirement"
                                                    placeholder="Select Requirement"
                                                    options={[]}
                                                  />
                                                )}
                                              />
                                              {errors.requirement && (
                                                <FormErrorText>
                                                  {errors.requirement.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register("projectName")}
                                                id="projectName"
                                                name="projectName"
                                                type="text"
                                                labelName="Project Name"
                                                placeholder="Enter Project Name"
                                              />
                                              {errors.projectName && (
                                                <FormErrorText>
                                                  {errors.projectName.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(`duration`, {
                                                  validate: (value) => {
                                                    if (
                                                      value &&
                                                      !/^[0-9]*([.:][0-9]+)?$/.test(
                                                        value
                                                      )
                                                    ) {
                                                      return "Invalid duration";
                                                    }
                                                    if (
                                                      convertTimeToSec(value) <=
                                                        86400 ||
                                                      value > 24
                                                    ) {
                                                      return "Duration should be less than 24 hours";
                                                    }
                                                  },
                                                })}
                                                id="duration"
                                                name="duration"
                                                type="text"
                                                placeholder="Enter Duration"
                                                labelName="Duration"
                                                onBlur={(e) => {
                                                  setValue(
                                                    `duration`,
                                                    convertToTimeFotTimeSheet(
                                                      e.target.value
                                                    )
                                                  );
                                                }}
                                              />
                                              {errors.duration && (
                                                <FormErrorText>
                                                  {errors.duration.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register("unitOfMeasure")}
                                                id="unitOfMeasure"
                                                name="unitOfMeasure"
                                                type="text"
                                                labelName="Unit Of Measure"
                                                placeholder="Enter Unit Of Measure"
                                              />
                                              {errors.unitOfMeasure && (
                                                <FormErrorText>
                                                  {errors.unitOfMeasure.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <Controller
                                                name="delivery"
                                                control={control}
                                                render={({ field }) => (
                                                  <TkDate
                                                    {...field}
                                                    id="delivery"
                                                    name="delivery"
                                                    type="text"
                                                    labelName="Expected Delivery Date"
                                                    placeholder="Enter Expected Delivery Date"
                                                  />
                                                )}
                                              />
                                              {errors.delivery?.message ? (
                                                <FormErrorText>
                                                  {errors.delivery?.message}
                                                </FormErrorText>
                                              ) : null}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register("location")}
                                                id="location"
                                                name="location"
                                                type="text"
                                                labelName="Location"
                                                placeholder="Enter Location"
                                              />
                                              {errors.location && (
                                                <FormErrorText>
                                                  {errors.location.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "locationContactPerson"
                                                )}
                                                id="locationContactPerson"
                                                name="locationContactPerson"
                                                type="text"
                                                labelName="Location Contact Person"
                                                placeholder="Enter Location Contact Person"
                                              />
                                              {errors.locationContactPerson && (
                                                <FormErrorText>
                                                  {
                                                    errors.locationContactPerson
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "contactPersonName"
                                                )}
                                                id="contactPersonName"
                                                name="contactPersonName"
                                                type="text"
                                                labelName="Contact Person Name"
                                                placeholder="Enter Contact Person Name"
                                              />
                                              {errors.contactPersonName && (
                                                <FormErrorText>
                                                  {
                                                    errors.contactPersonName
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "contactPersonNumber"
                                                )}
                                                id="contactPersonNumber"
                                                name="contactPersonNumber"
                                                type="text"
                                                labelName="Contact Person Number"
                                                placeholder="Enter Contact Person Number"
                                              />
                                              {errors.contactPersonNumber && (
                                                <FormErrorText>
                                                  {
                                                    errors.contactPersonNumber
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "contactPersonEmail"
                                                )}
                                                id="contactPersonEmail"
                                                name="contactPersonEmail"
                                                type="text"
                                                labelName="Contact Person Email"
                                                placeholder="Enter Contact Person Email"
                                              />
                                              {errors.contactPersonEmail && (
                                                <FormErrorText>
                                                  {
                                                    errors.contactPersonEmail
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "contactPersonDesignation"
                                                )}
                                                id="contactPersonDesignation"
                                                name="contactPersonDesignation"
                                                type="text"
                                                labelName="Contact Person Designation"
                                                placeholder="Enter Contact Person Designation"
                                              />
                                              {errors.contactPersonDesignation && (
                                                <FormErrorText>
                                                  {
                                                    errors
                                                      .contactPersonDesignation
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={12}>
                                              <TkInput
                                                {...register("notes")}
                                                id="note"
                                                name="note"
                                                type="textarea"
                                                labelName="Notes"
                                                placeholder="Enter Note"
                                              />
                                              {errors.notes && (
                                                <FormErrorText>
                                                  {errors.notes.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>
                                          </TkRow>
                                        </>
                                      </div>

                                      <TkRow className="mt-3">
                                        <TkCol>
                                          <TkButton
                                            type="button"
                                            onClick={() =>
                                              handleToggleVisibility(section.id)
                                            }
                                            className="bg-transparent border-0 ps-0 ms-0 text-center"
                                          >
                                            {section.isVisible ? (
                                              <span className="ms-auto badge p-1 rounded-circle badge-soft-danger fs-4 me-3">
                                                <TkIcon className="ri-delete-bin-6-line"></TkIcon>
                                              </span>
                                            ) : (
                                              <TkIcon className="ri-add-line"></TkIcon>
                                            )}
                                          </TkButton>
                                        </TkCol>
                                      </TkRow>
                                    </TkCol>
                                  </TkRow>
                                )}
                              </div>
                            ))}

                            <TkRow className="justify-content-center">
                              <TkCol lg={2} className="text-center">
                                <TkButton
                                  type="button"
                                  color="primary"
                                  onClick={handleAddSection}
                                >
                                  Add
                                </TkButton>
                              </TkCol>
                            </TkRow>

                            {/* <TkCol
                              md={1}
                              lg={5}
                              className="text-center text-md-end"
                            >
                              <TkButton
                                type="button"
                                className="bg-transparent border-0 ps-0 ms-0 text-center"
                                onClick={handleAddSection}
                              >
                                <span className="add-timsheet-btn badge p-1 rounded-circle badge-soft-dark fs-4">
                                  <TkIcon className="ri-add-line"></TkIcon>
                                </span>
                              </TkButton>
                            </TkCol> */}

                            <div className="d-flex mt-4 space-childern">
                              <div className="ms-auto" id="update-form-btns">
                                <TkButton
                                  type="button"
                                  color="primary"
                                  onClick={() => {
                                    toggleTab(tabs.leadAssigning);
                                  }}
                                >
                                  Next
                                </TkButton>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "lead" && (
                          <div>
                            <TkRow className="g-3">
                              <TkCol lg={4}>
                                <Controller
                                  name="region"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="region"
                                      name="region"
                                      labelName="Region"
                                      placeholder="Select Region"
                                      options={[
                                        { value: "1", label: "Region 1" },
                                        { value: "2", label: "Region 2" },
                                        { value: "3", label: "Region 3" },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.region && (
                                  <FormErrorText>
                                    {errors.region.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <Controller
                                  name="salesTeam"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="salesTeam"
                                      name="salesTeam"
                                      labelName="Sales Team Name"
                                      placeholder="Select Sales Team"
                                      options={[
                                        {
                                          value: "1",
                                          label: "Sales Team 1",
                                        },
                                        {
                                          value: "2",
                                          label: "Sales Team 2",
                                        },
                                        {
                                          value: "3",
                                          label: "Sales Team 3",
                                        },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.salesTeam && (
                                  <FormErrorText>
                                    {errors.salesTeam.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <div className="d-flex mt-4 space-childern">
                                <div className="ms-auto" id="update-form-btns">
                                  <TkButton
                                    type="button"
                                    color="primary"
                                    onClick={() => {
                                      toggleTab(tabs.leadNurutring);
                                    }}
                                  >
                                    Next
                                  </TkButton>
                                </div>
                              </div>
                            </TkRow>
                          </div>
                        )}

                        {activeTab === "nurturing" && (
                          <div>
                            <TkRow className="g-3">
                              <TkCol lg={4}>
                                <Controller
                                  name="primaryAcleadtion"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="primaryAcleadtion"
                                      name="primaryAction"
                                      labelName="Primary Action"
                                      placeholder="Select Primary Action"
                                      options={[
                                        { value: "1", label: "Replied" },
                                        { value: "2", label: "Call" },
                                        {
                                          value: "3",
                                          label: "Meeting appointment fixed",
                                        },
                                        {
                                          value: "3",
                                          label: "Meeting done",
                                        },
                                        {
                                          value: "3",
                                          label: "Waiting for the reply",
                                        },
                                        {
                                          value: "3",
                                          label: "Meeting postponed",
                                        },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.primaryAcleadtion && (
                                  <FormErrorText>
                                    {errors.primaryAcleadtion.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <Controller
                                  name="date"
                                  control={control}
                                  render={({ field }) => (
                                    <TkDate
                                      {...field}
                                      labelName="Date"
                                      id={"date"}
                                      placeholder="Enter Date"
                                      options={{
                                        altInput: true,
                                        dateFormat: "d M, Y",
                                      }}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        setSelectedDate(e);
                                        setAllDurations({});
                                      }}
                                      disabled={true}
                                      requiredStarOnLabel={true}
                                    />
                                  )}
                                />
                                {errors.date && (
                                  <FormErrorText>
                                    {errors.date.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <TkInput
                                  {...register(`time`, {
                                    required: "Time is required",
                                    validate: (value) => {
                                      if (
                                        value &&
                                        !/^[0-9]*([.:][0-9]+)?$/.test(value)
                                      ) {
                                        return "Invalid Time";
                                      }
                                      if (
                                        convertTimeToSec(value) > 86400 ||
                                        value > 24
                                      ) {
                                        return "Time should be less than 24 hours";
                                      }
                                    },
                                  })}
                                  onBlur={(e) => {
                                    setValue(
                                      `time`,
                                      convertToTimeFotTimeSheet(e.target.value)
                                    );
                                  }}
                                  labelName="Time (HH:MM)"
                                  id={"time"}
                                  name="time"
                                  type="text"
                                  placeholder="Enter Time"
                                  requiredStarOnLabel={true}
                                />
                                {errors.time && (
                                  <FormErrorText>
                                    {errors.time.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <TkInput
                                  {...register("leadValue")}
                                  id="leadValue"
                                  name="leadValue"
                                  labelName="Lead Value"
                                  type="text"
                                  placeholder="Enter Lead Value"
                                />
                                {errors.leadValue && (
                                  <FormErrorText>
                                    {errors.leadValue.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <Controller
                                  name="leadUpdate"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="leadUpdate"
                                      name="leadUpdate"
                                      labelName="Lead Update"
                                      placeholder="Select Lead Update"
                                      options={[
                                        {
                                          value: "1",
                                          label: "Qualified",
                                        },
                                        {
                                          value: "2",
                                          label: "Unqualified",
                                        },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.leadUpdate && (
                                  <FormErrorText>
                                    {errors.leadUpdate.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <TkInput
                                  {...register("reason")}
                                  id="reason"
                                  name="reason"
                                  labelName="Reason if unqualified lead"
                                  type="text"
                                  placeholder="Enter Reason"
                                />
                                {errors.reason && (
                                  <FormErrorText>
                                    {errors.reason.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <Controller
                                  name="prospectNurturing"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="prospectNurturing"
                                      name="prospectNurturing"
                                      labelName="Prospect Nurturing"
                                      placeholder="Select Prospect Nurturing"
                                      options={[
                                        {
                                          value: "1",
                                          label: "Quotation Issued",
                                        },
                                        {
                                          value: "2",
                                          label: "Waiting fro the approval",
                                        },
                                        {
                                          value: "3",
                                          label: "Waiting for document",
                                        },
                                        {
                                          value: "3",
                                          label: "Waiting for the PO",
                                        },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.prospectNurturing && (
                                  <FormErrorText>
                                    {errors.prospectNurturing.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <TkButton
                                  type="button"
                                  color="primary"
                                  className="mt-4"
                                  onClick={leadActivityToggle}
                                >
                                  Add Activity
                                </TkButton>
                              </TkCol>
                              <div className="d-flex mt-4 space-childern">
                                <div className="ms-auto" id="update-form-btns">
                                  <TkButton type="button" color="primary">
                                    Submit
                                  </TkButton>
                                </div>
                              </div>
                            </TkRow>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedButton === "portals" && (
                      <div>
                        {activeTab === "primary" && (
                          <div>
                            <TkRow className="mt-4 mb-5">
                              <TkCol>
                                <div>
                                  <TkRow className="g-3">
                                    <TkCol lg={4}>
                                      <Controller
                                        name="leadSource"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="leadSource"
                                            name="leadSource"
                                            labelName="Lead Source"
                                            placeholder="Select Source"
                                            requiredStarOnLabel="true"
                                            options={[
                                              { value: "1", label: "Refferal" },
                                              { value: "2", label: "New" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.leadSource && (
                                        <FormErrorText>
                                          {errors.leadSource.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="portalType"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="portalType"
                                            name="portalType"
                                            labelName="Name Of Portal"
                                            placeholder="Select Portal"
                                            requiredStarOnLabel="true"
                                            options={[
                                              {
                                                value: "1",
                                                label: "Direct Marketing",
                                              },
                                              {
                                                value: "2",
                                                label: "Social Media",
                                              },
                                              { value: "3", label: "Website" },
                                              { value: "4", label: "Email" },
                                              { value: "5", label: "Referral" },
                                              { value: "6", label: "Other" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.portalType && (
                                        <FormErrorText>
                                          {errors.portalType.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("createdBy")}
                                        id="createdBy"
                                        type="text"
                                        labelName="Created By"
                                        placeholder="Enter Created By"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.createdBy && (
                                        <FormErrorText>
                                          {errors.createdBy.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="createdDate"
                                        control={control}
                                        render={({ field }) => (
                                          <TkDate
                                            {...field}
                                            labelName="Created Date"
                                            id={"createdDate"}
                                            placeholder="Enter Created Date"
                                            options={{
                                              altInput: true,
                                              dateFormat: "d M, Y",
                                            }}
                                            onChange={(e) => {
                                              field.onChange(e);
                                              setSelectedDate(e);
                                              setAllDurations({});
                                            }}
                                            disabled={true}
                                            requiredStarOnLabel={true}
                                          />
                                        )}
                                      />
                                      {errors.createdDate && (
                                        <FormErrorText>
                                          {errors.createdDate.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                  </TkRow>
                                </div>
                              </TkCol>
                            </TkRow>

                            <TkRow className="mt-3">
                              <TkCol>
                                <TkCardHeader tag="h5" className="mb-4">
                                  <h4>Personal Details</h4>
                                </TkCardHeader>
                                <div>
                                  <TkRow className="g-3">
                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("name")}
                                        id="name"
                                        type="text"
                                        labelName="Name"
                                        placeholder="Enter Name"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.name && (
                                        <FormErrorText>
                                          {errors.name.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("mobileNo")}
                                        id="mobileNo"
                                        name="mobileNo"
                                        type="text"
                                        labelName="Phone No"
                                        placeholder="Enter Phone No"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.mobileNo && (
                                        <FormErrorText>
                                          {errors.mobileNo.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("email")}
                                        id="email"
                                        name="email"
                                        type="text"
                                        labelName="Email"
                                        placeholder="Enter Email"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.email && (
                                        <FormErrorText>
                                          {errors.email.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="enquiryBy"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="enquiryBy"
                                            name="enquiryBy"
                                            labelName="Enquiry By"
                                            placeholder="Enquiry By"
                                            requiredStarOnLabel="true"
                                            options={[
                                              { value: "1", label: "Direct" },
                                              {
                                                value: "2",
                                                label: "Consultant",
                                              },
                                              { value: "3", label: "Other" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.enquiryBy && (
                                        <FormErrorText>
                                          {errors.enquiryBy.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={8}>
                                      <TkInput
                                        {...register("note")}
                                        id="note"
                                        type="text"
                                        labelName="Note"
                                        placeholder="Enter Note"
                                      />
                                      {errors.note && (
                                        <FormErrorText>
                                          {errors.note.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                  </TkRow>
                                </div>
                              </TkCol>
                            </TkRow>
                            <TkRow className="mt-5">
                              <TkCol>
                                <TkCardHeader tag="h5" className="mb-4">
                                  <h4>Company Details</h4>
                                </TkCardHeader>
                                <div>
                                  <TkRow className="g-3">
                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("companyName")}
                                        id="companyName"
                                        type="text"
                                        labelName="Company Name"
                                        placeholder="Enter Company Name"
                                      />
                                      {errors.companyName && (
                                        <FormErrorText>
                                          {errors.companyName.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("contactNo")}
                                        id="contactNo"
                                        name="contactNo"
                                        type="text"
                                        labelName="Contact No"
                                        placeholder="Enter Contact No"
                                      />
                                      {errors.contactNo && (
                                        <FormErrorText>
                                          {errors.contactNo.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("companyEmail")}
                                        id="companyEmail"
                                        name="companyEmail"
                                        type="text"
                                        labelName="Email"
                                        placeholder="Enter Email"
                                      />
                                      {errors.companyEmail && (
                                        <FormErrorText>
                                          {errors.companyEmail.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("companyAddress")}
                                        id="companyAddress"
                                        name="companyAddress"
                                        type="text"
                                        labelName="Address"
                                        placeholder="Enter Address"
                                      />
                                      {errors.companyAddress && (
                                        <FormErrorText>
                                          {errors.companyAddress.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("region")}
                                        id="region"
                                        name="region"
                                        type="text"
                                        labelName="Region"
                                        placeholder="Enter Region"
                                      />
                                      {errors.region && (
                                        <FormErrorText>
                                          {errors.region.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("crno")}
                                        id="crno"
                                        name="crno"
                                        type="text"
                                        labelName="CR No"
                                        placeholder="Enter CR No"
                                      />
                                      {errors.crno && (
                                        <FormErrorText>
                                          {errors.crno.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("vatNo")}
                                        id="vatNo"
                                        name="vatNo"
                                        type="text"
                                        labelName="VAT No"
                                        placeholder="Enter VAT No"
                                      />
                                      {errors.vatNo && (
                                        <FormErrorText>
                                          {errors.vatNo.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="clientType"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="clientType"
                                            name="clientType"
                                            labelName="Client Type"
                                            placeholder="Select Client Type"
                                            options={[
                                              { value: "1", label: "Gov" },
                                              { value: "2", label: "Semi Gov" },
                                              { value: "3", label: "Privet" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.clientType && (
                                        <FormErrorText>
                                          {errors.clientType.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="segment"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="segment"
                                            name="segment"
                                            labelName="Segment"
                                            placeholder="Select Segment"
                                            options={[
                                              { value: "1", label: "O&G" },
                                              {
                                                value: "2",
                                                label: "Construction",
                                              },
                                              { value: "3", label: "Industry" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.segment && (
                                        <FormErrorText>
                                          {errors.segment.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                  </TkRow>
                                </div>
                              </TkCol>
                            </TkRow>

                            <TkRow className="mt-5">
                              <TkCol>
                                <TkCardHeader tag="h5" className="mb-3">
                                  <h4>Requirement Details</h4>
                                </TkCardHeader>
                              </TkCol>
                            </TkRow>
                            {requirementDetailsSections.map((section) => (
                              <div key={section.id}>
                                {section.isVisible && (
                                  <TkRow className=" mb-4">
                                    <TkCol>
                                      <div>
                                        <>
                                          <TkRow className="g-3">
                                            <TkCol lg={4}>
                                              <Controller
                                                name="division"
                                                control={control}
                                                render={({ field }) => (
                                                  <TkSelect
                                                    {...field}
                                                    id="division"
                                                    name="division"
                                                    labelName="Division"
                                                    placeholder="Select Division"
                                                    options={[
                                                      {
                                                        value: "1",
                                                        label: "Energy",
                                                      },
                                                      {
                                                        value: "2",
                                                        label: "Cooling",
                                                      },
                                                      {
                                                        value: "3",
                                                        label: "Welding",
                                                      },
                                                    ]}
                                                  />
                                                )}
                                              />
                                              {errors.division && (
                                                <FormErrorText>
                                                  {errors.division.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <Controller
                                                name="requirement"
                                                control={control}
                                                render={({ field }) => (
                                                  <TkSelect
                                                    {...field}
                                                    id="requirement"
                                                    name="requirement"
                                                    labelName="Requirement"
                                                    placeholder="Select Requirement"
                                                    options={[]}
                                                  />
                                                )}
                                              />
                                              {errors.requirement && (
                                                <FormErrorText>
                                                  {errors.requirement.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register("projectName")}
                                                id="projectName"
                                                name="projectName"
                                                type="text"
                                                labelName="Project Name"
                                                placeholder="Enter Project Name"
                                              />
                                              {errors.projectName && (
                                                <FormErrorText>
                                                  {errors.projectName.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(`duration`, {
                                                  validate: (value) => {
                                                    if (
                                                      value &&
                                                      !/^[0-9]*([.:][0-9]+)?$/.test(
                                                        value
                                                      )
                                                    ) {
                                                      return "Invalid duration";
                                                    }
                                                    if (
                                                      convertTimeToSec(value) <=
                                                        86400 ||
                                                      value > 24
                                                    ) {
                                                      return "Duration should be less than 24 hours";
                                                    }
                                                  },
                                                })}
                                                id="duration"
                                                name="duration"
                                                type="text"
                                                placeholder="Enter Duration"
                                                labelName="Duration"
                                                onBlur={(e) => {
                                                  setValue(
                                                    `duration`,
                                                    convertToTimeFotTimeSheet(
                                                      e.target.value
                                                    )
                                                  );
                                                }}
                                              />
                                              {errors.duration && (
                                                <FormErrorText>
                                                  {errors.duration.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register("unitOfMeasure")}
                                                id="unitOfMeasure"
                                                name="unitOfMeasure"
                                                type="text"
                                                labelName="Unit Of Measure"
                                                placeholder="Enter Unit Of Measure"
                                              />
                                              {errors.unitOfMeasure && (
                                                <FormErrorText>
                                                  {errors.unitOfMeasure.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <Controller
                                                name="delivery"
                                                control={control}
                                                render={({ field }) => (
                                                  <TkDate
                                                    {...field}
                                                    id="delivery"
                                                    name="delivery"
                                                    type="text"
                                                    labelName="Expected Delivery Date"
                                                    placeholder="Enter Expected Delivery Date"
                                                  />
                                                )}
                                              />
                                              {errors.delivery?.message ? (
                                                <FormErrorText>
                                                  {errors.delivery?.message}
                                                </FormErrorText>
                                              ) : null}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register("location")}
                                                id="location"
                                                name="location"
                                                type="text"
                                                labelName="Location"
                                                placeholder="Enter Location"
                                              />
                                              {errors.location && (
                                                <FormErrorText>
                                                  {errors.location.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "locationContactPerson"
                                                )}
                                                id="locationContactPerson"
                                                name="locationContactPerson"
                                                type="text"
                                                labelName="Location Contact Person"
                                                placeholder="Enter Location Contact Person"
                                              />
                                              {errors.locationContactPerson && (
                                                <FormErrorText>
                                                  {
                                                    errors.locationContactPerson
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "contactPersonName"
                                                )}
                                                id="contactPersonName"
                                                name="contactPersonName"
                                                type="text"
                                                labelName="Contact Person Name"
                                                placeholder="Enter Contact Person Name"
                                              />
                                              {errors.contactPersonName && (
                                                <FormErrorText>
                                                  {
                                                    errors.contactPersonName
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "contactPersonNumber"
                                                )}
                                                id="contactPersonNumber"
                                                name="contactPersonNumber"
                                                type="text"
                                                labelName="Contact Person Number"
                                                placeholder="Enter Contact Person Number"
                                              />
                                              {errors.contactPersonNumber && (
                                                <FormErrorText>
                                                  {
                                                    errors.contactPersonNumber
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "contactPersonEmail"
                                                )}
                                                id="contactPersonEmail"
                                                name="contactPersonEmail"
                                                type="text"
                                                labelName="Contact Person Email"
                                                placeholder="Enter Contact Person Email"
                                              />
                                              {errors.contactPersonEmail && (
                                                <FormErrorText>
                                                  {
                                                    errors.contactPersonEmail
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "contactPersonDesignation"
                                                )}
                                                id="contactPersonDesignation"
                                                name="contactPersonDesignation"
                                                type="text"
                                                labelName="Contact Person Designation"
                                                placeholder="Enter Contact Person Designation"
                                              />
                                              {errors.contactPersonDesignation && (
                                                <FormErrorText>
                                                  {
                                                    errors
                                                      .contactPersonDesignation
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={12}>
                                              <TkInput
                                                {...register("notes")}
                                                id="note"
                                                name="note"
                                                type="textarea"
                                                labelName="Notes"
                                                placeholder="Enter Note"
                                              />
                                              {errors.notes && (
                                                <FormErrorText>
                                                  {errors.notes.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>
                                          </TkRow>
                                        </>
                                      </div>

                                      <TkRow className="mt-3">
                                        <TkCol>
                                          <TkButton
                                            type="button"
                                            onClick={() =>
                                              handleToggleVisibility(section.id)
                                            }
                                            className="bg-transparent border-0 ps-0 ms-0 text-center"
                                          >
                                            {section.isVisible ? (
                                              <span className="ms-auto badge p-1 rounded-circle badge-soft-danger fs-4 me-3">
                                                <TkIcon className="ri-delete-bin-6-line"></TkIcon>
                                              </span>
                                            ) : (
                                              <TkIcon className="ri-add-line"></TkIcon>
                                            )}
                                          </TkButton>
                                        </TkCol>
                                      </TkRow>
                                    </TkCol>
                                  </TkRow>
                                )}
                              </div>
                            ))}

                            <TkRow className="justify-content-center">
                              <TkCol lg={2} className="text-center">
                                <TkButton
                                  type="button"
                                  color="primary"
                                  onClick={handleAddSection}
                                >
                                  Add
                                </TkButton>
                              </TkCol>
                            </TkRow>

                            {/* <TkCol
                              md={1}
                              lg={5}
                              className="text-center text-md-end"
                            >
                              <TkButton
                                type="button"
                                className="bg-transparent border-0 ps-0 ms-0 text-center"
                                onClick={handleAddSection}
                              >
                                <span className="add-timsheet-btn badge p-1 rounded-circle badge-soft-dark fs-4">
                                  <TkIcon className="ri-add-line"></TkIcon>
                                </span>
                              </TkButton>
                            </TkCol> */}

                            <div className="d-flex mt-4 space-childern">
                              <div className="ms-auto" id="update-form-btns">
                                <TkButton
                                  type="button"
                                  color="primary"
                                  onClick={() => {
                                    toggleTab(tabs.leadAssigning);
                                  }}
                                >
                                  Next
                                </TkButton>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "lead" && (
                          <div>
                            <TkRow className="g-3">
                              <TkCol lg={4}>
                                <Controller
                                  name="region"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="region"
                                      name="region"
                                      labelName="Region"
                                      placeholder="Select Region"
                                      options={[
                                        { value: "1", label: "Region 1" },
                                        { value: "2", label: "Region 2" },
                                        { value: "3", label: "Region 3" },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.region && (
                                  <FormErrorText>
                                    {errors.region.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <Controller
                                  name="salesTeam"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="salesTeam"
                                      name="salesTeam"
                                      labelName="Sales Team Name"
                                      placeholder="Select Sales Team"
                                      options={[
                                        {
                                          value: "1",
                                          label: "Sales Team 1",
                                        },
                                        {
                                          value: "2",
                                          label: "Sales Team 2",
                                        },
                                        {
                                          value: "3",
                                          label: "Sales Team 3",
                                        },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.salesTeam && (
                                  <FormErrorText>
                                    {errors.salesTeam.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <div className="d-flex mt-4 space-childern">
                                <div className="ms-auto" id="update-form-btns">
                                  <TkButton
                                    type="button"
                                    color="primary"
                                    onClick={() => {
                                      toggleTab(tabs.leadNurutring);
                                    }}
                                  >
                                    Next
                                  </TkButton>
                                </div>
                              </div>
                            </TkRow>
                          </div>
                        )}

                        {activeTab === "nurturing" && (
                          <div>
                            <TkRow className="g-3">
                              <TkCol lg={4}>
                                <Controller
                                  name="primaryAcleadtion"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="primaryAcleadtion"
                                      name="primaryAction"
                                      labelName="Primary Action"
                                      placeholder="Select Primary Action"
                                      options={[
                                        { value: "1", label: "Replied" },
                                        { value: "2", label: "Call" },
                                        {
                                          value: "3",
                                          label: "Meeting appointment fixed",
                                        },
                                        {
                                          value: "3",
                                          label: "Meeting done",
                                        },
                                        {
                                          value: "3",
                                          label: "Waiting for the reply",
                                        },
                                        {
                                          value: "3",
                                          label: "Meeting postponed",
                                        },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.primaryAcleadtion && (
                                  <FormErrorText>
                                    {errors.primaryAcleadtion.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <Controller
                                  name="date"
                                  control={control}
                                  render={({ field }) => (
                                    <TkDate
                                      {...field}
                                      labelName="Date"
                                      id={"date"}
                                      placeholder="Enter Created Date"
                                      options={{
                                        altInput: true,
                                        dateFormat: "d M, Y",
                                      }}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        setSelectedDate(e);
                                        setAllDurations({});
                                      }}
                                      disabled={true}
                                      requiredStarOnLabel={true}
                                    />
                                  )}
                                />
                                {errors.date && (
                                  <FormErrorText>
                                    {errors.date.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <TkInput
                                  {...register(`time`, {
                                    required: "Time is required",
                                    validate: (value) => {
                                      if (
                                        value &&
                                        !/^[0-9]*([.:][0-9]+)?$/.test(value)
                                      ) {
                                        return "Invalid Time";
                                      }
                                      if (
                                        convertTimeToSec(value) > 86400 ||
                                        value > 24
                                      ) {
                                        return "Time should be less than 24 hours";
                                      }
                                    },
                                  })}
                                  onBlur={(e) => {
                                    setValue(
                                      `time`,
                                      convertToTimeFotTimeSheet(e.target.value)
                                    );
                                  }}
                                  labelName="Time (HH:MM)"
                                  id={"time"}
                                  name="time"
                                  type="text"
                                  placeholder="Enter Time"
                                  requiredStarOnLabel={true}
                                />
                                {errors.time && (
                                  <FormErrorText>
                                    {errors.time.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <TkInput
                                  {...register("leadValue")}
                                  id="leadValue"
                                  name="leadValue"
                                  labelName="Lead Value"
                                  type="text"
                                  placeholder="Enter Lead Value"
                                />
                                {errors.leadValue && (
                                  <FormErrorText>
                                    {errors.leadValue.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <Controller
                                  name="leadUpdate"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="leadUpdate"
                                      name="leadUpdate"
                                      labelName="Lead Update"
                                      placeholder="Select Lead Update"
                                      options={[
                                        {
                                          value: "1",
                                          label: "Qualified",
                                        },
                                        {
                                          value: "2",
                                          label: "Unqualified",
                                        },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.leadUpdate && (
                                  <FormErrorText>
                                    {errors.leadUpdate.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <TkInput
                                  {...register("reason")}
                                  id="reason"
                                  name="reason"
                                  labelName="Reason if unqualified lead"
                                  type="text"
                                  placeholder="Enter Reason"
                                />
                                {errors.reason && (
                                  <FormErrorText>
                                    {errors.reason.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <Controller
                                  name="prospectNurturing"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="prospectNurturing"
                                      name="prospectNurturing"
                                      labelName="Prospect Nurturing"
                                      placeholder="Select Prospect Nurturing"
                                      options={[
                                        {
                                          value: "1",
                                          label: "Quotation Issued",
                                        },
                                        {
                                          value: "2",
                                          label: "Waiting fro the approval",
                                        },
                                        {
                                          value: "3",
                                          label: "Waiting for document",
                                        },
                                        {
                                          value: "3",
                                          label: "Waiting for the PO",
                                        },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.prospectNurturing && (
                                  <FormErrorText>
                                    {errors.prospectNurturing.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <TkButton
                                  type="button"
                                  color="primary"
                                  className="mt-4"
                                  onClick={leadActivityToggle}
                                >
                                  Add Activity
                                </TkButton>
                              </TkCol>

                              <div className="d-flex mt-4 space-childern">
                                <div className="ms-auto" id="update-form-btns">
                                  <TkButton type="button" color="primary">
                                    Submit
                                  </TkButton>
                                </div>
                              </div>
                            </TkRow>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedButton === "directMarketing" && (
                      <div>
                        {activeTab === "primary" && (
                          <div>
                            <TkRow className="mt-4 mb-5">
                              <TkCol>
                                <div>
                                  <TkRow className="g-3">
                                    <TkCol lg={4}>
                                      <Controller
                                        name="leadSource"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="leadSource"
                                            name="leadSource"
                                            labelName="Lead Source"
                                            placeholder="Select Source"
                                            requiredStarOnLabel="true"
                                            options={[
                                              { value: "1", label: "Refferal" },
                                              { value: "2", label: "New" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.leadSource && (
                                        <FormErrorText>
                                          {errors.leadSource.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="visitDate"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="visitDate"
                                            name="visitDate"
                                            labelName="Date Of Visit"
                                            options={[]}
                                            placeholder="Select Visit Date"
                                            requiredStarOnLabel="true"
                                          />
                                        )}
                                      />
                                      {errors.visitDate && (
                                        <FormErrorText>
                                          {errors.visitDate.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                    <TkCol lg={4}>
                                      <Controller
                                        name="visitTime"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="visitTime"
                                            name="visitTime"
                                            labelName="Time Of Visit"
                                            options={[]}
                                            placeholder="Select Visit Time"
                                            requiredStarOnLabel="true"
                                          />
                                        )}
                                      />
                                      {errors.visitTime && (
                                        <FormErrorText>
                                          {errors.visitTime.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="visitUpdate"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="visitUpdate"
                                            name="visitUpdate"
                                            labelName="Visit Update"
                                            options={[]}
                                            placeholder="Select Visit Update"
                                            requiredStarOnLabel="true"
                                          />
                                        )}
                                      />
                                      {errors.visitUpdate && (
                                        <FormErrorText>
                                          {errors.visitUpdate.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("createdBy")}
                                        id="createdBy"
                                        type="text"
                                        labelName="Created By"
                                        placeholder="Enter Created By"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.createdBy && (
                                        <FormErrorText>
                                          {errors.createdBy.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="createdDate"
                                        control={control}
                                        render={({ field }) => (
                                          <TkDate
                                            {...field}
                                            labelName="Created Date"
                                            id={"createdDate"}
                                            placeholder="Enter Created Date"
                                            options={{
                                              altInput: true,
                                              dateFormat: "d M, Y",
                                            }}
                                            onChange={(e) => {
                                              field.onChange(e);
                                              setSelectedDate(e);
                                              setAllDurations({});
                                            }}
                                            disabled={true}
                                            requiredStarOnLabel={true}
                                          />
                                        )}
                                      />
                                      {errors.createdDate && (
                                        <FormErrorText>
                                          {errors.createdDate.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                  </TkRow>
                                </div>
                              </TkCol>
                            </TkRow>

                            <TkRow className="mt-3">
                              <TkCol>
                                <TkCardHeader tag="h5" className="mb-4">
                                  <h4>Personal Details</h4>
                                </TkCardHeader>
                                <div>
                                  <TkRow className="g-3">
                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("name")}
                                        id="name"
                                        type="text"
                                        labelName="Name"
                                        placeholder="Enter Name"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.name && (
                                        <FormErrorText>
                                          {errors.name.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("mobileNo")}
                                        id="mobileNo"
                                        name="mobileNo"
                                        type="text"
                                        labelName="Phone No"
                                        placeholder="Enter Phone No"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.mobileNo && (
                                        <FormErrorText>
                                          {errors.mobileNo.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("email")}
                                        id="email"
                                        name="email"
                                        type="text"
                                        labelName="Email"
                                        placeholder="Enter Email"
                                        requiredStarOnLabel="true"
                                      />
                                      {errors.email && (
                                        <FormErrorText>
                                          {errors.email.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="enquiryBy"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="enquiryBy"
                                            name="enquiryBy"
                                            labelName="Enquiry By"
                                            placeholder="Enquiry By"
                                            requiredStarOnLabel="true"
                                            options={[
                                              { value: "1", label: "Direct" },
                                              {
                                                value: "2",
                                                label: "Consultant",
                                              },
                                              { value: "3", label: "Other" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.enquiryBy && (
                                        <FormErrorText>
                                          {errors.enquiryBy.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={8}>
                                      <TkInput
                                        {...register("note")}
                                        id="note"
                                        type="text"
                                        labelName="Note"
                                        placeholder="Enter Note"
                                      />
                                      {errors.note && (
                                        <FormErrorText>
                                          {errors.note.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                  </TkRow>
                                </div>
                              </TkCol>
                            </TkRow>
                            <TkRow className="mt-5">
                              <TkCol>
                                <TkCardHeader tag="h5" className="mb-4">
                                  <h4>Company Details</h4>
                                </TkCardHeader>
                                <div>
                                  <TkRow className="g-3">
                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("companyName")}
                                        id="companyName"
                                        type="text"
                                        labelName="Company Name"
                                        placeholder="Enter Company Name"
                                      />
                                      {errors.companyName && (
                                        <FormErrorText>
                                          {errors.companyName.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("contactNo")}
                                        id="contactNo"
                                        name="contactNo"
                                        type="text"
                                        labelName="Contact No"
                                        placeholder="Enter Contact No"
                                      />
                                      {errors.contactNo && (
                                        <FormErrorText>
                                          {errors.contactNo.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("companyEmail")}
                                        id="companyEmail"
                                        name="companyEmail"
                                        type="text"
                                        labelName="Email"
                                        placeholder="Enter Email"
                                      />
                                      {errors.companyEmail && (
                                        <FormErrorText>
                                          {errors.companyEmail.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("companyAddress")}
                                        id="companyAddress"
                                        name="companyAddress"
                                        type="text"
                                        labelName="Address"
                                        placeholder="Enter Address"
                                      />
                                      {errors.companyAddress && (
                                        <FormErrorText>
                                          {errors.companyAddress.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("region")}
                                        id="region"
                                        name="region"
                                        type="text"
                                        labelName="Region"
                                        placeholder="Enter Region"
                                      />
                                      {errors.region && (
                                        <FormErrorText>
                                          {errors.region.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("crno")}
                                        id="crno"
                                        name="crno"
                                        type="text"
                                        labelName="CR No"
                                        placeholder="Enter CR No"
                                      />
                                      {errors.crno && (
                                        <FormErrorText>
                                          {errors.crno.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register("vatNo")}
                                        id="vatNo"
                                        name="vatNo"
                                        type="text"
                                        labelName="VAT No"
                                        placeholder="Enter VAT No"
                                      />
                                      {errors.vatNo && (
                                        <FormErrorText>
                                          {errors.vatNo.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="clientType"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="clientType"
                                            name="clientType"
                                            labelName="Client Type"
                                            placeholder="Select Client Type"
                                            options={[
                                              { value: "1", label: "Gov" },
                                              { value: "2", label: "Semi Gov" },
                                              { value: "3", label: "Privet" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.clientType && (
                                        <FormErrorText>
                                          {errors.clientType.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <Controller
                                        name="segment"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="segment"
                                            name="segment"
                                            labelName="Segment"
                                            placeholder="Select Segment"
                                            options={[
                                              { value: "1", label: "O&G" },
                                              {
                                                value: "2",
                                                label: "Construction",
                                              },
                                              { value: "3", label: "Industry" },
                                            ]}
                                          />
                                        )}
                                      />
                                      {errors.segment && (
                                        <FormErrorText>
                                          {errors.segment.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>
                                  </TkRow>
                                </div>
                              </TkCol>
                            </TkRow>

                            <TkRow className="mt-5">
                              <TkCol>
                                <TkCardHeader tag="h5" className="mb-3">
                                  <h4>Requirement Details</h4>
                                </TkCardHeader>
                              </TkCol>
                            </TkRow>
                            {requirementDetailsSections.map((section) => (
                              <div key={section.id}>
                                {section.isVisible && (
                                  <TkRow className=" mb-4">
                                    <TkCol>
                                      <div>
                                        <>
                                          <TkRow className="g-3">
                                            <TkCol lg={4}>
                                              <Controller
                                                name="division"
                                                control={control}
                                                render={({ field }) => (
                                                  <TkSelect
                                                    {...field}
                                                    id="division"
                                                    name="division"
                                                    labelName="Division"
                                                    placeholder="Select Division"
                                                    options={[
                                                      {
                                                        value: "1",
                                                        label: "Energy",
                                                      },
                                                      {
                                                        value: "2",
                                                        label: "Cooling",
                                                      },
                                                      {
                                                        value: "3",
                                                        label: "Welding",
                                                      },
                                                    ]}
                                                  />
                                                )}
                                              />
                                              {errors.division && (
                                                <FormErrorText>
                                                  {errors.division.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <Controller
                                                name="requirement"
                                                control={control}
                                                render={({ field }) => (
                                                  <TkSelect
                                                    {...field}
                                                    id="requirement"
                                                    name="requirement"
                                                    labelName="Requirement"
                                                    placeholder="Select Requirement"
                                                    options={[]}
                                                  />
                                                )}
                                              />
                                              {errors.requirement && (
                                                <FormErrorText>
                                                  {errors.requirement.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register("projectName")}
                                                id="projectName"
                                                name="projectName"
                                                type="text"
                                                labelName="Project Name"
                                                placeholder="Enter Project Name"
                                              />
                                              {errors.projectName && (
                                                <FormErrorText>
                                                  {errors.projectName.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(`duration`, {
                                                  validate: (value) => {
                                                    if (
                                                      value &&
                                                      !/^[0-9]*([.:][0-9]+)?$/.test(
                                                        value
                                                      )
                                                    ) {
                                                      return "Invalid duration";
                                                    }
                                                    if (
                                                      convertTimeToSec(value) <=
                                                        86400 ||
                                                      value > 24
                                                    ) {
                                                      return "Duration should be less than 24 hours";
                                                    }
                                                  },
                                                })}
                                                id="duration"
                                                name="duration"
                                                type="text"
                                                placeholder="Enter Duration"
                                                labelName="Duration"
                                                onBlur={(e) => {
                                                  setValue(
                                                    `duration`,
                                                    convertToTimeFotTimeSheet(
                                                      e.target.value
                                                    )
                                                  );
                                                }}
                                              />
                                              {errors.duration && (
                                                <FormErrorText>
                                                  {errors.duration.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register("unitOfMeasure")}
                                                id="unitOfMeasure"
                                                name="unitOfMeasure"
                                                type="text"
                                                labelName="Unit Of Measure"
                                                placeholder="Enter Unit Of Measure"
                                              />
                                              {errors.unitOfMeasure && (
                                                <FormErrorText>
                                                  {errors.unitOfMeasure.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <Controller
                                                name="delivery"
                                                control={control}
                                                render={({ field }) => (
                                                  <TkDate
                                                    {...field}
                                                    id="delivery"
                                                    name="delivery"
                                                    type="text"
                                                    labelName="Expected Delivery Date"
                                                    placeholder="Enter Expected Delivery Date"
                                                  />
                                                )}
                                              />
                                              {errors.delivery?.message ? (
                                                <FormErrorText>
                                                  {errors.delivery?.message}
                                                </FormErrorText>
                                              ) : null}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register("location")}
                                                id="location"
                                                name="location"
                                                type="text"
                                                labelName="Location"
                                                placeholder="Enter Location"
                                              />
                                              {errors.location && (
                                                <FormErrorText>
                                                  {errors.location.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "locationContactPerson"
                                                )}
                                                id="locationContactPerson"
                                                name="locationContactPerson"
                                                type="text"
                                                labelName="Location Contact Person"
                                                placeholder="Enter Location Contact Person"
                                              />
                                              {errors.locationContactPerson && (
                                                <FormErrorText>
                                                  {
                                                    errors.locationContactPerson
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "contactPersonName"
                                                )}
                                                id="contactPersonName"
                                                name="contactPersonName"
                                                type="text"
                                                labelName="Contact Person Name"
                                                placeholder="Enter Contact Person Name"
                                              />
                                              {errors.contactPersonName && (
                                                <FormErrorText>
                                                  {
                                                    errors.contactPersonName
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "contactPersonNumber"
                                                )}
                                                id="contactPersonNumber"
                                                name="contactPersonNumber"
                                                type="text"
                                                labelName="Contact Person Number"
                                                placeholder="Enter Contact Person Number"
                                              />
                                              {errors.contactPersonNumber && (
                                                <FormErrorText>
                                                  {
                                                    errors.contactPersonNumber
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "contactPersonEmail"
                                                )}
                                                id="contactPersonEmail"
                                                name="contactPersonEmail"
                                                type="text"
                                                labelName="Contact Person Email"
                                                placeholder="Enter Contact Person Email"
                                              />
                                              {errors.contactPersonEmail && (
                                                <FormErrorText>
                                                  {
                                                    errors.contactPersonEmail
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register(
                                                  "contactPersonDesignation"
                                                )}
                                                id="contactPersonDesignation"
                                                name="contactPersonDesignation"
                                                type="text"
                                                labelName="Contact Person Designation"
                                                placeholder="Enter Contact Person Designation"
                                              />
                                              {errors.contactPersonDesignation && (
                                                <FormErrorText>
                                                  {
                                                    errors
                                                      .contactPersonDesignation
                                                      .message
                                                  }
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={12}>
                                              <TkInput
                                                {...register("notes")}
                                                id="note"
                                                name="note"
                                                type="textarea"
                                                labelName="Notes"
                                                placeholder="Enter Note"
                                              />
                                              {errors.notes && (
                                                <FormErrorText>
                                                  {errors.notes.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>
                                          </TkRow>
                                        </>
                                      </div>

                                      <TkRow className="mt-3">
                                        <TkCol>
                                          <TkButton
                                            type="button"
                                            onClick={() =>
                                              handleToggleVisibility(section.id)
                                            }
                                            className="bg-transparent border-0 ps-0 ms-0 text-center"
                                          >
                                            {section.isVisible ? (
                                              <span className="ms-auto badge p-1 rounded-circle badge-soft-danger fs-4 me-3">
                                                <TkIcon className="ri-delete-bin-6-line"></TkIcon>
                                              </span>
                                            ) : (
                                              <TkIcon className="ri-add-line"></TkIcon>
                                            )}
                                          </TkButton>
                                        </TkCol>
                                      </TkRow>
                                    </TkCol>
                                  </TkRow>
                                )}
                              </div>
                            ))}

                            <TkRow className="justify-content-center">
                              <TkCol lg={2} className="text-center">
                                <TkButton
                                  type="button"
                                  color="primary"
                                  onClick={handleAddSection}
                                >
                                  Add
                                </TkButton>
                              </TkCol>
                            </TkRow>

                            {/* <TkCol
                              md={1}
                              lg={5}
                              className="text-center text-md-end"
                            >
                              <TkButton
                                type="button"
                                className="bg-transparent border-0 ps-0 ms-0 text-center"
                                onClick={handleAddSection}
                              >
                                <span className="add-timsheet-btn badge p-1 rounded-circle badge-soft-dark fs-4">
                                  <TkIcon className="ri-add-line"></TkIcon>
                                </span>
                              </TkButton>
                            </TkCol> */}

                            <div className="d-flex mt-4 space-childern">
                              <div className="ms-auto" id="update-form-btns">
                                <TkButton
                                  type="button"
                                  color="primary"
                                  onClick={() => {
                                    toggleTab(tabs.leadAssigning);
                                  }}
                                >
                                  Next
                                </TkButton>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "lead" && (
                          <div>
                            <TkRow className="g-3">
                              <TkCol lg={4}>
                                <Controller
                                  name="region"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="region"
                                      name="region"
                                      labelName="Region"
                                      placeholder="Select Region"
                                      options={[
                                        { value: "1", label: "Region 1" },
                                        { value: "2", label: "Region 2" },
                                        { value: "3", label: "Region 3" },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.region && (
                                  <FormErrorText>
                                    {errors.region.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <Controller
                                  name="salesTeam"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="salesTeam"
                                      name="salesTeam"
                                      labelName="Sales Team Name"
                                      placeholder="Select Sales Team"
                                      options={[
                                        {
                                          value: "1",
                                          label: "Sales Team 1",
                                        },
                                        {
                                          value: "2",
                                          label: "Sales Team 2",
                                        },
                                        {
                                          value: "3",
                                          label: "Sales Team 3",
                                        },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.salesTeam && (
                                  <FormErrorText>
                                    {errors.salesTeam.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <div className="d-flex mt-4 space-childern">
                                <div className="ms-auto" id="update-form-btns">
                                  <TkButton
                                    type="button"
                                    color="primary"
                                    onClick={() => {
                                      toggleTab(tabs.leadNurutring);
                                    }}
                                  >
                                    Next
                                  </TkButton>
                                </div>
                              </div>
                            </TkRow>
                          </div>
                        )}

                        {activeTab === "nurturing" && (
                          <div>
                            <TkRow className="g-3">
                              <TkCol lg={4}>
                                <Controller
                                  name="primaryAcleadtion"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="primaryAcleadtion"
                                      name="primaryAction"
                                      labelName="Primary Action"
                                      placeholder="Select Primary Action"
                                      options={[
                                        { value: "1", label: "Replied" },
                                        { value: "2", label: "Call" },
                                        {
                                          value: "3",
                                          label: "Meeting appointment fixed",
                                        },
                                        {
                                          value: "3",
                                          label: "Meeting done",
                                        },
                                        {
                                          value: "3",
                                          label: "Waiting for the reply",
                                        },
                                        {
                                          value: "3",
                                          label: "Meeting postponed",
                                        },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.primaryAcleadtion && (
                                  <FormErrorText>
                                    {errors.primaryAcleadtion.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <Controller
                                  name="date"
                                  control={control}
                                  render={({ field }) => (
                                    <TkDate
                                      {...field}
                                      labelName="Date"
                                      id={"date"}
                                      placeholder="Enter Date"
                                      options={{
                                        altInput: true,
                                        dateFormat: "d M, Y",
                                      }}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        setSelectedDate(e);
                                        setAllDurations({});
                                      }}
                                      disabled={true}
                                      requiredStarOnLabel={true}
                                    />
                                  )}
                                />
                                {errors.date && (
                                  <FormErrorText>
                                    {errors.date.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <TkInput
                                  {...register(`time`, {
                                    required: "Time is required",
                                    validate: (value) => {
                                      if (
                                        value &&
                                        !/^[0-9]*([.:][0-9]+)?$/.test(value)
                                      ) {
                                        return "Invalid Time";
                                      }
                                      if (
                                        convertTimeToSec(value) > 86400 ||
                                        value > 24
                                      ) {
                                        return "Time should be less than 24 hours";
                                      }
                                    },
                                  })}
                                  onBlur={(e) => {
                                    setValue(
                                      `time`,
                                      convertToTimeFotTimeSheet(e.target.value)
                                    );
                                  }}
                                  labelName="Time (HH:MM)"
                                  id={"time"}
                                  name="time"
                                  type="text"
                                  placeholder="Enter Time"
                                  requiredStarOnLabel={true}
                                />
                                {errors.time && (
                                  <FormErrorText>
                                    {errors.time.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <TkInput
                                  {...register("leadValue")}
                                  id="leadValue"
                                  name="leadValue"
                                  labelName="Lead Value"
                                  type="text"
                                  placeholder="Enter Lead Value"
                                />
                                {errors.leadValue && (
                                  <FormErrorText>
                                    {errors.leadValue.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <Controller
                                  name="leadUpdate"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="leadUpdate"
                                      name="leadUpdate"
                                      labelName="Lead Update"
                                      placeholder="Select Lead Update"
                                      options={[
                                        {
                                          value: "1",
                                          label: "Qualified",
                                        },
                                        {
                                          value: "2",
                                          label: "Unqualified",
                                        },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.leadUpdate && (
                                  <FormErrorText>
                                    {errors.leadUpdate.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <TkInput
                                  {...register("reason")}
                                  id="reason"
                                  name="reason"
                                  labelName="Reason if unqualified lead"
                                  type="text"
                                  placeholder="Enter Reason"
                                />
                                {errors.reason && (
                                  <FormErrorText>
                                    {errors.reason.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <Controller
                                  name="prospectNurturing"
                                  control={control}
                                  render={({ field }) => (
                                    <TkSelect
                                      {...field}
                                      id="prospectNurturing"
                                      name="prospectNurturing"
                                      labelName="Prospect Nurturing"
                                      placeholder="Select Prospect Nurturing"
                                      options={[
                                        {
                                          value: "1",
                                          label: "Quotation Issued",
                                        },
                                        {
                                          value: "2",
                                          label: "Waiting fro the approval",
                                        },
                                        {
                                          value: "3",
                                          label: "Waiting for document",
                                        },
                                        {
                                          value: "3",
                                          label: "Waiting for the PO",
                                        },
                                      ]}
                                    />
                                  )}
                                />
                                {errors.prospectNurturing && (
                                  <FormErrorText>
                                    {errors.prospectNurturing.message}
                                  </FormErrorText>
                                )}
                              </TkCol>

                              <TkCol lg={4}>
                                <TkButton
                                  type="button"
                                  color="primary"
                                  className="mt-4"
                                  onClick={leadActivityToggle}
                                >
                                  Add Activity
                                </TkButton>
                              </TkCol>

                              <div className="d-flex mt-4 space-childern">
                                <div className="ms-auto" id="update-form-btns">
                                  <TkButton type="button" color="primary">
                                    Submit
                                  </TkButton>
                                </div>
                              </div>
                            </TkRow>
                          </div>
                        )}
                      </div>
                    )}
                  </Form>
                )}

                <TkModal
                  isOpen={activityModal}
                  leadActivityToggle={leadActivityToggle}
                  centered
                  size="lg"
                  className="border-0"
                  modalClassName="modal fade zoomIn"
                >
                  <TkModalHeader
                    className="p-3 bg-soft-info"
                    partnerToggle={leadActivityToggle}
                  >
                    {"Add Lead Activity"}
                  </TkModalHeader>
                  <TkContainer>
                    <TkCardBody>
                      <ActivityPopup isPopup={true} />
                    </TkCardBody>
                  </TkContainer>
                </TkModal>
              </div>
            </TkCol>
          </TkRow>
        </div>
      )}
    </>
  );
}

export default AddLead;
