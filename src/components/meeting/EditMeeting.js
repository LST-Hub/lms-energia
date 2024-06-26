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
  leadTypes,
  eventAcessTypes,
  stausTypes,
  organizerTypes,
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

const EditMeeting = ({ id, userData, mode }) => {
  const router = useRouter();
  const viewMode = mode === modes.view;
  const editMode = mode === modes.edit;
  const cid = Number(id);
  const [isMeeting, setIsMeeting] = useState(false);

  const accessLevel = useUserAccessLevel(permissionTypeIds.users);
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
  useEffect(() => {
    setIsMeeting(true);
  }, []);
  useEffect(() => {
    if (userData) {
      setValue("lead", {
        value: userData.lead,
        label: userData.lead,
      });
      setValue("location", userData.location);
      setValue("eventAccess", {
        value: userData.eventAccess,
        label: userData.eventAccess,
      });
      setValue("subject", userData.subject);
      setValue("status", {
        value: userData.status,
        label: userData.status,
      });
      setValue("organizer", {
        value: userData.organizer,
        label: userData.organizer,
      });
      setValue("date", new Date(userData.date));
      setValue("startTime", userData.startTime);
    }
  }, [userData, setValue]);
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
                      name="lead"
                      control={control}
                      render={({ field }) => (
                        <TkSelect
                          {...field}
                          labelName="Lead"
                          labelId={"_lead"}
                          id="lead"
                          placeholder="Select Leads"
                          options={leadTypes}
                          requiredStarOnLabel={true}
                          disabled={viewMode}
                        />
                      )}
                    />
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
                      disabled={viewMode}
                    />
                  </TkCol>

                  <TkCol lg={4}>
                    <TkInput
                      {...register("subject")}
                      labelName="Subject"
                      tooltip="Enter Subject"
                      labelId={"_subject"}
                      id="subject"
                      type="text"
                      placeholder="Enter Subject"
                      requiredStarOnLabel={true}
                      disabled={viewMode}
                    />
                  </TkCol>

                  {/* <TkCol lg={4}>
                    <Controller
                      name="eventAccess"
                      control={control}
                      render={({ field }) => (
                        <TkSelect
                          {...field}
                          labelName="Event Access"
                          labelId="eventAccess"
                          id="eventAccess"
                          options={eventAcessTypes}
                          placeholder="Select Event Access"
                          requiredStarOnLabel={true}
                          disabled={viewMode}
                        />
                      )}
                    />
                  </TkCol> */}
                </TkRow>
              </div>
              <div>
                <TkRow className="mt-3">
                  {/* <TkCol lg={4}>
                    <TkInput
                      {...register("subject")}
                      labelName="Subject"
                      tooltip="Enter Subject"
                      labelId={"_subject"}
                      id="subject"
                      type="text"
                      placeholder="Enter Subject"
                      requiredStarOnLabel={true}
                      disabled={viewMode}
                    />
                  </TkCol> */}

                  <TkCol lg={4}>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <TkSelect
                          {...field}
                          labelName="Status"
                          labelId="status"
                          id="status"
                          options={[]}
                          placeholder="Select Status"
                          requiredStarOnLabel={true}
                          disabled={viewMode}
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
                          tooltip="Select Organizer"
                          labelId={"organizer"}
                          id="organizer"
                          options={organizerTypes}
                          placeholder="Select Organizer"
                          requiredStarOnLabel={true}
                          disabled={viewMode}
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
                          disabled={viewMode}
                        />
                      )}
                    />
                  </TkCol>

                  <TkCol lg={4}>
                    <TkInput
                      {...register(`startTime`, {
                        required: "Time is required",
                        validate: (value) => {
                          if (value && !/^[0-9]*([.:][0-9]+)?$/.test(value)) {
                            return "Invalid Time";
                          }
                          if (convertTimeToSec(value) > 86400 || value > 24) {
                            return "Time should be less than 24 hours";
                          }
                        },
                      })}
                      onBlur={(e) => {
                        setValue(
                          `startTime`,
                          convertToTimeFotTimeSheet(e.target.value)
                        );
                      }}
                      labelName="Time"
                      id={"startTime"}
                      name="startTime"
                      type="text"
                      placeholder="Enter Time"
                      disabled={viewMode}
                      requiredStarOnLabel={true}
                    />
                  </TkCol>

                  {/* <TkCol>
                <TkInput
                  {...register("startTime")}
                  labelName="Start Time"
                  id={"startTime"}
                  type="text"
                  placeholder="Enter Start Time"
                />
              </TkCol> */}

                  {/* <TkCol lg={4}>
                    <TkRow className="justify-content-start mt-4">
                      <TkCol xs={"auto"}>
                        <TkCheckBox id="canBeSupervisor" type="checkbox" />
                        <TkLabel className="ms-3 me-lg-5" id="supervisor">
                          All Day
                        </TkLabel>
                      </TkCol>

                      <TkCol xs={"auto"}>
                        <TkCheckBox id="privatePhoenCall" type="checkbox" />
                        <TkLabel className="ms-3 me-lg-5" id="privatePhoenCall">
                          Reserve Time
                        </TkLabel>
                      </TkCol>
                    </TkRow>
                  </TkCol> */}
                </TkRow>
              </div>
            </TkCol>
          </TkRow>

          <div className="d-flex mt-4 space-childern">
            {editMode ? (
              <div className="ms-auto" id="update-form-btns">
                <TkButton
                  color="secondary"
                  onClick={() => router.push(`${urls.meeting}`)}
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
        </div>
      )}
    </>
  );
};

export default EditMeeting;
