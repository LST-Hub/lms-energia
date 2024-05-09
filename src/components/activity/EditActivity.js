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
  RQ,
  modes,
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
  activityType: Yup.object().required("Activity Type is required").nullable(),

  lead: Yup.string().required("Lead Name is required").nullable(),

  location: Yup.string().required("Location is required").nullable(),

  phoneNumber: Yup.string()
    .nullable()
    .matches(/^[0-9+() -]*$/, "Phone number must be number.")
    .max(
      MaxPhoneNumberLength,
      `Phone number must be at most ${MaxPhoneNumberLength} numbers.`
    ),

  status: Yup.object().required("Status is required").nullable(),

  date: Yup.string().required("Date is required").nullable(),

  time: Yup.string().required("Time is required").nullable(),

  comments: Yup.string()
    .max(
      bigInpuMaxLength,
      `Comments should have at most ${bigInpuMaxLength} characters.`
    )
    .nullable(),
}).required();

const EditActivity = ({
  leadActivityToggle,
  isPopup,
  directCallId,
  setNewAddress,
  id,
  mode,
}) => {
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
  const viewMode = mode === modes.view;
  const editMode = mode === modes.edit;
  const aid = Number(id);

  const onSubmit = (data) => {};
  return (
    <>
      <TkRow className="justify-content-center">
        <TkCol lg={12}>
          <TkCardBody className="mt-4">
            <TkForm onSubmit={handleSubmit(onSubmit)}>
              <div>
                <TkRow className="mt-3">
                  <TkCol>
                    <div>
                      <TkRow className="g-3">
                        <TkCol lg={4}>
                          <Controller
                            name="activityType"
                            control={control}
                            render={({ field }) => (
                              <TkSelect
                                {...field}
                                labelName="Activity Type"
                                labelId="activityType"
                                id="activityType"
                                options={leadActivityTypes}
                                placeholder="Select Activity Type"
                                requiredStarOnLabel={true}
                                disabled={viewMode}
                              />
                            )}
                          />
                          {errors.activityType && (
                            <FormErrorText>
                              {errors.activityType.message}
                            </FormErrorText>
                          )}
                        </TkCol>
                        <TkCol lg={4}>
                          <TkInput
                            {...register("lead")}
                            id="lead"
                            name="lead"
                            type="text"
                            labelName="Lead Name"
                            placeholder="Enter Lead Name"
                            requiredStarOnLabel={true}
                            disabled={viewMode}
                          />
                          {errors.lead && (
                            <FormErrorText>{errors.lead.message}</FormErrorText>
                          )}
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
                          {errors.location && (
                            <FormErrorText>
                              {errors.location.message}
                            </FormErrorText>
                          )}
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
                            disabled={viewMode}
                          />
                          {errors.phoneNumber && (
                            <FormErrorText>
                              {errors.phoneNumber.message}
                            </FormErrorText>
                          )}
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
                                disabled={viewMode}
                              />
                            )}
                          />
                          {errors.status && (
                            <FormErrorText>
                              {errors.status.message}
                            </FormErrorText>
                          )}
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
                                disabled={viewMode}
                              />
                            )}
                          />
                          {errors.date && (
                            <FormErrorText>{errors.date.message}</FormErrorText>
                          )}
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
                            labelName="Time (HH:MM)"
                            id={"time"}
                            name="time"
                            type="text"
                            placeholder="Enter Time"
                            requiredStarOnLabel={true}
                            disabled={viewMode}
                          />
                          {errors.time && (
                            <FormErrorText>{errors.time.message}</FormErrorText>
                          )}
                        </TkCol>

                        <TkCol lg={8}>
                          <TkInput
                            {...register("comments")}
                            id="comments"
                            name="comments"
                            type="textarea"
                            labelName="Comments"
                            placeholder="Enter Comments"
                            disabled={viewMode}
                          />
                          {errors.comments && (
                            <FormErrorText>
                              {errors.comments.message}
                            </FormErrorText>
                          )}
                        </TkCol>

                        <div className="d-flex mt-4 space-childern">
                          <div className="ms-auto" id="update-form-btns">
                            <TkButton
                              color="secondary"
                              type="button"
                              onClick={() => {
                                router.push(`${urls.activity}`);
                              }}
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

export default EditActivity;
