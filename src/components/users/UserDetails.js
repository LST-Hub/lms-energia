import React, { useState, useMemo, useEffect, useLayoutEffect } from "react";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import TkButton from "../TkButton";
import TkInput from "../forms/TkInput";
import TkSelect from "../forms/TkSelect";
import TkCard, { TkCardBody } from "../TkCard";
import TkRow, { TkCol } from "../TkRow";
import TkForm from "../forms/TkForm";
import TkEditCardHeader from "../TkEditCardHeader";
import TkLabel from "../forms/TkLabel";
import TkCheckBox from "../forms/TkCheckBox";
import { TkToastSuccess, TkToastError } from "../TkToastContainer";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";
import TkLoader from "../TkLoader";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/router";
import {
  API_BASE_URL,
  MaxEmailLength,
  MaxNameLength,
  MaxPhoneNumberLength,
  MinEmailLength,
  MinNameLength,
  modes,
  RQ,
  smallInputMaxLength,
  urls,
} from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import useUserAccessLevel from "../../utils/hooks/useUserAccessLevel";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import TkNoData from "../TkNoData";
import TkPageHead from "../TkPageHead";
import DeleteModal from "../../utils/DeleteModal";

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

  title: Yup.string()
    .max(
      smallInputMaxLength,
      `Designation should have at most ${smallInputMaxLength} characters.`
    )
    .nullable(),

  phone: Yup.string()
    .matches(/^[0-9+() -]*$/, "Phone number must be number.")
    .max(
      MaxPhoneNumberLength,
      `Phone number must be at most   ${MaxPhoneNumberLength} numbers.`
    )
    .nullable(),

  supervisor: Yup.object().nullable(),
  class: Yup.object().nullable(),
  // type: Yup.object().nullable(),
  // role: Yup.object().nullable().required("Role is required"),
}).required();

