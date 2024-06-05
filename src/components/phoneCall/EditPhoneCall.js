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
  title: Yup.string()
    .required("Subject is required")
    .max(MaxNameLength, `Subject must be at most ${MaxNameLength} characters.`)
    .nullable(),
  phone: Yup.string()
    .nullable()
    .required("Phone Number is required")
    .matches(/^[0-9+() -]*$/, "Phone Number must be number.")
    .max(
      MaxPhoneNumberLength,
      `Phone Number must be at most ${MaxPhoneNumberLength} numbers.`
    ),
  company: Yup.object().required("Lead name is required").nullable(),

  status: Yup.object().required("Status is required").nullable(),
  // assigned: Yup.object().required("Organizer is required").nullable(),
  startDate: Yup.date().required("Date is required").nullable(),
  message: Yup.string()
    .nullable()
    .max(
      bigInpuMaxLength,
      `Message must be at most ${bigInpuMaxLength} characters.`
    ),
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
  const [userId, setUserId] = useState(0);
  const [alluserLoginData, setAlluserLoginData] = useState([{}]);
  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const storedId = window.localStorage.getItem("internalid");
      setUserId(storedId);
    }
  }, []);

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

      {
        queryKey: [RQ.currentUserLogin],
        queryFn: tkFetch.get(
          `${API_BASE_URL}/loginCurrentUser?userId=${userId}`
        ),
        enabled: !!userId,
      },
    ],
  });
  const [salesTeam, leadList, userLogin] = results;
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

  const {
    data: userLoginData,
    isLoading: userLoginLoading,
    isError: userLoginIsError,
    error: userLoginError,
  } = userLogin;

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
        leadListData?.list?.map((leadListType) => ({
          label: leadListType?.values?.companyname,
          value: leadListType?.id,
        }))
      );
    }

    if (userLoginData) {
      setAlluserLoginData(
        userLoginData?.list?.map((userLoginType) => ({
          label:
            userLoginType?.values?.entityid +
            " " +
            userLoginType?.values?.firstname +
            " " +
            userLoginType?.values?.lastname,
          value: userLoginType?.entityid,
        }))
      );
    }
  }, [salesTeamData, leadListData, userLoginData]);

  const { data, isLoading, isFetched, isError, error } = useQuery({
    queryKey: [RQ.lead, cid],
    queryFn: tkFetch.get(`${API_BASE_URL}/phoneCallActivity/${cid}`),
    enabled: !!cid,
  });

  useEffect(() => {
    if (userLoginData) {
      setValue(
        "assigned",
        userLoginData?.list[0]?.values.entityid +
          " " +
          userLoginData?.list[0]?.values.firstname +
          " " +
          userLoginData?.list[0]?.values.lastname
      );
    }
  }, [userLoginData, setValue, isFetched]);

  useEffect(() => {
    if (isFetched && Array.isArray(data) && data.length > 0) {
      const { bodyValues } = data[0];
      setValue("title", bodyValues?.title);
      setValue("phone", bodyValues?.phone);
      setValue("company", {
        value: bodyValues?.company[0]?.value,
        label: bodyValues?.company[0]?.text,
      });
      setValue("status", {
        // value: bodyValues?.status[0].text,
        label: bodyValues?.status[0].value,
      });
      // setValue(
      //   "assigned",
      //   bodyValues?.loginUserData?.list[0]?.values.entityid +
      //     " " +
      //     bodyValues?.loginUserData?.list[0]?.values.firstname +
      //     " " +
      //     bodyValues?.loginUserData?.list[0]?.values.lastname
      // );

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
        company: {
          value: formData.company.value,
          text: formData.company.label,
        },
        status: {
          value: formData.status.value,
          text: formData.status.label,
        },
        // assigned: {
        //   value: formData.assigned.value,
        //   text: formData.assigned.label,
        // },
        startdate: formatDateForAPI(formData.startdate),
        // completeddate: formatDateForAPI(formData.completeddate),
        message: formData.message,
      },
      filters: {
        bodyfilters: [["internalid", "anyof", cid]],
      },
    };
    phoneCallActivityPost.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Phone Call Updated Successfully");
        router.push(`${urls.phoneCall}`);
      },
      onError: (error) => {
        TkToastError("error while creating Lead", error);
      },
    });
  };

  const deletePhoneCall = useMutation({
    mutationFn: tkFetch.deleteWithIdInUrl(`${API_BASE_URL}/phoneCallActivity`),
  });

  const handleDeletePhoneCall = () => {
    if (!editMode) return;
    const apiData = {
      id: cid,
    };
    deletePhoneCall.mutate(apiData, {
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
    });
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
                  disableDelete={viewMode}
                  isEditAccess={viewMode}
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
                                  requiredStarOnLabel={editMode}
                                  disabled={viewMode}
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
                                      loading={leadListLoading}
                                      placeholder="Select Lead Name"
                                      requiredStarOnLabel={editMode}
                                      disabled={viewMode}
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
                                  requiredStarOnLabel={editMode}
                                  disabled={viewMode}
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
                                      requiredStarOnLabel={editMode}
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
                                <TkInput
                                  {...register("assigned")}
                                  id="assigned"
                                  name="assigned"
                                  type="text"
                                  labelName="Organizer"
                                  placeholder="Enter Organizer"
                                  disabled={viewMode}
                                />
                                {/* <Controller
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
                                      requiredStarOnLabel={editMode}
                                      disabled={viewMode}
                                    />
                                  )} */}
                                {/* /> */}
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
                                      requiredStarOnLabel={editMode}
                                      disabled={viewMode}
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
                                  disabled={viewMode}
                                />
                                {errors.message && (
                                  <FormErrorText>
                                    {errors.message.message}
                                  </FormErrorText>
                                )}
                              </TkCol>
                              <div className="d-flex mt-4 space-childern">
                                {editMode ? (
                                  <div
                                    className="ms-auto"
                                    id="update-form-btns"
                                  >
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
                                ) : null}
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
