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
  API_BASE_URL,
  RQ,
  modes,
  PUBLIC_BUCKET_BASE_URL,
  urls,
  leadTypes,
  stausTypes,
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
import { permissionTypeIds } from "../../../DBConstants";
import hasPageModeAccess from "../../utils/hasPageAccess";
import Image from "next/image";
import axios from "axios";
import TkDate from "../forms/TkDate";
import DeleteModal from "../../utils/DeleteModal";
import TkLoader from "../TkLoader";
import TkEditCardHeader from "../TkEditCardHeader";
import { formatDateForAPI } from "../../utils/date";

const schema = Yup.object({
  title: Yup.string()
    .required("Subject is required")
    .max(MaxNameLength, `Subject must be at most ${MaxNameLength} characters.`)
    .nullable(),
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

const EditTask = ({ id, userData, mode }) => {
  const router = useRouter();
  const viewMode = mode === modes.view;
  const editMode = mode === modes.edit;
  const tid = Number(id);
  const accessLevel = useUserAccessLevel(permissionTypeIds.users);
  const [isTaskk, setIsTaskk] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

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
  useEffect(() => {
    setIsTaskk(true);
  }, []);
  const queryClient = useQueryClient();

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

  const { data, isLoading, isFetched, isError, error } = useQuery({
    queryKey: [RQ.lead, tid],
    queryFn: tkFetch.get(`${API_BASE_URL}/taskActivity/${tid}`),
    enabled: !!tid,
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
      setValue("priority", {
        value: bodyValues?.priority?.text,
        label: bodyValues?.priority?.value,
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
      setValue("dueDate", bodyValues?.dueDate);
      setValue("message", bodyValues?.message);
    }
  }, [data, setValue, isFetched]);

  const taskActivityPost = useMutation({
    mutationFn: tkFetch.patch(`${API_BASE_URL}/taskActivity/${tid}`),
  });

  const onSubmit = (formData) => {
    const apiData = {
      resttype: "Update",
      recordtype: "task",
      bodyfields: {
        title: formData.title,
        company: {
          value: formData.company.value,
          label: formData.company.text,
        },
        priority: {
          value: formData.priority.value,
          label: formData.priority.text,
        },
        status: {
          value: formData.status.value,
          label: formData.status.text,
        },
        startdate: formatDateForAPI(formData.startdate),
        dueDate: formatDateForAPI(formData.dueDate),
        message: formData.message,
      },
    };
    taskActivityPost.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Task Created Successfully");
        router.push(`${urls.taskk}`);
      },
      onError: (error) => {
        TkToastError("error while creating Lead", error);
      },
    });
  };

  const deleteTask = useMutation({
    mutationFnn: tkFetch.deleteWithIdInUrl(`${API_BASE_URL}/taskActivity`),
  });

  const handleDeleteTask = () => {
    if (!editMode) return;
    const apiData = {
      id: tid,
    };
    deleteTask.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Task Deleted Successfully");
        queryClient.invalidateQueries({
          queryKey: [RQ.allTask, tid],
        });
        router.push(`${urls.taskk}`);
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
              handleDeleteTask();
              setDeleteModal(false);
            }}
            onCloseClick={() => setDeleteModal(false)}
          />
          <div>
            <TkRow className="justify-content-center">
              <TkCol lg={12}>
                <TkEditCardHeader
                  title={viewMode ? "Task Details" : "Edit Task"}
                  viewMode={viewMode}
                  editLink={`${urls.taskkEdit}/${tid}`}
                  onDeleteClick={handleDeleteTask}
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
                                  labelName="Title"
                                  placeholder="Enter Title"
                                  requiredStarOnLabel={true}
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
                                      labelId={"_status"}
                                      id="company"
                                      options={[
                                        { label: "Email", value: "Email" },
                                        {
                                          label: "Direct Call",
                                          value: "Direct Call",
                                        },
                                        {
                                          label: "Social Media",
                                          value: "Social Media",
                                        },
                                        { label: "Portals", value: "Portals" },
                                      ]}
                                      placeholder="Select Lead Name"
                                      requiredStarOnLabel={true}
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
                                      disabled={viewMode}
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
                                      disabled={viewMode}
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

export default EditTask;
