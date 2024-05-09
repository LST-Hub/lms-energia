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
  assigned: Yup.object().required("Organizer is required").nullable(),
  status: Yup.object().required("Status is required").nullable(),
  startDate: Yup.string().required("Start date is required").nullable(),
  dueDate: Yup.string().required("Due date is required").nullable(),

}).required();

const LeadTaskPopup = ({
  leadTaskActivityToggle,
  isPopup,
  directCallId,
  setNewAddress,
}) => {
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
    // leadActivityToggle();
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
                          <Controller
                            name="assigned"
                            control={control}
                            render={({ field }) => (
                              <TkSelect
                                {...field}
                                labelName="Assigned To"
                                labelId={"assigned"}
                                id="assigned"
                                options={[]}
                                placeholder="Select Assigned To"
                                requiredStarOnLabel={true}
                              />
                            )}
                          />
                          {errors.assigned && (
                            <FormErrorText>
                              {errors.assigned.message}
                            </FormErrorText>
                          )}
                        </TkCol>

                        <TkCol lg={4}>
                          <Controller
                            name="priority"
                            control={control}
                            render={({ field }) => (
                              <TkSelect
                                {...field}
                                labelName="Proirity"
                                labelId={"priority"}
                                id="priority"
                                options={[]}
                                placeholder="Select Proirity"
                                requiredStarOnLabel={true}
                              />
                            )}
                          />
                          {errors.priority && (
                            <FormErrorText>
                              {errors.priority.message}
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
                            name="startDate"
                            control={control}
                            rules={{ required: "Start Date is required" }}
                            render={({ field }) => (
                              <TkDate
                                {...field}
                                labelName="Start Date"
                                id={"startDate"}
                                placeholder="Select Start Date"
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
                          <Controller
                            name="dueDate"
                            control={control}
                            rules={{ required: "Due Date is required" }}
                            render={({ field }) => (
                              <TkDate
                                {...field}
                                labelName="Due Date"
                                id={"dueDate"}
                                placeholder="Select Due Date"
                                options={{
                                  altInput: true,
                                  dateFormat: "d M, Y",
                                }}
                              />
                            )}
                          />
                          {errors.dueDate && (
                            <FormErrorText>
                              {errors.dueDate.message}
                            </FormErrorText>
                          )}
                        </TkCol>

                        <div className="modal-footer">
                          <div className="hstack gap-2 justify-content-end">
                            <TkButton
                              color="secondary"
                              onClick={leadTaskActivityToggle}
                              type="button"
                            >
                              Cancel
                            </TkButton>{" "}
                            <TkButton
                              type="submit"
                              color="primary"
                              // onClick={onClick}
                            >
                              Add
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

export default LeadTaskPopup;
