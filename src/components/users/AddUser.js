import React, { useEffect } from "react";
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
  MinEmailLength,
  MaxEmailLength,
  MaxPhoneNumberLength,
  smallInputMaxLength,
  API_BASE_URL,
  RQ,
  modes,
  PUBLIC_BUCKET_BASE_URL,
  urls,
} from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { useMutation, useQueries } from "@tanstack/react-query";
import { useRouter } from "next/router";
import useUserAccessLevel from "../../utils/hooks/useUserAccessLevel";
import { permissionTypeIds } from "../../../DBConstants";
import hasPageModeAccess from "../../utils/hasPageAccess";
import axios from "axios";

const schema = Yup.object({
  firstName: Yup.string()
    .required("First name is required")
    .min(
      MinNameLength,
      `First name should have at least ${MinNameLength} character.`
    )
    .max(
      MaxNameLength,
      `First name should have at most ${MaxNameLength} characters.`
    ),

  middleName: Yup.string()
    .required("Middle name is required")
    .min(
      MinNameLength,
      `Middle name should have at least ${MinNameLength} character.`
    )
    .max(
      MaxNameLength,
      `Middle name should have at most ${MaxNameLength} characters.`
    ),

  lastName: Yup.string()
    .required("Last name is required")

    .min(
      MinNameLength,
      `Last name should have at least ${MinNameLength} character.`
    )
    .max(
      MaxNameLength,
      `Last name should have at most ${MaxNameLength} characters.`
    ),

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

  title: Yup.string().max(
    smallInputMaxLength,
    `Designation should have at most ${smallInputMaxLength} characters.`
  ),

  phone: Yup.string()
    .matches(/^[0-9+() -]*$/, "Phone number must be number.")
    .max(
      MaxPhoneNumberLength,
      `Phone number must be at most   ${MaxPhoneNumberLength} numbers.`
    )
    .required("Phone number is required")
    .nullable(),

  supervisor: Yup.object().nullable(),
  department: Yup.object().nullable(),
  employeetype: Yup.object().nullable(),
  role: Yup.object().nullable(),
}).required();

const AddUser = () => {
  const router = useRouter();

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

  const onSubmit = (data) => {};
  console.log(errors);
  return (
    <>
      <TkRow className="justify-content-center">
        <TkCol lg={12}>
          <TkCardBody>
            <TkForm onSubmit={handleSubmit(onSubmit)}>
              <TkRow className="g-3 gx-4 gy-4">
                <TkCol lg={4}>
                  <TkInput
                    {...register("firstName")}
                    labelName="First Name"
                    type="text"
                    id="firstName"
                    placeholder="Enter First Name"
                    requiredStarOnLabel={true}
                  />
                  {errors.firstName && (
                    <FormErrorText>{errors.firstName.message}</FormErrorText>
                  )}
                </TkCol>

                <TkCol lg={4}>
                  <TkInput
                    {...register("middleName")}
                    labelName="Middle Name"
                    type="text"
                    id="middleName"
                    placeholder="Enter Middle Name"
                    requiredStarOnLabel={true}
                  />
                  {errors.middleName && (
                    <FormErrorText>{errors.middleName.message}</FormErrorText>
                  )}
                </TkCol>

                <TkCol lg={4}>
                  <TkInput
                    {...register("lastName")}
                    labelName="Last Name"
                    type="text"
                    id="lastName"
                    placeholder="Enter Last Name"
                    requiredStarOnLabel={true}
                  />
                  {errors.lastName && (
                    <FormErrorText>{errors.lastName.message}</FormErrorText>
                  )}
                </TkCol>

                <TkCol lg={4}>
                  <TkInput
                    {...register("email")}
                    labelName="Email"
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter Email"
                    requiredStarOnLabel={true}
                  />
                  {errors.email && (
                    <FormErrorText>{errors.email.message}</FormErrorText>
                  )}
                </TkCol>

                <TkCol lg={4}>
                  <TkInput
                    {...register("phone")}
                    labelName="Phone Number"
                    type="text"
                    id="phone"
                    placeholder="Enter Phone Number"
                  />
                  {errors.phone && (
                    <FormErrorText>{errors.phone.message}</FormErrorText>
                  )}
                </TkCol>

                <TkCol lg={4}>
                  <TkInput
                    {...register("title")}
                    labelName="Designation"
                    // tooltip="Designation"
                    // labelId={"_designation"}
                    type="text"
                    id="title"
                    placeholder="Enter Designation"
                  />
                  {errors.title && (
                    <FormErrorText>{errors.title.message}</FormErrorText>
                  )}
                </TkCol>

                <TkCol lg={3}>
                  <Controller
                    name="supervisor"
                    control={control}
                    render={({ field }) => (
                      <TkSelect
                        {...field}
                        labelName="Supervisor"
                        id="supervisor"
                        options={[]}
                        placeholder="Select Supervisor"
                      />
                    )}
                  />
                  {errors.supervisor && (
                    <FormErrorText>{errors.supervisor.message}</FormErrorText>
                  )}
                </TkCol>

                <TkCol lg={3}>
                  <Controller
                    name="department"
                    control={control}
                    render={({ field }) => (
                      <TkSelect
                        {...field}
                        labelName="Department"
                        id="department"
                        options={[]}
                        placeholder="Select Department"
                      />
                    )}
                  />
                  {errors.department && (
                    <FormErrorText>{errors.department.message}</FormErrorText>
                  )}
                </TkCol>

                <TkCol lg={3}>
                  <Controller
                    name="employeetype"
                    control={control}
                    render={({ field }) => (
                      <TkSelect
                        {...field}
                        labelName="Type"
                        // tooltip="Type"
                        // labelId={"_type"}
                        id="employeetype"
                        // options={employeeTypes}
                        placeholder="Select Type"
                      />
                    )}
                  />
                  {errors.employeetype && (
                    <FormErrorText>{errors.employeetype.message}</FormErrorText>
                  )}
                </TkCol>

                <TkCol lg={3}>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <TkSelect
                        {...field}
                        labelName="Role"
                        // tooltip="Role"
                        // labelId={"_role"}
                        id="role"
                        options={[]}
                        onChange={(value) => {
                          field.onChange(value);
                          setIsAdminRole(value ? value.isAdmin : false);
                        }}
                        placeholder="Select Role"
                      />
                    )}
                  />
                  {errors.role && (
                    <FormErrorText>{errors.role.message}</FormErrorText>
                  )}
                </TkCol>
              </TkRow>
              {/* {inviteUser.isError ? (
                <FormErrorBox errMessage={inviteUser.error.message} />
              ) : null} */}
              <div className="d-flex mt-4 space-childern">
                <TkButton
                  // disabled={inviteUser.isLoading || uploadingImage}
                  onClick={() => router.push(`${urls.users}`)}
                  color="secondary"
                  type="button"
                  className="ms-auto"
                >
                  Cancel
                </TkButton>
                <TkButton
                  // loading={inviteUser.isLoading || uploadingImage}
                  color="primary"
                  type="submit"
                >
                  Invite
                </TkButton>
              </div>
            </TkForm>
          </TkCardBody>
          {/* </TkCard> */}
        </TkCol>
      </TkRow>
    </>
  );
};

export default AddUser;
