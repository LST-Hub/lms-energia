import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import TkInput from "../forms/TkInput";
import TkRow, { TkCol } from "../TkRow";
import TkCard, { TkCardBody } from "../TkCard";
import TkButton from "../TkButton";
import TkForm from "../forms/TkForm";
import TkSelect from "../forms/TkSelect";
import TkLabel from "../forms/TkLabel";
import TkCheckBox from "../forms/TkCheckBox";
import { useRouter } from "next/router";
import imageCompression from "browser-image-compression";
import axios from "axios";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";
import {
  MinNameLength,
  MaxNameLength,
  RQ,
  API_BASE_URL,
  PUBLIC_BUCKET_BASE_URL,
  MinPasswordLength,
  MaxPasswordLength,
  MaxPhoneNumberLength,
  bigInpuMaxLength,
  urls,
  modes,
  countries,
} from "../../../src/utils/Constants";
import TkModal, { TkModalBody, TkModalHeader } from "../../../src/components/TkModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import { useEffect } from "react";
import TkLoader from "../TkLoader";
import TkEditCardHeader from "../TkEditCardHeader";

const schema = Yup.object({
  firstName: Yup.string()
    .min(MinNameLength, `First Name must be at least ${MinNameLength} character.`)
    .max(MaxNameLength, `First Name must be at most ${MaxNameLength} characters.`)
    .required("First Name is required"),

  lastName: Yup.string()
    .min(MinNameLength, `Last Name must be at least ${MinNameLength} character.`)
    .max(MaxNameLength, `Last Name must be at most ${MaxNameLength} characters.`)
    .required("Last Name is required"),

  phoneNumber: Yup.string()
    // .test("test-name", "Phone number must be at least 5 & at most 15 numbers", function (value) {
    //   if (value === "" || value === null || value === undefined) {
    //     return true;
    //   } else {
    //     return value.trim().match(/^[+]?[0-9]{5,15}$/, "Phone number must be at least 5 numbers.");
    //   }
    // })
    // not accepted charcters
   
    .matches(/^[0-9+() -]*$/, "Phone number must be number.")
    .max(MaxPhoneNumberLength, `Phone number must be at most   ${MaxPhoneNumberLength} numbers.`)
    .nullable(),

  gender: Yup.object().nullable(),

  email: Yup.string().required("Email is required"),

  country: Yup.object().nullable(),

  // zipCode: Yup.string()
  //   .max(MaxPhoneNumberLength, `Zip Code must be at most ${MaxPhoneNumberLength} characters.`)
  //   .nullable(),

  zipCode: Yup.string()
    .test("test-name", "Zip code does not accept characters", function (value) {
      if (value === "" || value === null || value === undefined) {
        return true;
      } else {
        return value.trim().match(/^[0-9]*$/, "Zip code must be numeric.");
      }
    })
    .max(MaxPhoneNumberLength, `Zip code must be at most   ${MaxPhoneNumberLength} numbers.`)
    .nullable(),

  designation: Yup.string().nullable(),

  department: Yup.string().nullable(),

  supervisor: Yup.string().nullable(),

  role: Yup.string().nullable(),

  workCalendar: Yup.string().nullable(),

  type: Yup.string().nullable(),

  canBePM: Yup.boolean().nullable(),

  canBeSupervisor: Yup.boolean().nullable(),

  address: Yup.string().max(bigInpuMaxLength, `Address must be at most ${bigInpuMaxLength} characters.`).nullable(),

  notes: Yup.string().nullable(),
}).required();

const schema2 = Yup.object({
  oldPassword: Yup.string()
    .min(MinPasswordLength, `Password should contain at least ${MinPasswordLength} characters`)
    .max(MaxPasswordLength, `Password cannot contain more than ${MaxPasswordLength} characters`)
    .required("Password is required"),

  password: Yup.string()
    .min(MinPasswordLength, `Password should contain at least ${MinPasswordLength} characters`)
    .max(MaxPasswordLength, `Password cannot contain more than ${MaxPasswordLength} characters`)
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#^()+!%*?&])[A-Za-z\d@$#^()+!%*?&]{8,32}$/,
      "Password must have One Uppercase, One Lowercase, One Number and one Special Character. \n Special Characters can be on of @ $ # ^ ( ) + ! % * ? &"
    )
    .required("Password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Password and Confirm Password must match")
    .required("Confirm Password is required"),
}).required();

