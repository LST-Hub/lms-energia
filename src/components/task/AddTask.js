import React, { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import TkButton from "../TkButton";
import TkInput from "../forms/TkInput";
import TkSelect from "../forms/TkSelect";
import TkCard, { TkCardHeader, TkCardBody, TkCardTitle } from "../TkCard";
import TkContainer from "../TkContainer";
import TkRow, { TkCol } from "../TkRow";
import TkForm from "../forms/TkForm";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";
import {
  API_BASE_URL,
  RQ,
  modes,
  PUBLIC_BUCKET_BASE_URL,
  urls,
  countries,
  organizerTypes,
  statusTypes,
  MaxPhoneNumberLength,
  MinEmailLength,
  MaxEmailLength,
  bigInpuMaxLength,
} from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import useUserAccessLevel from "../../utils/hooks/useUserAccessLevel";
import { permissionTypeIds } from "../../../DBConstants";
import TkDate from "../forms/TkDate";
import { formatDateForAPI } from "../../utils/date";
import { convertTimeToSec, convertToTimeFotTimeSheet } from "../../utils/time";

const schema = Yup.object({
  title: Yup.string().required("Subject is required").nullable(),
  company: Yup.object().required("Lead name is required").nullable(),
  // assigned: Yup.object().required("Organizer is required").nullable(),
  priority: Yup.object().required("Proirity is required").nullable(),
  status: Yup.object().required("Status is required").nullable(),
  startDate: Yup.string().required("Date is required").nullable(),
  dueDate: Yup.string().required("Due date is required").nullable(),
  message: Yup.string()
    .nullable()
    .max(
      bigInpuMaxLength,
      `Message must be at most ${bigInpuMaxLength} characters.`
    ),
}).required();

const AddTask = ({ value }) => {
  const router = useRouter();
  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [allSalesTeamData, setAllSalesTeamData] = useState([{}]);
  const [allLeadNameListData, setAllLeadNameListData] = useState([{}]);

  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allSalesTeam],
        queryFn: tkFetch.get(`${API_BASE_URL}/sales-team`),
      },

      {
        queryKey: [RQ.allLeadName],
        queryFn: tkFetch.get(`${API_BASE_URL}/lead-name`),
      },
    ],
  });

  const [salesTeam,leadList] = results;
  const {
    data: salesTeamData,
    isLoading: salesTeamLoading,
    isError: salesTeamIsError,
    error: salesTeamError,
  } = salesTeam;

  const {
    data: leadNameListData,
    isLoading: leadListLoading,
    isError: leadListIsError,
    error: leadListError,
  } = leadList;

  useEffect(() => {
    if (salesTeamIsError) {
      console.log("salesTeamIsError", salesTeamError);
      TkToastError(salesTeamError.message);
    }

    if (leadListIsError) {
      console.log("leadListIsError", leadListError);
      TkToastError(leadListError.message);
    }
  }, [salesTeamIsError, salesTeamError,leadListIsError,leadListError]);

  useEffect(() => {
    if (salesTeamData) {
      setAllSalesTeamData(
        salesTeamData?.items?.map((salesTeamType) => ({
          label: salesTeamType.firstname,
          value: salesTeamType.entityid,
        }))
      );
    }
  }, [salesTeamData]);

  const taskActivityPost = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/taskActivity`),
  });

  const onSubmit = (formData) => {
    const apiData = {
      resttype: "Add",
      recordtype: "task",
      bodyfields: {
        title: formData.title,
        company: {
          value: formData.company.value,
          label: formData.company.text,
        },
        // assigned: {
        //   value: formData.assigned.value,
        //   label: formData.assigned.text,
        // },
        priority: {
          value: formData.priority.value,
          label: formData.priority.text,
        },
        status: {
          value: formData.status.value,
          label: formData.status.text,
        },
        // startdate: formatDateForAPI(formData.startdate),
        dueDate: formatDateForAPI(formData.dueDate),
        message: formData.message,
      },
    };
    taskActivityPost.mutate(apiData,
      {
        onSuccess: (data) => {
          TkToastSuccess("Task Created Successfully");
          router.push(`${urls.taskk}`);
        },
        onError: (error) => {
          TkToastError("error while creating Lead", error);
        },
      });
  };

  return (
    <>
      <div>
        <div>
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
                              <Controller
                                name="company"
                                control={control}
                                render={({ field }) => (
                                  <TkSelect
                                    {...field}
                                    labelName="Lead Name"
                                    labelId={"_status"}
                                    id="company"
                                    options={allLeadNameListData}
                                    placeholder="Select Lead Name"
                                    requiredStarOnLabel={true}
                                    loading={leadListLoading}
                                  />
                                )}
                              />
                              {errors.company && (
                                <FormErrorText>
                                  {errors.company.message}
                                </FormErrorText>
                              )}
                            </TkCol>
                            {/* <TkCol lg={4}>
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
                            </TkCol> */}

                            {/* <TkCol lg={4}>
                              <Controller
                                name="assigned"
                                control={control}
                                render={({ field }) => (
                                  <TkSelect
                                    {...field}
                                    labelName="Assigned To"
                                    labelId={"assigned"}
                                    id="assigned"
                                    options={allSalesTeamData}
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
                            </TkCol> */}

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
                                    options={[
                                      { label: "High", value: "1" },
                                      { label: "Medium", value: "2" },
                                      { label: "Low", value: "3" },
                                    ]}
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
                                    options={[
                                        {
                                          label: "Completed",
                                          value: "Completed",
                                        },
                                        {
                                          label: "Scheduled",
                                          value: "Scheduled",
                                        },
                                      ]}
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
                                rules={{
                                  required: "Start Date is required",
                                }}
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
                                rules={{
                                  required: "Due Date is required",
                                }}
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
                                    requiredStarOnLabel={true}
                                  />
                                )}
                              />
                              {errors.dueDate && (
                                <FormErrorText>
                                  {errors.dueDate.message}
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
                            <div className="d-flex mt-4 space-childern">
                              <div className="ms-auto" id="update-form-btns">
                                <TkButton
                                  color="secondary"
                                  onClick={() => {
                                    router.push(`${urls.taskk}`);
                                  }}
                                  type="button"
                                  disabled={taskActivityPost.isLoading}
                                >
                                  Cancel
                                </TkButton>{" "}
                                <TkButton
                                  type="submit"
                                  color="primary"
                                  loading={taskActivityPost.isLoading}
                                >
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
        </div>
      </div>
    </>
  );
};

export default AddTask;
