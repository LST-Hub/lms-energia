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
  status: Yup.object().required("Status is required").nullable(),
  startDate: Yup.string().required("Date is required").nullable(),
  starttime: Yup.string().required("Start Time is required").nullable(),
  endtime: Yup.string().required("End Time is required").nullable(),
  message: Yup.string()
    .nullable()
    .max(
      bigInpuMaxLength,
      `Message must be at most ${bigInpuMaxLength} characters.`
    ),
}).required();

const EventActivity = ({ value }) => {
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
  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allSalesTeam],
        queryFn: tkFetch.get(`${API_BASE_URL}/sales-team`),
      },
    ],
  });

  const [salesTeam] = results;
  const {
    data: salesTeamData,
    isLoading: salesTeamLoading,
    isError: salesTeamIsError,
    error: salesTeamError,
  } = salesTeam;

  useEffect(() => {
    if (salesTeamIsError) {
      console.log("salesTeamIsError", salesTeamError);
      TkToastError(salesTeamError.message);
    }
  }, [salesTeamIsError, salesTeamError]);

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

  const eventActivityPost = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/taskActivity`),
  });

  const onSubmit = (formData) => {
    const apiData = {
      resttype: "Add",
      recordtype: "calendarevent",
      bodyfields: {
        title: formData.title,
        company: {
          value: formData.company.value,
          label: formData.company.text,
        },
        location: formData.location,
        status: {
          value: formData.status.value,
          label: formData.status.text,
        },
        // accesslevel: {
        //   value: formData.accesslevel.value,
        //   label: formData.accesslevel.text,
        // },
        // organizer: {
        //   value: formData.organizer.value,
        //   label: formData.organizer.text,
        // },

        startdate: formatDateForAPI(formData.startdate),
        starttime: formData.starttime,
        endtime: formData.endtime,
        message: formData.message,
      },
    };
    eventActivityPost.mutate(apiData),
      {
        onSuccess: (data) => {
          TkToastSuccess("Event Created Successfully");
          router.push(`${urls.activity}`);
        },
        onError: (error) => {
          TkToastError("error while creating Lead", error);
        },
      };
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
                                    options={[
                                        { label: "Email", value: "Email" },
                                        { label: "Direct Call", value: "Direct Call" },
                                        { label: "Social Media", value: "Social Media" },
                                        { label: "Portals", value: "Portals" },
                                      ]}
                                    placeholder="Select Lead Name"
                                    requiredStarOnLabel={true}
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

                            {/* <TkCol lg={4}>
                              <Controller
                                name="accesslevel"
                                control={control}
                                render={({ field }) => (
                                  <TkSelect
                                    {...field}
                                    labelName="Event Access"
                                    labelId={"accesslevel"}
                                    id="accesslevel"
                                    options={[
                                      { label: "Public", value: "Public" },
                                      { label: "Private", value: "Private" },
                                      {
                                        label: "Show as Busy",
                                        value: "Show as Busy",
                                      },
                                    ]}
                                    placeholder="Select Event Access"
                                    requiredStarOnLabel={true}
                                  />
                                )}
                              />
                              {errors.accesslevel && (
                                <FormErrorText>
                                  {errors.accesslevel.message}
                                </FormErrorText>
                              )}
                            </TkCol> */}

                            {/* <TkCol lg={4}>
                              <Controller
                                name="organizer"
                                control={control}
                                render={({ field }) => (
                                  <TkSelect
                                    {...field}
                                    labelName="Organizer"
                                    labelId={"organizer"}
                                    id="organizer"
                                    options={allSalesTeamData}
                                    placeholder="Select Organizer"
                                    requiredStarOnLabel={true}
                                  />
                                )}
                              />
                              {errors.organizer && (
                                <FormErrorText>
                                  {errors.organizer.message}
                                </FormErrorText>
                              )}
                            </TkCol> */}

                            <TkCol lg={4}>
                              <Controller
                                name="startDate"
                                control={control}
                                rules={{
                                  required: "Date is required",
                                }}
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

                            <TkCol lg={8}>
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
                                    router.push(`${urls.activity}`);
                                  }}
                                  type="button"
                                  disabled={eventActivityPost.isLoading}
                                >
                                  Cancel
                                </TkButton>{" "}
                                <TkButton
                                  type="submit"
                                  color="primary"
                                  loading={eventActivityPost.isLoading}
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

export default EventActivity;
