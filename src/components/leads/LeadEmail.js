import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  API_BASE_URL,
  MaxEmailLength,
  MaxNameLength,
  MaxPhoneNumberLength,
  MinEmailLength,
  MinNameLength,
  RQ,
  bigInpuMaxLength,
  createdByNameTypes,
  leadActivityTypes,
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
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";
import { convertTimeToSec, convertToTime, convertToTimeFotTimeSheet } from "../../utils/time";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useMutation, useQueries } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import LeadEventPopup from "./LeadEventPopup";
import LeadTaskPopup from "./LeadTaskPopup";
import { formatDateForAPI } from "../../utils/date";
import { MaxCrNoLength } from "../../../lib/constants";
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
  leadActivity: "leadActivity",
  phoneCallActivity: "phoneCallActivity",
  taskActivity: "taskActivity",
  eventActivity: "eventActivity",
};

const schema = Yup.object({
  custentity_lms_leadsource: Yup.object()
    .nullable()
    .required("Lead Source is required"),

  subsidiary: Yup.object().required("Primary subsidairy is required"),
  custentity_lms_name: Yup.string()
    .required("Name is required")
    .min(MinNameLength, `Name should have at least ${MinNameLength} character.`)
    .max(
      MaxNameLength,
      `Name should have at most ${MaxNameLength} characters.`
    ),

  custentity_lms_personal_phonenumber: Yup.string()
    .nullable()
    .required("Phone Number is Required")
    .matches(/^[0-9+() -]*$/, "Phone Number must be number.")
    .max(
      MaxPhoneNumberLength,
      `Phone Number must be at most ${MaxPhoneNumberLength} numbers.`
    ),
  custentity_lms_personal_email: Yup.string()
    .nullable()
    .required("Email is required")
    .email("Email must be valid.")
    .min(
      MinEmailLength,
      `Email should have at least ${MinEmailLength} characters.`
    )
    .max(
      MaxEmailLength,
      `Email should have at most ${MaxEmailLength} characters.`
    ),
  custentity_lms_enquiryby: Yup.object()
    .nullable()
    .required("Enquiry By is required"),

  custentity_lms_noteother: Yup.string()
    .nullable()
    .max(
      bigInpuMaxLength,
      `Note should have at most ${bigInpuMaxLength} characters.`
    ),

  companyname: Yup.string()
    .nullable()
    .required("Company Name is required")
    .max(
      smallInputMaxLength,
      `Company Name should have at most ${smallInputMaxLength} characters.`
    ),
  phoneNo: Yup.string()
    .nullable()
    .required("Contact Number is Required")
    .matches(/^[0-9+() -]*$/, "Contact Number must be number.")
    .max(
      MaxPhoneNumberLength,
      `Contact Number must be at most ${MaxPhoneNumberLength} numbers.`
    ),
  email: Yup.string()
    .nullable()
    .required("Email is required")
    .email("Email must be valid.")
    .max(
      MaxEmailLength,
      `Company Email should have at most ${MaxEmailLength} characters.`
    ),
  // custentity_lms_cr_no: Yup.string()
  //   .nullable()
  //   .required("CR Number is required"),

  // custentity3: Yup.string().nullable().required("VAT Number is required"),

  custentity_lms_cr_no: Yup.string()
  .nullable()
  .required("CR Number is required")
  .matches(/^[a-zA-Z0-9]*$/, 'CR Number must be alphanumeric')
    .max(
      MaxCrNoLength,
      `CR Number should have at most ${MaxCrNoLength} characters.`
    ),

custentity3: Yup.string().nullable()
.required("VAT Number is required")
.matches(/^[a-zA-Z0-9]*$/, 'VAT Number must be alphanumeric')
.max(
  MaxCrNoLength,
  `VAT Number should have at most ${MaxCrNoLength} characters.`
),

  custentity_lms_client_type: Yup.object()
    .nullable()
    .required("Client Type is required"),

  custentity_market_segment: Yup.object()
    .nullable()
    .required("Segment is required"),

    addr1: Yup.string()
    .max(
      smallInputMaxLength,
      `Address 1 should have at most ${smallInputMaxLength} characters.`
    )
    .nullable(),

  addr2: Yup.string()
    .max(
      smallInputMaxLength,
      `Address 2 should have at most ${smallInputMaxLength} characters.`
    )
    .nullable(),
  city: Yup.string().max(
    smallInputMaxLength,
    `City should have at most ${smallInputMaxLength} characters.`
  )
  .nullable(),

  state: Yup.string().nullable(),

  zip: Yup.string().test(
    "test-name",
    "Zip code does not accept characters",
    function (value) {
      if (value === "" || value === null || value === undefined) {
        return true;
      } else {
        return value.trim().match(/^[0-9]*$/, "Zip code must be numeric.");
      }
    }
  ),
}).required();


