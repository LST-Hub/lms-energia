import React, { useCallback, useEffect, useMemo, useState } from "react";
import TkPageHead from "../../../src/components/TkPageHead";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import {
  MaxNameLength,
  MinNameLength,
  clientTypes,
  createdByNameTypes,
  demoUserData,
  divisionTypes,
  leadSourceTypes,
  requirementTypes,
  segmentTypes,
  smallInputMaxLength,
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
import {
  API_BASE_URL,
  MaxEmailLength,
  MaxPhoneNumberLength,
  MinEmailLength,
  RQ,
  bigInpuMaxLength,
  modes,
  statusTypes,
} from "../../utils/Constants";
import TkTableContainer from "../TkTableContainer";
import Link from "next/link";
import { yupResolver } from "@hookform/resolvers/yup";
import TkModal, { TkModalHeader } from "../TkModal";
import ActivityPopup from "./ActivityPopup";
import FormErrorText from "../forms/ErrorText";
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
}).required();
// const tabs = {
//   directCall: "directCall",
//   email: "email",
//   socialMedia: "socialMedia",
//   portals: "portals",
//   directMarketing: "directMarketing",
//   leadAssigning: "leadAssigning",
//   leadNurutring: "leadNurutring",
// };

const tabs = {
  directCall: "directCall",
  phoneCall: "phoneCall",
  email: "email",
  socialMedia: "socialMedia",
  portals: "portals",
  directMarketing: "directMarketing",
};
function AddLead({ id, userData, mode }) {
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
  const [activeTab, setActiveTab] = useState(tabs.directCall);
  const router = useRouter();
  const viewMode = mode === modes.view;
  const editMode = mode === modes.edit;
  const lid = Number(id);
  const [activityModal, setActivityModal] = useState(false);
  const [directCallCheckbox, setDirectCallCheckbox] = useState(false);
  const [emailCheckbox, setEmailCheckbox] = useState(false);
  const [socialMediaCheckbox, setSocialMediaCheckbox] = useState(false);
  const [portalsCheckbox, setPortalsCheckbox] = useState(false);
  const [directMarketingCheckbox, setDirectMarketingCheckbox] = useState(false);
  const [isLeadEdit, setIsLeadEdit] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allDurations, setAllDurations] = useState({});
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
    setIsLeadEdit(true);
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
  // const toggleTab = (tab) => {
  //   if (activeTab !== tab) {
  //     setActiveTab(tab);
  //     router.push(`${urls.lead}/add?tab=${tab}`, undefined, {
  //       scroll: false,
  //     });
  //   }
  // };

  const DirectCallData = [
    {
      id: 1,
      _activityType: "Phone",
      lead: "John Doe",
      phoneNumber: "1234567890",
      date: "2021-09-01",
      comments: "Lead Mangement Demo",
    },
    {
      id: 2,
      _activityType: "Email",
      lead: "Steave Smith",
      phoneNumber: "1234567890",
      date: "2021-09-01",
      comments: "Lead Mangement Module Demo",
    },
    {
      id: 3,
      _activityType: "Meeting",
      lead: "Will Smith",
      phoneNumber: "1234567890",
      date: "2021-09-01",
      comments: "Lead Mangement Module Demo",
    },
  ];
  const columns = useMemo(
    () => [
      // {
      //   Header: "View",
      //   accessor: "view",
      //   filterable: false,
      //   Cell: (cellProps) => {
      //     return (
      //       <div className="d-flex align-items-center">
      //         <ul className="ps-0 mb-0">
      //           <li className="list-inline-item">
      //             <Link
      //               href={`${urls.phoneCallView}/${cellProps.row.original.id}`}
      //             >
      //               <a>
      //                 <TkButton color="none">
      //                   <TkIcon className="ri-eye-fill align-bottom text-muted"></TkIcon>
      //                 </TkButton>
      //               </a>
      //             </Link>
      //           </li>
      //         </ul>
      //       </div>
      //     );
      //   },
      // },
      {
        Header: "Activity Type",
        accessor: "_activityType",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Lead Name",
        accessor: "lead",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Phone Number",
        accessor: "phoneNumber",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Date",
        accessor: "date",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Comments",
        accessor: "comments",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
    ],
    []
  );

  useEffect(() => {
    if (userData) {
      setValue("leadSource", {
        value: userData.leadSource,
        label: userData.leadSource,
      });
      setValue("createdBy", userData.createdBy);
      setValue("name", userData.name);
      setValue("mobileNo", userData.mobileNo);
      setValue("email", userData.email);
      setValue("enquiryBy", {
        value: userData.enquiryBy,
        label: userData.enquiryBy,
      });
      setValue("noote", userData.noote);
      setValue("createdDate", userData.createdDate);
      setValue("leadValue", userData.leadValue);
      setValue("companyName", userData.companyName);
      setValue("contactNo", userData.contactNo);
      setValue("cemail", userData.cemail);
      setValue("address", userData.address);
      setValue("region", userData.region);
      setValue("crno", userData.crNo);
      setValue("vatNo", userData.vatNo);
      setValue("clientType", {
        value: userData.clientType,
        label: userData.clientType,
      });
      setValue("segment", {
        value: userData.segment,
        label: userData.segment,
      });
      setValue("division", {
        value: userData.division,
        label: userData.division,
      });
      setValue("requirement", {
        value: userData.requirement,
        label: userData.requirement,
      });
      setValue("projectName", userData.projectName);
      setValue("duration", userData.duration);
      setValue("delivery", userData.delivery);
      setValue("location", userData.location);
      setValue("locationContactPerson", userData.locationContactPerson);
      setValue("note", userData.note);
    }
  }, [setValue, userData]);

  useEffect(() => {
    setValue("createdDate", new Date());
    setSelectedDate(new Date());
  }, [setValue]);

  return (
    <>
      {isLeadEdit && (
        <div>
          <TkForm>
            <TkRow>
              <TkCol lg={12} className="d-flex justify-content-end">
                <TkButton
                  type="button"
                  color="primary"
                  onClick={leadActivityToggle}
                  disabled={viewMode}
                >
                  Add Activity
                </TkButton>
              </TkCol>
            </TkRow>
            <TkRow className="mt-3 mb-5">
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
                            labelName="Lead Source"
                            labelId={"_leadSource"}
                            id="leadSource"
                            placeholder="Select Lead Source"
                            options={leadSourceTypes}
                            requiredStarOnLabel={true}
                            disabled={viewMode}
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
                      <Controller
                        name="leadSource"
                        control={control}
                        render={({ field }) => (
                          <TkSelect
                            id="leadSource"
                            name="leadSource"
                            labelName="Lead Source"
                            placeholder="Select Lead Source"
                            requiredStarOnLabel="true"
                            options={leadSourceTypes}
                            disabled={viewMode}
                          />
                        )}
                      />
                    </TkCol> */}
                    <TkCol lg={4}>
                      <TkInput
                        {...register("createdBy")}
                        id="createdBy"
                        type="text"
                        labelName="Created By"
                        placeholder="Enter Created By"
                        disabled={true}
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
                          {errors.leadSource.message}
                        </FormErrorText>
                      )}
                    </TkCol>
                  </TkRow>
                </div>
              </TkCol>
            </TkRow>
            <TkRow className="mt-4">
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
                        disabled={viewMode}
                      />
                      {errors.name && (
                        <FormErrorText>{errors.name.message}</FormErrorText>
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
                        disabled={viewMode}
                      />
                      {errors.mobileNo && (
                        <FormErrorText>{errors.mobileNo.message}</FormErrorText>
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
                        disabled={viewMode}
                      />
                      {errors.email && (
                        <FormErrorText>{errors.email.message}</FormErrorText>
                      )}
                    </TkCol>

                    {/* <TkCol lg={4}>
                    <TkInput
                    {...register("leadValue")}
                      id="leadValue"
                      type="text"
                      labelName="Lead Value"
                      placeholder="Enter Lead Value"
                      requiredStarOnLabel="true"
                      disabled={viewMode}
                    />
                  </TkCol> */}
                    <TkCol lg={4}>
                      <Controller
                        name="enquiryBy"
                        control={control}
                        render={({ field }) => (
                          <TkSelect
                            {...field}
                            labelName="Enquiry By"
                            labelId={"_enquiryBy"}
                            id="enquiryBy"
                            placeholder="Enquiry By"
                            options={[
                              { value: "1", label: "Direct" },
                              { value: "2", label: "Consultant" },
                              { value: "3", label: "Other" },
                            ]}
                            requiredStarOnLabel={true}
                            disabled={viewMode}
                          />
                        )}
                      />
                      {errors.enquiryBy && (
                        <FormErrorText>
                          {errors.enquiryBy.message}
                        </FormErrorText>
                      )}
                    </TkCol>
                    {/* <TkCol lg={4}>
                      <TkSelect
                        id="enquiryBy"
                        name="enquiryBy"
                        labelName="Enquiry By"
                        placeholder="Enquiry By"
                        requiredStarOnLabel="true"
                        options={[
                          { value: "1", label: "Direct" },
                          { value: "2", label: "Consultant" },
                          { value: "3", label: "Other" },
                        ]}
                      />
                    </TkCol> */}
                    <TkCol lg={8}>
                      <TkInput
                        {...register("note")}
                        id="note"
                        type="text"
                        labelName="Note"
                        placeholder="Enter Note"
                        disabled={viewMode}
                      />
                      {errors.note && (
                        <FormErrorText>{errors.note.message}</FormErrorText>
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
                        disabled={viewMode}
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
                        disabled={viewMode}
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
                        disabled={viewMode}
                      />
                      {errors.companyEmail && (
                        <FormErrorText>
                          {errors.companyEmail.message}
                        </FormErrorText>
                      )}
                    </TkCol>
                    {/* </TkRow>
                  <TkRow className="mt-3"> */}
                    <TkCol lg={4}>
                      <TkInput
                        {...register("companyAddress")}
                        id="companyAddress"
                        name="companyAddress"
                        type="text"
                        labelName="Address"
                        placeholder="Enter Address"
                        disabled={viewMode}
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
                        disabled={viewMode}
                      />
                      {errors.region && (
                        <FormErrorText>{errors.region.message}</FormErrorText>
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
                        disabled={viewMode}
                      />
                      {errors.crno && (
                        <FormErrorText>{errors.crno.message}</FormErrorText>
                      )}
                    </TkCol>
                    {/* </TkRow>
                  <TkRow className="mt-3"> */}
                    <TkCol lg={4}>
                      <TkInput
                        {...register("vatNo")}
                        id="vatNo"
                        name="vatNo"
                        type="text"
                        labelName="VAT No"
                        placeholder="Enter VAT No"
                        disabled={viewMode}
                      />
                      {errors.vatNo && (
                        <FormErrorText>{errors.vatNo.message}</FormErrorText>
                      )}
                    </TkCol>

                    <TkCol lg={4}>
                      <Controller
                        name="clientType"
                        control={control}
                        render={({ field }) => (
                          <TkSelect
                            {...field}
                            labelName="Client Type "
                            labelId={"_clientType"}
                            id="lead"
                            placeholder="Select Leads"
                            options={createdByNameTypes}
                            requiredStarOnLabel={true}
                            disabled={viewMode}
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
                            labelName="Segment "
                            labelId={"_segment"}
                            id="lead"
                            placeholder="Select Segment"
                            options={segmentTypes}
                            requiredStarOnLabel={true}
                            disabled={viewMode}
                          />
                        )}
                      />
                      {errors.segment && (
                        <FormErrorText>{errors.segment.message}</FormErrorText>
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
                                    labelName="Division "
                                    labelId={"_division"}
                                    id="division"
                                    placeholder="Select Division"
                                    options={divisionTypes}
                                    requiredStarOnLabel={true}
                                    disabled={viewMode}
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
                                    labelName="Requirement "
                                    labelId={"_requirement"}
                                    id="requirement"
                                    placeholder="Select Requirement"
                                    options={requirementTypes}
                                    requiredStarOnLabel={true}
                                    disabled={viewMode}
                                  />
                                )}
                              />
                              {errors.requirement && (
                                <FormErrorText>
                                  {errors.requirement.message}
                                </FormErrorText>
                              )}
                            </TkCol>

                            {/* <TkCol lg={4}>
                          <TkInput
                            {...register("requirement")}
                            id="requirement"
                            name="requirement"
                            type="textarea"
                            labelName="Requirement"
                            placeholder="Enter Requirement"
                            disabled={viewMode}
                          />
                        </TkCol> */}
                            <TkCol lg={4}>
                              <TkInput
                                {...register("projectName")}
                                id="projectName"
                                name="projectName"
                                type="text"
                                labelName="Project Name"
                                placeholder="Enter Project Name"
                                disabled={viewMode}
                              />
                              {errors.projectName && (
                                <FormErrorText>
                                  {errors.projectName.message}
                                </FormErrorText>
                              )}
                            </TkCol>
                            {/* </TkRow>
                          <TkRow className="mt-3"> */}
                            <TkCol lg={4}>
                              <TkInput
                                {...register("duration")}
                                id="duration"
                                name="duration"
                                type="text"
                                labelName="Duration"
                                placeholder="Enter Duration"
                                disabled={viewMode}
                              />
                              {errors.duration && (
                                <FormErrorText>
                                  {errors.duration.message}
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
                                    labelName="Expected Delivery Date"
                                    id={"delivery"}
                                    placeholder="Enter Expected Delivery Date"
                                    options={{
                                      altInput: true,
                                      dateFormat: "d M, Y",
                                    }}
                                    requiredStarOnLabel={true}
                                    disabled={viewMode}
                                  />
                                )}
                              />
                              {errors.delivery && (
                                <FormErrorText>
                                  {errors.delivery.message}
                                </FormErrorText>
                              )}
                            </TkCol>
                            <TkCol lg={4}>
                              <TkInput
                                {...register("location")}
                                id="location"
                                name="location"
                                type="text"
                                labelName="Location"
                                placeholder="Enter Location"
                                disabled={viewMode}
                              />
                              {errors.location && (
                                <FormErrorText>
                                  {errors.location.message}
                                </FormErrorText>
                              )}
                            </TkCol>
                            {/* </TkRow>
                          <TkRow className="mt-3"> */}
                            <TkCol lg={4}>
                              <TkInput
                                {...register("locationContactPerson")}
                                id="locationContactPerson"
                                name="locationContactPerson"
                                type="text"
                                labelName="Location Contact Person"
                                placeholder="Enter Location Contact Person"
                                disabled={viewMode}
                              />
                              {errors.locationContactPerson && (
                                <FormErrorText>
                                  {errors.locationContactPerson.message}
                                </FormErrorText>
                              )}
                            </TkCol>
                            <TkCol lg={4}>
                                              <TkInput
                                                {...register("contactPersonName")}
                                                id="contactPersonName"
                                                name="contactPersonName"
                                                type="text"
                                                labelName="Contact Person Name"
                                                placeholder="Enter Contact Person Name"
                                              />
                                              {errors.contactPersonName && (
                                                <FormErrorText>
                                                  {errors.contactPersonName.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register("contactPersonNumber")}
                                                id="contactPersonNumber"
                                                name="contactPersonNumber"
                                                type="text"
                                                labelName="Contact Person Number"
                                                placeholder="Enter Contact Person Number"
                                              />
                                              {errors.contactPersonNumber && (
                                                <FormErrorText>
                                                  {errors.contactPersonNumber.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>


                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register("contactPersonEmail")}
                                                id="contactPersonEmail"
                                                name="contactPersonEmail"
                                                type="text"
                                                labelName="Contact Person Email"
                                                placeholder="Enter Contact Person Email"
                                              />
                                              {errors.contactPersonEmail && (
                                                <FormErrorText>
                                                  {errors.contactPersonEmail.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>


                                            <TkCol lg={4}>
                                              <TkInput
                                                {...register("contactPersonDesignation")}
                                                id="contactPersonDesignation"
                                                name="contactPersonDesignation"
                                                type="text"
                                                labelName="Contact Person Designation"
                                                placeholder="Enter Contact Person Designation"
                                              />
                                              {errors.contactPersonDesignation && (
                                                <FormErrorText>
                                                  {errors.contactPersonDesignation.message}
                                                </FormErrorText>
                                              )}
                                            </TkCol>

                                            <TkCol lg={4}>
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
                            onClick={() => handleToggleVisibility(section.id)}
                            className="bg-transparent border-0 ps-0 ms-0 text-center"
                            disabled={viewMode}
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
                  disabled={viewMode}
                >
                  Add
                </TkButton>
              </TkCol>
            </TkRow>

            {/* <TkCol md={1} lg={5} className="text-center text-md-end">
              <TkButton
                type="button"
                className="bg-transparent border-0 ps-0 ms-0 text-center"
                onClick={handleAddSection}
                disabled={viewMode}
              >
                <span className="add-timsheet-btn badge p-1 rounded-circle badge-soft-dark fs-4">
                  <TkIcon className="ri-add-line"></TkIcon>
                </span>
              </TkButton>
            </TkCol> */}
            <TkRow className="g-3">
              {/* <TkCardHeader>
                <h5>Leads Events</h5>
              </TkCardHeader> */}

              {/* <TkCol lg={12}>
                <TkRow className="justify-content-start mt-4">
                  <TkCol xs={"auto"}>
                    <TkCheckBox
                      // {...register("directCallCheckbox")}
                      id="directCallCheckbox"
                      type="checkbox"
                      onChange={(e) => setDirectCallCheckbox(e.target.checked)}
                    />
                    <TkLabel className="ms-3 me-lg-5" id="supervisor">
                      Direct Call
                    </TkLabel>
                  </TkCol>

                  <TkCol xs={"auto"}>
                    <TkCheckBox
                      // {...register("emailCheckbox")}
                      id="emailCheckbox"
                      type="checkbox"
                      onChange={(e) => setEmailCheckbox(e.target.checked)}
                    />
                    <TkLabel className="ms-3 me-lg-5" id="privatePhoenCall">
                      Email
                    </TkLabel>
                  </TkCol>

                  <TkCol xs={"auto"}>
                    <TkCheckBox
                      // {...register("socialMediaCheckbox")}
                      id="socialMediaCheckbox"
                      type="checkbox"
                      onChange={(e) => setSocialMediaCheckbox(e.target.checked)}
                    />
                    <TkLabel className="ms-3 me-lg-5" id="privatePhoenCall">
                      Social Media
                    </TkLabel>
                  </TkCol>

                  <TkCol xs={"auto"}>
                    <TkCheckBox
                      // {...register("portsCheckbox")}
                      id="portsCheckbox"
                      type="checkbox"
                      onChange={(e) => setPortalsCheckbox(e.target.checked)}
                    />
                    <TkLabel className="ms-3 me-lg-5" id="privatePhoenCall">
                      Portals
                    </TkLabel>
                  </TkCol>

                  <TkCol xs={"auto"}>
                    <TkCheckBox
                      // {...register("directMarketingCheckbox")}
                      id="directMarketingCheckbox"
                      type="checkbox"
                      onChange={(e) =>
                        setDirectMarketingCheckbox(e.target.checked)
                      }
                    />
                    <TkLabel className="ms-3 me-lg-5" id="privatePhoenCall">
                      Direct Marketing
                    </TkLabel>
                  </TkCol>
                </TkRow>
              </TkCol> */}

              {/* Direct Call */}
              {/* <div>
                {directCallCheckbox && (
                  <>
                    <TkRow className="justify-content-center mt-4">
                      <TkCardHeader>
                        <h4>Direct Call</h4>
                      </TkCardHeader>
                      <TkRow className="g-3 gx-4 ">
                        <TkCol lg={4}>
                          <TkSelect
                            id="leadSource"
                            name="leadSource"
                            labelName="Lead Source"
                            placeholder="Select Lead Source"
                            requiredStarOnLabel="true"
                            options={[
                              { value: "1", label: "Direct" },
                              { value: "2", label: "Refferal" },
                              { value: "3", label: "New" },
                            ]}
                          />
                        </TkCol>
                      </TkRow>

                      <TkRow className="mt-5">
                        <TkCol>
                          <TkCardHeader tag="h5" className="mb-3">
                            <h4>Lead Assigning</h4>
                          </TkCardHeader>
                          <>
                            <TkRow className="g-3">
                              <TkCol lg={4}>
                                <TkSelect
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
                              </TkCol>
                              <TkCol lg={4}>
                                <TkSelect
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
                              </TkCol>
                            </TkRow>
                          </>
                        </TkCol>
                      </TkRow>

                      <TkRow className="mt-5">
                        <TkCol>
                          <TkCardHeader tag="h5" className="mb-3">
                            <h4>Lead Nurturing</h4>
                          </TkCardHeader>
                          <div>
                            <TkRow className="g-3">
                              <TkCol lg={4}>
                                <TkSelect
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
                              </TkCol>
                              <TkCol lg={4}>
                                <TkInput
                                  id="leadValue"
                                  name="leadValue"
                                  labelName="Lead Value"
                                  type="text"
                                  placeholder="Enter Lead Value"
                                />
                              </TkCol>
                              <TkCol lg={4}>
                                <TkSelect
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
                              </TkCol>
                            </TkRow>
                            <TkRow className="mt-4">
                              <TkCol lg={4}>
                                <TkInput
                                  id="reason"
                                  name="reason"
                                  labelName="Reason if unqualified lead"
                                  type="text"
                                  placeholder="Enter Reason"
                                />
                              </TkCol>
                              <TkCol lg={4}>
                                <TkSelect
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
                              </TkCol>
                            </TkRow>
                          </div>
                        </TkCol>
                      </TkRow>
                    </TkRow>
                  </>
                )}

                {/* Email */}
              {/* <>
                  {emailCheckbox && (
                    <>
                      <TkRow className="justify-content-center mt-4">
                        <TkCardHeader>
                          <h4>Email</h4>
                        </TkCardHeader>
                        <TkRow className="g-3 gx-4 ">
                          <TkCol lg={4}>
                            <TkSelect
                              id="leadSource"
                              name="leadSource"
                              labelName="Lead Source"
                              placeholder="Select Lead Source"
                              requiredStarOnLabel="true"
                              options={[
                                { value: "1", label: "Direct" },
                                { value: "2", label: "Refferal" },
                                { value: "3", label: "Portal" },
                                { value: "4", label: "New" },
                                { value: "5", label: "Existing" },
                              ]}
                            />
                          </TkCol>
                        </TkRow>

                        <TkRow className="mt-5">
                          <TkCol>
                            <TkCardHeader tag="h5" className="mb-3">
                              <h4>Lead Assigning</h4>
                            </TkCardHeader>
                            <div>
                              <TkRow className="g-3">
                                <TkCol lg={4}>
                                  <TkSelect
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
                                </TkCol>
                                <TkCol lg={4}>
                                  <TkSelect
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
                                </TkCol>
                              </TkRow>
                            </div>
                          </TkCol>
                        </TkRow>

                        <TkRow className="mt-5">
                          <TkCol>
                            <TkCardHeader tag="h5" className="mb-3">
                              <h4>Lead Nurturing</h4>
                            </TkCardHeader>
                            <div>
                              <TkRow className="g-3">
                                <TkCol lg={4}>
                                  <TkSelect
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
                                </TkCol>
                                <TkCol lg={4}>
                                  <TkInput
                                    id="leadValue"
                                    name="leadValue"
                                    labelName="Lead Value"
                                    type="text"
                                    placeholder="Enter Lead Value"
                                  />
                                </TkCol>
                                <TkCol lg={4}>
                                  <TkSelect
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
                                </TkCol>
                              </TkRow>
                              <TkRow className="mt-4">
                                <TkCol lg={4}>
                                  <TkInput
                                    id="reason"
                                    name="reason"
                                    labelName="Reason if unqualified lead"
                                    type="text"
                                    placeholder="Enter Reason"
                                  />
                                </TkCol>
                                <TkCol lg={4}>
                                  <TkSelect
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
                                </TkCol>
                              </TkRow>
                            </div>
                          </TkCol>
                        </TkRow>
                      </TkRow>
                    </>
                  )}
                </> */}

              {/* Social Media */}
              {/* <>
                  {socialMediaCheckbox && (
                    <>
                      <TkRow className="justify-content-center mt-4">
                        <TkCardHeader>
                          <h4>Social Media</h4>
                        </TkCardHeader>
                        <TkRow className="g-3 gx-4 ">
                          <TkCol lg={4}>
                            <TkSelect
                              id="leadSource"
                              name="leadSource"
                              labelName="Lead Source"
                              placeholder="Select Lead Source"
                              requiredStarOnLabel="true"
                              options={[
                                { value: "1", label: "New" },
                                { value: "2", label: "Existing" },
                              ]}
                            />
                          </TkCol>
                          <TkCol lg={4}>
                            <TkSelect
                              id="platformType"
                              name="platformType"
                              labelName="Name Of Platform"
                              placeholder="Select Platform"
                              requiredStarOnLabel="true"
                              options={[
                                { value: "1", label: "Linkedin" },
                                { value: "2", label: "Facebook" },
                                { value: "3", label: "Instagram" },
                                { value: "4", label: "Twitter" },
                              ]}
                            />
                          </TkCol>
                          <TkCol lg={4}>
                            <TkInput
                              id="campaignName"
                              name="campaignName"
                              type="text"
                              labelName="Campaign Name"
                              placeholder="Enter Campaign Name"
                              requiredStarOnLabel="true"
                            />
                          </TkCol>
                        </TkRow>

                        <TkRow className="mt-5">
                          <TkCol>
                            <TkCardHeader tag="h5" className="mb-3">
                              <h4>Lead Assigning</h4>
                            </TkCardHeader>
                            <div>
                              <TkRow className="g-3">
                                <TkCol lg={4}>
                                  <TkSelect
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
                                </TkCol>
                                <TkCol lg={4}>
                                  <TkSelect
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
                                </TkCol>
                              </TkRow>
                            </div>
                          </TkCol>
                        </TkRow>

                        <TkRow className="mt-5">
                          <TkCol>
                            <TkCardHeader tag="h5" className="mb-3">
                              <h4>Lead Nurturing</h4>
                            </TkCardHeader>
                            <div>
                              <TkRow className="g-3">
                                <TkCol lg={4}>
                                  <TkSelect
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
                                </TkCol>
                                <TkCol lg={4}>
                                  <TkInput
                                    id="leadValue"
                                    name="leadValue"
                                    labelName="Lead Value"
                                    type="text"
                                    placeholder="Enter Lead Value"
                                  />
                                </TkCol>
                                <TkCol lg={4}>
                                  <TkSelect
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
                                </TkCol>
                              </TkRow>
                              <TkRow className="mt-4">
                                <TkCol lg={4}>
                                  <TkInput
                                    id="reason"
                                    name="reason"
                                    labelName="Reason if unqualified lead"
                                    type="text"
                                    placeholder="Enter Reason"
                                  />
                                </TkCol>
                                <TkCol lg={4}>
                                  <TkSelect
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
                                </TkCol>
                              </TkRow>
                            </div>
                          </TkCol>
                        </TkRow>
                      </TkRow>
                    </>
                  )}
                </> */}

              {/* Ports */}
              {/* <>
                  {portalsCheckbox && (
                    <>
                      <TkRow className="justify-content-center mt-4">
                        <TkCardHeader>
                          <h4>Portals</h4>
                        </TkCardHeader>
                        <TkRow className="g-3 gx-4 ">
                          <TkCol lg={4}>
                            <TkSelect
                              id="leadSource"
                              name="leadSource"
                              labelName="Lead Source"
                              placeholder="Select Lead Source"
                              requiredStarOnLabel="true"
                              options={[
                                { value: "1", label: "New" },
                                { value: "2", label: "Existing" },
                              ]}
                            />
                          </TkCol>
                          <TkCol lg={4}>
                            <TkSelect
                              id="portalType"
                              name="portalType"
                              labelName="Name Of Portal"
                              placeholder="Select Portal"
                              requiredStarOnLabel="true"
                              options={[
                                { value: "1", label: "Direct Marketing" },
                                { value: "2", label: "Social Media" },
                                { value: "3", label: "Website" },
                                { value: "4", label: "Email" },
                                { value: "5", label: "Referral" },
                                { value: "6", label: "Other" },
                              ]}
                            />
                          </TkCol>
                        </TkRow>

                        <TkRow className="mt-5">
                          <TkCol>
                            <TkCardHeader tag="h5" className="mb-3">
                              <h4>Lead Assigning</h4>
                            </TkCardHeader>
                            <div>
                              <TkRow className="g-3">
                                <TkCol lg={4}>
                                  <TkSelect
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
                                </TkCol>
                                <TkCol lg={4}>
                                  <TkSelect
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
                                </TkCol>
                              </TkRow>
                            </div>
                          </TkCol>
                        </TkRow>

                        <TkRow className="mt-5">
                          <TkCol>
                            <TkCardHeader tag="h5" className="mb-3">
                              <h4>Lead Nurturing</h4>
                            </TkCardHeader>
                            <div>
                              <TkRow className="g-3">
                                <TkCol lg={4}>
                                  <TkSelect
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
                                </TkCol>
                                <TkCol lg={4}>
                                  <TkInput
                                    id="leadValue"
                                    name="leadValue"
                                    labelName="Lead Value"
                                    type="text"
                                    placeholder="Enter Lead Value"
                                  />
                                </TkCol>
                                <TkCol lg={4}>
                                  <TkSelect
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
                                </TkCol>
                              </TkRow>
                              <TkRow className="mt-4">
                                <TkCol lg={4}>
                                  <TkInput
                                    id="reason"
                                    name="reason"
                                    labelName="Reason if unqualified lead"
                                    type="text"
                                    placeholder="Enter Reason"
                                  />
                                </TkCol>
                                <TkCol lg={4}>
                                  <TkSelect
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
                                </TkCol>
                              </TkRow>
                            </div>
                          </TkCol>
                        </TkRow>
                      </TkRow>
                    </>
                  )}
                </> */}

              {/* Direct Marketing */}
              {/* {directMarketingCheckbox && (
                  <>
                    <TkRow className="justify-content-center mt-4">
                      <TkCardHeader>
                        <h4>Direct Marketing</h4>
                      </TkCardHeader>
                      <TkRow className="g-3 gx-4 ">
                        <TkCol lg={4}>
                          <TkSelect
                            id="leadSource"
                            name="leadSource"
                            labelName="Lead Source"
                            placeholder="Select Lead Source"
                            requiredStarOnLabel="true"
                            options={[
                              { value: "1", label: "New" },
                              { value: "2", label: "Existing" },
                            ]}
                          />
                        </TkCol>
                        <TkCol lg={4}>
                          <TkSelect
                            id="visitDate"
                            name="visitDate"
                            labelName="Date Of Visit"
                            options={[]}
                            placeholder="Select Visit Date"
                            requiredStarOnLabel="true"
                          />
                        </TkCol>
                        <TkCol lg={4}>
                          <TkSelect
                            id="visitTime"
                            name="visitTime"
                            labelName="Time Of Visit"
                            options={[]}
                            placeholder="Select Visit Time"
                            requiredStarOnLabel="true"
                          />
                        </TkCol>
                      </TkRow>
                      <TkRow className="mt-3">
                        <TkCol lg={4}>
                          <TkSelect
                            id="visitUpdate"
                            name="visitUpdate"
                            labelName="Visit Update"
                            options={[]}
                            placeholder="Select Visit Update"
                            requiredStarOnLabel="true"
                          />
                        </TkCol>
                      </TkRow>

                      <TkRow className="mt-5">
                        <TkCol>
                          <TkCardHeader tag="h5" className="mb-3">
                            <h4>Lead Assigning</h4>
                          </TkCardHeader>
                          <div>
                            <TkRow className="g-3">
                              <TkCol lg={4}>
                                <TkSelect
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
                              </TkCol>
                              <TkCol lg={4}>
                                <TkSelect
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
                              </TkCol>
                            </TkRow>
                          </div>
                        </TkCol>
                      </TkRow>

                      <TkRow className="mt-5">
                        <TkCol>
                          <TkCardHeader tag="h5" className="mb-3">
                            <h4>Lead Nurturing</h4>
                          </TkCardHeader>
                          <div>
                            <TkRow className="g-3">
                              <TkCol lg={4}>
                                <TkSelect
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
                              </TkCol>
                              <TkCol lg={4}>
                                <TkInput
                                  id="leadValue"
                                  name="leadValue"
                                  labelName="Lead Value"
                                  type="text"
                                  placeholder="Enter Lead Value"
                                />
                              </TkCol>
                              <TkCol lg={4}>
                                <TkSelect
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
                              </TkCol>
                            </TkRow>
                            <TkRow className="mt-4">
                              <TkCol lg={4}>
                                <TkInput
                                  id="reason"
                                  name="reason"
                                  labelName="Reason if unqualified lead"
                                  type="text"
                                  placeholder="Enter Reason"
                                />
                              </TkCol>
                              <TkCol lg={4}>
                                <TkSelect
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
                              </TkCol>
                            </TkRow>
                          </div>
                        </TkCol>
                      </TkRow>
                    </TkRow>
                  </>
                )} */}
              {/* </div>  */}

              {/* <h5>Lead History</h5> */}

              <div className="d-flex mt-4 space-childern">
                {editMode ? (
                  <div className="ms-auto" id="update-form-btns">
                    <TkButton
                      color="secondary"
                      onClick={() => router.push(`${urls.lead}`)}
                      type="button"
                    >
                      Cancel
                    </TkButton>{" "}
                    <TkButton type="submit" color="primary">
                      Update
                    </TkButton>
                  </div>
                ) : null}
              </div>

              <Nav className="nav-tabs dropdown-tabs nav-tabs-custom mb-3 mt-3">
                <NavItem>
                  <NavLink
                    // href="#"
                    className={classnames({
                      active: activeTab === tabs.phoneCall,
                    })}
                    // onClick={() => {
                    //   toggleTab(tabs.phoneCall);
                    // }}
                  >
                    Lead Activity
                  </NavLink>
                </NavItem>
              </Nav>

              <TabContent activeTab={activeTab}>
                <TabPane tabId={tabs.directCall}>
                  <TkCardBody className="table-padding pt-0">
                    <TkTableContainer
                      columns={columns}
                      data={DirectCallData || []}
                      isSearch={false}
                      defaultPageSize={10}
                      isFilters={true}
                      showPagination={true}
                    />
                  </TkCardBody>
                </TabPane>
              </TabContent>
            </TkRow>
          </TkForm>
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
      )}
    </>
  );
}

export default AddLead;
