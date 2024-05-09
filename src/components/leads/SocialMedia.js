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
import ActivityPopup from "./ActivityPopup";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";
import { convertTimeToSec, convertToTimeFotTimeSheet } from "../../utils/time";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useMutation, useQueries } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import { formatDateForAPI } from "../../utils/date";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
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
};

const schema = Yup.object({
  custentity_lms_leadsource: Yup.object()
    .nullable()
    .required("Lead source is required"),
  custentity_lms_name_of_the_platform_dd: Yup.object().required(
    "Name Of Platform is required"
  ),

    custentity_lms_campaign_name: Yup.object().required(
    "Campaign Name is required"
  ),
  
    custentity_lms_visit_update: Yup.object().required(
    "Visit Update is required"
  ),
  subsidiary: Yup.object().required("Primary subsidairy is required"),
  custentity_lms_name: Yup.string()
    .min(MinNameLength, `Name should have at least ${MinNameLength} character.`)
    .max(MaxNameLength, `Name should have at most ${MaxNameLength} characters.`)
    .required("Name is required"),

  custentity_lms_personal_phonenumber: Yup.string()
    .nullable()
    .required("Phone number is Required")
    .matches(/^[0-9+() -]*$/, "Mobile number must be number.")
    .max(
      MaxPhoneNumberLength,
      `Mobile number must be at most ${MaxPhoneNumberLength} numbers.`
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
  custentity_lms_enquiryby: Yup.object().required("Enquiry by is required"),
  custentity_lms_noteother: Yup.string().max(
    bigInpuMaxLength,
    `Note should have at most ${bigInpuMaxLength} characters.`
  ),
  companyName: Yup.string()
    .nullable()
    .max(
      smallInputMaxLength,
      `Company name should have at most ${smallInputMaxLength} characters.`
    ),
  phone: Yup.string()
    .nullable()
    .matches(/^[0-9+() -]*$/, "Phone number must be number.")
    .max(
      MaxPhoneNumberLength,
      `Phone number must be at most ${MaxPhoneNumberLength} numbers.`
    ),
  email: Yup.string()
    .nullable()
    .email("Email must be valid.")
    .max(
      MaxEmailLength,
      `Email should have at most ${MaxEmailLength} characters.`
    ),
    addr1: Yup.string()
    .required("Address 1 is required")
    .max(
      smallInputMaxLength,
      `Address 1 should have at most ${smallInputMaxLength} characters.`
    )
    .nullable(),
  city: Yup.string()
    .required("City is required")
    .max(
      smallInputMaxLength,
      `City should have at most ${smallInputMaxLength} characters.`
    )
    .nullable(),

  state: Yup.string().required("State is required").nullable(),

  zip: Yup.string()
    .required("Zip is required")
    .test("test-name", "Zip code does not accept characters", function (value) {
      if (value === "" || value === null || value === undefined) {
        return true;
      } else {
        return value.trim().match(/^[0-9]*$/, "Zip code must be numeric.");
      }
    }),
}).required();


function SocialMedia({ selectedButton }) {
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
  const [allPlatformData, setAlllPlatformData] = useState([{}]);
  const [allCampaignData, setAlllCampaignData] = useState([{}]);
  const [allVisitUpdateData, setAlllVisitUpdateData] = useState([{}]);
  const [directCallId, setDirectCallId] = useState(null);
  const [newAddress, setNewAddress] = useState(null);
  const [allCountryData, setAllCountryData] = useState([{}]);
  const [fullAddress, setFullAddress] = useState(false);

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
        queryKey: [RQ.allLeadPlatform],
        queryFn: tkFetch.get(`${API_BASE_URL}/lead-platform`),
      },

      {
        queryKey: [RQ.allLeadCampaign],
        queryFn: tkFetch.get(`${API_BASE_URL}/lead-campaign`),
      },

      {
        queryKey: [RQ.allVisitUpdate],
        queryFn: tkFetch.get(`${API_BASE_URL}/visit-update`),
      },
      {
        queryKey: [RQ.allCountry],
        queryFn: tkFetch.get(`${API_BASE_URL}/country`),
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
    leadPlatform,
    leadCampaign,
    leadVisitUpdate,
    country
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
    data: leadPlatformData,
    isLoading: leadPlatformLoading,
    isError: leadPlatformIsError,
    error: leadPlatformError,
  } = leadPlatform;

  const {
    data: leadCampaignData,
    isLoading: leadCampaignLoading,
    isError: leadCampaignIsError,
    error: leadCampaignError,
  } = leadCampaign;

  const {
    data: leadVisitUpdateData,
    isLoading: leadVisitUpdateLoading,
    isError: leadVisitUpdateIsError,
    error: leadVisitUpdateError,
  } = leadVisitUpdate;

  const {
    data: countryData,
    isLoading: countryLoading,
    isError: countryIsError,
    error: countryError,
  } = country;


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

    if (leadPlatformIsError) {
      console.log("leadPlatformIsError", leadPlatformError);
      TkToastError(leadPlatformError.message);
    }
    if (leadCampaignIsError) {
      console.log("leadCampaignIsError", leadCampaignError);
      TkToastError(leadCampaignError.message);
    }

    if (leadVisitUpdateIsError) {
      console.log("leadVisitUpdateIsError", leadVisitUpdateError);
      TkToastError(leadVisitUpdateError.message);
    }

    if (countryIsError) {
      console.log("countryIsError", countryError);
      TkToastError(countryError.message);
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
    leadPlatformIsError,
    leadPlatformError,
    leadCampaignIsError,
    leadCampaignError,
    leadVisitUpdateIsError,
    leadVisitUpdateError,
    countryIsError,
    countryError,
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

    if (leadPlatformData) {
      setAlllPlatformData(
        leadPlatformData?.items?.map((leadPlatformType) => ({
          label: leadPlatformType.name,
          value: leadPlatformType.id,
        }))
      );
    }

    if (leadCampaignData) {
      setAlllCampaignData(
        leadCampaignData?.items?.map((leadCampaignType) => ({
          label: leadCampaignType.name,
          value: leadCampaignType.id,
        }))
      );
    }

    if (leadVisitUpdateData) {
      setAlllVisitUpdateData(
        leadVisitUpdateData?.items?.map((leadVisitUpdateType) => ({
          label: leadVisitUpdateType.name,
          value: leadVisitUpdateType.id,
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
    leadPlatformData,
    leadCampaignData,
    leadVisitUpdateData,
    countryData,
  ]);
  const [rows, setRows] = useState([
    {
      division: null,
      requirement: "",
      projectname: "",
      duration: "",
      unitOfMeasure: null,
      value: "",
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
    if (fullAddress) {
      setValue("addrtext", fullAddress);
    }
  }, [fullAddress, setValue]);

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

    setValue("custentity_lms_createddate", now);
    setValue("custentity_lms_lastactivitydate", formattedDate);
    setSelectedDate(now);
  }, [setValue]);

  // const handleButtonClick = (button) => {
  //   setSelectedButton(button);
  //   setShowForm(true);
  //   setButtonsDisabled(true);
  // };

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
        value: "",
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
  const { remove: removeValue } = useFieldArray({
    control,
    name: "value",
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

  const leadPost = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/lead`),
  });

  const leadAssignPost = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/lead-assign`),
  });

  const onSubmit = (formData) => {
    const apiData = {
      customForm: {
        id: "135",
        refName: "LMS CRM FORM",
      },
      entitystatus: {
        id: "7",
        refName: "LEAD-Qualified",
      },
      custentity_lms_channel_lead: {
        id: selectedButton.id,
      },
      custentity_lms_leadsource: {
        id: formData.custentity_lms_leadsource.value,
      },

      custentity_lms_name_of_the_platform_dd: {
        id: formData.custentity_lms_name_of_the_platform_dd.value,
      },
      custentity_lms_campaign_name: {
        id: formData.custentity_lms_campaign_name.value,
      },
      custentity_lms_date_of_visit: formatDateForAPI(
        formData.custentity_lms_date_of_visit
      ),
      custentity_lms_visit_update: {
        id: formData.custentity_lms_visit_update.value,
      },
      custentity_lms_createdby: formData.custentity_lms_createdby,
      custentity_lms_createddate: formData.custentity_lms_createddate,
      subsidiary: {
        id: formData.subsidiary.value,
      },
      custentity_lms_name: formData.custentity_lms_name,
      custentity_lms_personal_phonenumber:
        formData.custentity_lms_personal_phonenumber,
      custentity_lms_personal_email: formData.custentity_lms_personal_email,
      custentity_lms_enquiryby: {
        id: formData.custentity_lms_enquiryby.value,
      },
      custentity_lms_noteother: formData.custentity_lms_noteother,
      companyName: formData.companyName,
      phone: formData.phone,
      email: formData.email,
      custentity_lms_cr_no: formData.custentity_lms_cr_no,
      custentity3: formData.custentity3,
      custentity_lms_client_type: {
        id: formData.custentity_lms_client_type.value,
      },
      custentity_market_segment: {
        id: formData.custentity_market_segment.value,
      },
      addressBook: {
        items: [
          {
            addressBookAddress: {
              addr1: formData.addr1,
              addr2: formData.addr2,
              city: formData.city,
              state: formData.state,
              zip: formData.zip,
              country: {
                id: formData.country.value,
              },
              defaultBilling: true,
              defaultShipping: true,
              addrtext: formData.addrtext,
            },
          },
        ],
      },
    };

    // const leadAssignData = {
    //   custrecord_lms_lead_assigning: {
    //     id: "26723",
    //   },
    //   custrecord_lms_region: {
    //     id: formData.custrecord_lms_region?.value,
    //   },
    //   custrecord_lms_sales_team_name: {
    //     id: formData.custrecord_lms_sales_team_name?.value,
    //   },
    // };

    leadPost.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("SocialMedia Lead Created Successfully");
        router.push(`${urls.lead}`);
      },
      onError: (error) => {
        TkToastError("error while creating Lead", error);
      },
    });
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
              name={`custrecord_lms_division[${cellProps.row.index}]`}
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
              {...register(`projectName[${cellProps.row.index}]`)}
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
      accessor: "custrecord_lms_location",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              placeholder="Enter Location"
              id="custrecord_lms_location"
              {...register(`custrecord_lms_location[${cellProps.row.index}]`)}
            />
            {errors?.custrecord_lms_location?.[cellProps.row.index] && (
              <FormErrorText>
                {
                  errors?.custrecord_lms_location?.[cellProps.row.index]
                    ?.message
                }
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
                        <Controller
                          name="custentity_lms_name_of_the_platform_dd"
                          control={control}
                          render={({ field }) => (
                            <TkSelect
                              {...field}
                              id="custentity_lms_name_of_the_platform_dd"
                              name="custentity_lms_name_of_the_platform_dd"
                              labelName="Name Of Platform"
                              placeholder="Select Platform"
                              requiredStarOnLabel="true"
                              options={allPlatformData}
                              loading={leadPlatformLoading}
                            />
                          )}
                        />
                        {errors.custentity_lms_name_of_the_platform_dd && (
                          <FormErrorText>
                            {
                              errors.custentity_lms_name_of_the_platform_dd
                                .message
                            }
                          </FormErrorText>
                        )}
                      </TkCol>

                      <TkCol lg={3}>
                        <Controller
                          name="custentity_lms_campaign_name"
                          control={control}
                          render={({ field }) => (
                            <TkSelect
                              {...field}
                              id="custentity_lms_campaign_name"
                              name="custentity_lms_campaign_name"
                              labelName="Campaign Name"
                              placeholder="Enter Campaign Name"
                              requiredStarOnLabel="true"
                              options={allCampaignData}
                              loading={leadCampaignLoading}
                            />
                          )}
                        />
                        {errors.custentity_lms_campaign_name && (
                          <FormErrorText>
                            {errors.custentity_lms_campaign_name.message}
                          </FormErrorText>
                        )}
                      </TkCol>

                      <TkCol lg={3}>
                        <Controller
                          name="custentity_lms_visit_update"
                          control={control}
                          render={({ field }) => (
                            <TkSelect
                              {...field}
                              id="custentity_lms_visit_update"
                              name="custentity_lms_visit_update"
                              labelName="Visit Update"
                              options={allVisitUpdateData}
                              placeholder="Select Visit Update"
                              requiredStarOnLabel="true"
                              loading={leadVisitUpdateLoading}
                            />
                          )}
                        />
                        {errors.custentity_lms_visit_update && (
                          <FormErrorText>
                            {errors.custentity_lms_visit_update.message}
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
                          requiredStarOnLabel="true"
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
                              requiredStarOnLabel={true}
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
                      <TkCol lg={4}>
                        <TkInput
                          {...register("firstname")}
                          id="firstname"
                          type="text"
                          labelName="Name"
                          placeholder="Enter Name"
                          requiredStarOnLabel="true"
                        />
                        {errors.firstname && (
                          <FormErrorText>
                            {errors.firstname.message}
                          </FormErrorText>
                        )}
                      </TkCol>
                      <TkCol lg={4}>
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
                      <TkCol lg={4}>
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

                      <TkCol lg={4}>
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
                            />
                          )}
                        />
                        {errors.custentity_lms_enquiryby && (
                          <FormErrorText>
                            {errors.custentity_lms_enquiryby.message}
                          </FormErrorText>
                        )}
                      </TkCol>
                      <TkCol lg={8}>
                        <TkInput
                          {...register("custentity_lms_noteother")}
                          id="custentity_lms_noteother"
                          type="textarea"
                          labelName="Notes"
                          placeholder="Enter Notes"
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
                          {...register("phone")}
                          id="phone"
                          name="phone"
                          type="text"
                          labelName="Contact No"
                          placeholder="Enter Contact No"
                        />
                        {errors.phone && (
                          <FormErrorText>{errors.phone.message}</FormErrorText>
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
                            />
                          )}
                        />
                        {errors.custentity_lms_client_type && (
                          <FormErrorText>
                            {errors.custentity_lms_client_type.message}
                          </FormErrorText>
                        )}
                      </TkCol>
                      <TkCol lg={3}>
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
                            />
                          )}
                        />
                        {errors.custentity_market_segment && (
                          <FormErrorText>
                            {errors.custentity_market_segment.message}
                          </FormErrorText>
                        )}
                      </TkCol>

                      <TkCol lg={7}>
                        <TkInput
                          {...register("defaultaddress")}
                          id="defaultaddress"
                          name="defaultaddress"
                          type="textarea"
                          labelName="Address"
                          placeholder="Enter Address"
                        />
                        {errors.defaultaddress && (
                          <FormErrorText>
                            {errors.defaultaddress.message}
                          </FormErrorText>
                        )}
                      </TkCol>
                      <TkCol lg={2}>
                        <TkButton
                          type="button"
                          color="primary"
                          className="mt-4"
                          onClick={leadActivityToggle}
                        >
                          Add Address
                        </TkButton>
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

                    <NavItem>
                      <NavLink
                        href="#"
                        className={classnames({
                          active: activeSubTab === tabs.leadActivity,
                        })}
                        onClick={() => toggleTab(tabs.leadActivity)}
                      >
                        Lead Activity
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
                              name="custentity_lms_primary_action"
                              control={control}
                              render={({ field }) => (
                                <TkSelect
                                  {...field}
                                  id="custentity_lms_primary_action"
                                  name="custentity_lms_primary_action"
                                  labelName="Primary Action"
                                  placeholder="Select Primary Action"
                                  options={allPrimaryActionData}
                                  loading={primaryActionLoading}
                                />
                              )}
                            />
                            {errors.custentity_lms_primary_action && (
                              <FormErrorText>
                                {errors.custentity_lms_primary_action.message}
                              </FormErrorText>
                            )}
                          </TkCol>

                          <TkCol lg={3}>
                            <TkInput
                              {...register("custentity_lms_lastactivitydate")}
                              id="custentity_lms_lastactivitydate"
                              name="custentity_lms_lastactivitydate"
                              labelName="Date Time"
                              type="text"
                              disabled={true}
                            />
                          </TkCol>

                          <TkCol lg={3}>
                            <TkInput
                              {...register("custentity_lms_lead_value")}
                              id="custentity_lms_lead_value"
                              name="custentity_lms_lead_value"
                              labelName="Lead Value"
                              type="text"
                              placeholder="Enter Lead Value"
                            />
                            {errors.custentity_lms_lead_value && (
                              <FormErrorText>
                                {errors.custentity_lms_lead_value.message}
                              </FormErrorText>
                            )}
                          </TkCol>
                          <TkCol lg={3}>
                            <Controller
                              name="entitystatus"
                              control={control}
                              render={({ field }) => (
                                <TkSelect
                                  {...field}
                                  id="entitystatus"
                                  name="entitystatus"
                                  labelName="Lead Status"
                                  placeholder="Select Lead Status"
                                  options={[
                                    {
                                      value: "7",
                                      label: "Qualified",
                                    },
                                    {
                                      value: "8",
                                      label: "Unqualified",
                                    },
                                  ]}
                                />
                              )}
                            />
                            {errors.entitystatus && (
                              <FormErrorText>
                                {errors.entitystatus.message}
                              </FormErrorText>
                            )}
                          </TkCol>

                          <TkCol lg={4}>
                            <TkInput
                              {...register("custentity_lms_lead_unqualified")}
                              id="custentity_lms_lead_unqualified"
                              name="custentity_lms_lead_unqualified"
                              labelName="Reason if unqualified lead"
                              type="textarea"
                              placeholder="Enter Reason"
                            />
                            {errors.custentity_lms_lead_unqualified && (
                              <FormErrorText>
                                {errors.custentity_lms_lead_unqualified.message}
                              </FormErrorText>
                            )}
                          </TkCol>

                          <TkCol lg={3}>
                            <Controller
                              name="custentity_lms_prospect_nurturing"
                              control={control}
                              render={({ field }) => (
                                <TkSelect
                                  {...field}
                                  id="custentity_lms_prospect_nurturing"
                                  name="custentity_lms_prospect_nurturing"
                                  labelName="Prospect Nurturing"
                                  placeholder="Select Prospect Nurturing"
                                  options={allProspectNurturingData}
                                  loading={prospectNurturingLoading}
                                />
                              )}
                            />
                            {errors.custentity_lms_prospect_nurturing && (
                              <FormErrorText>
                                {
                                  errors.custentity_lms_prospect_nurturing
                                    .message
                                }
                              </FormErrorText>
                            )}
                          </TkCol>
                        </TkRow>
                      </div>
                    </TabPane>

                    <TabPane tabId={tabs.leadActivity}>
                      <div>
                        <TkRow className="g-3">
                          <TkCol lg={4}>
                            <Controller
                              name="activityType"
                              control={control}
                              render={({ field }) => (
                                <TkSelect
                                  {...field}
                                  labelName="Activity Type"
                                  labelId="activityType"
                                  id="activityType"
                                  options={leadActivityTypes}
                                  placeholder="Select Activity Type"
                                  requiredStarOnLabel={true}
                                />
                              )}
                            />
                            {errors.activityType && (
                              <FormErrorText>
                                {errors.activityType.message}
                              </FormErrorText>
                            )}
                          </TkCol>
                          <TkCol lg={4}>
                            <TkInput
                              {...register("lead")}
                              id="lead"
                              name="lead"
                              type="text"
                              labelName="Lead Name"
                              placeholder="Enter Lead Name"
                              requiredStarOnLabel={true}
                            />
                            {errors.lead && (
                              <FormErrorText>
                                {errors.lead.message}
                              </FormErrorText>
                            )}
                          </TkCol>

                          <TkCol lg={4}>
                            <TkInput
                              {...register("location")}
                              labelName="Location"
                              labelId={"location"}
                              id="location"
                              type="text"
                              placeholder="Enter Location"
                              requiredStarOnLabel={true}
                            />
                            {errors.location && (
                              <FormErrorText>
                                {errors.location.message}
                              </FormErrorText>
                            )}
                          </TkCol>

                          <TkCol lg={4}>
                            <TkInput
                              {...register("phoneNumber")}
                              id="phoneNumber"
                              name="phoneNumber"
                              type="text"
                              labelName="Phone Number"
                              placeholder="Enter Phone Number"
                              requiredStarOnLabel={true}
                            />
                            {errors.phoneNumber && (
                              <FormErrorText>
                                {errors.phoneNumber.message}
                              </FormErrorText>
                            )}
                          </TkCol>

                          <TkCol lg={4}>
                            <Controller
                              name="status"
                              control={control}
                              render={({ field }) => (
                                <TkSelect
                                  {...field}
                                  labelName="Status"
                                  labelId={"_status"}
                                  id="status"
                                  options={[]}
                                  placeholder="Select Type"
                                  requiredStarOnLabel={true}
                                />
                              )}
                            />
                            {errors.status && (
                              <FormErrorText>
                                {errors.status.message}
                              </FormErrorText>
                            )}
                          </TkCol>

                          <TkCol lg={4}>
                            <Controller
                              name="date"
                              control={control}
                              rules={{ required: "Date is required" }}
                              render={({ field }) => (
                                <TkDate
                                  {...field}
                                  labelName="Date"
                                  id={"date"}
                                  placeholder="Select Date"
                                  options={{
                                    altInput: true,
                                    dateFormat: "d M, Y",
                                  }}
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

                          <TkCol lg={8}>
                            <TkInput
                              {...register("comments")}
                              id="comments"
                              name="comments"
                              type="textarea"
                              labelName="Comments"
                              placeholder="Enter Comments"
                            />
                            {errors.comments && (
                              <FormErrorText>
                                {errors.comments.message}
                              </FormErrorText>
                            )}
                          </TkCol>
                        </TkRow>
                      </div>
                    </TabPane>
                  </TabContent>
                </TkCol>
              </TkRow>

              {leadPost.isError ? (
                <FormErrorBox errMessage={leadPost.error?.message} />
              ) : null}
              <div className="d-flex mt-4 space-childern">
                <div className="ms-auto" id="update-form-btns">
                  <TkButton
                    color="secondary"
                    onClick={() => {
                      router.push(`${urls.lead}`);
                    }}
                    type="button"
                    disabled={leadPost.isLoading}
                  >
                    Cancel
                  </TkButton>{" "}
                  <TkButton
                    type="submit"
                    color="primary"
                    loading={leadPost.isLoading}
                  >
                    Save
                  </TkButton>
                </div>
              </div>
            </TkForm>

            <TkModal
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
                {"Add Address"}
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
          </TkCardBody>
        </TkCol>
      </TkRow>
    </>
  );
}

export default SocialMedia;
