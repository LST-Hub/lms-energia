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
  MaxNameLength,
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
  title: Yup.string()
    .required("Subject is required")
    .max(MaxNameLength, `Subject must be at most ${MaxNameLength} characters.`)
    .nullable(),
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
  assigned: Yup.object().required("Organizer is required").nullable(),
  startDate: Yup.date().required("Date is required").nullable(),
  message: Yup.string()
    .nullable()
    .max(
      bigInpuMaxLength,
      `Message must be at most ${bigInpuMaxLength} characters.`
    ),
  // completeddate: Yup.date().required("Due date is required").nullable(),
}).required();

const AddPhoneCallActivty = ({ value }) => {
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

  const [salesTeam, leadList] = results;
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
  }, [salesTeamIsError, salesTeamError, leadListIsError, leadListError]);

  useEffect(() => {
    if (salesTeamData) {
      setAllSalesTeamData(
        salesTeamData?.items?.map((salesTeamType) => ({
          label: salesTeamType.firstname,
          value: salesTeamType.entityid,
        }))
      );
    }

    if (leadNameListData) {
      setAllLeadNameListData(
        leadNameListData?.list?.map((leadListType) => ({
          label: leadListType?.values?.companyname,
          value: leadListType?.id,
        }))
      );
    }
  }, [salesTeamData, leadNameListData]);

  const phoneCallActivityPost = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/phoneCallActivity`),
  });

  const onSubmit = (formData) => {
    const apiData = {
      resttype: "Add",
      recordtype: "phonecall",
      bodyfields: {
        // Netsuite field: FormaData Field
        title: formData.title,
        company: {
          value: formData.company.value,
          text: formData.company.label,
        },
        phone: formData.phone,
        status: {
          value: formData.status.value,
          text: formData.status.label,
        },
        assigned: {
          value: formData.assigned.value,
          text: formData.assigned.label,
        },
        startdate: formatDateForAPI(formData.startdate),
        message: formData.message,
      },
    };
    console.log(" apiData", apiData);
    phoneCallActivityPost.mutate(apiData, {
      onSuccess: (data) => {
        console.log("data", data);
        TkToastSuccess("Phone Call Created Successfully");
        router.push(`${urls.phoneCall}`);
      },
      onError: (error) => {
        console.log("error", error);
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
                                        value: "COMPLETED",
                                      },
                                      {
                                        label: "Scheduled",
                                        value: "SCHEDULED",
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
                                name="assigned"
                                control={control}
                                render={({ field }) => (
                                  <TkSelect
                                    {...field}
                                    labelName="Organizer"
                                    labelId={"assigned"}
                                    id="assigned"
                                    options={allSalesTeamData}
                                    placeholder="Select Organizer"
                                    requiredStarOnLabel={true}
                                    loading={salesTeamLoading}
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

                            {/* <TkCol lg={4}>
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
                            </TkCol> */}

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
                                    router.push(`${urls.phoneCall}`);
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

export default AddPhoneCallActivty;