function LeadEmail({ selectedButton }) {
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
  const [leadTaskModal, setLeadTaskModal] = useState(false);
  const [leadEventModal, setLeadEventModal] = useState(false);

  const [isLead, setIsLead] = useState(false);
  const [rSelected, setRSelected] = useState(0);
  const [activeTab, setActiveTab] = useState(tabs.directCall);
  const [activeSubTab, setActiveSubTab] = useState(tabs.requirementDetails);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [taskDropdown, setTaskDropdown] = useState([]);
  const [allPrimarySubsidiaryData, setAllPrimarySubsidiaryData] = useState([
    {},
  ]);
  const [allEnquiryByData, setAllEnquiryByData] = useState([{}]);
  const [allClientTypeData, setAllClientTypeData] = useState([{}]);
  const [allSegmentData, setAllSegmentData] = useState([{}]);
  const [allDivisionData, setAllDivisionData] = useState([{}]);
  const [allUnitOfMeasureData, setAllUnitOfMeasureData] = useState([{}]);
  const [allRegionData, setAllRegionData] = useState([{}]);
  const [allSalesTeamData, setAllSalesTeamData] = useState([{}]);
  const [allPrimaryActionData, setAllPrimaryActioData] = useState([{}]);
  const [allProspectNurturingData, setAllProspectNurturingData] = useState([
    {},
  ]);
  const [allleadSourceData, setAllleadSourceData] = useState([{}]);
  const [directCallId, setDirectCallId] = useState(null);
  const [newAddress, setNewAddress] = useState(null);
  const [allCountryData, setAllCountryData] = useState([{}]);
  const [fullAddress, setFullAddress] = useState(false);
  const [selectedEnquiryBy, setSelectedEnquiryBy] = useState(false);
  const [allNurturStatusData, setAllNurturStatusData] = useState([{}]);


  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allPrimarySubsidiary],
        queryFn: tkFetch.get(`${API_BASE_URL}/primary-subsidiary`),
      },

      {
        queryKey: [RQ.allEnquiryBy],
        queryFn: tkFetch.get(`${API_BASE_URL}/enquiry-by`),
      },
      {
        queryKey: [RQ.allClientType],
        queryFn: tkFetch.get(`${API_BASE_URL}/client-type`),
      },

      {
        queryKey: [RQ.allSegment],
        queryFn: tkFetch.get(`${API_BASE_URL}/segment`),
      },
      {
        queryKey: [RQ.allDivision],
        queryFn: tkFetch.get(`${API_BASE_URL}/division`),
      },
      {
        queryKey: [RQ.allUnitOfMeasure],
        queryFn: tkFetch.get(`${API_BASE_URL}/unit-of-measure`),
      },
      {
        queryKey: [RQ.allRegion],
        queryFn: tkFetch.get(`${API_BASE_URL}/region`),
      },

      {
        queryKey: [RQ.allSalesTeam],
        queryFn: tkFetch.get(`${API_BASE_URL}/sales-team`),
      },

      {
        queryKey: [RQ.allPrimaryAction],
        queryFn: tkFetch.get(`${API_BASE_URL}/primary-action`),
      },

      {
        queryKey: [RQ.allProspectNurturing],
        queryFn: tkFetch.get(`${API_BASE_URL}/prospect-nurturing`),
      },

      {
        queryKey: [RQ.allleadSource],
        queryFn: tkFetch.get(`${API_BASE_URL}/lead-source`),
      },
      {
        queryKey: [RQ.allCountry],
        queryFn: tkFetch.get(`${API_BASE_URL}/country`),
      },

      {
        queryKey: [RQ.allNurturingStatus],
        queryFn: tkFetch.get(`${API_BASE_URL}/nurtur-status`),
      },
    ],
  });

  const [
    primarySubisdiary,
    enquiryBy,
    clientType,
    segment,
    division,
    unitOfMeasure,
    region,
    salesTeam,
    primaryAction,
    prospectNurturing,
    leadSource,
    country,
    status,
  ] = results;
  const {
    data: primarySubisdiaryData,
    isLoading: primarySubisdiaryLoading,
    isError: primarySubisdiaryIsError,
    error: primarySubisdiaryError,
  } = primarySubisdiary;

  const {
    data: enquiryByData,
    isLoading: enquiryByLoading,
    isError: enquiryByIsError,
    error: enquiryByError,
  } = enquiryBy;

  const {
    data: clientTypeData,
    isLoading: clientTypeLoading,
    isError: clientTypeIsError,
    error: clientTypeError,
  } = clientType;

  const {
    data: segmentData,
    isLoading: segmentLoading,
    isError: segmentIsError,
    error: segmentError,
  } = segment;

  const {
    data: divisionData,
    isLoading: divisionLoading,
    isError: divisionIsError,
    error: divisionError,
  } = division;

  const {
    data: unitOfMeasureData,
    isLoading: unitOfMeasureLoading,
    isError: unitOfMeasureIsError,
    error: unitOfMeasureError,
  } = unitOfMeasure;

  const {
    data: regionData,
    isLoading: regionLoading,
    isError: regionIsError,
    error: regionError,
  } = region;

  const {
    data: salesTeamData,
    isLoading: salesTeamLoading,
    isError: salesTeamIsError,
    error: salesTeamError,
  } = salesTeam;

  const {
    data: primaryActionData,
    isLoading: primaryActionLoading,
    isError: primaryActionIsError,
    error: primaryActionError,
  } = primaryAction;

  const {
    data: prospectNurturingData,
    isLoading: prospectNurturingLoading,
    isError: prospectNurturingIsError,
    error: prospectNurturingError,
  } = prospectNurturing;

  const {
    data: leadSourceData,
    isLoading: leadSourceLoading,
    isError: leadSourceIsError,
    error: leadSourceError,
  } = leadSource;

  const {
    data: countryData,
    isLoading: countryLoading,
    isError: countryIsError,
    error: countryError,
  } = country;

  const {
    data: statusNurturData,
    isLoading: statusNurturLoading,
    isError: statusNurturIsError,
    error: statusNurturError,
  } = status;

  useEffect(() => {
    if (primarySubisdiaryIsError) {
      console.log("primarySubisdiaryIsError", primarySubisdiaryError);
      TkToastError(primarySubisdiaryError.message);
    }

    if (enquiryByIsError) {
      console.log("enquiryByIsError", enquiryByError);
      TkToastError(enquiryByError.message);
    }

    if (clientTypeIsError) {
      console.log("clientTypeIsError", clientTypeError);
      TkToastError(clientTypeError.message);
    }

    if (segmentIsError) {
      console.log("segmentIsError", segmentError);
      TkToastError(segmentError.message);
    }

    if (divisionIsError) {
      console.log("divisionIsError", divisionError);
      TkToastError(divisionError.message);
    }

    if (unitOfMeasureIsError) {
      console.log("unitOfMeasureIsError", unitOfMeasureError);
      TkToastError(unitOfMeasureError.message);
    }

    if (regionIsError) {
      console.log("regionIsError", regionError);
      TkToastError(regionError.message);
    }

    if (salesTeamIsError) {
      console.log("salesTeamIsError", salesTeamError);
      TkToastError(salesTeamError.message);
    }

    if (primaryActionIsError) {
      console.log("primaryActionIsError", primaryActionError);
      TkToastError(primaryActionError.message);
    }

    if (prospectNurturingIsError) {
      console.log("prospectNurturingIsError", prospectNurturingError);
      TkToastError(prospectNurturingError.message);
    }

    if (leadSourceIsError) {
      console.log("leadSourceIsError", leadSourceError);
      TkToastError(leadSourceError.message);
    }

    if (countryIsError) {
      console.log("countryIsError", countryError);
      TkToastError(countryError.message);
    }

    if (statusNurturIsError) {
      console.log("statusNurturIsError", statusNurturError);
      TkToastError(statusNurturError.message);
    }
  }, [
    primarySubisdiaryIsError,
    primarySubisdiaryError,
    enquiryByIsError,
    enquiryByError,
    clientTypeIsError,
    clientTypeError,
    segmentIsError,
    segmentError,
    divisionIsError,
    divisionError,
    unitOfMeasureIsError,
    unitOfMeasureError,
    regionIsError,
    regionError,
    salesTeamIsError,
    salesTeamError,
    primaryActionIsError,
    primaryActionError,
    prospectNurturingIsError,
    prospectNurturingError,
    leadSourceIsError,
    leadSourceError,
    countryIsError,
    countryError,
    statusNurturIsError,
    statusNurturError,
  ]);

  useEffect(() => {
    if (primarySubisdiaryData) {
      setAllPrimarySubsidiaryData(
        primarySubisdiaryData?.items?.map((primarySubisdiary) => ({
          label: primarySubisdiary.name,
          value: primarySubisdiary.id,
        }))
      );
    }

    if (enquiryByData) {
      setAllEnquiryByData(
        enquiryByData?.items?.map((enquiryBy) => ({
          label: enquiryBy.name,
          value: enquiryBy.id,
        }))
      );
    }

    if (clientTypeData) {
      setAllClientTypeData(
        clientTypeData?.items?.map((clientType) => ({
          label: clientType.name,
          value: clientType.id,
        }))
      );
    }

    if (segmentData) {
      setAllSegmentData(
        segmentData?.items?.map((segmentType) => ({
          label: segmentType.name,
          value: segmentType.id,
        }))
      );
    }

    if (divisionData) {
      setAllDivisionData(
        divisionData?.items?.map((divisionType) => ({
          label: divisionType.name,
          value: divisionType.id,
        }))
      );
    }

    if (unitOfMeasureData) {
      setAllUnitOfMeasureData(
        unitOfMeasureData?.items?.map((unitOfMeasureType) => ({
          label: unitOfMeasureType.name,
          value: unitOfMeasureType.id,
        }))
      );
    }

    if (regionData) {
      setAllRegionData(
        regionData?.items?.map((regionType) => ({
          label: regionType.name,
          value: regionType.id,
        }))
      );
    }

    if (salesTeamData) {
      setAllSalesTeamData(
        salesTeamData?.items?.map((salesTeamType) => ({
          label: salesTeamType.firstname,
          value: salesTeamType.entityid,
        }))
      );
    }

    if (primaryActionData) {
      setAllPrimaryActioData(
        primaryActionData?.items?.map((primaryActionType) => ({
          label: primaryActionType.name,
          value: primaryActionType.id,
        }))
      );
    }

    if (prospectNurturingData) {
      setAllProspectNurturingData(
        prospectNurturingData?.items?.map((prospectNurturingType) => ({
          label: prospectNurturingType.name,
          value: prospectNurturingType.id,
        }))
      );
    }

    if (leadSourceData) {
      setAllleadSourceData(
        leadSourceData?.items?.map((leadSourceType) => ({
          label: leadSourceType.name,
          value: leadSourceType.id,
        }))
      );
    }

    if (countryData) {
      setAllCountryData(
        countryData?.items?.map((countryType) => ({
          label: countryType.name,
          value: countryType.id,
        }))
      );
    }

    if (statusNurturData) {
      setAllNurturStatusData(
        statusNurturData?.items?.map((nurturStatusType) => ({
          label: nurturStatusType.name,
          value: nurturStatusType.id,
        }))
      );
    }
  }, [
    primarySubisdiaryData,
    enquiryByData,
    clientTypeData,
    segmentData,
    divisionData,
    unitOfMeasureData,
    regionData,
    salesTeamData,
    primaryActionData,
    prospectNurturingData,
    leadSourceData,
    countryData,
    statusNurturData,
  ]);

 
  const [rows, setRows] = useState([
    {
      custrecord_lms_division: null,
      custrecord_lms_requirement: "",
      custrecord_lms_project_name: "",
      custrecord_lms_duration: "",
      custrecord_lms_unit_of_measure: null,
      custrecord_lms_value: "",
      custrecord_lms_expected_delivery_date: "",
    },
  ]);
  const [locationRows, setLocationRows] = useState([
    {
      custrecordlms_location: "",
      custrecord_lms_contactperson_name: "",
      custrecord_lms_phonenumber: "",
      custrecord_location_email: "",
      custrecord_lms_designation: "",
    },
  ]);


  const [phoneCallRows, setPhoneCallRows] = useState([
    {
      subject: "",
      phone: "",
      status: null,
      organizer: null,
      startDate: "",
    },
  ]);

  const [taskCallRows, setTaskCallRows] = useState([
    {
      taskTitle: "",
      priority: null,
      startTasktDate: "",
      dueTaskDate: "",
    },
  ]);

  const [eventCallRows, setEventCallRows] = useState([
    {
      eventTitle: "",
      location: "",
      startEventtDate: "",
      starttime: "",
      endtime: "",
    },
  ]);
 

  const leadActivityToggle = useCallback(() => {
    if (activityModal) {
      setActivityModal(false);
    } else {
      setActivityModal(true);
    }
  }, [activityModal]);

  const leadTaskActivityToggle = useCallback(() => {
    if (leadTaskModal) {
      setLeadTaskModal(false);
    } else {
      setLeadTaskModal(true);
    }
  }, [leadTaskModal]);

  const leadEventActivityToggle = useCallback(() => {
    if (leadEventModal) {
      setLeadEventModal(false);
    } else {
      setLeadEventModal(true);
    }
  }, [leadEventModal]);

  useEffect(() => {
    if (fullAddress) {
      setValue("custentity_lms_address", fullAddress);
    }
  }, [fullAddress, setValue]);

  // useEffect(() => {
  //   setValue("defaultaddress", newAddress);
  //   console.log("defaultaddress", newAddress);
  //   setActivityModal(false);
  // }, [setValue, newAddress]);

  // useEffect(() => {
  //   setIsLead(true);
  // }, []);

  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    setValue("custentity_lms_createddate", now);
    setValue("custrecord_lms_datetime", formattedDate);
    setSelectedDate(now);
  }, [setValue]);

  

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
        custrecord_lms_division: null,
        custrecord_lms_requirement: "",
        custrecord_lms_project_name: "",
        custrecord_lms_duration: "",
        custrecord_lms_unit_of_measure: null,
        custrecord_lms_value: "",
        custrecord_lms_expected_delivery_date: "",
      },
    ]);
  };

  const handleAddLocationRow = () => {
    setLocationRows([
      ...locationRows,
      {
        custrecordlms_location: "",
        custrecord_lms_contactperson_name: "",
        custrecord_lms_phonenumber: "",
        custrecord_location_email: "",
        custrecord_lms_designation: "",
      },
    ]);
  };

  const handleAddPhoneCallRow = () => {
    setPhoneCallRows([
      ...phoneCallRows,
      {
        subject: "",
        phone: "",
        status: null,
        organizer: null,
        startDate: "",
      },
    ]);
  };

  const handleAddTaskRow = () => {
    setTaskCallRows([
      ...taskCallRows,
      {
        taskTitle: "",
        priority: null,
        startTasktDate: "",
        dueTaskDate: "",
      },
    ]);
  };

  const handleAddEventRow = () => {
    setEventCallRows([
      ...eventCallRows,
      {
        eventTitle: "",
        location: "",
        startEventtDate: "",
        starttime: "",
        endtime: "",
      },
    ]);
  };

  const { remove: removeDivision } = useFieldArray({
    control,
    name: "custrecord_lms_division",
  });
  const { remove: removeRequirement } = useFieldArray({
    control,
    name: "custrecord_lms_requirement",
  });
  const { remove: removeProjectName } = useFieldArray({
    control,
    name: "custrecord_lms_project_name",
  });
  const { remove: removeDuration } = useFieldArray({
    control,
    name: "custrecord_lms_duration",
  });
  const { remove: removeUnitOfMeasure } = useFieldArray({
    control,
    name: "custrecord_lms_unit_of_measure",
  });
  const { remove: removeValue } = useFieldArray({
    control,
    name: "custrecord_lms_value",
  });
  const { remove: removeDelivery } = useFieldArray({
    control,
    name: "custrecord_lms_expected_delivery_date",
  });
  const { remove: removeLocation } = useFieldArray({
    control,
    name: "custrecordlms_location",
  });
  const { remove: removeContactPersonName } = useFieldArray({
    control,
    name: "custrecord_lms_contactperson_name",
  });
  const { remove: removephoneNumber } = useFieldArray({
    control,
    name: "custrecord_lms_phonenumber",
  });
  const { remove: removeEmail } = useFieldArray({
    control,
    name: "custrecord_location_email",
  });
  const { remove: removeDesignation } = useFieldArray({
    control,
    name: "custrecord_lms_designation",
  });

  const { remove: removeSubject } = useFieldArray({
    control,
    name: "subject",
  });
  const { remove: removePhoneNumber } = useFieldArray({
    control,
    name: "phone",
  });
  const { remove: removeStatus } = useFieldArray({
    control,
    name: "status",
  });
  const { remove: removeOrganizer } = useFieldArray({
    control,
    name: "organizer",
  });
  const { remove: removeStartDate } = useFieldArray({
    control,
    name: "startDate",
  });
  const { remove: removeTaskTitle } = useFieldArray({
    control,
    name: "taskTitle",
  });
  const { remove: removeTaskPriority } = useFieldArray({
    control,
    name: "priority",
  });
  const { remove: removeTaskStartDate } = useFieldArray({
    control,
    name: "startTasktDate",
  });
  const { remove: removeTaskDueDate } = useFieldArray({
    control,
    name: "dueTaskDate",
  });
  const { remove: removeEventTitle } = useFieldArray({
    control,
    name: "eventTitle",
  });

  const { remove: removeEventLocation } = useFieldArray({
    control,
    name: "location",
  });

  const { remove: removeEventStartDate } = useFieldArray({
    control,
    name: "startEventtDate",
  });

  const { remove: removeEventStartTime } = useFieldArray({
    control,
    name: "starttime",
  });

  const { remove: removeEventEndTime } = useFieldArray({
    control,
    name: "endtime",
  });

  const handleRemoveRow = (index) => {
    removeDivision(index);
    removeRequirement(index);
    removeProjectName(index);
    removeDuration(index);
    removeUnitOfMeasure(index);
    removeValue(index);
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

  const handleRemovePhoneCallRow = (i) => {
    removeSubject(i);
    removePhoneNumber(i);
    removeStatus(i);
    removeOrganizer(i);
    removeStartDate(i);
    const newPhoneCallRows = [...phoneCallRows];
    newPhoneCallRows.splice(i, 1);
    setPhoneCallRows(newPhoneCallRows);
  };

  const handleRemoveTaskRow = (i) => {
    removeTaskTitle(i);
    removeTaskPriority(i);
    removeTaskStartDate(i);
    removeTaskDueDate(i);
    const newTaskRows = [...taskCallRows];
    newTaskRows.splice(i, 1);
    setPhoneCallRows(newTaskRows);
  };

  const handleRemoveEventRow = (i) => {
    removeEventTitle(i);
    removeEventLocation(i);
    removeEventAccess(i);
    removeEventStartDate(i);
    removeEventStartTime(i);
    removeEventEndTime(i);

    const newEventRows = [...eventCallRows];
    newEventRows.splice(i, 1);
    setPhoneCallRows(newEventRows);
  };

  const leadEmailPost = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/lead`),
  });

  const onSubmit = (formData) => {
    const apiData = {
      resttype: "Add",
      recordtype: "lead",
      bodyfields: {
        customform: { value: "135", text: "LMS CRM FORM" },
        entitystatus: { value: "7", text: "LEAD-Qualified" },
        custentity_lms_channel_lead: { value: selectedButton.id },
        custentity_lms_leadsource: {
          value: formData.custentity_lms_leadsource.value,
          text: formData.custentity_lms_leadsource.text,
        },
        custentity_lms_createdby: formData.custentity_lms_createdby,
        custentity_lms_createddate: formData.custentity_lms_createddate,
        subsidiary: {
          value: formData.subsidiary.value,
          text: formData.subsidiary.text,
        },
        custentity_lms_name: formData.custentity_lms_name,
        custentity_lms_personal_phonenumber:
          formData.custentity_lms_personal_phonenumber,
        custentity_lms_personal_email: formData.custentity_lms_personal_email,
        custentity_lms_enquiryby: {
          value: formData.custentity_lms_enquiryby.value,
          text: formData.custentity_lms_enquiryby.text,
        },
        custentity_lms_noteother: formData.custentity_lms_noteother,
        companyname: formData.companyname,
        phone: formData.phoneNo,
        email: formData.email,
        custentity_lms_cr_no: formData.custentity_lms_cr_no,
        custentity3: formData.custentity3,
        custentity_lms_client_type: {
          value: formData.custentity_lms_client_type.value,
          text: formData.custentity_lms_client_type.text,
        },
        custentity_market_segment: {
          value: formData.custentity_market_segment.value,
          text: formData.custentity_market_segment.text,
        },
        addr1: formData.addr1,
        addr2: formData.addr2,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: {
          value: formData.country?.value,
          label: formData.country?.text,
        },
        custentity_lms_address: formData.custentity_lms_address,
      },
      linefields: {
        // addressbook: [
        //   {
        //     subrecord: {
        //       addressbookaddress: {
        //         addr1: formData.addr1,
        //         addr2: formData.addr2,
        //         city: formData.city,
        //         state: formData.state,
        //         zip: formData.zip,
        //         country: {
        //           value: formData.country?.value,
        //           text: formData.country?.text,
        //         },
        //       },
        //     },
        //     defaultBilling: true,
        //     defaultShipping: true,
        //     addrtext: formData.addrtext,
        //   },
        // ],
        recmachcustrecord_lms_requirement_details:
          formData.custrecord_lms_requirement.flatMap((req, i) => ({
            custrecord_lms_requirement: req,
            custrecord_lms_project_name:
              formData.custrecord_lms_project_name[i],

            custrecord_lms_division: {
              value: formData.custrecord_lms_division.value,
              text: formData.custrecord_lms_division.text,
            },
            custrecord_lms_duration: convertToTime(
              formData.custrecord_lms_duration[i]
            ),
            custrecord_lms_unit_of_measure: {
              value: formData.custrecord_lms_unit_of_measure.value,
              text: formData.custrecord_lms_unit_of_measure.text,
            },
            custrecord_lms_value: Number(formData.custrecord_lms_value[i]),
            custrecord_lms_expected_delivery_date: [
              formatDateForAPI(formData.custrecord_lms_expected_delivery_date[i]),
            ],
          })),

        recmachcustrecord_parent_record: formData.custrecordlms_location.map(
          (loc, i) => ({
            custrecordlms_location: loc,
            custrecord_lms_contactperson_name:
              formData.custrecord_lms_contactperson_name[i],
            custrecord_lms_phonenumber: formData.custrecord_lms_phonenumber[i],
            custrecord_location_email:
              formData.custrecord_location_email[i] || "",
            custrecord_lms_designation: formData.custrecord_lms_designation[i],
          })
        ),

        recmachcustrecord_lms_lead_assigning: [
          {
            custrecord_lms_region: {
              value: formData.custrecord_lms_region?.value,
              text: formData.custrecord_lms_region?.text,
            },
            custrecord_lms_sales_team_name: {
              value: formData.custrecord_lms_sales_team_name?.value || "",
              text: formData.custrecord_lms_sales_team_name?.text || "",
            },
          },
        ],

        recmachcustrecord_lms_leadnurt: [
          {
            custrecord_lms_primary_action: {
              value: formData.custrecord_lms_primary_action?.value,
              text: formData.custrecord_lms_primary_action?.text,
            },
            custrecord_lms_datetime: formatDateForAPI(
              formData.custrecord_lms_datetime
            ),
            custrecord_lms_lead_value: Number(
              formData.custrecord_lms_lead_value
            ),
            custrecord_lms_statusoflead: {
              value: formData.custrecord_lms_statusoflead?.value,
              text: formData.custrecord_lms_statusoflead?.text,
            },
            custrecord_lms_lead_unqualifie:
              formData.custrecord_lms_lead_unqualifie,
            custrecord_lms_prospect_nurtur: {
              value: formData.custrecord_lms_prospect_nurtur?.value,
              text: formData.custrecord_lms_prospect_nurtur?.text,
            },
          },
        ],

        // calls:
        // formData?.phone?.map((call, i) => ({
        //   phone: call,
        //   title: formData.subject[i],
        //   status: {
        //     value: formData.status[i]?.value,
        //     text: formData.status[i]?.label,
        //   },
        //   organizer: {
        //     value: formData.organizer[i]?.value,
        //     text: formData.organizer[i]?.label,
        //   }
        //   // startdate: [formData.startdate]
        // })),
        

        

        // tasks: formData?.title?.map((task, i) => ({
        //   title: formData.taskTitle[i],

        //   priority: {
        //     value: formData.status[i]?.value,
        //     label: formData.status[i]?.text,
        //   },
        //   // startdate: [
        //   //   formData.startTasktDate[i],
        //   // ],
        //   // dueDate: [formData.dueTaskDate[i]]
         
        // })),

        // events: formData?.location?.map((event, i) => ({
        //   title: formData.eventTitle[i],
        //   location: event,
        //   starttime: [formData.starttime[i]],
        //   endtime: [formData.endtime[i]],
        //   // startdate: formData.startEventtDate,
        // })),
      },
    };


    leadEmailPost.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Lead Email Created Successfully");
        router.push(`${urls.lead}`);
      },
      onError: (error) => {
        TkToastError("error while creating Lead", error);
      },
    });
  };
  const requirementDetailsColumns = [
    {
      Header: "Division *",
      accessor: "custrecord_lms_division",
      Cell: (cellProps) => {
        return (
          <>
            <Controller
              control={control}
              name={`custrecord_lms_division[${cellProps.row.index}]`}
              rules={{ required: "Division is required" }}
              render={({ field }) => (
                <TkSelect
                  {...field}
                  id={"custrecord_lms_division"}
                  options={allDivisionData}
                  requiredStarOnLabel={true}
                  style={{ width: "200px" }}
                  loading={divisionLoading}
                />
              )}
            />
            {errors?.custrecord_lms_division?.[cellProps.row.index] && (
              <FormErrorText>
                {
                  errors?.custrecord_lms_division?.[cellProps.row.index]
                    ?.message
                }
              </FormErrorText>
            )}
          </>
        );
      },
    },

    {
      Header: "Requirement",
      accessor: "custrecord_lms_requirement",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              id="custrecord_lms_requirement"
              placeholder="Enter Requirement"
              {...register(
                `custrecord_lms_requirement[${cellProps.row.index}]`
              )}
              rules={{ required: "Requirement is required" }}
            />
            {errors?.custrecord_lms_requirement?.[cellProps.row.index] && (
              <FormErrorText>
                {
                  errors?.custrecord_lms_requirement?.[cellProps.row.index]
                    ?.message
                }
              </FormErrorText>
            )}
          </>
        );
      },
    },
    {
      Header: "Project Name",
      accessor: "custrecord_lms_project_name",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              id="custrecord_lms_project_name"
              placeholder="Enter Project Name"
              {...register(
                `custrecord_lms_project_name[${cellProps.row.index}]`
              )}
            />
            {errors?.custrecord_lms_project_name?.[cellProps.row.index] && (
              <FormErrorText>
                {
                  errors?.custrecord_lms_project_name?.[cellProps.row.index]
                    ?.message
                }
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
              id="custrecord_lms_duration"
              placeholder="Enter Duration"
              {...register(`custrecord_lms_duration[${cellProps.row.index}]`, {
                required: "Duration is required",
                validate: (value) => {
                  if (value && !/^[0-9]*([.:][0-9]+)?$/.test(value)) {
                    return "Invalid Duration";
                  }
                  // if (convertTimeToSec(value) > 86400 || value > 24) {
                  //   return "Duration should be less than 24 hours";
                  // }
                },
              })}
              onBlur={(e) => {
                setValue(
                  `custrecord_lms_duration[${cellProps.row.index}]`,
                  convertToTime(e.target.value)
                );
              }}
            />
            {errors?.custrecord_lms_duration?.[cellProps.row.index] && (
              <FormErrorText>
                {
                  errors?.custrecord_lms_duration?.[cellProps.row.index]
                    ?.message
                }
              </FormErrorText>
            )}
          </>
        );
      },
    },

    {
      Header: "UOM",
      accessor: "custrecord_lms_unit_of_measure",
      Cell: (cellProps) => {
        return (
          <>
            <Controller
              control={control}
              name={`custrecord_lms_unit_of_measure[${cellProps.row.index}]`}
              render={({ field }) => (
                <>
                  <TkSelect
                    {...field}
                    id="custrecord_lms_unit_of_measure"
                    options={allUnitOfMeasureData}
                    loading={unitOfMeasureLoading}
                  />
                  {errors?.custrecord_lms_unit_of_measure?.[
                    cellProps.row.index
                  ] && (
                    <FormErrorText>
                      {
                        errors?.custrecord_lms_unit_of_measure?.[
                          cellProps.row.index
                        ]?.message
                      }
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
      Header: "Value",
      accessor: "custrecord_lms_value",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              placeholder="Enter Value"
              id="custrecord_lms_value"
              {...register(`custrecord_lms_value[${cellProps.row.index}]`)}
            />
            {errors?.custrecord_lms_value?.[cellProps.row.index] && (
              <FormErrorText>
                {errors?.custrecord_lms_value?.[cellProps.row.index]?.message}
              </FormErrorText>
            )}
          </>
        );
      },
    },

    {
      Header: "Expected Delivery Date",
      accessor: "custrecord_lms_expected_delivery_date",
      Cell: (cellProps) => {
        return (
          <>
            <Controller
              control={control}
              name={`custrecord_lms_expected_delivery_date[${cellProps.row.index}]`}
              render={({ field }) => (
                <>
                  <TkDate
                    {...field}
                    id="custrecord_lms_expected_delivery_date"
                    placeholder="Select Delivery Date"
                  />
                  {errors?.custrecord_lms_expected_delivery_date?.[
                    cellProps.row.index
                  ] && (
                    <FormErrorText>
                      {
                        errors?.custrecord_lms_expected_delivery_date?.[
                          cellProps.row.index
                        ]?.message
                      }
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
      accessor: "custrecordlms_location",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              placeholder="Enter Location"
              id="custrecordlms_location"
              {...register(`custrecordlms_location[${cellProps.row.index}]`)}
            />
            {errors?.custrecordlms_location?.[cellProps.row.index] && (
              <FormErrorText>
                {errors?.custrecordlms_location?.[cellProps.row.index]?.message}
              </FormErrorText>
            )}
          </>
        );
      },
    },
    {
      Header: "Contact Person Name",
      accessor: "custrecord_lms_contactperson_name",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              placeholder="Enter Person Name"
              id="custrecord_lms_contactperson_name"
              {...register(
                `custrecord_lms_contactperson_name[${cellProps.row.index}]`
              )}
            />
            {errors?.custrecord_lms_contactperson_name?.[
              cellProps.row.index
            ] && (
              <FormErrorText>
                {
                  errors?.custrecord_lms_contactperson_name?.[
                    cellProps.row.index
                  ]?.message
                }
              </FormErrorText>
            )}
          </>
        );
      },
    },
    {
      Header: "Phone Number",
      accessor: "custrecord_lms_phonenumber",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              placeholder="Enter Phone Number"
              id="custrecord_lms_phonenumber"
              {...register(
                `custrecord_lms_phonenumber[${cellProps.row.index}]`
              )}
            />
            {errors?.custrecord_lms_phonenumber?.[cellProps.row.index] && (
              <FormErrorText>
                {
                  errors?.custrecord_lms_phonenumber?.[cellProps.row.index]
                    ?.message
                }
              </FormErrorText>
            )}
          </>
        );
      },
    },

    {
      Header: "Email",
      accessor: "custrecord_location_email",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              placeholder="Enter Email"
              id="custrecord_location_email"
              {...register(`custrecord_location_email[${cellProps.row.index}]`)}
            />
            {errors?.custrecord_location_email?.[cellProps.row.index] && (
              <FormErrorText>
                {
                  errors?.custrecord_location_email?.[cellProps.row.index]
                    ?.message
                }
              </FormErrorText>
            )}
          </>
        );
      },
    },

    {
      Header: "Designation",
      accessor: "custrecord_lms_designation",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              placeholder="Enter Designation"
              {...register(
                `custrecord_lms_designation[${cellProps.row.index}]`
              )}
            />
            {errors?.custrecord_lms_designation?.[cellProps.row.index] && (
              <FormErrorText>
                {
                  errors?.custrecord_lms_designation?.[cellProps.row.index]
                    ?.message
                }
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

  const phoneCallActivityColumns = [
    {
      Header: "Subject",
      accessor: "subject",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              id="subject"
              placeholder="Enter Subject"
              {...register(`subject[${cellProps.row.index}]`)}
              rules={{ required: "Subject is required" }}
            />
            {errors?.subject?.[cellProps.row.index] && (
              <FormErrorText>
                {errors?.subject?.[cellProps.row.index]?.message}
              </FormErrorText>
            )}
          </>
        );
      },
    },

    {
      Header: "Phone Number",
      accessor: "phone",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              placeholder="Enter Phone Number"
              id="phone"
              {...register(`phone[${cellProps.row.index}]`)}
            />
            {errors?.phone?.[cellProps.row.index] && (
              <FormErrorText>
                {errors?.phone?.[cellProps.row.index]?.message}
              </FormErrorText>
            )}
          </>
        );
      },
    },

    {
      Header: "Status",
      accessor: "status",
      Cell: (cellProps) => {
        return (
          <>
            <Controller
              control={control}
              name={`status[${cellProps.row.index}]`}
              render={({ field }) => (
                <>
                  <TkSelect
                    {...field}
                    id="status"
                    options={[
                      {
                        label: "Completed",
                        value: "Completed",
                      },
                      {
                        label: "Scheduled",
                        value: "Scheduled",
                      },
                    ]}
                  />
                  {errors?.status?.[cellProps.row.index] && (
                    <FormErrorText>
                      {errors?.status?.[cellProps.row.index]?.message}
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
      Header: "Organizer",
      accessor: "organizer",
      Cell: (cellProps) => {
        return (
          <>
            <Controller
              control={control}
              name={`organizer[${cellProps.row.index}]`}
              render={({ field }) => (
                <>
                  <TkSelect
                    {...field}
                    id="organizer"
                    options={allSalesTeamData}
                  />
                  {errors?.organizer?.[cellProps.row.index] && (
                    <FormErrorText>
                      {errors?.organizer?.[cellProps.row.index]?.message}
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
      Header: "Date",
      accessor: "startDate",
      Cell: (cellProps) => {
        return (
          <>
            <Controller
              control={control}
              name={`startDate[${cellProps.row.index}]`}
              render={({ field }) => (
                <>
                  <TkDate {...field} id="startDate" placeholder="Select Date" />
                  {errors?.startDate?.[cellProps.row.index] && (
                    <FormErrorText>
                      {errors?.startDate?.[cellProps.row.index]?.message}
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
                handleRemovePhoneCallRow(cellProps.row.index);
              }}
              disabled={phoneCallRows.length === 1}
            >
              Delete
            </TkButton>
          </>
        );
      },
    },
  ];

  const taskActivityColumns = [
    {
      Header: "Title",
      accessor: "taskTitle",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              id="taskTitle"
              placeholder="Enter Title"
              {...register(`taskTitle[${cellProps.row.index}]`)}
              rules={{ required: "Title is required" }}
            />
            {errors?.taskTitle?.[cellProps.row.index] && (
              <FormErrorText>
                {errors?.taskTitle?.[cellProps.row.index]?.message}
              </FormErrorText>
            )}
          </>
        );
      },
    },

    {
      Header: "Proirity",
      accessor: "priority",
      Cell: (cellProps) => {
        return (
          <>
            <Controller
              control={control}
              name={`priority[${cellProps.row.index}]`}
              render={({ field }) => (
                <>
                  <TkSelect
                    {...field}
                    id="priority"
                    options={[
                      { label: "High", value: "1" },
                      { label: "Medium", value: "2" },
                      { label: "Low", value: "3" },
                    ]}
                  />
                  {errors?.priority?.[cellProps.row.index] && (
                    <FormErrorText>
                      {errors?.priority?.[cellProps.row.index]?.message}
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
      Header: "Date",
      accessor: "startTasktDate",
      Cell: (cellProps) => {
        return (
          <>
            <Controller
              control={control}
              name={`startTasktDate[${cellProps.row.index}]`}
              render={({ field }) => (
                <>
                  <TkDate
                    {...field}
                    id="startTasktDate"
                    placeholder="Select Date"
                  />
                  {errors?.startTasktDate?.[cellProps.row.index] && (
                    <FormErrorText>
                      {errors?.startTasktDate?.[cellProps.row.index]?.message}
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
      Header: "Date Date",
      accessor: "dueTaskDate",
      Cell: (cellProps) => {
        return (
          <>
            <Controller
              control={control}
              name={`dueTaskDate[${cellProps.row.index}]`}
              render={({ field }) => (
                <>
                  <TkDate
                    {...field}
                    id="dueTaskDate"
                    placeholder="Select Date Completed"
                  />
                  {errors?.dueTaskDate?.[cellProps.row.index] && (
                    <FormErrorText>
                      {errors?.dueTaskDate?.[cellProps.row.index]?.message}
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
                handleRemoveTaskRow(cellProps.row.index);
              }}
              disabled={taskCallRows.length === 1}
            >
              Delete
            </TkButton>
          </>
        );
      },
    },
  ];

  const eventActivityColumns = [
    {
      Header: "Title",
      accessor: "eventTitle",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              id="eventTitle"
              placeholder="Enter Title"
              {...register(`eventTitle[${cellProps.row.index}]`)}
              rules={{ required: "Title is required" }}
            />
            {errors?.eventTitle?.[cellProps.row.index] && (
              <FormErrorText>
                {errors?.eventTitle?.[cellProps.row.index]?.message}
              </FormErrorText>
            )}
          </>
        );
      },
    },

    {
      Header: "Location",
      accessor: "location",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              id="location"
              placeholder="Enter Location"
              {...register(`location[${cellProps.row.index}]`)}
              rules={{ required: "Location is required" }}
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
      Header: "Date",
      accessor: "startDate",
      Cell: (cellProps) => {
        return (
          <>
            <Controller
              control={control}
              name={`startDate[${cellProps.row.index}]`}
              render={({ field }) => (
                <>
                  <TkDate {...field} id="startDate" placeholder="Select Date" />
                  {errors?.startDate?.[cellProps.row.index] && (
                    <FormErrorText>
                      {errors?.startDate?.[cellProps.row.index]?.message}
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
      Header: "Start Time",
      accessor: "starttime",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              id="starttime"
              placeholder="Enter Start Time"
              {...register(`starttime[${cellProps.row.index}]`, {
                required: "Start Time is required",
                validate: (value) => {
                  if (value && !/^[0-9]*([.:][0-9]+)?$/.test(value)) {
                    return "Invalid Start Time";
                  }
                },
              })}
              onBlur={(e) => {
                setValue(
                  `starttime[${cellProps.row.index}]`,
                  convertToTime(e.target.value)
                );
              }}
            />
            {errors?.starttime?.[cellProps.row.index] && (
              <FormErrorText>
                {errors?.starttime?.[cellProps.row.index]?.message}
              </FormErrorText>
            )}
          </>
        );
      },
    },

    {
      Header: "End Time",
      accessor: "endtime",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              id="endtime"
              placeholder="Enter End Time"
              {...register(`endtime[${cellProps.row.index}]`, {
                required: "End Time is required",
                validate: (value) => {
                  if (value && !/^[0-9]*([.:][0-9]+)?$/.test(value)) {
                    return "Invalid End Time";
                  }
                },
              })}
              onBlur={(e) => {
                setValue(
                  `endtime[${cellProps.row.index}]`,
                  convertToTime(e.target.value)
                );
              }}
            />
            {errors?.endtime?.[cellProps.row.index] && (
              <FormErrorText>
                {errors?.endtime?.[cellProps.row.index]?.message}
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
                handleRemoveEventRow(cellProps.row.index);
              }}
              disabled={eventCallRows.length === 1}
            >
              Delete
            </TkButton>
          </>
        );
      },
    },
  ];

  const columns = useMemo(
    () => [
      {
        Header: "Edit | Delete ",
        accessor: "id",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div style={{ display: "flex" }}>
                <div
                  onClick={() =>
                    toggle([
                      {
                        // id: cellProps.row.original.id,
                        // repeatId: cellProps.row.original.repeatId,
                        // project: { ...cellProps.row.original.project },
                        // task: { ...cellProps.row.original.task },
                        // allocatedUser: { ...cellProps.row.original.allocatedUser },
                        // date: cellProps.row.original.date,
                        // duration: cellProps.row.original.duration,
                        // repetationType: cellProps.row.original.repetationType,
                      },
                    ])
                  }
                >
                  {/* <Link href={`${urls.resourceAllocationView}/${cellProps.value}`}> */}
                  <span className="table-text flex-grow-1 fw-medium link-primary cursor-pointer">
                    {accessLevel >= perAccessIds.edit ? (
                      <i className="ri-edit-line fs-4"></i>
                    ) : (
                      <TkButton color="none">
                        <TkIcon className="ri-eye-fill align-bottom me-2 text-muted"></TkIcon>
                      </TkButton>
                    )}
                  </span>
                </div>
                <span style={{ marginLeft: "20px" }}></span>

                <div
                  onClick={() => {
                    setEditLeadId(cellProps.row.original.id);
                    toggleDeleteModelPopup();
                  }}
                >
                  <span className="table-text flex-grow-1 fw-medium link-danger cursor-pointer">
                    {accessLevel >= perAccessIds.edit ? (
                      <i className="ri-delete-bin-line fs-4"></i>
                    ) : (
                      <TkIcon className="table-text flex-grow-1 fw-medium link-danger cursor-pointer"></TkIcon>
                    )}
                  </span>
                </div>
              </div>
            </>
          );
        },
      },
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

  const concatenateAddress = () => {
    const addr1 = getValues("addr1") || "";
    const addr2 = getValues("addr2") || "";
    const city = getValues("city") || "";
    const state = getValues("state") || "";
    const zip = getValues("zip") || "";
    const country = getValues("country");
    const countryLabel = Array.isArray(country)
      ? country.map((c) => c.label).join(", ")
      : country?.label || "";

    const fullAddress = `${addr1.trim()}, ${addr2.trim()}, ${city.trim()}, ${state.trim()}, ${zip.trim()}, ${countryLabel}`;
    setFullAddress(fullAddress.replace(/,\s*,/g, ",")); // Remove consecutive commas
  };

  const handleInputBlur = (e) => {
    concatenateAddress();
  };

  

  return (
    <>
      <TkRow className="justify-content-center">
        <TkCol lg={12}>
          <TkCardBody className="mt-4">
            <TkForm onSubmit={handleSubmit(onSubmit)}>
              <TkRow className="mt-4 mb-5">
                <TkCol>
                  <div>
                    <TkRow className="g-3">
                      <TkCol lg={3}>
                        <Controller
                          name="custentity_lms_leadsource"
                          control={control}
                          render={({ field }) => (
                            <TkSelect
                              {...field}
                              id="custentity_lms_leadsource"
                              name="custentity_lms_leadsource"
                              labelName="Lead Source"
                              placeholder="Select Lead Source"
                              requiredStarOnLabel="true"
                              options={allleadSourceData}
                              loading={leadSourceLoading}
                            />
                          )}
                        />
                        {errors.custentity_lms_leadsource && (
                          <FormErrorText>
                            {errors.custentity_lms_leadsource.message}
                          </FormErrorText>
                        )}
                      </TkCol>
                      <TkCol lg={3}>
                        <TkInput
                          {...register("custentity_lms_createdby")}
                          id="custentity_lms_createdby"
                          type="text"
                          labelName="Created By"
                          placeholder="Enter Created By"
                          disabled={true}
                        />
                        {errors.custentity_lms_createdby && (
                          <FormErrorText>
                            {errors.custentity_lms_createdby.message}
                          </FormErrorText>
                        )}
                      </TkCol>
                      <TkCol lg={3}>
                        <Controller
                          name="custentity_lms_createddate"
                          control={control}
                          render={({ field }) => (
                            <TkDate
                              {...field}
                              labelName="Created Date"
                              id={"custentity_lms_createddate"}
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
                            />
                          )}
                        />
                        {errors.custentity_lms_createddate && (
                          <FormErrorText>
                            {errors.custentity_lms_createddate.message}
                          </FormErrorText>
                        )}
                      </TkCol>

                      <TkCol lg={3}>
                        <Controller
                          name="subsidiary"
                          control={control}
                          render={({ field }) => (
                            <TkSelect
                              {...field}
                              id="subsidiary"
                              name="subsidiary"
                              labelName="Primary Subsidiary"
                              placeholder="Select Primary Subsidiary"
                              requiredStarOnLabel="true"
                              options={allPrimarySubsidiaryData}
                              loading={primarySubisdiaryLoading}
                            />
                          )}
                        />
                        {errors.subsidiary && (
                          <FormErrorText>
                            {errors.subsidiary.message}
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
                      <TkCol lg={3}>
                        <TkInput
                          {...register("custentity_lms_name")}
                          id="custentity_lms_name"
                          type="text"
                          labelName="Name"
                          placeholder="Enter Name"
                          requiredStarOnLabel="true"
                        />
                        {errors.custentity_lms_name && (
                          <FormErrorText>
                            {errors.custentity_lms_name.message}
                          </FormErrorText>
                        )}
                      </TkCol>

                      <TkCol lg={3}>
                        <TkInput
                          {...register("custentity_lms_personal_phonenumber")}
                          id="custentity_lms_personal_phonenumber"
                          name="custentity_lms_personal_phonenumber"
                          type="text"
                          labelName="Phone No"
                          placeholder="Enter Phone No"
                          requiredStarOnLabel="true"
                        />
                        {errors.custentity_lms_personal_phonenumber && (
                          <FormErrorText>
                            {errors.custentity_lms_personal_phonenumber.message}
                          </FormErrorText>
                        )}
                      </TkCol>
                      <TkCol lg={3}>
                        <TkInput
                          {...register("custentity_lms_personal_email")}
                          id="custentity_lms_personal_email"
                          name="custentity_lms_personal_email"
                          type="text"
                          labelName="Email"
                          placeholder="Enter Email"
                          requiredStarOnLabel="true"
                        />
                        {errors.custentity_lms_personal_email && (
                          <FormErrorText>
                            {errors.custentity_lms_personal_email.message}
                          </FormErrorText>
                        )}
                      </TkCol>

                      <TkCol lg={3}>
                        <Controller
                          name="custentity_lms_enquiryby"
                          control={control}
                          render={({ field }) => (
                            <TkSelect
                              {...field}
                              id="custentity_lms_enquiryby"
                              name="custentity_lms_enquiryby"
                              labelName="Enquiry By"
                              placeholder="Enquiry By"
                              requiredStarOnLabel="true"
                              options={allEnquiryByData}
                              onChange={(e) => {
                                console.log("e", e);
                                field.onChange(e);
                                if (e.value === "3") {
                                  // replace "value_for_other" with the actual value for "Other"
                                  setSelectedEnquiryBy(true);
                                } else {
                                  setSelectedEnquiryBy(false);
                                }
                              }}
                            />
                          )}
                        />
                        {errors.custentity_lms_enquiryby && (
                          <FormErrorText>
                            {errors.custentity_lms_enquiryby.message}
                          </FormErrorText>
                        )}
                      </TkCol>
                      <TkCol lg={12}>
                        <TkInput
                          {...register("custentity_lms_noteother", {
                            required: selectedEnquiryBy
                              ? "Notes is required"
                              : false,
                          })}
                          id="custentity_lms_noteother"
                          type="textarea"
                          labelName="Notes"
                          placeholder="Enter Notes"
                          requiredStarOnLabel={selectedEnquiryBy}
                        />
                        {errors.custentity_lms_noteother && (
                          <FormErrorText>
                            {errors.custentity_lms_noteother.message}
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
                          {...register("companyname")}
                          id="companyname"
                          type="text"
                          labelName="Company Name"
                          placeholder="Enter Company Name"
                          requiredStarOnLabel="true"
                        />
                        {errors.companyname && (
                          <FormErrorText>
                            {errors.companyname.message}
                          </FormErrorText>
                        )}
                      </TkCol>
                      <TkCol lg={4}>
                        <TkInput
                          {...register("phoneNo")}
                          id="phoneNo"
                          name="phoneNo"
                          type="text"
                          labelName="Contact No"
                          placeholder="Enter Contact No"
                          requiredStarOnLabel="true"
                        />
                        {errors.phoneNo && (
                          <FormErrorText>{errors.phoneNo.message}</FormErrorText>
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
                        <TkInput
                          {...register("custentity_lms_cr_no")}
                          id="custentity_lms_cr_no"
                          name="custentity_lms_cr_no"
                          type="text"
                          labelName="CR No"
                          placeholder="Enter CR No"
                          requiredStarOnLabel="true"
                        />
                        {errors.custentity_lms_cr_no && (
                          <FormErrorText>
                            {errors.custentity_lms_cr_no.message}
                          </FormErrorText>
                        )}
                      </TkCol>

                      <TkCol lg={4}>
                        <TkInput
                          {...register("custentity3")}
                          id="custentity3"
                          name="custentity3"
                          type="text"
                          labelName="VAT No"
                          placeholder="Enter VAT No"
                          requiredStarOnLabel="true"
                        />
                        {errors.custentity3 && (
                          <FormErrorText>
                            {errors.custentity3.message}
                          </FormErrorText>
                        )}
                      </TkCol>
                      <TkCol lg={4}>
                        <Controller
                          name="custentity_lms_client_type"
                          control={control}
                          render={({ field }) => (
                            <TkSelect
                              {...field}
                              id="custentity_lms_client_type"
                              name="custentity_lms_client_type"
                              labelName="Client Type"
                              placeholder="Select Client Type"
                              options={allClientTypeData}
                              loading={clientTypeLoading}
                              requiredStarOnLabel="true"
                            />
                          )}
                        />
                        {errors.custentity_lms_client_type && (
                          <FormErrorText>
                            {errors.custentity_lms_client_type.message}
                          </FormErrorText>
                        )}
                      </TkCol>
                      <TkCol lg={2}>
                        <Controller
                          name="custentity_market_segment"
                          control={control}
                          render={({ field }) => (
                            <TkSelect
                              {...field}
                              id="custentity_market_segment"
                              name="custentity_market_segment"
                              labelName="Segment"
                              placeholder="Select Segment"
                              options={allSegmentData}
                              loading={segmentLoading}
                              requiredStarOnLabel="true"
                            />
                          )}
                        />
                        {errors.custentity_market_segment && (
                          <FormErrorText>
                            {errors.custentity_market_segment.message}
                          </FormErrorText>
                        )}
                      </TkCol>
                      <TkCol lg={5}>
                        <TkInput
                          {...register("addr1")}
                          id="addr1"
                          name="addr1"
                          type="textarea"
                          labelName="Address 1"
                          placeholder="Enter Address 1"
                          onBlur={handleInputBlur}
                        />
                        {errors.addr1 && (
                          <FormErrorText>{errors.addr1.message}</FormErrorText>
                        )}
                      </TkCol>

                      <TkCol lg={5}>
                        <TkInput
                          {...register("addr2")}
                          id="addr2"
                          name="addr2"
                          type="textarea"
                          labelName="Address 2"
                          placeholder="Enter Address 2"
                          onBlur={handleInputBlur}
                        />
                        {errors.addr2 && (
                          <FormErrorText>{errors.addr2.message}</FormErrorText>
                        )}
                      </TkCol>

                      <TkCol lg={3}>
                        <TkInput
                          {...register("city")}
                          id="city"
                          name="city"
                          type="text"
                          labelName="City"
                          placeholder="Enter City"
                          onBlur={handleInputBlur}
                        />
                        {errors.city && (
                          <FormErrorText>{errors.city.message}</FormErrorText>
                        )}
                      </TkCol>

                      <TkCol lg={3}>
                        <TkInput
                          {...register("state")}
                          id="state"
                          name="state"
                          type="text"
                          labelName="State"
                          placeholder="Enter State"
                          onBlur={handleInputBlur}
                        />
                        {errors.state && (
                          <FormErrorText>{errors.state.message}</FormErrorText>
                        )}
                      </TkCol>

                      <TkCol lg={3}>
                        <TkInput
                          {...register("zip")}
                          id="zip"
                          name="zip"
                          type="text"
                          labelName="Zip"
                          placeholder="Enter Zip"
                          onBlur={handleInputBlur}
                        />
                        {errors.zip && (
                          <FormErrorText>{errors.zip.message}</FormErrorText>
                        )}
                      </TkCol>

                      <TkCol lg={3}>
                        <Controller
                          name="country"
                          control={control}
                          render={({ field }) => (
                            <TkSelect
                              {...field}
                              labelName="Country"
                              tooltip="Select Country"
                              labelId={"_country"}
                              id="country"
                              options={allCountryData}
                              placeholder="Select Country"
                              onBlur={handleInputBlur}
                            />
                          )}
                        />

                        {errors.country && (
                          <FormErrorText>
                            {errors.country.message}
                          </FormErrorText>
                        )}
                      </TkCol>

                      <TkCol lg={12}>
                        <TkInput
                          {...register("custentity_lms_address")}
                          id="custentity_lms_address"
                          name="custentity_lms_address"
                          type="textarea"
                          labelName="Address "
                          placeholder="Enter Address"
                          disabled={true}
                        />
                        {errors.custentity_lms_address && (
                          <FormErrorText>
                            {errors.custentity_lms_address.message}
                          </FormErrorText>
                        )}
                      </TkCol>

                      {/* <TkCol lg={7}>
                        <TkInput
                          {...register("defaultaddress")}
                          id="defaultaddress"
                          name="defaultaddress"
                          type="textarea"
                          labelName="Address"
                          placeholder="Enter Address"
                          disabled={true}
                        />
                        {errors.defaultaddress && (
                          <FormErrorText>
                            {errors.defaultaddress.message}
                          </FormErrorText>
                        )}
                      </TkCol> */}
                      {/* <TkCol lg={2}>
                        <TkButton
                          type="button"
                          color="primary"
                          className="mt-4"
                          onClick={leadActivityToggle}
                        >
                          Add Address
                        </TkButton>
                      </TkCol> */}
                    </TkRow>
                  </div>
                  <div className="d-flex mt-4 space-childern">
                    {/* <div className="ms-auto" id="update-form-btns">
                  <TkButton
                    type="submit"
                    color="primary"
                    loading={leadPost.isLoading}
                  >
                    Save
                  </TkButton>
                </div> */}
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
                    {/* <NavItem>
                      <NavLink
                        href="#"
                        className={classnames({
                          active: activeSubTab === tabs.leadActivity,
                        })}
                        onClick={() => toggleTab(tabs.leadActivity)}
                        // onClick={leadActivityToggle}
                      >
                        Activity
                      </NavLink>
                    </NavItem> */}
                    <NavItem>
                      <NavLink
                        href="#"
                        className={classnames({
                          active: activeSubTab === tabs.phoneCallActivity,
                        })}
                        onClick={() => toggleTab(tabs.phoneCallActivity)}
                      >
                        Phone Call
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        href="#"
                        className={classnames({
                          active: activeSubTab === tabs.taskActivity,
                        })}
                        onClick={() => toggleTab(tabs.taskActivity)}
                      >
                        Task
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        href="#"
                        className={classnames({
                          active: activeSubTab === tabs.eventActivity,
                        })}
                        onClick={() => toggleTab(tabs.eventActivity)}
                      >
                        Event
                      </NavLink>
                    </NavItem>
                  </Nav>
                </TkCol>
              </TkRow>
              <TkRow className="mt-3">
                <TkCol>
                  <TabContent activeTab={activeSubTab}>
                    <TabPane tabId={tabs.requirementDetails}>
                      <TkContainer>
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
                      </TkContainer>
                    </TabPane>
                    <TabPane tabId={tabs.locationDetails}>
                      <TkContainer>
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
                      </TkContainer>
                    </TabPane>

                    <TabPane tabId={tabs.leadAssigning}>
                      <div>
                        <TkRow className="g-3">
                          <TkCol lg={4}>
                            <Controller
                              name="custrecord_lms_region"
                              control={control}
                              render={({ field }) => (
                                <TkSelect
                                  {...field}
                                  id="custrecord_lms_region"
                                  name="custrecord_lms_region"
                                  labelName="Region"
                                  placeholder="Select Region"
                                  options={allRegionData}
                                  loading={regionLoading}
                                />
                              )}
                            />
                            {errors.custrecord_lms_region && (
                              <FormErrorText>
                                {errors.custrecord_lms_region.message}
                              </FormErrorText>
                            )}
                          </TkCol>

                          <TkCol lg={4}>
                            <Controller
                              name="custrecord_lms_sales_team_name"
                              control={control}
                              render={({ field }) => (
                                <TkSelect
                                  {...field}
                                  id="custrecord_lms_sales_team_name"
                                  name="custrecord_lms_sales_team_name"
                                  labelName="Sales Team Name"
                                  placeholder="Select Sales Team"
                                  options={allSalesTeamData}
                                  loading={salesTeamLoading}
                                />
                              )}
                            />
                            {errors.custrecord_lms_sales_team_name && (
                              <FormErrorText>
                                {errors.custrecord_lms_sales_team_name.message}
                              </FormErrorText>
                            )}
                          </TkCol>
                        </TkRow>
                      </div>
                    </TabPane>

                    <TabPane tabId={tabs.leadNurutring}>
                      <div>
                        <TkRow className="g-3">
                          <TkCol lg={3}>
                            <Controller
                              name="custrecord_lms_primary_action"
                              control={control}
                              render={({ field }) => (
                                <TkSelect
                                  {...field}
                                  id="custrecord_lms_primary_action"
                                  name="custrecord_lms_primary_action"
                                  labelName="Primary Action"
                                  placeholder="Select Primary Action"
                                  options={allPrimaryActionData}
                                  loading={primaryActionLoading}
                                />
                              )}
                            />
                            {errors.custrecord_lms_primary_action && (
                              <FormErrorText>
                                {errors.custrecord_lms_primary_action.message}
                              </FormErrorText>
                            )}
                          </TkCol>

                          <TkCol lg={3}>
                            <TkInput
                              {...register("custrecord_lms_datetime")}
                              id="custrecord_lms_datetime"
                              name="custrecord_lms_datetime"
                              labelName="Date Time"
                              type="text"
                              disabled={true}
                            />
                          </TkCol>

                          <TkCol lg={3}>
                            <TkInput
                              {...register("custrecord_lms_lead_value")}
                              id="custrecord_lms_lead_value"
                              name="custrecord_lms_lead_value"
                              labelName="Total Lead Value"
                              type="text"
                              placeholder="Enter Total Lead Value"
                            />
                            {errors.custrecord_lms_lead_value && (
                              <FormErrorText>
                                {errors.custrecord_lms_lead_value.message}
                              </FormErrorText>
                            )}
                          </TkCol>
                          <TkCol lg={3}>
                            <Controller
                              name="custrecord_lms_statusoflead"
                              control={control}
                              render={({ field }) => (
                                <TkSelect
                                  {...field}
                                  id="custrecord_lms_statusoflead"
                                  name="custrecord_lms_statusoflead"
                                  labelName="Lead Status"
                                  placeholder="Select Lead Status"
                                  options={allNurturStatusData}
                                  // options={[
                                  //   {
                                  //     value: "7",
                                  //     label: "Qualified",
                                  //   },
                                  //   {
                                  //     value: "8",
                                  //     label: "Unqualified",
                                  //   },
                                  // ]}
                                />
                              )}
                            />
                            {errors.custrecord_lms_statusoflead && (
                              <FormErrorText>
                                {errors.custrecord_lms_statusoflead.message}
                              </FormErrorText>
                            )}
                          </TkCol>

                          <TkCol lg={4}>
                            <TkInput
                              {...register("custrecord_lms_lead_unqualifie")}
                              id="custrecord_lms_lead_unqualifie"
                              name="custrecord_lms_lead_unqualifie"
                              labelName="Reason if unqualified lead"
                              type="textarea"
                              placeholder="Enter Reason"
                            />
                            {errors.custrecord_lms_lead_unqualifie && (
                              <FormErrorText>
                                {errors.custrecord_lms_lead_unqualifie.message}
                              </FormErrorText>
                            )}
                          </TkCol>

                          <TkCol lg={3}>
                            <Controller
                              name="custrecord_lms_prospect_nurtur"
                              control={control}
                              render={({ field }) => (
                                <TkSelect
                                  {...field}
                                  id="custrecord_lms_prospect_nurtur"
                                  name="custrecord_lms_prospect_nurtur"
                                  labelName="Prospect Nurturing"
                                  placeholder="Select Prospect Nurturing"
                                  options={allProspectNurturingData}
                                  loading={prospectNurturingLoading}
                                />
                              )}
                            />
                            {errors.custrecord_lms_prospect_nurtur && (
                              <FormErrorText>
                                {errors.custrecord_lms_prospect_nurtur.message}
                              </FormErrorText>
                            )}
                          </TkCol>
                        </TkRow>
                      </div>
                    </TabPane>
                    <TabPane tabId={tabs.phoneCallActivity}>
                      <TkContainer>
                        <TkTableContainer
                          customPageSize={true}
                          showAddButton={true}
                          onClickAdd={handleAddPhoneCallRow}
                          onclickDelete={handleRemovePhoneCallRow}
                          columns={phoneCallActivityColumns}
                          data={phoneCallRows}
                          thClass="text-dark"
                          dynamicTable={true}
                        />
                      </TkContainer>
                    </TabPane>

                    <TabPane tabId={tabs.taskActivity}>
                      <TkContainer>
                        <TkTableContainer
                          customPageSize={true}
                          showAddButton={true}
                          onClickAdd={handleAddTaskRow}
                          onclickDelete={handleRemoveTaskRow}
                          columns={taskActivityColumns}
                          data={taskCallRows}
                          thClass="text-dark"
                          dynamicTable={true}
                        />
                      </TkContainer>
                    </TabPane>

                    <TabPane tabId={tabs.eventActivity}>
                      <TkContainer>
                        <TkTableContainer
                          customPageSize={true}
                          showAddButton={true}
                          onClickAdd={handleAddEventRow}
                          onclickDelete={handleRemoveEventRow}
                          columns={eventActivityColumns}
                          data={eventCallRows}
                          thClass="text-dark"
                          dynamicTable={true}
                        />
                      </TkContainer>
                    </TabPane>
                    
                  </TabContent>
                </TkCol>
              </TkRow>

              {leadEmailPost.isError ? (
                <FormErrorBox errMessage={leadEmailPost.error?.message} />
              ) : null}
              <div className="d-flex mt-4 space-childern">
                <div className="ms-auto" id="update-form-btns">
                  <TkButton
                    color="secondary"
                    onClick={() => {
                      router.push(`${urls.lead}`);
                    }}
                    type="button"
                    disabled={leadEmailPost.isLoading}
                  >
                    Cancel
                  </TkButton>{" "}
                  <TkButton
                    type="submit"
                    color="primary"
                    loading={leadEmailPost.isLoading}
                  >
                    Submit
                  </TkButton>
                </div>
              </div>
            </TkForm>

            {/* <TkModal
              isOpen={activityModal}
              toggle={leadActivityToggle}
              leadActivityToggle={leadActivityToggle}
              centered
              size="lg"
              className="border-0"
              modalClassName="modal fade zoomIn"
            >
              <TkModalHeader
                className="p-3 bg-soft-info"
                partnerToggle={leadActivityToggle}
                toggle={leadActivityToggle}
              >
                {"Phone Call"}
              </TkModalHeader>
              <TkContainer>
                <TkCardBody>
                  <ActivityPopup
                    leadActivityToggle={leadActivityToggle}
                    isPopup={true}
                    directCallId={directCallId}
                    setNewAddress={setNewAddress}
                  />
                </TkCardBody>
              </TkContainer>
            </TkModal>

            <TkModal
              isOpen={leadTaskModal}
              toggle={leadTaskActivityToggle}
              leadTaskActivityToggle={leadTaskActivityToggle}
              centered
              size="lg"
              className="border-0"
              modalClassName="modal fade zoomIn"
            >
              <TkModalHeader
                className="p-3 bg-soft-info"
                partnerToggle={leadTaskActivityToggle}
                toggle={leadTaskActivityToggle}
              >
                {"Task"}
              </TkModalHeader>
              <TkContainer>
                <TkCardBody>
                  <LeadTaskPopup
                    leadTaskActivityToggle={leadTaskActivityToggle}
                    isPopup={true}
                    directCallId={directCallId}
                    setNewAddress={setNewAddress}
                  />
                </TkCardBody>
              </TkContainer>
            </TkModal>

            <TkModal
              isOpen={leadEventModal}
              toggle={leadEventActivityToggle}
              leadEventActivityToggle={leadEventActivityToggle}
              centered
              size="lg"
              className="border-0"
              modalClassName="modal fade zoomIn"
            >
              <TkModalHeader
                className="p-3 bg-soft-info"
                partnerToggle={leadEventActivityToggle}
                toggle={leadEventActivityToggle}
              >
                {"Event"}
              </TkModalHeader>
              <TkContainer>
                <TkCardBody>
                  <LeadEventPopup
                    leadEventActivityToggle={leadEventActivityToggle}
                    isPopup={true}
                    directCallId={directCallId}
                    setNewAddress={setNewAddress}
                  />
                </TkCardBody>
              </TkContainer>
            </TkModal> */}
          </TkCardBody>
        </TkCol>
      </TkRow>
     
    </>
  );
}

export default LeadEmail;
