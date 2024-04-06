import React, { useEffect, useState } from "react";
import TkButton from "../TkButton";
import TkInput from "../forms/TkInput";
import TkCard, { TkCardBody } from "../TkCard";
import TkContainer from "../TkContainer";
import TkRow, { TkCol } from "../TkRow";
import TkForm from "../forms/TkForm";

import { TkToastSuccess } from "../TkToastContainer";
import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";
import {
  API_BASE_URL,
  urls,
  MinEmailLength,
  MaxEmailLength,
  MinNameLength,
  MaxNameLength,
  MaxPhoneNumberLength,
  bigInpuMaxLength,
  countries,
  smallInputMaxLength,
  leadActivityTypes,
} from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { useMutation, useQueries } from "@tanstack/react-query";
import { useRouter } from "next/router";
import useUserAccessLevel from "../../utils/hooks/useUserAccessLevel";
import { permissionTypeIds } from "../../../DBConstants";
import TkSelect from "../forms/TkSelect";
import TkDate from "../forms/TkDate";
import { convertTimeToSec, convertToTimeFotTimeSheet } from "../../utils/time";

const schema = Yup.object({
  name: Yup.string()
    .required("Name is Required")
    .min(
      MinNameLength,
      `Partner name should have at least ${MinNameLength} character.`
    )
    .max(
      MaxNameLength,
      `Partner name should have at most ${MaxNameLength} characters.`
    ),
  jobTitle: Yup.string()
    .required("Job Title is Required")
    .min(
      MinNameLength,
      `Job title should have at least ${MinNameLength} character.`
    )
    .max(
      MaxNameLength,
      `Job title should have at most ${MaxNameLength} characters.`
    ),
  phoneNumber: Yup.string()
    .required("Phone Number is Required")
    .matches(/^[0-9+() -]*$/, "Phone number must be number.")
    .max(
      MaxPhoneNumberLength,
      `Phone number must be at most ${MaxPhoneNumberLength} numbers.`
    )
    .nullable(),
  email: Yup.string()
    .nullable()
    .required("Email is Required")
    .email("Email must be valid.")
    .min(
      MinEmailLength,
      `Email should have at least ${MinEmailLength} characters.`
    )
    .max(
      MaxEmailLength,
      `Email should have at most ${MaxEmailLength} characters.`
    ),
  address: Yup.string().max(
    bigInpuMaxLength,
    `Address must be at most ${bigInpuMaxLength} characters.`
  ),
  address1: Yup.string()
    .max(
      smallInputMaxLength,
      `Address 1 should have at most ${smallInputMaxLength} characters.`
    )
    .nullable(),
  address2: Yup.string()
    .max(
      smallInputMaxLength,
      `Address 2 should have at most ${smallInputMaxLength} characters.`
    )
    .nullable(),
  city: Yup.string()
    .max(
      smallInputMaxLength,
      `City should have at most ${smallInputMaxLength} characters.`
    )
    .nullable(),
  state: Yup.string()
    .max(
      smallInputMaxLength,
      `State should have at most ${smallInputMaxLength} characters.`
    )
    .nullable(),

  comments: Yup.string().max(
    bigInpuMaxLength,
    `Comments must be at most ${bigInpuMaxLength} characters.`
  ),
}).required();

const ActivityPopup = ({ isPopup }) => {
  const accessLevel = useUserAccessLevel(permissionTypeIds.partner);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const router = useRouter();

  return (
    <>
      <TkRow className="justify-content-center">
        <TkCol lg={12}>
          <TkCardBody className="mt-4">
            <TkForm>
              <div>
                <TkRow className="mt-3">
                  <TkCol>
                    <div>
                      <TkRow className="g-3">
                        <TkCol lg={4}>
                          <Controller
                            name="_activityType"
                            control={control}
                            render={({ field }) => (
                              <TkSelect
                                {...field}
                                labelName="Activity Type"
                                labelId={"_activityType"}
                                id="_activityType"
                                options={leadActivityTypes}
                                placeholder="Select Activity Type"
                              />
                            )}
                          />
                        </TkCol>

                        {/* <TkCol lg={4}>
                          <TkSelect
                            labelName="Lead"
                            labelId={"_lead"}
                            id="lead"
                            options={leadTypes}
                            placeholder="Select Lead"
                            requiredStarOnLabel={true}
                          />
                        </TkCol> */}

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
                          <TkInput
                            {...register("phoneNumber")}
                            id="phoneNumber"
                            name="phoneNumber"
                            type="text"
                            labelName="Phone Number"
                            placeholder="Enter Phone Number"
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
                                options={[]}
                                placeholder="Select Type"
                                requiredStarOnLabel={true}
                              />
                            )}
                          />
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
                            labelName="Follow Up Time (HH:MM)"
                            id={"time"}
                            name="time"
                            type="text"
                            placeholder="Enter Time"
                            requiredStarOnLabel={true}
                          />
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
                            </TkCol>

                        <div className="d-flex mt-4 space-childern">
                          <div className="ms-auto" id="update-form-btns">
                            <TkButton
                              color="secondary"
                              onClick={() => {
                                router.push(`${urls.lead}`);
                              }}
                              type="button"
                            >
                              Cancel
                            </TkButton>{" "}
                            <TkButton type="submit" color="primary">
                              Save
                            </TkButton>
                          </div>
                        </div>
                      </TkRow>
                    </div>
                  </TkCol>
                </TkRow>
              </div>
            </TkForm>
          </TkCardBody>
        </TkCol>
      </TkRow>
    </>
  );
};

export default ActivityPopup;