const UserDetails = ({ mode, id }) => {
  const router = useRouter();
  const accessLevel = useUserAccessLevel(permissionTypeIds.users);
  const queryClient = useQueryClient();
  const viewMode = mode === modes.view;
  const editMode = mode === modes.edit;
  const uid = Number(id);

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

  const [user, setUser] = useState({});
  const [isAdminRole, setIsAdminRole] = React.useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const { data, isLoading, isFetched, isError, error } = useQuery({
    queryKey: [RQ.user, uid],
    queryFn: tkFetch.get(`${API_BASE_URL}/employee/${uid}`),
    enabled: !!uid,
  });

  useEffect(() => {
    if (isFetched && Array.isArray(data) && data.length > 0) {
      const {
        firstName,
        middleName,
        lastName,
        email,
        title,
        phone,
        supervisor,
        department,
        employeetype,
        custentity_lms_roles,
      } = data[0];

      setValue("firstName", firstName);
      setValue("middleName", middleName);
      setValue("lastName", lastName);
      setValue("email", email);
      setValue("title", title);
      setValue("phone", phone);
      setValue(
        "supervisor",
        supervisor
          ? {
              label: supervisor?.refName,
              value: supervisor?.id,
            }
          : null
      );
      setValue(
        "department",
        department
          ? {
              label: department?.refName,
              value: department?.id,
            }
          : null
      );
      setValue(
        "employeetype",
        employeetype
          ? {
              label: employeetype?.refName,
              value: employeetype?.id,
            }
          : null
      );
      setValue(
        "custentity_lms_roles",
        custentity_lms_roles
          ? {
              label: custentity_lms_roles?.refName,
              value: custentity_lms_roles?.id,
            }
          : null
      );
    }
  }, [data, isFetched, setValue]);
  const onSubmit = (data) => {
    if (!editMode) return;
    const apidata = {
      id: router.query?.uid,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      title: data.title,
      phoneNumber: data.phoneNumber,
      supervisorId: data.supervisor?.value ?? null,
      class: data.class?.value ?? null,
      roleId: data.role?.value,
      type: data.type?.value ?? null,
    };

    updateUser.mutate(apiusersData, {
      onSuccess: (apiusersData) => {
        TkToastSuccess("User Updated Successfully");
        queryClient.invalidateQueries({
          queryKey: [RQ.user, router.query?.uid],
        });
        router.push(`${urls.users}`);
      },
      onError: (error) => {
        console.log("error", error);
        //TODO: report error to error reporting service
      },
    });
  };

  const toggleDeleteModel = () => {
    setDeleteModal(true);
  };

  return (
    <>
      {isLoading ? (
        <TkLoader />
      ) : (
        <>
          <TkPageHead>
            {/* <title>{`User: ${usersData[0]?.firstName}`}</title> */}
          </TkPageHead>
          <TkRow>
            <TkCol>
              {/* <TkCard> */}
              <TkEditCardHeader
                title={viewMode ? "User Details" : "Edit User"}
                isEditAccess={viewMode && accessLevel >= perAccessIds.edit}
                disableDelete={viewMode}
                editLink={`${urls.userEdit}/${router.query.uid}`}
                toggleDeleteModel={toggleDeleteModel}
              />
              {/* {deleteUser.isError ? (
              <FormErrorBox errMessage={deleteUser.error?.message} />
            ) : null} */}
              <TkCardBody className="mt-4">
                <TkForm onSubmit={handleSubmit(onSubmit)}>
                  <TkRow className="g-3 gx-4 gy-4">
                    <TkCol lg={4}>
                      <TkInput
                        {...register("firstName")}
                        labelName="First Name"
                        type="text"
                        id="firstName"
                        placeholder="Enter First Name"
                        disabled={viewMode}
                        requiredStarOnLabel={editMode}
                      />
                      {errors.firstname && (
                        <FormErrorText>
                          {errors.firstname.message}
                        </FormErrorText>
                      )}
                    </TkCol>

                    <TkCol lg={4}>
                      <TkInput
                        {...register("middleName")}
                        labelName="Middle Name"
                        type="text"
                        id="middleName"
                        placeholder="Enter Middle Name"
                        disabled={viewMode}
                        requiredStarOnLabel={editMode}
                      />
                      {errors.middleName && (
                        <FormErrorText>
                          {errors.middleName.message}
                        </FormErrorText>
                      )}
                    </TkCol>

                    <TkCol lg={4}>
                      <TkInput
                        {...register("lastName")}
                        labelName="Last Name"
                        type="text"
                        id="lastName"
                        placeholder="Enter Last Name"
                        disabled={viewMode}
                        requiredStarOnLabel={editMode}
                      />
                      {errors.lastname && (
                        <FormErrorText>{errors.lastname.message}</FormErrorText>
                      )}
                    </TkCol>

                    <TkCol lg={4}>
                      <TkInput
                        {...register("email")}
                        labelName="email"
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter Email"
                        disabled
                        requiredStarOnLabel={editMode}
                      />
                      {errors.email && (
                        <FormErrorText>{errors.email.message}</FormErrorText>
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
                        disabled={viewMode}
                      />
                      {errors.title && (
                        <FormErrorText>{errors.title.message}</FormErrorText>
                      )}
                    </TkCol>

                    <TkCol lg={4}>
                      <TkInput
                        {...register("phone")}
                        labelName="Phone Number"
                        type="text"
                        id="phone"
                        placeholder="Enter Phone Number"
                        disabled={viewMode}
                      />
                      {errors.phone && (
                        <FormErrorText>{errors.phone.message}</FormErrorText>
                      )}
                    </TkCol>

                    <TkCol lg={4}>
                      <Controller
                        name="supervisor"
                        control={control}
                        render={({ field }) => (
                          <TkSelect
                            {...field}
                            labelName="supervisor"
                            id="supervisor"
                            options={[]}
                            placeholder="Select Supervisor"
                            disabled={viewMode}
                          />
                        )}
                      />
                      {errors.supervisor && (
                        <FormErrorText>
                          {errors.supervisor.message}
                        </FormErrorText>
                      )}
                    </TkCol>

                    <TkCol lg={4}>
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
                            disabled={viewMode}
                          />
                        )}
                      />
                      {errors.department && (
                        <FormErrorText>
                          {errors.department.message}
                        </FormErrorText>
                      )}
                    </TkCol>

                    <TkCol lg={4}>
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
                            disabled={viewMode}
                          />
                        )}
                      />
                      {errors.employeetype && (
                        <FormErrorText>
                          {errors.employeetype.message}
                        </FormErrorText>
                      )}
                    </TkCol>

                    <TkCol lg={4}>
                      <Controller
                        name="custentity_lms_roles"
                        control={control}
                        render={({ field }) => (
                          <TkSelect
                            {...field}
                            labelName="Role"
                            // tooltip="Role"
                            // labelId={"_role"}
                            id="custentity_lms_roles"
                            options={[]}
                            onChange={(value) => {
                              field.onChange(value);
                              setIsAdminRole(value ? value.isAdmin : false);
                            }}
                            placeholder="Select Role"
                            requiredStarOnLabel={editMode}
                            disabled={viewMode}
                          />
                        )}
                      />
                      {errors.custentity_lms_roles && (
                        <FormErrorText>{errors.custentity_lms_roles.message}</FormErrorText>
                      )}
                    </TkCol>
                  </TkRow>
                  {/* {updateUser.isError ? (
                  <FormErrorBox errMessage={updateUser.error?.message} />
                ) : null} */}
                  <div className="d-flex mt-4 space-childern">
                    {editMode ? (
                      <div className="ms-auto">
                        <TkButton
                          onClick={() => router.push(`${urls.users}`)}
                          disabled={updateUser.isLoading}
                          type="button"
                          color="secondary"
                        >
                          Cancel
                        </TkButton>{" "}
                        <TkButton
                          loading={updateUser.isLoading}
                          type="submit"
                          color="primary"
                        >
                          Update
                        </TkButton>
                      </div>
                    ) : null}
                  </div>
                </TkForm>
              </TkCardBody>
              {/* </TkCard> */}
            </TkCol>
          </TkRow>
        </>
      )}
    </>
  );
};

export default UserDetails;
