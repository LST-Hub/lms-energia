import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import TkCard, { TkCardBody, TkCardHeader } from "../src/components/TkCard";
import TkRow, { TkCol } from "../src/components/TkRow";
import TkInput from "../src/components/forms/TkInput";
import TkForm from "../src/components/forms/TkForm";
import TkSelect from "../src/components/forms/TkSelect";
import TkPageHead from "../src/components/TkPageHead";
import TkContainer from "../src/components/TkContainer";
import TkButton from "../src/components/TkButton";
import ParticlesAuth from "../src/utils/ParticlesAuth";

import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../src/components/forms/ErrorText";
import {
  MinNameLength,
  MaxNameLength,
  MaxPhoneNumberLength,
  bigInpuMaxLength,
  API_BASE_URL,
  smallInputMaxLength,
  genderTypes,
  PUBLIC_BUCKET_BASE_URL,
  urls,
} from "../src/utils/Constants";
import { useRouter } from "next/router";
import tkFetch from "../src/utils/fetch";
import { useMutation, useQuery } from "@tanstack/react-query";
import TkLoader from "../src/components/TkLoader";
import { TkToastError, TkToastSuccess } from "../src/components/TkToastContainer";
import axios from "axios";
import TkLabel from "../src/components/forms/TkLabel";

const schema = Yup.object({
  firstName: Yup.string()
    .min(MinNameLength, `First Name must be at least ${MinNameLength} character.`)
    .max(MaxNameLength, `First Name must be at most ${MaxNameLength} characters.`)
    .required("First Name is required"),

  lastName: Yup.string()
    .min(MinNameLength, `Last Name must be at least ${MinNameLength} character.`)
    .max(MaxNameLength, `Last Name must be at most ${MaxNameLength} characters.`)
    .required("Last Name is required"),

  phoneNumber: Yup.string().max(
    MaxPhoneNumberLength,
    `Phone Number must be at most ${MaxPhoneNumberLength} characters.`
  ),
  zipCode: Yup.string().max(MaxPhoneNumberLength, `Zip Code must be at most ${MaxPhoneNumberLength} characters.`),
  country: Yup.string().max(smallInputMaxLength, `Country must be at most ${smallInputMaxLength} characters.`),
  address: Yup.string().max(bigInpuMaxLength, `Address must be at most ${bigInpuMaxLength} characters.`),
  gender: Yup.object().nullable(),

  //below fields are non-editable by user
  designation: Yup.string(),
  email: Yup.string(),
  supervisor: Yup.string().nullable(),
  department: Yup.string().nullable(),
  type: Yup.string().nullable(),
  role: Yup.string().nullable(),
  notes: Yup.string(),
}).required();

