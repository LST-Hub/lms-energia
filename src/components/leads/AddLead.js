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
import DirectCall from "../../../src/components/leads/DirectCall";
import LeadEmail from "./LeadEmail";
import SocialMedia from "./SocialMedia";
import LeadPortals from "./LeadPortals";
import DirectMarketing from "./DirectMarketing";

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
      setActiveSubTab(
        tab === "requirementDetails" ? "requirementDetails" : "locationDetails"
      );
      router.push(
        `${urls.lead}/add?tab=${tab}&button=${selectedButton}`,
        undefined,
        {
          scroll: false,
        }
      );
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
      {isLead && (
        <div>
          <TkRow className="mt-3">
            <TkCol>
              <TkCardHeader tag="h5" className="mb-4">
                <h4>Lead Types</h4>
              </TkCardHeader>
              <div>
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
                    {selectedButton === "directCall" && <DirectCall />}

                    {selectedButton === "email" && <LeadEmail />}

                    {selectedButton === "socialMedia" && <SocialMedia />}

                    {selectedButton === "portals" && <LeadPortals />}

                    {selectedButton === "directMarketing" && (
                      <DirectMarketing />
                    )}
                  </Form>
                )}
              </div>
            </TkCol>
          </TkRow>
        </div>
      )}
    </>
  );
}

export default AddLead;
