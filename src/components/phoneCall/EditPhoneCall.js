import React, { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import TkButton from "../TkButton";
import TkInput from "../forms/TkInput";
import TkSelect from "../forms/TkSelect";
import TkCard, { TkCardHeader, TkCardBody, TkCardTitle } from "../TkCard";
import TkContainer from "../TkContainer";
import TkRow, { TkCol } from "../TkRow";
import TkForm from "../forms/TkForm";
import TkLabel from "../forms/TkLabel";
import TkCheckBox from "../forms/TkCheckBox";
import avatar1 from "/public/images/users/avatar-1.jpg";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";
import {
  MinNameLength,
  MaxNameLength,
  bigInpuMaxLength,
  MinEmailLength,
  MaxEmailLength,
  MaxPhoneNumberLength,
  smallInputMaxLength,
  employeeTypes,
  genderTypes,
  API_BASE_URL,
  RQ,
  modes,
  PUBLIC_BUCKET_BASE_URL,
  urls,
  countries,
  customFormTypes,
  leadTypes,
  organizerTypes,
  stausTypes,
  remindersTypes,
} from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/router";
import useUserAccessLevel from "../../utils/hooks/useUserAccessLevel";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import hasPageModeAccess from "../../utils/hasPageAccess";
import TkAccessDenied from "../TkAccessDenied";
import Image from "next/image";
import axios from "axios";
import TkDate from "../forms/TkDate";
import { convertTimeToSec, convertToTimeFotTimeSheet } from "../../utils/time";
import { Nav, NavItem, NavLink } from "reactstrap";
import classNames from "classnames";
import { formatDateForAPI } from "../../utils/date";
import TkLoader from "../TkLoader";
import DeleteModal from "../../utils/DeleteModal";
import TkEditCardHeader from "../TkEditCardHeader";

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
  // completeddate: Yup.date().required("Due date is required").nullable(),
}).required();

const EditPhoneCall = ({ id, mode }) => {
  const router = useRouter();
  const viewMode = mode === modes.view;
  const editMode = mode === modes.edit;
  const cid = Number(id);
  const accessLevel = useUserAccessLevel(permissionTypeIds.users);
  const {
    control,
    register,
    handleSubmit,
    getValues,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [allSalesTeamData, setAllSalesTeamData] = useState([{}]);
  const [allLeadNameListData, setAllLeadNameListData] = useState([{}]);
  const [deleteModal, setDeleteModal] = useState(false);


  const queryClient = useQueryClient();

  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allSalesTeam],
        queryFn: tkFetch.get(`${API_BASE_URL}/sales-team`),
      },

      {
        queryKey: [RQ.allSalesTeam],
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
    data: leadListData,
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

    if (leadListData) {
      setAllLeadNameListData(
        leadListData?.items?.map((leadListType) => ({
          label: leadListType.companyname,
          // value: leadListType.id,
        }))
      );
    }
  }, [salesTeamData, leadListData]);
  // console.log("allLeadNameListData", allLeadNameListData?.items[0].companyname);

  const { data, isLoading, isFetched, isError, error } = useQuery({
    queryKey: [RQ.lead, cid],
    queryFn: tkFetch.get(`${API_BASE_URL}/phoneCallActivity/${cid}`),
    enabled: !!cid,
  });

  useEffect(() => {
    if (isFetched && Array.isArray(data) && data.length > 0) {
      const { bodyValues } = data[0];
      setValue("title", bodyValues?.title);
      setValue("phone", bodyValues?.phone);
      setValue("company", {
        value: bodyValues?.company?.text,
        label: bodyValues?.company?.value,
      });
      setValue("status", {
        value: bodyValues?.status?.text,
        label: bodyValues?.status?.value,
      });
      setValue("organizer", {
        value: bodyValues?.organizer?.text,
        label: bodyValues?.organizer?.value,
      });
      setValue("startDate", bodyValues?.startdate);
      setValue("message", bodyValues?.message);
    }
  }, [data, setValue, isFetched]);

  const phoneCallActivityPost = useMutation({
    mutationFn: tkFetch.patch(`${API_BASE_URL}/phoneCallActivity/${cid}`),
  });

  const onSubmit = (formData) => {
    const apiData = {
      resttype: "Update",
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
        // completeddate: formatDateForAPI(formData.completeddate),
        message: formData.message,
        company: {
          value: formData.company.value,
          label: formData.company.text,
        },
      },
      filters: {
        bodyfilters: [["internalid", "anyof", cid]],
      },
    };
    phoneCallActivityPost.mutate(apiData),
      {
        onSuccess: (data) => {
          TkToastSuccess("Phone Call Updated Successfully");
          router.push(`${urls.phoneCall}`);
        },
        onError: (error) => {
          TkToastError("error while creating Lead", error);
        },
      };
  };

  const deletePhoneCall = useMutation({
    mutationFn: tkFetch.deleteWithIdInUrl(`${API_BASE_URL}/phoneCallActivity`),
  });

  const handleDeletePhoneCall = () => {
    if (!editMode) return;
    const apiData = {
      id: cid,
    };
    deletePhoneCall.mutate(apiData),
      {
        onSuccess: (data) => {
          TkToastSuccess("Phone Call Deleted Successfully");
          queryClient.invalidateQueries({
            queryKey: [RQ.allLeads, cid],
          });
          router.push(`${urls.phoneCall}`);
        },
        onError: (error) => {
          TkToastError("error while deleting Phone Call", error);
        },
      };
  };

  const toggleDeleteModelPopup = () => {
    setDeleteModal(true);
  };
  return (
    <>
      {isLoading ? (
        <TkLoader />
      ) : (
        <>
          <DeleteModal
            show={deleteModal}
            onDeleteClick={() => {
              handleDeletePhoneCall();
              setDeleteModal(false);
            }}
            onCloseClick={() => setDeleteModal(false)}
          />
          <div>
            <TkRow className="justify-content-center">
              <TkCol lg={12}>
                <TkEditCardHeader
                  title={viewMode ? "Phone Call Details" : "Edit Phone Call"}
                  viewMode={viewMode}
                  editLink={`${urls.phoneCallEdit}/${cid}`}
                  onDeleteClick={handleDeletePhoneCall}
                  toggleDeleteModel={toggleDeleteModelPopup}
                />
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
                                      // options={[
                                      //     { label: "Email", value: "Email" },
                                      //     { label: "Direct Call", value: "Direct Call" },
                                      //     { label: "Social Media", value: "Social Media" },
                                      //     { label: "Portals", value: "Portals" },
                                      //   ]}
                                      options={allLeadNameListData}
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
                                    Update
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
        </>
      )}
    </>
  );
};

export default EditPhoneCall;
