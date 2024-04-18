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
import TkContainer from "../../../src/components/TkContainer";
import TkRow, { TkCol } from "../../../src/components/TkRow";
import TkSelect from "../../../src/components/forms/TkSelect";
import TkInput from "../../../src/components/forms/TkInput";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import TkIcon from "../TkIcon";
import TkButton from "../TkButton";
import TkDate from "../forms/TkDate";
import TkForm from "../forms/TkForm";
import * as Yup from "yup";
import {
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

const tabs = {
  directCall: "directCall",
  phoneCall: "phoneCall",
  email: "email",
  socialMedia: "socialMedia",
  portals: "portals",
  directMarketing: "directMarketing",
  requirementDetails: "requirementDetails",
  locationDetails: "locationDetails",
};
function EditLead({ id, userData, mode }) {
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
  const [activeSubTab, setActiveSubTab] = useState(tabs.requirementDetails);
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

  const [rows, setRows] = useState([
    {
      division: null,
      requirement: "",
      projectname: "",
      duration: "",
      unitOfMeasure: null,
      delivery: "",
    },
  ]);
  const [locationRows, setLocationRows] = useState([
    {
      location: "",
      contactPersonName: "",
      phoneNumber: "",
      email: "",
      designation: "",
    },
  ]);
  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      // setActiveTab(tab);
      setActiveSubTab(tab);
      // router.push(`${urls.leadEdit}?tab=${tab}`, undefined, {
      //   scroll: false,
      // });
    }
  };
  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        division: null,
        requirement: "",
        projectname: "",
        duration: "",
        unitOfMeasure: null,
        delivery: "",
      },
    ]);
  };

  const handleAddLocationRow = () => {
    setLocationRows([
      ...locationRows,
      {
        location: "",
        contactPersonName: "",
        phoneNumber: "",
        email: "",
        designation: "",
      },
    ]);
  };

  const { remove: removeDivision } = useFieldArray({
    control,
    name: "division",
  });
  const { remove: removeRequirement } = useFieldArray({
    control,
    name: "requirement",
  });
  const { remove: removeProjectName } = useFieldArray({
    control,
    name: "projectname",
  });
  const { remove: removeDuration } = useFieldArray({
    control,
    name: "duration",
  });
  const { remove: removeUnitOfMeasure } = useFieldArray({
    control,
    name: "unitOfMeasure",
  });
  const { remove: removeDelivery } = useFieldArray({
    control,
    name: "delivery",
  });
  const { remove: removeLocation } = useFieldArray({
    control,
    name: "location",
  });
  const { remove: removeContactPersonName } = useFieldArray({
    control,
    name: "contactPersonName",
  });
  const { remove: removephoneNumber } = useFieldArray({
    control,
    name: "phoneNumber",
  });
  const { remove: removeEmail } = useFieldArray({
    control,
    name: "email",
  });
  const { remove: removeDesignation } = useFieldArray({
    control,
    name: "designation",
  });

  const handleRemoveRow = (index) => {
    removeDivision(index);
    removeRequirement(index);
    removeProjectName(index);
    removeDuration(index);
    removeUnitOfMeasure(index);
    removeDelivery(index);
    removeLocation(index);
    removeContactPersonName(index);
    removephoneNumber(index);
    removeEmail(index);
    removeDesignation(index);
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  const handleRemoveLocationRow = (i) => {
    removeLocation(i);
    removeContactPersonName(i);
    removephoneNumber(i);
    removeEmail(i);
    removeDesignation(i);
    const newLocationRows = [...locationRows];
    newLocationRows.splice(i, 1);
    setLocationRows(newLocationRows);
  };
  const requirementDetailsColumns = [
    {
      Header: "Division",
      accessor: "division",
      Cell: (cellProps) => {
        return (
          <>
            <Controller
              control={control}
              name={`division[${cellProps.row.index}]`}
              render={({ field }) => (
                <TkSelect
                  {...field}
                  id={"division"}
                  placeholder="Division"
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
                  requiredStarOnLabel={true}
                  disabled={viewMode}
                  style={{ width: "200px" }}
                />
              )}
            />
            {errors?.task?.[cellProps.row.index] && (
              <FormErrorText>
                {errors?.task?.[cellProps.row.index]?.message}
              </FormErrorText>
            )}
          </>
        );
      },
    },
    {
      Header: "Requirement",
      accessor: "requirement",
      Cell: (cellProps) => {
        return (
          <Controller
            control={control}
            name={`requirement[${cellProps.row.index}]`}
            rules={{ required: "Employee is required" }}
            render={({ field }) => (
              <>
                <TkSelect
                  {...field}
                  id="requirement"
                  placeholder="Requirement"
                  // loading={selectedTaskId && isUsersLoading}
                  // options={allUsersData}
                  // menuPlacement="top"
                  style={{ width: "200px" }}
                  disabled={viewMode}
                />
                {errors?.requirement?.[cellProps.row.index] && (
                  <FormErrorText>
                    {errors?.requirement?.[cellProps.row.index]?.message}
                  </FormErrorText>
                )}
              </>
            )}
          />
        );
      },
    },
    {
      Header: "Project Name",
      accessor: "projectName",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              placeholder="Project Name"
              disabled={viewMode}
              {...register(`projectName[${cellProps.row.index}]`)}
            />
            {errors?.duration?.[cellProps.row.index] && (
              <FormErrorText>
                {errors?.duration?.[cellProps.row.index]?.message}
              </FormErrorText>
            )}
          </>
        );
      },
    },
    {
      Header: "Duration",
      accessor: "duration",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              placeholder="Duration"
              disabled={viewMode}
              {...register(`duration[${cellProps.row.index}]`, {
                required: "Duration is required",
                validate: (value) => {
                  if (value && !/^[0-9]*([.:][0-9]+)?$/.test(value)) {
                    return "Invalid Duration";
                  }
                  if (convertTimeToSec(value) > 86400 || value > 24) {
                    return "Duration should be less than 24 hours";
                  }
                },
              })}
              onBlur={(e) => {
                setValue(
                  `duration[${cellProps.row.index}]`,
                  convertToTimeFotTimeSheet(e.target.value)
                );
              }}
            />
            {errors?.duration?.[cellProps.row.index] && (
              <FormErrorText>
                {errors?.duration?.[cellProps.row.index]?.message}
              </FormErrorText>
            )}
          </>
        );
      },
    },

    {
      Header: "Unit Of Measure",
      accessor: "unitOfMeasure",
      Cell: (cellProps) => {
        return (
          <>
            <Controller
              control={control}
              name={`unitOfMeasure[${cellProps.row.index}]`}
              render={({ field }) => (
                <>
                  <TkSelect
                    {...field}
                    id="unitOfMeasure"
                    placeholder="Unit Of Measure"
                    disabled={viewMode}
                    // loading={selectedTaskId && isUsersLoading}
                    // options={allUsersData}
                    // menuPlacement="top"
                  />
                  {errors?.unitOfMeasure?.[cellProps.row.index] && (
                    <FormErrorText>
                      {errors?.unitOfMeasure?.[cellProps.row.index]?.message}
                    </FormErrorText>
                  )}
                </>
              )}
            />
          </>
        );
      },
    },

    {
      Header: "Expected Delivery Date",
      accessor: "delivery",
      Cell: (cellProps) => {
        return (
          <>
            <Controller
              control={control}
              name={`delivery[${cellProps.row.index}]`}
              render={({ field }) => (
                <>
                  <TkDate
                    {...field}
                    id="delivery"
                    placeholder="Expected Delivery Date"
                    disabled={viewMode}
                  />
                  {errors?.delivery?.[cellProps.row.index] && (
                    <FormErrorText>
                      {errors?.delivery?.[cellProps.row.index]?.message}
                    </FormErrorText>
                  )}
                </>
              )}
            />
          </>
        );
      },
    },
    {
      Header: "Action",
      accessor: "action",
      Cell: (cellProps) => {
        return (
          <>
            <TkButton
              type={"button"}
              onClick={() => {
                handleRemoveRow(cellProps.row.index);
              }}
              disabled={rows.length === 1}
            >
              Delete
            </TkButton>
          </>
        );
      },
    },
  ];
  const locationDetailsColumns = [
    {
      Header: "Location",
      accessor: "location",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              placeholder="Location Name"
              disabled={viewMode}
              {...register(`location[${cellProps.row.index}]`)}
            />
            {errors?.location?.[cellProps.row.index] && (
              <FormErrorText>
                {errors?.location?.[cellProps.row.index]?.message}
              </FormErrorText>
            )}
          </>
        );
      },
    },
    {
      Header: "Contact Person Name",
      accessor: "contactPersonName",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              placeholder="Contact Person Name"
              disabled={viewMode}
              {...register(`contactPersonName[${cellProps.row.index}]`)}
            />
            {errors?.contactPersonName?.[cellProps.row.index] && (
              <FormErrorText>
                {errors?.contactPersonName?.[cellProps.row.index]?.message}
              </FormErrorText>
            )}
          </>
        );
      },
    },
    {
      Header: "Phone Number",
      accessor: "phoneNumber",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              placeholder="Phone Number"
              disabled={viewMode}
              {...register(`phoneNumber[${cellProps.row.index}]`)}
            />
            {errors?.phoneNumber?.[cellProps.row.index] && (
              <FormErrorText>
                {errors?.phoneNumber?.[cellProps.row.index]?.message}
              </FormErrorText>
            )}
          </>
        );
      },
    },

    {
      Header: "Email",
      accessor: "email",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              placeholder="Email"
              disabled={viewMode}
              {...register(`email[${cellProps.row.index}]`)}
            />
            {errors?.email?.[cellProps.row.index] && (
              <FormErrorText>
                {errors?.email?.[cellProps.row.index]?.message}
              </FormErrorText>
            )}
          </>
        );
      },
    },

    {
      Header: "Designation",
      accessor: "designation",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              placeholder="Designation"
              disabled={viewMode}
              {...register(`designation[${cellProps.row.index}]`)}
            />
            {errors?.designation?.[cellProps.row.index] && (
              <FormErrorText>
                {errors?.designation?.[cellProps.row.index]?.message}
              </FormErrorText>
            )}
          </>
        );
      },
    },

    {
      Header: "Action",
      accessor: "action",
      Cell: (cellProps) => {
        return (
          <>
            <TkButton
              type={"button"}
              onClick={() => {
                handleRemoveLocationRow(cellProps.row.index);
              }}
              disabled={locationRows.length === 1}
            >
              Delete
            </TkButton>
          </>
        );
      },
    },
  ];

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
                <Nav className="nav-tabs dropdown-tabs nav-tabs-custom mb-3">
                  <NavItem>
                    <NavLink
                      href="#"
                      className={classnames({
                        active: activeSubTab === tabs.requirementDetails,
                      })}
                      onClick={() => toggleTab(tabs.requirementDetails)}
                    >
                      Requirement Details
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      href="#"
                      className={classnames({
                        active: activeSubTab === tabs.locationDetails,
                      })}
                      onClick={() => toggleTab(tabs.locationDetails)}
                    >
                      Location Details
                    </NavLink>
                  </NavItem>
                </Nav>
              </TkCol>
            </TkRow>

            <TkRow className="mt-3">
              <TkCol>
                <TabContent activeTab={activeSubTab}>
                  <TabPane tabId={tabs.requirementDetails}>
                    <TkTableContainer
                      customPageSize={true}
                      showAddButton={true}
                      onClickAdd={handleAddRow}
                      onclickDelete={handleRemoveRow}
                      columns={requirementDetailsColumns}
                      data={rows}
                      thClass="text-dark"
                      dynamicTable={true}
                    />
                  </TabPane>
                  <TabPane tabId={tabs.locationDetails}>
                    <TkTableContainer
                      customPageSize={true}
                      showAddButton={true}
                      onClickAdd={handleAddLocationRow}
                      onclickDelete={handleRemoveLocationRow}
                      columns={locationDetailsColumns}
                      data={locationRows}
                      thClass="text-dark"
                      dynamicTable={true}
                    />
                  </TabPane>
                </TabContent>
              </TkCol>
            </TkRow>

            <TkRow className="g-3">
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

export default EditLead;
