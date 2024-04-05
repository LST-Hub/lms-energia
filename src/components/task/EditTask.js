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
  API_BASE_URL,
  RQ,
  modes,
  PUBLIC_BUCKET_BASE_URL,
  urls,
  leadTypes,
  stausTypes,
} from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { useMutation, useQueries } from "@tanstack/react-query";
import { useRouter } from "next/router";
import useUserAccessLevel from "../../utils/hooks/useUserAccessLevel";
import { permissionTypeIds } from "../../../DBConstants";
import hasPageModeAccess from "../../utils/hasPageAccess";
import Image from "next/image";
import axios from "axios";
import TkDate from "../forms/TkDate";

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

const EditTask = ({ id, userData, mode }) => {
  const router = useRouter();
  const viewMode = mode === modes.view;
  const editMode = mode === modes.edit;
  const cid = Number(id);
  const accessLevel = useUserAccessLevel(permissionTypeIds.users);
  const [isTaskk, setIsTaskk] = useState(false);
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
    setIsTaskk(true);
  }, []);

  useEffect(() => {
    if (userData) {
      setValue("lead", {
        value: userData.lead,
        label: userData.lead,
      });
      setValue("status", {
        value: userData.status,
        label: userData.status,
      });
      setValue("title", userData.title);
      setValue("date", userData.date);
    }
  }, [userData, setValue]);

  return (
    <>
      {isTaskk && (
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
                    <TkInput
                      {...register("title")}
                      labelName="Title"
                      labelId={"_title"}
                      id="title"
                      type="text"
                      placeholder="Enter Title"
                      requiredStarOnLabel={true}
                      disabled={viewMode}
                    />
                  </TkCol>
                </TkRow>
              </div>
              <div>
                <TkRow className="mt-3">
                  <TkCol lg={4}>
                    {/* add checkbox that user can be project manager */}
                    <TkRow className="justify-content-start mt-4">
                      <TkCol xs={"auto"}>
                        <TkCheckBox
                          {...register("canBeSupervisor")}
                          id="canBeSupervisor"
                          type="checkbox"
                        />
                        <TkLabel className="ms-3 me-lg-5" id="supervisor">
                          Notify Assign By Email
                        </TkLabel>
                      </TkCol>

                      {/* <TkCol xs={"auto"}>
                        <TkCheckBox
                          {...register("privatePhoenCall")}
                          id="privatePhoenCall"
                          type="checkbox"
                        />
                        <TkLabel className="ms-3 me-lg-5" id="privatePhoenCall">
                          Private Task
                        </TkLabel>
                      </TkCol> */}
                    </TkRow>
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
                    {errors.date?.message ? (
                      <FormErrorText>{errors.date?.message}</FormErrorText>
                    ) : null}
                  </TkCol>

                  {/* <TkCol lg={6}>
                    <TkRow className="justify-content-start mt-4">
                      <TkCol xs={"auto"}>
                        <TkCheckBox
                          {...register("canBeSupervisor")}
                          id="canBeSupervisor"
                          type="checkbox"
                        />
                        <TkLabel className="ms-3 me-lg-5" id="supervisor">
                          Notify Assign By Email
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
                  onClick={() => router.push(`${urls.taskk}`)}
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

export default EditTask;
