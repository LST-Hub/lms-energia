import React, { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import TkButton from "../TkButton";
import TkInput from "../forms/TkInput";
import TkSelect from "../forms/TkSelect";
import TkCard, { TkCardHeader, TkCardBody, TkCardTitle } from "../TkCard";
import TkContainer from "../TkContainer";
import TkRow, { TkCol } from "../TkRow";
import TkForm from "../forms/TkForm";
import TkLabel from "../forms/TkLabel";
import TkCheckBox from "../forms/TkCheckBox";
import avatar1 from "/public/images/users/avatar-1.jpg";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";
import {
  MinNameLength,
  MaxNameLength,
  bigInpuMaxLength,
  MinEmailLength,
  MaxEmailLength,
  MaxPhoneNumberLength,
  smallInputMaxLength,
  employeeTypes,
  genderTypes,
  API_BASE_URL,
  RQ,
  modes,
  PUBLIC_BUCKET_BASE_URL,
  urls,
  countries,
  reminderTypes,
  remindersTypes,
  eventAcessTypes,
  stausTypes,
  organizerTypes,
  customFormTypes,
  leadTypes,
  meetingStatusTypes,
} from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { useMutation, useQueries } from "@tanstack/react-query";
import { useRouter } from "next/router";
import useUserAccessLevel from "../../utils/hooks/useUserAccessLevel";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import hasPageModeAccess from "../../utils/hasPageAccess";
import TkAccessDenied from "../TkAccessDenied";
import Image from "next/image";
import axios from "axios";
import TkDate from "../forms/TkDate";
import { convertTimeToSec, convertToTimeFotTimeSheet } from "../../utils/time";
import { Nav, NavItem, NavLink } from "reactstrap";
import classNames from "classnames";

const schema = Yup.object({
  firstName: Yup.string()
    .min(
      MinNameLength,
      `First name should have at least ${MinNameLength} character.`
    )
    .max(
      MaxNameLength,
      `First name should have at most ${MaxNameLength} characters.`
    )
    .required("First name is required"),

  lastName: Yup.string()
    .min(
      MinNameLength,
      `Last name should have at least ${MinNameLength} character.`
    )
    .max(
      MaxNameLength,
      `Last name should have at most ${MaxNameLength} characters.`
    )
    .required("Last name is required"),

  email: Yup.string()
    .email("Email must be valid.")
    .min(
      MinEmailLength,
      `Email should have at least ${MinEmailLength} characters.`
    )
    .max(
      MaxEmailLength,
      `Email should have at most ${MaxEmailLength} characters.`
    )
    .required("Email is required"),

  designation: Yup.string().max(
    smallInputMaxLength,
    `Designation should have at most ${smallInputMaxLength} characters.`
  ),
  // .required("Designation is required"),

  phoneNumber: Yup.string()
    .matches(/^[0-9+() -]*$/, "Phone number must be number.")
    .max(
      MaxPhoneNumberLength,
      `Phone number must be at most   ${MaxPhoneNumberLength} numbers.`
    )
    .nullable(),

  // we romoved supervisor field mandatory from here as for admin role supervisor field id not mandatory, we checked it manually
  supervisor: Yup.object().nullable(),
  department: Yup.object().nullable(),
  type: Yup.object().nullable(),
  role: Yup.object().nullable().required("Select Role"),
  // zip code an dphoen number has same max lenght so we are usign it here
  zipCode: Yup.string()
    .test("test-name", "Zip code does not accept characters", function (value) {
      if (value === "" || value === null || value === undefined) {
        return true;
      } else {
        return value.trim().match(/^[0-9]*$/, "Zip code must be numeric.");
      }
    })
    .max(
      MaxPhoneNumberLength,
      `Zip code must be at most   ${MaxPhoneNumberLength} numbers.`
    )
    .nullable(),
  country: Yup.object().nullable(),
  gender: Yup.object().nullable(),
  notes: Yup.string().max(
    bigInpuMaxLength,
    `Notes must be at most ${bigInpuMaxLength} characters.`
  ),
  workCalendar: Yup.object().nullable().required("Select Work Calendar"),
  canBePM: Yup.boolean(),
  canBeSupervisor: Yup.boolean(),
  address: Yup.string().max(
    bigInpuMaxLength,
    `Address must be at most ${bigInpuMaxLength} characters.`
  ),
}).required();

const AddMeeting = () => {
  const router = useRouter();
  const accessLevel = useUserAccessLevel(permissionTypeIds.users);
  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allSupervisors],
        queryFn: tkFetch.get(`${API_BASE_URL}/users/list?filter=supervisor`),
        enabled: hasPageModeAccess(modes.create, accessLevel),
      },
      {
        queryKey: [RQ.allDepts],
        queryFn: tkFetch.get(`${API_BASE_URL}/department/list`),
        enabled: hasPageModeAccess(modes.create, accessLevel),
      },
      {
        queryKey: [RQ.allRolesList],
        queryFn: tkFetch.get(`${API_BASE_URL}/roles/list`),
        enabled: hasPageModeAccess(modes.create, accessLevel),
      },
      {
        queryKey: [RQ.allWorkCals],
        queryFn: tkFetch.get(`${API_BASE_URL}/work-calendar/list`),
        enabled: hasPageModeAccess(modes.create, accessLevel),
      },
      {
        queryKey: [RQ.workspaceSettings, RQ.workspaceDefaults],
        queryFn: tkFetch.postWithBody(
          `${API_BASE_URL}/workspace/public-settings`,
          { defaults: true }
        ),
        enabled: hasPageModeAccess(modes.create, accessLevel),
      },
    ],
  });
  const [supervisors, depts, roles, workCals, defaultWorkCal] = results;
  const {
    isLoading: isSupervisorLoading,
    isError: isSupervisorError,
    error: supervisorError,
    data: supervisorsData,
  } = supervisors;
  const {
    isLoading: isDeptLoading,
    isError: isDeptError,
    error: deptError,
    data: deptData,
  } = depts;
  const {
    isLoading: isRoleLoading,
    isError: isRoleError,
    error: roleError,
    data: roleData,
  } = roles;
  const {
    isLoading: isWcalLoading,
    isError: isWcalError,
    error: WcalError,
    data: wCalData,
  } = workCals;

  //TODO: report this error to error reporting service, dont show it to user,( becuase not that important user can select a work calendar any way)
  const {
    isLoading: isDefaultWcalLoading,
    isError: isDefaultWcalError,
    error: defaultWcalError,
    data: defaultwCalData,
  } = defaultWorkCal;

  const inviteUser = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/users/invite`),
  });

  const {
    control,
    register,
    handleSubmit,
    getValues,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [allSuperVisors, setAllSuperVisors] = React.useState([]);
  const [allDept, setAllDept] = React.useState([]);
  const [allRoles, setAllRoles] = React.useState([]);
  const [allWorkCals, setAllWorkCals] = React.useState([]);
  const [isAdminRole, setIsAdminRole] = React.useState(false);
  const [profileImage, setProfileImage] = React.useState(null);
  const [profileImageFile, setProfileImageFile] = React.useState(null);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [isMeeting, setIsMeeting] = useState(false);

  useEffect(() => {
    setIsMeeting(true);
  }, []);

  return (
    <>
     {isMeeting && (
      <div>
        <TkRow className="mt-3">
          <TkCol>
            <TkCardHeader tag="h5" className="mb-4">
              <h4>Primary Information</h4>
            </TkCardHeader>
            <div>
              <TkRow className="g-3">
                <TkCol lg={4}>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <TkSelect
                        {...field}
                        labelName="Leads"
                        labelId={"_type"}
                        id="type"
                        options={leadTypes}
                        placeholder="Select Leads"
                        requiredStarOnLabel={true}
                      />
                    )}
                  />
                </TkCol>
                <TkCol lg={4}>
                  <TkInput
                    labelName="Location"
                    labelId={"location"}
                    id="location"
                    type="text"
                    placeholder="Enter Location"
                    requiredStarOnLabel={true}
                  />
                </TkCol>

                <TkCol lg={4}>
                  <Controller
                    name="eventAccess"
                    control={control}
                    render={({ field }) => (
                      <TkSelect
                        {...field}
                        labelName="Event Access"
                        tooltip="Select Event Access"
                        labelId={"eventAccess"}
                        id="eventAccess"
                        options={eventAcessTypes}
                        placeholder="Select Event Access"
                        requiredStarOnLabel={true}
                      />
                    )}
                  />
                </TkCol>
              </TkRow>
            </div>
            <div>
              <TkRow className="mt-3">
              <TkCol lg={4}>
                    <TkInput
                      {...register("subject")}
                      labelName="Subject"
                      labelId={"_subject"}
                      id="subject"
                      type="text"
                      placeholder="Enter Subject"
                      requiredStarOnLabel={true}
                    />
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
                        options={meetingStatusTypes}
                        placeholder="Select Type"
                        requiredStarOnLabel={true}
                      />
                    )}
                  />
                </TkCol>
                <TkCol lg={4}>
                  <Controller
                    name="organizer"
                    control={control}
                    render={({ field }) => (
                      <TkSelect
                        {...field}
                        labelName="Organizer"
                        labelId={"_organizer"}
                        id="organizer"
                        options={organizerTypes}
                        placeholder="Select Organizer"
                        requiredStarOnLabel={true}
                      />
                    )}
                  />
                </TkCol>
              </TkRow>
            </div>
          </TkCol>
        </TkRow>

        <TkRow className="mt-5">
          <TkCol>
            <TkCardHeader tag="h5" className="mb-4">
              <h4>Date and Time</h4>
            </TkCardHeader>
            <div>
              <TkRow className="g-3">
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
                </TkCol>

                <TkCol>
                  <TkInput
                    labelName="Start Time"
                    id={"startTime"}
                    type="text"
                    placeholder="Enter Start Time"
                  />
                </TkCol>

                <TkCol lg={4}>
                  <TkRow className="justify-content-start mt-4">
                    <TkCol xs={"auto"}>
                      <TkCheckBox
                        id="canBeSupervisor"
                        type="checkbox"
                        disabled={isAdminRole}
                      />
                      <TkLabel className="ms-3 me-lg-5" id="supervisor">
                        All Day
                      </TkLabel>
                    </TkCol>

                    <TkCol xs={"auto"}>
                      <TkCheckBox
                        id="privatePhoenCall"
                        type="checkbox"
                        disabled={isAdminRole}
                      />
                      <TkLabel className="ms-3 me-lg-5" id="privatePhoenCall">
                        Reserve Time
                      </TkLabel>
                    </TkCol>
                  </TkRow>
                </TkCol>
              </TkRow>
            </div>
          </TkCol>
        </TkRow>
        <div className="d-flex mt-4 space-childern">
          <div className="ms-auto" id="update-form-btns">
            <TkButton
              color="secondary"
              type="button"
              onClick={() => router.push(`${urls.meeting}`)}
            >
              Cancel
            </TkButton>{" "}
            <TkButton type="submit" color="primary">
              Save
            </TkButton>
          </div>
        </div>
      </div>
       )}
    </>
  );
};

export default AddMeeting;
