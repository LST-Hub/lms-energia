import React, { useCallback, useEffect, useMemo, useState } from "react";
import TkPageHead from "../../../src/components/TkPageHead";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import {
  API_BASE_URL,
  MaxNameLength,
  MinNameLength,
  clientTypes,
  createdByNameTypes,
  demoUserData,
  divisionTypes,
  leadActivityTypes,
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
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import LeadTaskPopup from "./LeadTaskPopup";
import LeadEventPopup from "./LeadEventPopup";
const schema = Yup.object({
  custentity_lms_leadsource: Yup.object()
    .nullable()
    .required("Lead source is required"),

  subsidiary: Yup.object().required("Primary subsidairy is required"),
  custentity_lms_name: Yup.string()
    .required("Name is required")
    .min(MinNameLength, `Name should have at least ${MinNameLength} character.`)
    .max(
      MaxNameLength,
      `Name should have at most ${MaxNameLength} characters.`
    ),
  // lastName: Yup.string()
  //   .min(MinNameLength, `Name should have at least ${MinNameLength} character.`)
  //   .max(MaxNameLength, `Name should have at most ${MaxNameLength} characters.`)
  //   .required("Last Name is required"),

  custentity_lms_personal_phonenumber: Yup.string()
    .nullable()
    .required("Phone number is Required")
    .matches(/^[0-9+() -]*$/, "Phone number must be number.")
    .max(
      MaxPhoneNumberLength,
      `Phone number must be at most ${MaxPhoneNumberLength} numbers.`
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
    .required("Company Name is required")
    .max(
      smallInputMaxLength,
      `Company name should have at most ${smallInputMaxLength} characters.`
    ),
  phone: Yup.string()
    .nullable()
    .matches(/^[0-9+() -]*$/, "Contact number must be number.")
    .max(
      MaxPhoneNumberLength,
      `Contact number must be at most ${MaxPhoneNumberLength} numbers.`
    ),
  email: Yup.string()
    .nullable()
    .email("Email must be valid.")
    .max(
      MaxEmailLength,
      `Company Email should have at most ${MaxEmailLength} characters.`
    ),
  addr1: Yup.string()
    .max(
      smallInputMaxLength,
      `Address 1 should have at most ${smallInputMaxLength} characters.`
    )
    .nullable(),
  city: Yup.string()
    .max(
      smallInputMaxLength,
      `City should have at most ${smallInputMaxLength} characters.`
    )
    .nullable(),

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

const tabs = {
  directCall: "directCall",
  phoneCall: "phoneCall",
  email: "email",
  socialMedia: "socialMedia",
  portals: "portals",
  directMarketing: "directMarketing",
  requirementDetails: "requirementDetails",
  locationDetails: "locationDetails",
  leadAssigning: "leadAssigning",
  leadNurutring: "leadNurutring",
  leadActivity: "leadActivity",
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
  const [leadTaskModal, setLeadTaskModal] = useState(false);
  const [leadEventModal, setLeadEventModal] = useState(false);

  const [isLeadEdit, setIsLeadEdit] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allDurations, setAllDurations] = useState({});
  const [activeSubTab, setActiveSubTab] = useState(tabs.requirementDetails);
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
  const [allCountryData, setAllCountryData] = useState([{}]);
  const [fullAddress, setFullAddress] = useState(false);
  const [editLeadId, setEditLeadId] = useState(null);
  const [directCallId, setDirectCallId] = useState(null);
  const [newAddress, setNewAddress] = useState(null);

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
  const { data, isLoading, isFetched, isError, error } = useQuery({
    queryKey: [RQ.lead, lid],
    queryFn: tkFetch.get(`${API_BASE_URL}/lead/${lid}`),
    enabled: !!lid,
  });

  const concatenateAddress = useCallback(() => {
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
    setFullAddress(fullAddress.replace(/,\s*,/g, ","));
  }, [getValues, setFullAddress]);

  const handleInputBlur = (e) => {
    concatenateAddress();
  };
  useEffect(() => {
    if (fullAddress) {
      setValue("addrtext", fullAddress);
    }
  }, [fullAddress, setValue]);

  useEffect(() => {
    if (isFetched && Array.isArray(data) && data.length > 0) {
      const {
        custentity_lms_leadsource,
        custentity_lms_createdby,
        subsidiary,
        custentity_lms_name,
        // middleName,
        // lastName,
        custentity_lms_personal_phonenumber,
        custentity_lms_personal_email,
        custentity_lms_enquiryby,
        custentity_lms_noteother,
        companyName,
        phone,
        email,
        custentity_lms_cr_no,
        custentity3,
        custentity_lms_client_type,
        custentity_market_segment,
        defaultAddress,
      } = data[0];
      // const address = defaultAddress.split(",");
      const address = defaultAddress ? defaultAddress.split(", ") : [];

      setValue("custentity_lms_leadsource", {
        label: custentity_lms_leadsource?.refName,
        value: custentity_lms_leadsource?.id,
      });
      setValue("custentity_lms_createdby", custentity_lms_createdby?.refName);
      setValue("subsidiary", {
        label: subsidiary?.refName,
        value: subsidiary?.id,
      });
      setValue("custentity_lms_name", custentity_lms_name);
      // setValue("middleName", middleName),
      //   setValue("lastName", lastName),
      setValue(
        "custentity_lms_personal_phonenumber",
        custentity_lms_personal_phonenumber
      );
      setValue("custentity_lms_personal_email", custentity_lms_personal_email);
      setValue("custentity_lms_enquiryby", {
        label: custentity_lms_enquiryby?.refName,
        value: custentity_lms_enquiryby?.id,
      });
      setValue("custentity_lms_noteother", custentity_lms_noteother);
      // Use empty string if companyName is null or undefined
      setValue("companyName", companyName ?? "");
      setValue("companyName", companyName);
      setValue("phone", phone);
      setValue("email", email);
      setValue("custentity_lms_cr_no", custentity_lms_cr_no);
      setValue("custentity3", custentity3);
      setValue("custentity_lms_client_type", {
        label: custentity_lms_client_type?.refName,
        value: custentity_lms_client_type?.id,
      });
      setValue("custentity_market_segment", {
        label: custentity_market_segment?.refName,
        value: custentity_market_segment?.id,
      });
      setValue("addr1", address[0]);
      setValue("addr2", address[1]);
      setValue("city", address[2]);
      setValue("state", address[3]);
      setValue("zip", address[4]);
      setValue("country", {
        label: address[5],
        value: address[5],
      });

      // setValue("addrtext", defaultAddress);
      concatenateAddress();
    }
  }, [data, isFetched, setValue, concatenateAddress]);

  const leadPost = useMutation({
    mutationFn: tkFetch.patchWithIdInUrl(`${API_BASE_URL}/lead`),
  });

  const onSubmit = (formData) => {
    if (!editMode) return;
    const apiData = {
      id: lid,
      custentity_lms_leadsource: {
        id: formData.custentity_lms_leadsource.value,
        refName: formData.custentity_lms_leadsource.label,
      },
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
      companyName: formData.companyName ?? "", // Use empty string if companyName is null or undefined
      phone: formData.phone ?? "", // Use empty string if phone is null or undefined
      email: formData.email ?? "", // Use empty string if email is null or undefined
      custentity_lms_cr_no: formData.custentity_lms_cr_no ?? "", // Use empty string if custentity_lms_cr_no is null or undefined
      custentity3: formData.custentity3 ?? "", // Use empty string if custentity3 is null or undefined
      custentity_lms_client_type: formData.custentity_lms_client_type?.value
        ? { id: formData.custentity_lms_client_type.value }
        : null, // Use null if custentity_lms_client_type is null or undefined
      custentity_market_segment: formData.custentity_market_segment?.value
        ? { id: formData.custentity_market_segment.value }
        : null,
      // companyName: formData.companyName,
      // phone: formData.phone,
      // email: formData.email,
      // custentity_lms_cr_no: formData.custentity_lms_cr_no,
      // custentity3: formData.custentity3,
      // custentity_lms_client_type: {
      //   id: formData.custentity_lms_client_type.value,
      // },
      // custentity_market_segment: {
      //   id: formData.custentity_market_segment.value,
      // },
      // addressBook: {
      //   items: [
      //     {
      //       addressBookAddress: {
      //         addr1: formData.addr1,
      //         addr2: formData.addr2,
      //         city: formData.city,
      //         state: formData.state,
      //         zip: formData.zip,
      //         country: {
      //           id: formData.country?.value,
      //           refName: formData.country?.label,
      //         },
      //       },
      //       defaultBilling: true,
      //       defaultShipping: true,
      //       addrtext: formData.addrtext,
      //     },
      //   ],
      // },
    };

    leadPost.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Lead updated Successfully");
        router.push(`${urls.lead}`);
      },
      onError: (error) => {
        TkToastError("Lead not updated", error);
      },
    });
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
                    // loading={selectedTaskId && isUsersLoading}
                    // options={allUsersData}
                    // menuPlacement="top"
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
  const toggleDeleteModelPopup = () => {
    setDeleteModal(true);
  };

  return (
    <>
      {isLeadEdit && (
        <div>
          <TkRow>
            <TkCol>
              <TkRow className="justify-content-center">
                <TkCol lg={12}>
                  <TkCardBody className="mt-4">
                    <TkForm onSubmit={handleSubmit(onSubmit)}>
                      <div>
                        <TkRow className="mt-3 mb-5">
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
                                        placeholder="Select Source"
                                        requiredStarOnLabel="true"
                                        options={allleadSourceData}
                                        disabled={viewMode}
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
                                    requiredStarOnLabel="true"
                                    disabled={viewMode}
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
                                      {
                                        errors.custentity_lms_createddate
                                          .message
                                      }
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
                                        disabled={viewMode}
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

                        <TkRow className="mt-4">
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
                                    disabled={viewMode}
                                  />
                                  {errors.custentity_lms_name && (
                                    <FormErrorText>
                                      {errors.custentity_lms_name.message}
                                    </FormErrorText>
                                  )}
                                </TkCol>
                                {/* <TkCol lg={3}>
                                  <TkInput
                                    {...register("firstName")}
                                    id="firstName"
                                    type="text"
                                    labelName="First Name"
                                    placeholder="Enter First Name"
                                    requiredStarOnLabel="true"
                                    disabled={viewMode}
                                  />
                                  {errors.firstName && (
                                    <FormErrorText>
                                      {errors.firstName.message}
                                    </FormErrorText>
                                  )}
                                </TkCol>
                                <TkCol lg={2}>
                                  <TkInput
                                    {...register("middleName")}
                                    id="middleName"
                                    type="text"
                                    labelName="Middle Name"
                                    placeholder="Enter Middle Name"
                                    disabled={viewMode}
                                  />
                                  {errors.middleName && (
                                    <FormErrorText>
                                      {errors.middleName.message}
                                    </FormErrorText>
                                  )}
                                </TkCol>

                                <TkCol lg={3}>
                                  <TkInput
                                    {...register("lastName")}
                                    id="lastName"
                                    type="text"
                                    labelName="Last Name"
                                    placeholder="Enter Last Name"
                                    requiredStarOnLabel="true"
                                    disabled={viewMode}
                                  />
                                  {errors.lastName && (
                                    <FormErrorText>
                                      {errors.lastName.message}
                                    </FormErrorText>
                                  )}
                                </TkCol> */}
                                <TkCol lg={3}>
                                  <TkInput
                                    {...register(
                                      "custentity_lms_personal_phonenumber"
                                    )}
                                    id="custentity_lms_personal_phonenumber"
                                    name="custentity_lms_personal_phonenumber"
                                    type="text"
                                    labelName="Phone No"
                                    placeholder="Enter Phone No"
                                    requiredStarOnLabel="true"
                                    disabled={viewMode}
                                  />
                                  {errors.custentity_lms_personal_phonenumber && (
                                    <FormErrorText>
                                      {
                                        errors
                                          .custentity_lms_personal_phonenumber
                                          .message
                                      }
                                    </FormErrorText>
                                  )}
                                </TkCol>
                                <TkCol lg={3}>
                                  <TkInput
                                    {...register(
                                      "custentity_lms_personal_email"
                                    )}
                                    id="custentity_lms_personal_email"
                                    name="custentity_lms_personal_email"
                                    type="text"
                                    labelName="Email"
                                    placeholder="Enter Email"
                                    requiredStarOnLabel="true"
                                    disabled={viewMode}
                                  />
                                  {errors.custentity_lms_personal_email && (
                                    <FormErrorText>
                                      {
                                        errors.custentity_lms_personal_email
                                          .message
                                      }
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
                                        disabled={viewMode}
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
                                    {...register("custentity_lms_noteother")}
                                    id="custentity_lms_noteother"
                                    type="text"
                                    labelName="Note"
                                    placeholder="Enter Note"
                                    disabled={viewMode}
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
                                    requiredStarOnLabel="true"
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
                                    {...register("phone")}
                                    id="phone"
                                    name="phone"
                                    type="text"
                                    labelName="Contact No"
                                    placeholder="Enter Contact No"
                                    disabled={viewMode}
                                  />
                                  {errors.phone && (
                                    <FormErrorText>
                                      {errors.phone.message}
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
                                    disabled={viewMode}
                                  />
                                  {errors.email && (
                                    <FormErrorText>
                                      {errors.email.message}
                                    </FormErrorText>
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
                                    disabled={viewMode}
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
                                    disabled={viewMode}
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
                                        disabled={viewMode}
                                        options={allClientTypeData}
                                      />
                                    )}
                                  />
                                  {errors.custentity_lms_client_type && (
                                    <FormErrorText>
                                      {
                                        errors.custentity_lms_client_type
                                          .message
                                      }
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
                                        disabled={viewMode}
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
                                    disabled={true}
                                  />
                                  {errors.addr1 && (
                                    <FormErrorText>
                                      {errors.addr1.message}
                                    </FormErrorText>
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
                                    disabled={true}
                                  />
                                  {errors.addr2 && (
                                    <FormErrorText>
                                      {errors.addr2.message}
                                    </FormErrorText>
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
                                    disabled={true}
                                  />
                                  {errors.city && (
                                    <FormErrorText>
                                      {errors.city.message}
                                    </FormErrorText>
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
                                    disabled={true}
                                  />
                                  {errors.state && (
                                    <FormErrorText>
                                      {errors.state.message}
                                    </FormErrorText>
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
                                    disabled={true}
                                  />
                                  {errors.zip && (
                                    <FormErrorText>
                                      {errors.zip.message}
                                    </FormErrorText>
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
                                        disabled={true}
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
                                    {...register("addrtext")}
                                    id="addrtext"
                                    name="addrtext"
                                    type="textarea"
                                    labelName="Address "
                                    placeholder="Enter Address"
                                    disabled={true}
                                  />
                                  {errors.addrtext && (
                                    <FormErrorText>
                                      {errors.addrtext.message}
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
                      disabled={viewMode}
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
                          </TkCol>
                        </TkRow>

                        <TkRow className="mt-5">
                          <TkCol>
                            <Nav className="nav-tabs dropdown-tabs nav-tabs-custom mb-3">
                              <NavItem>
                                <NavLink
                                  href="#"
                                  className={classnames({
                                    active:
                                      activeSubTab === tabs.requirementDetails,
                                  })}
                                  onClick={() =>
                                    toggleTab(tabs.requirementDetails)
                                  }
                                >
                                  Requirement Details
                                </NavLink>
                              </NavItem>
                              <NavItem>
                                <NavLink
                                  href="#"
                                  className={classnames({
                                    active:
                                      activeSubTab === tabs.locationDetails,
                                  })}
                                  onClick={() =>
                                    toggleTab(tabs.locationDetails)
                                  }
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
                                  Activity
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
                                        name="region"
                                        control={control}
                                        render={({ field }) => (
                                          <TkSelect
                                            {...field}
                                            id="region"
                                            name="region"
                                            labelName="Region"
                                            placeholder="Select Region"
                                            options={allRegionData}
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
                                            options={allSalesTeamData}
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
                                          />
                                        )}
                                      />
                                      {errors.custentity_lms_primary_action && (
                                        <FormErrorText>
                                          {
                                            errors.custentity_lms_primary_action
                                              .message
                                          }
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={3}>
                                      <TkInput
                                        {...register(
                                          "custentity_lms_lastactivitydate"
                                        )}
                                        id="custentity_lms_lastactivitydate"
                                        name="custentity_lms_lastactivitydate"
                                        labelName="Date Time"
                                        type="text"
                                        disabled={true}
                                      />
                                    </TkCol>

                                    <TkCol lg={3}>
                                      <TkInput
                                        {...register(
                                          "custentity_lms_lead_value"
                                        )}
                                        id="custentity_lms_lead_value"
                                        name="custentity_lms_lead_value"
                                        labelName="Lead Value"
                                        type="text"
                                        placeholder="Enter Lead Value"
                                      />
                                      {errors.custentity_lms_lead_value && (
                                        <FormErrorText>
                                          {
                                            errors.custentity_lms_lead_value
                                              .message
                                          }
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
                                      {errors.entitystatus && (
                                        <FormErrorText>
                                          {errors.entitystatus.message}
                                        </FormErrorText>
                                      )}
                                    </TkCol>

                                    <TkCol lg={4}>
                                      <TkInput
                                        {...register(
                                          "custentity_lms_lead_unqualified"
                                        )}
                                        id="custentity_lms_lead_unqualified"
                                        name="custentity_lms_lead_unqualified"
                                        labelName="Reason if unqualified lead"
                                        type="textarea"
                                        placeholder="Enter Reason"
                                      />
                                      {errors.custentity_lms_lead_unqualified && (
                                        <FormErrorText>
                                          {
                                            errors
                                              .custentity_lms_lead_unqualified
                                              .message
                                          }
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
                                          />
                                        )}
                                      />
                                      {errors.custentity_lms_prospect_nurturing && (
                                        <FormErrorText>
                                          {
                                            errors
                                              .custentity_lms_prospect_nurturing
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
                                    <TkCol lg={2}>
                                      <TkButton
                                        type="button"
                                        color="primary"
                                        onClick={leadActivityToggle}
                                        style={{ width: "80%" }}
                                      >
                                        Phone Call
                                      </TkButton>
                                    </TkCol>
                                    <TkCol lg={2}>
                                      <TkButton
                                        type="button"
                                        color="primary"
                                        onClick={leadTaskActivityToggle}
                                        style={{ width: "80%" }}
                                      >
                                        Task
                                      </TkButton>
                                    </TkCol>
                                    <TkCol lg={2}>
                                      <TkButton
                                        type="button"
                                        color="primary"
                                        onClick={leadEventActivityToggle}
                                        style={{ width: "80%" }}
                                      >
                                        Event
                                      </TkButton>
                                    </TkCol>
                                  </TkRow>
                                </div>
                              </TabPane>
                            </TabContent>
                          </TkCol>
                        </TkRow>

                        <div className="d-flex mt-4 space-childern">
                          {editMode ? (
                            <div className="ms-auto" id="update-form-btns">
                              <TkButton
                                color="secondary"
                                onClick={() => router.push(`${urls.lead}`)}
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
                                Update
                              </TkButton>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </TkForm>
                  </TkCardBody>
                </TkCol>
              </TkRow>
            </TkCol>

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
            </TkModal>
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
                    data={[]}
                    isSearch={false}
                    defaultPageSize={10}
                    isFilters={true}
                    showPagination={true}
                  />
                </TkCardBody>
              </TabPane>
            </TabContent>
          </TkRow>
        </div>
      )}
    </>
  );
}

export default EditLead;
