import React, { useState, useEffect } from "react";
import TkInput from "../forms/TkInput";
import TkSelect from "../forms/TkSelect";
import TkButton from "../TkButton";
import TkCard, { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkForm from "../forms/TkForm";
import TkRow, { TkCol } from "../TkRow";
import TkDate from "../forms/TkDate";

import TkLoader from "../TkLoader";

import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";

import { API_BASE_URL, approvalsTab, bigInpuMaxLength, bigInpuMinLength, RQ, urls } from "../../utils/Constants";

import { TkToastSuccess } from "../TkToastContainer";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import { convertSecToTime } from "../../utils/time";
import { useRouter } from "next/router";
import TkNoData from "../TkNoData";
import useUser from "../../utils/hooks/useUser";
import TkAccessDenied from "../TkAccessDenied";

const schema = Yup.object({
  empName: Yup.string().required("Employee name is required"),

  projectName: Yup.string().required("Project name is required"),

  taskName: Yup.string().required("Task name is required"),

  date: Yup.date().nullable().required("Date is required"),

  duration: Yup.string().required("Duration is required"),

  description: Yup.string().max(bigInpuMaxLength, `Description must be at most ${bigInpuMaxLength} characters.`),

  rejectionNote: Yup.string()
    .min(bigInpuMinLength, `Notes should have at least ${bigInpuMinLength} character.`)
    .max(bigInpuMaxLength, `Notes should have at most ${bigInpuMaxLength} characters.`)
    .nullable()
    .required("Rejection note is required"),
}).required();

const ViewPendingTodayTask = ({ id }) => {
  const userData = useUser();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const tid = Number(id);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isApprove, setIsApprove] = useState(false);

  const { data, isLoading, isFetched, isError, error } = useQuery({
    queryKey: [RQ.TodayTask, tid],
    queryFn: tkFetch.get(`${API_BASE_URL}/todays-tasks/${tid}`),
    enabled: !!tid,
  });

  useEffect(() => {
    if (isFetched && Array.isArray(data) && data.length > 0) {
      const { createdBy, project, task, date, duration, description, ticket, rejectionNote } = data[0];
      setValue("empName", createdBy.name);
      setValue("projectName", project.name);
      setValue("taskName", task.name);
      setValue("date", date);
      setValue("duration", convertSecToTime(duration));
      setValue("description", description);
      setValue("rejectionNote", rejectionNote);
      setValue("ticket", ticket);
    }
  }, [data, isFetched, setValue]);

  const updateApprovalStatus = useMutation({
    mutationFn: tkFetch.patch(`${API_BASE_URL}/approvals/todays-tasks`),
  });

  const onClickApproved = (id) => {
    setIsApprove(true);
    const apiData = {
      id: [id],
      approved: true,
    };
    updateApprovalStatus.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Today's Task Approved");
        queryClient.invalidateQueries({
          queryKey: [RQ.allPendinTodayTask],
        });
        router.push(`${urls.approvals}?tab=${approvalsTab.todayTask}`);
        setIsApprove(false);
      },
      onError: (error) => {
        console.log("error", error);
        setIsApprove(false);
      },
    });
  };

  const onSubmit = (formData) => {
    const apiData = {
      id: [id],
      rejected: true,
      rejectionNote: formData.rejectionNote,
    };
    updateApprovalStatus.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Today's Task Rejected");
        queryClient.invalidateQueries({
          queryKey: [RQ.allPendinTodayTask],
        });
        router.push(`${urls.approvals}?tab=${approvalsTab.todayTask}`);
      },
      onError: (error) => {
        console.log("error", error);
      },
    });
  };

  //admin is always be going to be PM and supervisor, so we skip to check for admin
  if (userData.canBePM === false && userData.canBeSupervisor === false) {
    return <TkAccessDenied />;
  }

  return (
    <>
      {isLoading ? (
        <TkLoader />
      ) : isError ? (
        <FormErrorBox errMessage={error.message} />
      ) : data.length > 0 ? (
        <TkCard>
          <TkCardHeader>
            <h4 className="card-title">Today&apos;s Task Details</h4>
          </TkCardHeader>
          <TkCardBody>
            <TkForm onSubmit={handleSubmit(onSubmit)}>
              <TkRow className="g-3">
                <TkCol lg={4}>
                  <TkInput
                    {...register("empName")}
                    labelName="Employee Name"
                    name="empName"
                    id="empName"
                    placeholder="Employee Name"
                    type="text"
                    disabled={true}
                  />
                  {errors.empName && <FormErrorText>{errors.empName.message}</FormErrorText>}
                </TkCol>

                <TkCol lg={4}>
                  <Controller
                    name="date"
                    control={control}
                    render={({ field }) => (
                      <TkDate
                        {...field}
                        labelName="Date"
                        id="date"
                        placeholder="Select Date"
                        disabled={true}
                        options={{
                          altInput: true,
                          altFormat: "d M, Y",
                          dateFormat: "d M, Y",
                        }}
                      />
                    )}
                  />
                </TkCol>

                <TkCol lg={4}>
                  <TkInput
                    {...register("duration")}
                    labelName="Duration"
                    id="duration"
                    placeholder="Duration"
                    type="text"
                    disabled={true}
                  />
                  {errors.duration && <FormErrorText>{errors.duration.message}</FormErrorText>}
                </TkCol>

                {/* <TkCol lg={4}>
                <Controller
                  name="projectName"
                  control={control}
                  render={({ field }) => (
                    <TkSelect
                      {...field}
                      labelName="Project"
                      id="projectName"
                      placeholder="Select Project Name"
                      disabled={true}
                    />
                  )}
                />
              </TkCol> */}

                <TkCol lg={4}>
                  <TkInput
                    {...register("projectName")}
                    labelName="Project"
                    id="projectName"
                    placeholder="Select Project Name"
                    type="text"
                    disabled={true}
                  />
                  {errors.projectName && <FormErrorText>{errors.projectName.message}</FormErrorText>}
                </TkCol>

                {/* <TkCol lg={4}>
                <Controller
                  name="taskName"
                  control={control}
                  render={({ field }) => (
                    <TkSelect
                      {...field}
                      labelName="Task"
                      id="taskName"
                      placeholder="Select Task Name"
                      disabled={true}
                    />
                  )}
                />
              </TkCol> */}

                <TkCol lg={4}>
                  <TkInput
                    {...register("taskName")}
                    labelName="Task"
                    id="taskName"
                    placeholder="Select Task Name"
                    type="text"
                    disabled={true}
                  />
                  {errors.taskName && <FormErrorText>{errors.taskName.message}</FormErrorText>}
                </TkCol>

                <TkCol lg={4}>
                  <TkInput
                    {...register("ticket")}
                    labelName="Ticket"
                    id="ticket"
                    // placeholder="Select Task Name"
                    type="text"
                    disabled={true}
                  />
                  {errors.ticket && <FormErrorText>{errors.ticket.message}</FormErrorText>}
                </TkCol>

                {/* <TkCol lg={4}>
                <div>
                  <TkSelect
                    labelName="Approval Status"
                    id="timeSheetStatus"
                    name="timeSheetStatus"
                    //   disabled={true}
                    options={selectApprovalStatus}
                    defaultValue={selectApprovalStatus[0]}
                    //   onChange={onChange}
                  />
                </div>
              </TkCol> */}

                <TkCol lg={12}>
                  <div>
                    <TkInput
                      {...register("description")}
                      labelName="Description"
                      id="description"
                      placeholder="Task Description"
                      type="textarea"
                      disabled={true}
                    />
                    {errors.description && <FormErrorText>{errors.description.message}</FormErrorText>}
                  </div>
                </TkCol>

                <TkCol lg={12}>
                  <div>
                    <TkInput
                      {...register("rejectionNote")}
                      labelName="Rejection Note"
                      id="rejectionNote"
                      placeholder="Rejection Note "
                      type="textarea"
                      requiredStarOnLabel={true}
                    />
                    {errors.rejectionNote && <FormErrorText>{errors.rejectionNote.message}</FormErrorText>}
                  </div>
                </TkCol>

                {updateApprovalStatus.isError ? <FormErrorBox errMessage={updateApprovalStatus.error.message} /> : null}
                <div className="d-flex mt-4 space-childern">
                  <div className="ms-auto">
                    <TkButton
                      onClick={() => router.push(`${urls.approvals}?tab=${approvalsTab.todayTask}`)}
                      disabled={updateApprovalStatus.isLoading}
                      type="button"
                      color="secondary"
                    >
                      Cancel
                    </TkButton>{" "}
                    <TkButton loading={!isApprove && updateApprovalStatus.isLoading} type="submit" color="primary">
                      Reject
                    </TkButton>{" "}
                    <TkButton
                      onClick={() => onClickApproved(id)}
                      loading={isApprove && updateApprovalStatus.isLoading}
                      type="button"
                      color="primary"
                    >
                      Approve
                    </TkButton>
                  </div>
                </div>
              </TkRow>
            </TkForm>
          </TkCardBody>
        </TkCard>
      ) : (
        <TkNoData />
      )}
    </>
  );
};

export default ViewPendingTodayTask;