function InviteUserDetailas() {
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

  const { data, isLoading, isError, error, isFetched } = useQuery({
    queryKey: ["invite-user"],
    queryFn: tkFetch.get(`${API_BASE_URL}/users/accept-invite?token=${router.query.token}`),
    enabled: !!router.query.token,
  });

  useEffect(() => {
    if (isFetched && Array.isArray(data) && data.length > 0) {
      setValue("firstName", data[0]?.firstName);
      setValue("lastName", data[0]?.lastName);
      setValue("email", data[0]?.email);
      setValue("designation", data[0]?.designation);
      setValue("phoneNumber", data[0]?.phoneNumber);
      setValue("gender", data[0]?.gender ? { value: data[0].gender, label: data[0].gender } : null);
      setValue("zipCode", data[0]?.zipCode);
      setValue("country", data[0]?.country);
      setValue("notes", data[0]?.notes);
      setValue("address", data[0]?.address);
      setValue("type", data[0]?.type);
      setValue("role", data[0]?.role?.name);
      setValue("supervisor", data[0]?.supervisor?.name);
      setValue("department", data[0]?.department?.name);
    }
  }, [isFetched, data, setValue]);

  const [profileImage, setProfileImage] = React.useState(null);
  const [profileImageFile, setProfileImageFile] = React.useState(null);
  const [uploadingImage, setUploadingImage] = React.useState(false);

  const handelProfileImg = async (imageFile) => {
    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(imageFile, options);
      // console.log(compressedFile);
      setProfileImageFile(compressedFile);
      setProfileImage(URL.createObjectURL(compressedFile));
    } catch (error) {
      TkToastError("Error while getting image file.");
      setProfileImageFile(null);
      setProfileImage(null);
      console.log(error);
    }
  };

  const updateUser = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/users/accept-invite`),
  });

  const handelUpdateUser = (data, imageKey) => {
    const apiData = {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      zipCode: data.zipCode,
      country: data.country,
      address: data.address,
      gender: data.gender?.value ?? null,
      image: imageKey ? `${PUBLIC_BUCKET_BASE_URL}/${imageKey}` : undefined,
      token: router.query.token,
    };

    updateUser.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("User Updated Successfully");
        router.push(`${urls.dashboard}`);
      },
      onError: (error) => {
        console.log("error", error);
        TkToastError("Error while updating user.");
        //TODO: report error to error reporting service
      },
    });
  };

  const presignedUrls = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/attachments/public-presigned-urls`),
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

  // const removeProfileImage = useMutation({
  //   mutationFn: tkFetch.patch(`${API_BASE_URL}/users/${data[0]?.id}`),
  // });

  const onclickRemoveProfileImage = () => {
    setProfileImage(null);
    setProfileImageFile(null);
  };

  return (
    <>
      <TkPageHead>
        <title>{`SignUp - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
      </TkPageHead>

      <ParticlesAuth>
        <div className="auth-page-content">
          <TkContainer className="mt-3">
            {/* <TkRow>
              <TkCol lg={12}>
                <div className="text-center mt-sm-5 mb-4 text-white-50">
                  <div>
                    <Link href="/">
                      <a className="d-inline-block auth-logo">
                        <h2 className="logo-text text-light">{process.env.NEXT_PUBLIC_APP_NAME}</h2>
                      </a>
                    </Link>
                  </div>
                </div>
              </TkCol>
            </TkRow> */}
            <TkRow>
              <TkCard className="non-ws-card">
              <TkCardHeader className="tk-card-header">
                <h2>User Details</h2>
              </TkCardHeader>
              <TkCardBody className="p-4">
                {isLoading ? (
                  <TkLoader />
                ) : isError ? (
                  <FormErrorBox errMessage={error} />
                ) : (
                  <TkForm onSubmit={handleSubmit(onSubmit)}>
                    <TkRow className="g-3 gx-4 gy-4">
                      <div id="teamlist">
                        <TkRow className="team-list list-view-filter">
                          <TkCol lg={5} className="list-view-filter">
                            <TkCard className="team-box border">
                              <TkCardBody className="">
                                <TkRow className="align-items-center justify-space-between team-row">
                                  <TkCol>
                                    <div className="team-profile-img d-flex justify-content-center">
                                      <TkCol>
                                        <div className="profile-user avatar-lg img-thumbnail rounded-circle border border-primary d-inline-block">
                                          {profileImage || data[0]?.image ? (
                                            <Image
                                              src={profileImage || String(data[0].image)}
                                              height={100}
                                              width={100}
                                              alt="use image"
                                              className="img-fluid d-block rounded-circle"
                                            />
                                          ) : (
                                            <div className="avatar-title text-uppercase border rounded-circle bg-light text-primary">
                                              {String(data[0]?.firstName).charAt(0) +
                                                String(data[0]?.lastName).charAt(0)}
                                            </div>
                                          )}
                                          <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                                            <TkInput
                                              id="profile-img-file-input"
                                              type="file"
                                              className="profile-img-file-input"
                                              accept="image/*"
                                              onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                  handelProfileImg(file);
                                                }
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
                                      </TkCol>
                                      <div className="team-content">
                                        <h5 className="fs-16 mb-1">{data[0]?.firstName + " " + data[0]?.lastName}</h5>
                                        <p className="text-muted mb-0">
                                          {data[0]?.designation ? data[0].designation : ""}
                                        </p>
                                      </div>
                                    </div>
                                  </TkCol>

                                  {/* <TkCol lg={3} className="col">
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
                                    </TkCol> */}
                                  <TkCol lg={3}>
                                    <TkButton type="button" onClick={onclickRemoveProfileImage}>
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
                        <div>
                          <TkInput {...register("firstName")} labelName="First Name" type="text" id="firstName" />
                        </div>
                        {errors.firstName ? <FormErrorText>{errors.firstName?.message}</FormErrorText> : null}
                      </TkCol>
                      <TkCol lg={4}>
                        <div>
                          <TkInput {...register("lastName")} labelName="Last Name" type="text" id="lastName" />
                          {errors.lastName ? <FormErrorText>{errors.lastName?.message}</FormErrorText> : null}
                        </div>
                      </TkCol>
                      <TkCol lg={4}>
                        <div>
                          <TkInput {...register("email")} labelName="Email Address" type="email" id="email" disabled />
                        </div>
                      </TkCol>
                      <TkCol lg={4}>
                        <div>
                          <TkInput
                            {...register("designation")}
                            labelName="Designation"
                            type="text"
                            id="designation"
                            disabled
                          />
                        </div>
                      </TkCol>
                      <TkCol lg={4}>
                        <div>
                          <TkInput {...register("phoneNumber")} labelName="Phone Number" type="text" id="phoneNumber" />
                          {errors.phoneNumber?.message ? (
                            <FormErrorText>{errors.phoneNumber?.message}</FormErrorText>
                          ) : null}
                        </div>
                      </TkCol>
                      <TkCol lg={4}>
                        <div>
                          <TkInput
                            {...register("supervisor")}
                            labelName="Supervisor"
                            type="text"
                            id="supervisor"
                            disabled
                          />
                          {errors.supervisor?.message ? (
                            <FormErrorText>{errors.supervisor?.message}</FormErrorText>
                          ) : null}
                        </div>
                      </TkCol>
                      <TkCol lg={4}>
                        <div>
                          <TkInput
                            {...register("department")}
                            labelName="Department"
                            type="text"
                            id="department"
                            disabled
                          />
                          {errors.department?.message ? (
                            <FormErrorText>{errors.department?.message}</FormErrorText>
                          ) : null}
                        </div>
                      </TkCol>
                      <TkCol lg={4}>
                        <div>
                          <TkInput {...register("type")} labelName="Type" type="text" id="type" disabled />
                          {errors.type?.message ? <FormErrorText>{errors.type?.message}</FormErrorText> : null}
                        </div>
                      </TkCol>

                      <TkCol lg={4}>
                        <div>
                          <TkInput {...register("role")} labelName="Role" type="text" id="role" disabled />
                          {errors.role?.message ? <FormErrorText>{errors.role?.message}</FormErrorText> : null}
                        </div>
                      </TkCol>

                      <TkCol lg={4}>
                        <div>
                          <TkInput {...register("zipCode")} labelName="Zip Code" type="text" id="zipCode" />
                          {errors.zipCode?.message ? <FormErrorText>{errors.zipCode?.message}</FormErrorText> : null}
                        </div>
                      </TkCol>
                      <TkCol lg={4}>
                        <div>
                          <TkInput {...register("country")} labelName="Country" type="text" id="country" />
                        </div>
                      </TkCol>

                      <TkCol lg={4}>
                        <Controller
                          name="gender"
                          control={control}
                          render={({ field }) => (
                            <TkSelect {...field} labelName="Gender" id="gender" options={genderTypes} />
                          )}
                        />
                        {errors.gender && <FormErrorText>{errors.gender.message}</FormErrorText>}
                      </TkCol>

                      <TkCol lg={12}>
                        <TkInput {...register("address")} labelName="Address" name="address" id="address" type="text" />
                        {errors.address && <FormErrorText>{errors.address.message}</FormErrorText>}
                      </TkCol>
                      <TkCol lg={12}>
                        <TkInput {...register("notes")} labelName="Notes" id="notes" type="textarea" disabled />
                        {errors.notes && <FormErrorText>{errors.notes.message}</FormErrorText>}
                      </TkCol>

                      <TkCol lg={12}>
                        <div className="d-flex mt-4 space-children">
                          <div className="ms-auto">
                            <TkButton
                              color="secondary"
                              className={"mx-2"}
                              type="button"
                              disabled={uploadingImage || updateUser.isLoading}
                              onClick={() => {
                                router.push(`${urls.dashboard}`);
                              }}
                            >
                              Login
                            </TkButton>
                            <TkButton color="primary" type="submit" loading={uploadingImage || updateUser.isLoading}>
                              Update and Login
                            </TkButton>
                          </div>
                        </div>
                      </TkCol>
                    </TkRow>
                  </TkForm>
                )}
              </TkCardBody>
              </TkCard>
            </TkRow>
          </TkContainer>
        </div>
      </ParticlesAuth>
    </>
  );
}

export default InviteUserDetailas;

InviteUserDetailas.options = {
  auth: true,
};
