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
  title: Yup.string().required("Subject is required").nullable(),
  company: Yup.string().required("Lead name is required").nullable(),
  starttime: Yup.string().required("Start time is required").nullable(),
  endtime: Yup.string().required("End time is required").nullable(),
  message: Yup.string()
    .nullable()
    .max(
      bigInpuMaxLength,
      `Message should have at most ${bigInpuMaxLength} characters.`
    ),
}).required();

const LeadEventPopup = ({ leadEventActivityToggle }) => {
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

  const onSubmit = (data) => {
    // console.log("Address is:", data);
    // setNewAddress(fullAddress);
    // leadEventActivityToggle();
  };

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
                          <TkInput
                            {...register("title")}
                            id="title"
                            name="title"
                            type="text"
                            labelName="Title"
                            placeholder="Enter Title"
                            requiredStarOnLabel={true}
                          />
                          {errors.title && (
                            <FormErrorText>
                              {errors.title.message}
                            </FormErrorText>
                          )}
                        </TkCol>

                        <TkCol lg={4}>
                          <TkInput
                            {...register("company")}
                            id="company"
                            name="company"
                            type="text"
                            labelName="Lead Name"
                            placeholder="Enter Lead Name"
                            requiredStarOnLabel={true}
                          />
                          {errors.company && (
                            <FormErrorText>
                              {errors.company.message}
                            </FormErrorText>
                          )}
                        </TkCol>

                        <TkCol lg={4}>
                          <TkInput
                            {...register("location")}
                            id="location"
                            name="location"
                            type="text"
                            labelName="Location"
                            placeholder="Enter Location"
                          />
                          {errors.location && (
                            <FormErrorText>
                              {errors.location.message}
                            </FormErrorText>
                          )}
                        </TkCol>

                        <TkCol lg={4}>
                          <Controller
                            name="startDate"
                            control={control}
                            rules={{ required: "Date is required" }}
                            render={({ field }) => (
                              <TkDate
                                {...field}
                                labelName="Date"
                                id={"startDate"}
                                placeholder="Select Date"
                                options={{
                                  altInput: true,
                                  dateFormat: "d M, Y",
                                }}
                                requiredStarOnLabel={true}
                              />
                            )}
                          />
                          {errors.startDate && (
                            <FormErrorText>
                              {errors.startDate.message}
                            </FormErrorText>
                          )}
                        </TkCol>

                        <TkCol lg={4}>
                          <TkInput
                            {...register(`starttime`, {
                              required: "Start Time is required",
                              validate: (value) => {
                                if (
                                  value &&
                                  !/^[0-9]*([.:][0-9]+)?$/.test(value)
                                ) {
                                  return "Invalid Start Time";
                                }
                                if (
                                  convertTimeToSec(value) > 86400 ||
                                  value > 24
                                ) {
                                  return "Start Time should be less than 24 hours";
                                }
                              },
                            })}
                            onBlur={(e) => {
                              setValue(
                                `starttime`,
                                convertToTimeFotTimeSheet(e.target.value)
                              );
                            }}
                            labelName="Start Time (HH:MM)"
                            id={"starttime"}
                            name="starttime"
                            type="text"
                            placeholder="Enter Start Time"
                            requiredStarOnLabel={true}
                          />
                          {errors.starttime && (
                            <FormErrorText>
                              {errors.starttime.message}
                            </FormErrorText>
                          )}
                        </TkCol>

                        <TkCol lg={4}>
                          <TkInput
                            {...register(`endtime`, {
                              required: "End Time is required",
                              validate: (value) => {
                                if (
                                  value &&
                                  !/^[0-9]*([.:][0-9]+)?$/.test(value)
                                ) {
                                  return "Invalid End Time";
                                }
                                if (
                                  convertTimeToSec(value) > 86400 ||
                                  value > 24
                                ) {
                                  return "End Time should be less than 24 hours";
                                }
                              },
                            })}
                            onBlur={(e) => {
                              setValue(
                                `endtime`,
                                convertToTimeFotTimeSheet(e.target.value)
                              );
                            }}
                            labelName="End Time (HH:MM)"
                            id={"endtime"}
                            name="endtime"
                            type="text"
                            placeholder="Enter End Time"
                            requiredStarOnLabel={true}
                          />
                          {errors.endtime && (
                            <FormErrorText>
                              {errors.endtime.message}
                            </FormErrorText>
                          )}
                        </TkCol>

                        <TkCol lg={12}>
                          <TkInput
                            {...register("message")}
                            id="message"
                            type="textarea"
                            labelName="Message"
                            placeholder="Enter Message"
                          />
                          {errors.message && (
                            <FormErrorText>
                              {errors.message.message}
                            </FormErrorText>
                          )}
                        </TkCol>

                        <div className="modal-footer">
                          <div className="hstack gap-2 justify-content-end">
                            <TkButton
                              color="secondary"
                              onClick={leadEventActivityToggle}
                              type="button"
                            >
                              Cancel
                            </TkButton>{" "}
                            <TkButton type="submit" color="primary">
                              Submit
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

export default LeadEventPopup;
