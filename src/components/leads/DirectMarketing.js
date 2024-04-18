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
import TkTableContainer from "../TkTableContainer";
import TkModal, { TkModalHeader } from "../TkModal";
import { useRouter } from "next/router";
import { TkCardBody, TkCardHeader } from "../../../src/components/TkCard";
import TkRow, { TkCol } from "../../../src/components/TkRow";
import TkSelect from "../../../src/components/forms/TkSelect";
import TkInput from "../../../src/components/forms/TkInput";
// import { Controller, useForm } from "react-hook-form";
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
import { useForm, Controller, useFieldArray } from "react-hook-form";
const tabs = {
  directCall: "primary",
  email: "email",
  socialMedia: "socialMedia",
  portals: "portals",
  directMarketing: "directMarketing",
  leadAssigning: "lead",
  leadNurutring: "nurturing",
  requirementDetails: "requirementDetails",
  locationDetails: "locationDetails",
  test: "test",
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
function DirectMarketing() {
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
  const [activeSubTab, setActiveSubTab] = useState(tabs.requirementDetails);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [taskDropdown, setTaskDropdown] = useState([]);
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
    const now = new Date();
    const formattedDate = now.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    setValue("createdDate", formattedDate);
    setValue("dateTime", formattedDate);
    setSelectedDate(now);
  }, [setValue]);

  const handleButtonClick = (button) => {
    setSelectedButton(button);
    setShowForm(true);
    setButtonsDisabled(true);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setShowForm(false);
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setActiveSubTab(tab);
      router.push(`${urls.leadAdd}?tab=${tab}`, undefined, {
        scroll: false,
      });
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
      <div>
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
                      <FormErrorText>{errors.leadSource.message}</FormErrorText>
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
                      <FormErrorText>{errors.visitDate.message}</FormErrorText>
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
                      <FormErrorText>{errors.visitTime.message}</FormErrorText>
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
                      <FormErrorText>{errors.createdBy.message}</FormErrorText>
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
                    />
                    {errors.email && (
                      <FormErrorText>{errors.email.message}</FormErrorText>
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
                      <FormErrorText>{errors.enquiryBy.message}</FormErrorText>
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
                      <FormErrorText>{errors.contactNo.message}</FormErrorText>
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
                    />
                    {errors.crno && (
                      <FormErrorText>{errors.crno.message}</FormErrorText>
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
                      <FormErrorText>{errors.clientType.message}</FormErrorText>
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
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({
                      active: activeSubTab === tabs.leadAssigning,
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
                      active: activeSubTab === tabs.leadNurutring,
                    })}
                    onClick={() => toggleTab(tabs.leadNurutring)}
                  >
                    Lead Nurturing
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

                <TabPane tabId={tabs.leadAssigning}>
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
                          <FormErrorText>{errors.region.message}</FormErrorText>
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
                    </TkRow>
                  </div>
                </TabPane>

                <TabPane tabId={tabs.leadNurutring}>
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
                        <TkInput
                          {...register("dateTime")}
                          id="dateTime"
                          name="dateTime"
                          labelName="Date Time"
                          type="text"
                          placeholder="Enter Lead Value"
                          disabled={true}
                        />
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
                          <FormErrorText>{errors.reason.message}</FormErrorText>
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
                    </TkRow>
                  </div>
                </TabPane>
              </TabContent>
            </TkCol>
          </TkRow>

          <div className="d-flex mt-4 space-childern">
            <div className="ms-auto" id="update-form-btns">
              <TkButton type="button" color="primary">
                Submit
              </TkButton>
            </div>
          </div>

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
      </div>
    </>
  );
}

export default DirectMarketing;
