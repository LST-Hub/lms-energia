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

const AddUser = () => {
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

  // const handelProfileImg = async (imageFile) => {
  //   const options = {
  //     maxSizeMB: 0.3,
  //     maxWidthOrHeight: 1024,
  //     useWebWorker: true,
  //   };
  //   try {
  //     const compressedFile = await imageCompression(imageFile, options);
  //     setProfileImageFile(compressedFile);
  //     setProfileImage(URL.createObjectURL(compressedFile));
  //   } catch (error) {
  //     TkToastError("Error while getting image file.");
  //     setProfileImageFile(null);
  //     setProfileImage(null);
  //     console.log(error);
  //   }
  // };

  const handelProfileImg = async (imageFile) => {
    if (imageFile.size >= 10506319) {
      TkToastError("Image size should be less than 10MB.");
      return;
    }
    const options = {
      maxSizeMB: 10.24,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(imageFile, options);
      setProfileImageFile(compressedFile);
      setProfileImage(URL.createObjectURL(compressedFile));
    } catch (error) {
      TkToastError("Error while getting image file.");
      setProfileImageFile(null);
      setProfileImage(null);
      console.log(error);
    }
  };

  useEffect(() => {
    if (isAdminRole) {
      setValue("canBePM", true);
      setValue("canBeSupervisor", true);
    }
  }, [isAdminRole, setValue]);

  useEffect(() => {
    if (isSupervisorError) {
      console.log("error", supervisorError);
      TkToastError(supervisorError?.message);
    }
    if (isDeptError) {
      console.log("error", deptError);
      TkToastError(deptError?.message);
    }
    if (isRoleError) {
      console.log("error", roleError);
      TkToastError(roleError?.message);
    }
    if (isWcalError) {
      console.log("error", WcalError);
      TkToastError(WcalError?.message);
    }
  }, [
    supervisorError,
    isSupervisorError,
    isDeptError,
    deptError,
    isRoleError,
    roleError,
    isWcalError,
    WcalError,
  ]);

  useEffect(() => {
    if (Array.isArray(supervisorsData)) {
      const s = supervisorsData.map((supervisor) => ({
        value: supervisor.id,
        label: supervisor.firstName + " " + supervisor.lastName,
      }));
      setAllSuperVisors(s);
    }

    if (Array.isArray(deptData)) {
      const d = deptData.map((dept) => ({
        value: dept.id,
        label: dept.name,
        active: dept.active,
      }));
      setAllDept(d);
    }

    if (Array.isArray(roleData)) {
      const r = roleData.map((role) => ({
        value: role.id,
        label: role.name,
        isAdmin: role.isAdmin,
        active: role.active,
      }));
      setAllRoles(r);
    }

    if (Array.isArray(wCalData)) {
      const w = wCalData.map((wCal) => ({
        value: wCal.id,
        label: wCal.name,
      }));
      setAllWorkCals(w);
    }
  }, [supervisorsData, deptData, roleData, wCalData]);

  useEffect(() => {
    if (Array.isArray(defaultwCalData) && defaultwCalData.length > 0) {
      if (defaultwCalData[0]?.defaultWorkCal) {
        setValue("workCalendar", {
          value: defaultwCalData[0]?.defaultWorkCal.id,
          label: defaultwCalData[0]?.defaultWorkCal.name,
        });
      }
    }
  }, [defaultwCalData, setValue]);

  const presignedUrls = useMutation({
    mutationFn: tkFetch.post(
      `${API_BASE_URL}/attachments/public-presigned-urls`
    ),
  });

  const handelUpdateUser = (data, imageKey) => {
    if (data.department?.active === false) {
      setError("department", {
        type: "manual",
        message: "Department is not active",
      });
      return;
    } else if (data.role?.active === false) {
      setError("role", {
        type: "manual",
        message: "Role is not active",
      });
      return;
    }
    const apiData = data;
    apiData.supervisorId = data.supervisor?.value;
    apiData.departmentId = data.department?.value;
    apiData.type = data.type?.value;
    apiData.roleId = data.role?.value;
    apiData.workCalendarId = data.workCalendar?.value;
    apiData.gender = data.gender?.value;
    apiData.country = data.country?.label ?? null;
    apiData.image = imageKey
      ? `${PUBLIC_BUCKET_BASE_URL}/${imageKey}`
      : undefined;

    inviteUser.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("User Invited Successfully");
        router.push(`${urls.users}`);
      },
      onError: (error) => {
        console.log("error", error);
        //TODO: report error to error reporting service
      },
    });
  };

  const onSubmit = (data) => {
    // if (!isAdminRole) {
    //   const supervisor = getValues("supervisor");
    //   if (!supervisor?.value) {
    //     setError("supervisor", {
    //       type: "manual",
    //       message: "Select supervisor",
    //     });
    //     return;
    //   }
    // }
    if (profileImage && profileImageFile) {
      setUploadingImage(true);
      const files = [
        {
          name: profileImageFile.name,
          type: profileImageFile.type,
        },
      ];
      presignedUrls.mutate(
        { files },
        {
          onSuccess: async (urls) => {
            if (Array.isArray(urls)) {
              const config = {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              };
              const urlInfo = urls[0];
              let imageuploaded = false;
              await axios
                .put(urlInfo.url, profileImageFile, config)
                .then(() => {
                  imageuploaded = true;
                })
                .catch((err) => {
                  TkToastError(
                    "Error while uploading profile image. Saving the user without it."
                  );
                  console.log(err);
                });
              setUploadingImage(false);
              handelUpdateUser(data, imageuploaded ? urlInfo.key : undefined);
            }
          },
          onError: (error) => {
            console.log("error while uploading files", error);
            setUploadingImage(false);
          },
        }
      );
    } else {
      handelUpdateUser(data);
    }
  };

  const onclickRemoveProfileImage = () => {
    console.log("remove profile image");
    setProfileImageFile(null);
    setProfileImage(null);
    setValue("profile-img-file-input", null);
  };

  const onChangeImg = (e) => {
    const file = e.target.files[0];
    if (file) {
      handelProfileImg(file);
    }
  };

  return (
    <>
      <TkRow className="justify-content-center">
        <TkCol lg={12}>
          {/* <TkCard> */}
          {/* <TkCardHeader className="tk-card-header">
            <h3>Add User</h3>
          </TkCardHeader> */}
          <TkCardBody>
            <TkForm onSubmit={handleSubmit(onSubmit)}>
              <TkRow className="g-3 gx-4 gy-4">
                <div id="teamlist">
                  <TkRow className="team-list list-view-filter">
                    <TkCol lg={4} className="list-view-filter">
                      <TkCard className="team-box mt-3 border">
                        {/* <TkCardBody className="">
                          <TkRow className="align-items-center justify-space-between team-row">
                            <TkCol className="col">
                              <div className="team-profile-img">
                                <div className="avatar-lg img-thumbnail rounded-circle flex-shrink-0">
                                  {profileImage ? (
                                    <Image
                                      src={profileImage}
                                      height={100}
                                      width={100}
                                      alt="user image"
                                      className="img-fluid d-block rounded-circle"
                                    />
                                  ) : null}
                                </div>
                              </div>
                            </TkCol>

                            <TkCol lg={3}>
                              <TkInput
                                labelName="Upload Image"
                                type="file"
                                id="profile-image"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    handelProfileImg(file);
                                  }
                                }}
                                className="d-none"
                                labelClassName="btn btn-light"
                              />
                            </TkCol>
                            <TkCol lg={3}>
                              <TkButton type="button" onClick={onclickRemoveProfileImage}>
                                Remove
                              </TkButton>
                            </TkCol>
                          </TkRow>
                        </TkCardBody> */}

                        <TkCardBody className="">
                          <TkRow className="align-items-center justify-space-between team-row">
                            <TkCol>
                              <div className="team-profile-img d-flex justify-content-center">
                                <div className="profile-user avatar-lg img-thumbnail rounded-circle border border-primary d-inline-block">
                                  {profileImage ? (
                                    <Image
                                      src={profileImage}
                                      height={100}
                                      width={100}
                                      alt="user image"
                                      className="img-fluid d-block rounded-circle"
                                    />
                                  ) : null}
                                  <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                                    <TkInput
                                      {...register("profile-img-file-input")}
                                      id="profile-img-file-input"
                                      type="file"
                                      className="profile-img-file-input"
                                      accept="image/*"
                                      onChange={(e) => {
                                        onChangeImg(e);
                                      }}
                                    />
                                    <TkLabel
                                      htmlFor="profile-img-file-input"
                                      className="profile-photo-edit upload-img-btn avatar-xs"
                                    >
                                      <span className="avatar-title rounded-circle border border-primary bg-light text-body">
                                        <i className="ri-camera-fill"></i>
                                      </span>
                                    </TkLabel>
                                  </div>
                                </div>
                              </div>
                            </TkCol>
                            <TkCol className="d-flex justify-content-center">
                              <TkButton
                                type="button"
                                onClick={onclickRemoveProfileImage}
                                disabled={!profileImage}
                              >
                                Remove
                              </TkButton>
                            </TkCol>
                          </TkRow>
                        </TkCardBody>
                      </TkCard>
                    </TkCol>
                  </TkRow>
                </div>
                <TkCol lg={4}>
                  <TkInput
                    {...register("firstName")}
                    labelName="First Name"
                    tooltip="Enter First Name"
                    labelId={"_firstName"}
                    id="firstName"
                    type="text"
                    placeholder="Enter First Name"
                    requiredStarOnLabel={true}
                  />
                  {errors.firstName && (
                    <FormErrorText>{errors.firstName.message}</FormErrorText>
                  )}
                </TkCol>
                <TkCol lg={4}>
                  <TkInput
                    {...register("lastName")}
                    labelName="Last Name"
                    tooltip="Enter Last Name"
                    labelId={"_lastName"}
                    id="lastName"
                    type="text"
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
                    tooltip="Enter Email"
                    labelId={"_email"}
                    id="email"
                    type="email"
                    placeholder="Email"
                    requiredStarOnLabel={true}
                  />
                  {errors.email && (
                    <FormErrorText>{errors.email.message}</FormErrorText>
                  )}
                </TkCol>

                <TkCol lg={4}>
                  <TkInput
                    {...register("designation")}
                    labelName="Designation"
                    tooltip="Enter Designation"
                    labelId={"_designation"}
                    name="designation"
                    id="designation"
                    type="text"
                    placeholder="Enter Designation"
                    // requiredStarOnLabel={true}
                  />
                  {errors.designation && (
                    <FormErrorText>{errors.designation.message}</FormErrorText>
                  )}
                </TkCol>

                <TkCol lg={4}>
                  <TkInput
                    {...register("phoneNumber")}
                    labelName="Phone Number"
                    tooltip="Enter Phone Number"
                    labelId={"_phoneNumber"}
                    id="phoneNumber"
                    type="text"
                    placeholder="Enter Phone Number"
                  />
                  {errors.phoneNumber && (
                    <FormErrorText>{errors.phoneNumber.message}</FormErrorText>
                  )}
                </TkCol>
                <TkCol lg={4}>
                  <Controller
                    name="supervisor"
                    control={control}
                    render={({ field }) => (
                      <TkSelect
                        {...field}
                        labelName="Supervisor"
                        tooltip="Select Supervisor"
                        labelId={"_supervisor"}
                        id="supervisor"
                        // isLoading={isSupervisorLoading}
                        options={[]}
                        placeholder="Select Supervisor"
                        // if role is Admin then we supervisor is not mandatory
                        requiredStarOnLabel={false}
                      />
                    )}
                  />
                  {/* {errors.supervisor && <FormErrorText>{errors.supervisor.message}</FormErrorText>} */}
                </TkCol>

                <TkCol lg={4}>
                  <Controller
                    name="department"
                    control={control}
                    render={({ field }) => (
                      <TkSelect
                        {...field}
                        labelName="Department"
                        tooltip="Select Department"
                        labelId={"_department"}
                        id="department"
                        // isLoading={isDeptLoading}
                        options={[]}
                        placeholder="Select Department"
                      />
                    )}
                  />
                  {errors.department && (
                    <FormErrorText>{errors.department.message}</FormErrorText>
                  )}
                </TkCol>

                <TkCol lg={4}>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <TkSelect
                        {...field}
                        labelName="Type"
                        tooltip="Select Type"
                        labelId={"_type"}
                        id="type"
                        options={employeeTypes}
                        placeholder="Select Type"
                      />
                    )}
                  />
                  {errors.type && (
                    <FormErrorText>{errors.type.message}</FormErrorText>
                  )}
                </TkCol>

                <TkCol lg={4}>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <TkSelect
                        {...field}
                        labelName="Role"
                        tooltip="Select Role"
                        labelId={"_role"}
                        id="role"
                        onChange={(value) => {
                          field.onChange(value);
                          // if clearled by clicking X then null will be passed
                          setIsAdminRole(value ? value.isAdmin : false);
                        }}
                        // isLoading={isRoleLoading}
                        options={[]}
                        placeholder="Select Role"
                        requiredStarOnLabel={true}
                      />
                    )}
                  />
                  {errors.role && (
                    <FormErrorText>{errors.role.message}</FormErrorText>
                  )}
                </TkCol>

                <TkCol lg={4}>
                  <TkInput
                    {...register("zipCode")}
                    labelName="Zip Code"
                    tooltip="Enter Zip Code"
                    labelId={"_zipCode"}
                    id="zipCode"
                    type="text"
                    placeholder="Enter Zip Code"
                    validate={{
                      required: { value: false },
                    }}
                  />
                  {errors.zipCode && (
                    <FormErrorText>{errors.zipCode.message}</FormErrorText>
                  )}
                </TkCol>

                <TkCol lg={4}>
                  {/* <TkInput
                    {...register("country")}
                    labelName="Country"
                    id="country"
                    type="text"
                    placeholder="Enter Country"
                    validate={{
                      required: { value: false },
                    }}
                  /> */}
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
                        options={countries}
                        placeholder="Select Country"
                      />
                    )}
                  />
                  {errors.country && (
                    <FormErrorText>{errors.country.message}</FormErrorText>
                  )}
                </TkCol>

                <TkCol lg={4}>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <TkSelect
                        {...field}
                        labelName="Gender"
                        tooltip="Enter Gender"
                        labelId={"_gender"}
                        id="gender"
                        options={genderTypes}
                        placeholder="Select Gender"
                      />
                    )}
                  />
                  {errors.gender && (
                    <FormErrorText>{errors.gender.message}</FormErrorText>
                  )}
                </TkCol>

                <TkCol lg={4}>
                  <Controller
                    name="workCalendar"
                    control={control}
                    render={({ field }) => (
                      <TkSelect
                        {...field}
                        labelName="Work Calendar"
                        tooltip="Select Work Calendar"
                        labelId={"_workCalendar"}
                        id="workCalendar"
                        requiredStarOnLabel={true}
                        // isLoading={isWcalLoading || isDefaultWcalLoading}
                        options={[]}
                        placeholder="Select Work Calendar"
                      />
                    )}
                  />
                  {errors.workCalendar && (
                    <FormErrorText>{errors.workCalendar.message}</FormErrorText>
                  )}
                </TkCol>

                <TkCol lg={12}>
                  {/* add checkbox that user can be project manager */}
                  <TkRow className="justify-content-start">
                    {/* <TkCol xs={"auto"}>
                      <TkCheckBox {...register("canBePM")} id="canBePM" type="checkbox" disabled={isAdminRole} />
                      <TkLabel className="ms-3" id="projectManager">
                        Can be Project Manager
                      </TkLabel>
                    </TkCol> */}
                    <TkCol xs={"auto"}>
                      <TkCheckBox
                        {...register("canBeSupervisor")}
                        id="canBeSupervisor"
                        type="checkbox"
                        disabled={isAdminRole}
                      />
                      <TkLabel className="ms-3 me-lg-5" id="supervisor">
                        Can be Supervisor
                      </TkLabel>
                    </TkCol>
                  </TkRow>
                </TkCol>

                <TkCol lg={12}>
                  <TkInput
                    {...register("address")}
                    labelName="Address"
                    tooltip="Enter Address"
                    labelId={"_address"}
                    name="address"
                    id="address"
                    type="textarea"
                    placeholder="Enter Address"
                  />
                  {errors.address && (
                    <FormErrorText>{errors.address.message}</FormErrorText>
                  )}
                </TkCol>
                <TkCol lg={12}>
                  <TkInput
                    {...register("notes")}
                    labelName="Notes"
                    tooltip="Enter Notes"
                    labelId={"_notes"}
                    id="notes"
                    type="textarea"
                    placeholder="Enter Notes"
                  />
                  {errors.notes && (
                    <FormErrorText>{errors.notes.message}</FormErrorText>
                  )}
                </TkCol>
              </TkRow>
              {inviteUser.isError ? (
                <FormErrorBox errMessage={inviteUser.error.message} />
              ) : null}
              <div className="d-flex mt-4 space-childern">
                <TkButton
                  //keep it disabled dont give loading to it
                  disabled={inviteUser.isLoading || uploadingImage}
                  onClick={() => router.push(`${urls.users}`)}
                  color="secondary"
                  type="button"
                  className="ms-auto"
                >
                  Cancel
                </TkButton>
                <TkButton
                  loading={inviteUser.isLoading || uploadingImage}
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