const genderTypes = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const ProfileSetting = ({ mode }) => {
  const viewMode = mode === modes.view;
  const editMode = mode === modes.edit;

  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    setValue: setValuePassword,
    formState: { errors: errorsPassword },
  } = useForm({
    resolver: yupResolver(schema2),
  });

  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState({});
  const [userImage, setUserImage] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = React.useState(false);

  const { data, isLoading, isError, error, isFetched } = useQuery({
    queryKey: [RQ.profileData],
    queryFn: tkFetch.get(`${API_BASE_URL}/profile`),
  });

  const { data: userAuthData, isLoading: userAuthIsLoading } = useQuery({
    queryKey: [RQ.userAuthData],
    queryFn: tkFetch.get(`${API_BASE_URL}/users/authProvider`),
  });

  useEffect(() => {
    if (isFetched && Array.isArray(data) && data.length > 0) {
      setUser(data[0]);
      setUserImage(data[0].image);
      setValue("firstName", data[0].firstName);
      setValue("lastName", data[0].lastName);
      setValue("phoneNumber", data[0].phoneNumber);
      setValue("gender", data[0]?.gender ? { value: data[0]?.gender, label: data[0]?.gender } : null);
      setValue("email", data[0].email);
      setValue("country", data[0].country ? { value: data[0].country, label: data[0].country } : null);
      setValue("zipCode", data[0].zipCode);
      setValue("designation", data[0].designation);
      setValue("department", data[0]?.department ? data[0]?.department.name : null);
      setValue("supervisor", data[0]?.supervisor ? data[0]?.supervisor.name : null);
      setValue("role", data[0]?.role ? data[0]?.role.name : null);
      setValue("workCalendar", data[0]?.workCalendar ? data[0]?.workCalendar.name : null);
      setValue("type", data[0]?.type ? data[0]?.type : null);
      setValue("canBePM", data[0].canBePM);
      setValue("canBeSupervisor", data[0].canBeSupervisor);
      setValue("address", data[0].address);
      setValue("notes", data[0].notes);
    }
  }, [data, isFetched, setValue]);

  const toggle = React.useCallback(() => {
    if (isModalOpen) {
      setIsModalOpen(false);
    } else {
      setIsModalOpen(true);
      setValuePassword("oldPassword", "");
      setValuePassword("password", "");
      setValuePassword("confirmPassword", "");
    }
  }, [isModalOpen, setValuePassword]);

  const handelProfileImg = async (imageFile) => {
    if (imageFile.size >= 10606316) {
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

  const updateProfile = useMutation({
    mutationFn: tkFetch.put(`${API_BASE_URL}/profile`),
  });

  const presignedUrls = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/attachments/public-presigned-urls`),
  });

  const changePassword = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/users/password/update`),
  });

  const removeProfileImage = useMutation({
    mutationFn: tkFetch.patch(`${API_BASE_URL}/profile`),
  });

  const onSubmit = (data) => {
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
                  console.log(err);
                  TkToastError("Error while uploading profile image. Saving the user without it.");
                });
              setUploadingImage(false);
              updateUserProfile(data, imageuploaded ? urlInfo.key : undefined);
            }
          },
          onError: (error) => {
            console.log("error while uploading files", error);
            setUploadingImage(false);
          },
        }
      );
    } else {
      updateUserProfile(data);
    }
  };

  const updateUserProfile = (data, imageKey) => {
    const apiData = {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber ?? null,
      gender: data.gender?.value ?? null,
      email: data.email,
      country: data.country?.label ?? null,
      zipCode: data.zipCode ?? null,
      address: data.address ?? null,
      image: imageKey ? `${PUBLIC_BUCKET_BASE_URL}/${imageKey}` : undefined,
    };

    updateProfile.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Profile Updated Successfully");
        queryClient.invalidateQueries({
          queryKey: [RQ.profileData],
        });
        router.push(`${urls.dashboard}`);
      },
      onError: (error) => {
        console.log("error", error);
      },
    });
  };

  const handleChangePassword = (data) => {
    const apiData = {
      currentPassword: data.oldPassword,
      newPassword: data.confirmPassword,
    };
    changePassword.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Password Changed Successfully");
        queryClient.invalidateQueries({
          queryKey: [RQ.changePassword],
        });
        toggle();
      },
      onError: (error) => {
        console.log("error", error);
      },
    });
  };

  const onclickRemoveProfileImage = () => {
    const apiData = {
      image: null,
    };
    removeProfileImage.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Profile Image Removed Successfully");
        queryClient.invalidateQueries({
          queryKey: [RQ.profileData],
        });
        setProfileImage(null);
        setProfileImageFile(null);
        setValue("profile-img-file-input", null);
      },
      onError: (error) => {
        console.log("error", error);
      },
    });
  };

  const onChangeImg = (e) => {
    const file = e.target.files[0];
    if (file) {
      handelProfileImg(file);
    }
  };

  return (
    <>
      {isLoading ? (
        <TkLoader />
      ) : isError ? (
        <FormErrorBox errMessage={error?.message} />
      ) : (
        <>
          <TkCardBody className="p-4">
            <TkForm onSubmit={handleSubmit(onSubmit)}>
              <TkRow>
                <div id="teamlist">
                  <TkEditCardHeader
                    title="Profile"
                    // active={isClientActive}
                    // onActiveClick={activeClientChange}
                    // onDeleteClick={deleteClientHandler}
                    isEditAccess={viewMode}
                    disableDelete={viewMode}
                    editLink={`${urls.profileEdit}`}
                  />
                  <TkRow className="team-list list-view-filter">
                    <TkCol lg={6} className="list-view-filter">
                      <TkCard className="team-box">
                        <TkCardBody className="p-4">
                          <TkRow className="align-items-center team-row">
                            <TkCol>
                              <div className="team-profile-img">
                                <TkCol>
                                  <div className="profile-user avatar-lg img-thumbnail rounded-circle border border-primary d-inline-block">
                                    {profileImage || user?.image ? (
                                      <Image
                                        src={profileImage || userImage}
                                        height={100}
                                        width={100}
                                        alt="user-image"
                                        className="img-fluid d-block rounded-circle"
                                      />
                                    ) : (
                                      <div className="avatar-title text-uppercase border rounded-circle bg-light text-primary">
                                        {String(user?.firstName ?? "").charAt(0) +
                                          String(user?.lastName ?? "").charAt(0)}
                                      </div>
                                    )}
                                    {editMode && (
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
                                    )}
                                  </div>
                                </TkCol>
                                <TkCol>
                                  <div className="team-content">
                                    <Link href="#">
                                      <a>
                                        <h5 className="fs-16 mb-1">
                                          {data[0].firstName?.length > 17 ? (
                                            <>{data[0].firstName?.substring(0, 17) + "..."}</>
                                          ) : (
                                            <>{data[0].firstName + " "}</>
                                          )}
                                          {data[0].lastName?.length > 17 ? (
                                            <>{data[0].lastName?.substring(0, 17) + "..."}</>
                                          ) : (
                                            <>{data[0].lastName}</>
                                          )}
                                        </h5>
                                      </a>
                                    </Link>
                                    {/* <p className="text-muted mb-0">{user?.designation}</p> */}
                                    {data[0].designation?.length > 17 ? (
                                      <p className="text-muted mb-0">{data[0].designation?.substring(0, 17) + "..."}</p>
                                    ) : (
                                      <p className="text-muted mb-0">{data[0].designation}</p>
                                    )}
                                  </div>
                                </TkCol>
                              </div>
                            </TkCol>
                            {
                              <>
                                {editMode && (
                                  <>
                                    <TkCol lg={3}>
                                      <TkButton
                                        type="button"
                                        onClick={onclickRemoveProfileImage}
                                        disabled={!profileImage && !user?.image}
                                      >
                                        Remove
                                      </TkButton>
                                    </TkCol>
                                  </>
                                )}
                              </>
                            }
                          </TkRow>
                        </TkCardBody>
                      </TkCard>
                    </TkCol>
                  </TkRow>
                </div>
                <TkCol lg={4}>
                  <div className="mb-3">
                    <TkInput
                      {...register("firstName")}
                      id="firstName"
                      type="text"
                      labelName="First Name"
                      placeholder="Enter First Name"
                      requiredStarOnLabel={editMode}
                      disabled={viewMode}
                    />
                  </div>
                  {errors.firstName?.message ? <FormErrorText>{errors.firstName?.message}</FormErrorText> : null}
                </TkCol>
                <TkCol lg={4}>
                  <div className="mb-3">
                    <TkInput
                      {...register("lastName")}
                      id="lastName"
                      type="text"
                      labelName="Last Name"
                      placeholder="Enter Last Name"
                      requiredStarOnLabel={editMode}
                      disabled={viewMode}
                    />
                  </div>
                  {errors.lastName?.message ? <FormErrorText>{errors.lastName?.message}</FormErrorText> : null}
                </TkCol>
                <TkCol lg={4}>
                  <div className="mb-3">
                    <TkInput
                      {...register("phoneNumber")}
                      id="phoneNumber"
                      type="text"
                      labelName="Phone Number"
                      placeholder="Enter Phone Number"
                      className="form-control"
                      disabled={viewMode}
                    />
                    {errors.phoneNumber?.message ? <FormErrorText>{errors.phoneNumber?.message}</FormErrorText> : null}
                  </div>
                </TkCol>

                <TkCol lg={4}>
                  <div className="mb-3">
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <TkSelect {...field} id="gender" labelName="Gender" placeholder="Select Gender" options={genderTypes} disabled={viewMode} />
                      )}
                    />
                  </div>
                </TkCol>

                <TkCol lg={4}>
                  <div className="mb-3">
                    <TkInput
                      {...register("email")}
                      id="email"
                      type="text"
                      labelName="Email Address"
                      placeholder="Enter Email Address"
                      className="form-control"
                      disabled={true}
                    />
                  </div>
                </TkCol>

                <TkCol lg={4}>
                  <div className="mb-3">
                    {/* <TkInput
                      {...register("country")}
                      id="country"
                      name="country"
                      type="text"
                      labelName="Country"
                      className="form-control"
                      disabled={viewMode}
                     
                    /> */}
                    <Controller
                      name="country"
                      control={control}
                      render={({ field }) => (
                        <TkSelect {...field} id="country" labelName="Country" placeholder="Select Country" options={countries} disabled={viewMode} />
                      )}
                    />
                    {errors.country?.message ? <FormErrorText>{errors.country?.message}</FormErrorText> : null}
                  </div>
                </TkCol>
                <TkCol lg={4}>
                  <div className="mb-3">
                    <TkInput
                      {...register("zipCode")}
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      labelName="Zip Code"
                      placeholder="Enter Zip Code"
                      className="form-control"
                      disabled={viewMode}
                    />
                    {errors.zipCode?.message ? <FormErrorText>{errors.zipCode?.message}</FormErrorText> : null}
                  </div>
                </TkCol>

                <TkCol lg={4}>
                  <div className="mb-3">
                    <TkInput
                      {...register("designation")}
                      id="designation"
                      name="designation"
                      type="text"
                      labelName="Designation"
                      placeholder="Enter Designation"
                      className="form-control"
                      disabled={true}
                    />
                    {errors.designation?.message ? <FormErrorText>{errors.designation?.message}</FormErrorText> : null}
                  </div>
                </TkCol>

                <TkCol lg={4}>
                  <div className="mb-3">
                    <TkInput {...register("department")} 
                    id="department" 
                    labelName="Department" 
                    placeholder="Enter Department"
                    disabled={true} />
                  </div>
                </TkCol>

                <TkCol lg={4}>
                  <div className="mb-3">
                    <TkInput {...register("supervisor")} 
                    id="supervisor" 
                    labelName="Supervisor" 
                    placeholder="Enter Supervisor"
                    disabled={true} />
                  </div>
                </TkCol>

                <TkCol lg={4}>
                  <div className="mb-3">
                    <TkInput {...register("role")} 
                    id="role" 
                    labelName="Role" 
                    placeholder="Enter Role"
                    disabled={true} 
                    />
                  </div>
                </TkCol>

                <TkCol lg={4}>
                  <div className="mb-3">
                    <TkInput
                      {...register("workCalendar")}
                      id="workCalendar"
                      labelName="Work Calender"
                      placeholder="Enter Work Calender"
                      disabled={true}
                    />
                  </div>
                </TkCol>

                <TkCol lg={4}>
                  <div className="mb-3">
                    <TkInput {...register("type")} 
                    id="type" 
                    labelName="Type" 
                    placeholder="Enter Type"
                    disabled={true} />
                  </div>
                </TkCol>

                <TkCol lg={8}>
                  <TkRow className="justify-content-start">
                    <TkLabel tag="h5" className="mt-2"></TkLabel>
                    <TkCol className="mt-3 text-nowrap">
                      <TkLabel className="me-3" id="monday">
                        Project Manager
                      </TkLabel>
                      <TkCheckBox
                        {...register("canBePM")}
                        id="monday"
                        name="monday"
                        type="checkbox"
                        defaultChecked={true}
                        disabled={true}
                      />
                    </TkCol>
                    <TkCol className="mt-3 text-nowrap">
                      <TkLabel className="me-3" id="tuesday">
                        Supervisor
                      </TkLabel>
                      <TkCheckBox
                        {...register("canBeSupervisor")}
                        id="tuesday"
                        name="tuesday"
                        type="checkbox"
                        disabled={true}
                      />
                    </TkCol>
                  </TkRow>
                </TkCol>

                <TkCol lg={12} className="mb-3">
                  <TkInput
                    {...register("address")}
                    labelName="Address"
                    name="address"
                    id="address"
                    type="text"
                    placeholder="Enter Address"
                    disabled={viewMode}
                  />
                  {errors.address && <FormErrorText>{errors.address.message}</FormErrorText>}
                </TkCol>

                <TkCol lg={12}>
                  <div className="mb-3">
                    <TkInput
                      {...register("notes")}
                      id="notes"
                      disabled
                      type="textarea"
                      labelName="Notes"
                      placeholder="Enter your notes"
                    />
                  </div>
                </TkCol>

                <TkCol lg={12}>
                  {/* we are checking is user is logged in through google or any other third party provider
                  if he is not logged in from google then we are showing the option to change the password */}
                  <div>
                    {!userAuthIsLoading && userAuthData?.length && userAuthData[0]?.id ? null : (
                      <div className="col-3">
                        <a
                          className="fw-semibold text-primary text-decoration-underline cursor-pointer"
                          onClick={toggle}
                        >
                          <p>Change Password</p>
                        </a>
                      </div>
                    )}
                    {editMode && (
                      <div className="hstack gap-2 justify-content-end">
                        <TkButton
                          disabled={updateProfile.isLoading || uploadingImage}
                          onClick={() => router.push(`${urls.dashboard}`)}
                          type="button"
                          color="secondary"
                        >
                          Cancel
                        </TkButton>
                        <TkButton loading={updateProfile.isLoading || uploadingImage} type="submit" color="primary">
                          Update
                        </TkButton>
                      </div>
                    )}
                  </div>
                </TkCol>
              </TkRow>
            </TkForm>
          </TkCardBody>
        </>
      )}

      <TkModal
        isOpen={isModalOpen}
        toggle={toggle}
        centered
        size="lg"
        className="border-0"
        modalClassName="modal fade zoomIn"
      >
        <TkModalHeader className="p-3 bg-soft-info" toggle={toggle}>
          {"Change Password"}
        </TkModalHeader>
        {/* TODO: there is huge rerenders while filling new task form , rectify it */}
        <TkModalBody className="modal-body">
          <TkForm onSubmit={handleSubmitPassword(handleChangePassword)}>
            <TkRow>
              <TkCol lg={4}>
                <TkInput
                  {...registerPassword("oldPassword")}
                  id="oldPassword"
                  type="password"
                  labelName="Old Password"
                  placeholder="Enter Old Password"
                  requiredStarOnLabel={true}
                />
                {errorsPassword.oldPassword?.message ? (
                  <FormErrorText>{errorsPassword.oldPassword?.message}</FormErrorText>
                ) : null}
              </TkCol>

              <TkCol lg={4}>
                <TkInput
                  {...registerPassword("password")}
                  id="newPassword"
                  type="password"
                  labelName="New Password"
                  placeholder="Enter New Password"
                  requiredStarOnLabel={true}
                />
                {errorsPassword.password?.message ? (
                  <FormErrorText>{errorsPassword.password?.message}</FormErrorText>
                ) : null}
              </TkCol>

              <TkCol lg={4}>
                <TkInput
                  {...registerPassword("confirmPassword")}
                  id="confirmPassword"
                  type="password"
                  labelName="Confirm Password"
                  placeholder="Enter Confirm Password"
                  requiredStarOnLabel={true}
                />
                {errorsPassword.confirmPassword?.message ? (
                  <FormErrorText>{errorsPassword.confirmPassword?.message}</FormErrorText>
                ) : null}
              </TkCol>

              {changePassword.isError ? <FormErrorBox errMessage={changePassword.error.message} /> : null}

              <TkCol lg={12} className="mt-3">
                <div className="hstack gap-2 justify-content-end">
                  <TkButton disabled={changePassword.isLoading} onClick={toggle} type="button" color="secondary">
                    Cancel
                  </TkButton>
                  <TkButton loading={changePassword.isLoading} type="submit" color="primary">
                    Update
                  </TkButton>
                </div>
              </TkCol>
            </TkRow>
          </TkForm>
        </TkModalBody>
      </TkModal>
    </>
  );
};

export default ProfileSetting;
