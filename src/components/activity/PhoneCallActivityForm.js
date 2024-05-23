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
  phone: Yup.string()
    .nullable()
    .required("Phone number is required")
    .matches(/^[0-9+() -]*$/, "Phone number must be number.")
    .max(
      MaxPhoneNumberLength,
      `Phone number must be at most ${MaxPhoneNumberLength} numbers.`
    ),
  company: Yup.object().required("Lead name is required").nullable(),

  status: Yup.object().required("Status is required").nullable(),
  organizer: Yup.object().required("Organizer is required").nullable(),
  startDate: Yup.date().required("Date is required").nullable(),
  completeddate: Yup.date().required("Due date is required").nullable(),
}).required();

const AddPhoneCall = ({ value }) => {
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

  const phoneCallActivityPost = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/phoneCallActivity`),
  });

  const onSubmit = (formData) => {
    console.log("formData", formData);
    const apiData = {
      resttype: "Add",
      recordtype: "phonecall",
      bodyfields: {
        title: formData.title,
        phone: formData.phone,
        status: {
          value: formData.status.value,
          label: formData.status.text,
        },
        organizer: {
          value: formData.organizer.value,
          label: formData.organizer.text,
        },
        startdate: formatDateForAPI(formData.startdate),
        completeddate: formatDateForAPI(formData.completeddate),
        message: formData.message,
        company: {
          value: formData.company.value,
          label: formData.company.text,
        },
      },
    };
    phoneCallActivityPost.mutate(apiData),
      {
        onSuccess: (data) => {
          TkToastSuccess("Phone Call Created Successfully");
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
                                labelName="Subject"
                                placeholder="Enter Subject"
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
                                    labelId={"company"}
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

                            <TkCol lg={4}>
                              <TkInput
                                {...register("phone")}
                                id="phone"
                                name="phone"
                                type="text"
                                labelName="Phone Number"
                                placeholder="Enter Phone Number"
                                requiredStarOnLabel="true"
                              />
                              {errors.phone && (
                                <FormErrorText>
                                  {errors.phone.message}
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
                            </TkCol>

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
                              <Controller
                                name="completeddate"
                                control={control}
                                rules={{
                                  required: "Date Completed is required",
                                }}
                                render={({ field }) => (
                                  <TkDate
                                    {...field}
                                    labelName="Date Completed"
                                    id={"completeddate"}
                                    placeholder="Select Date Completed"
                                    options={{
                                      altInput: true,
                                      dateFormat: "d M, Y",
                                    }}
                                  />
                                )}
                              />
                              {errors.completeddate && (
                                <FormErrorText>
                                  {errors.completeddate.message}
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
                                  disabled={phoneCallActivityPost.isLoading}
                                >
                                  Cancel
                                </TkButton>{" "}
                                <TkButton
                                  type="submit"
                                  color="primary"
                                  loading={phoneCallActivityPost.isLoading}
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

export default AddPhoneCall;
