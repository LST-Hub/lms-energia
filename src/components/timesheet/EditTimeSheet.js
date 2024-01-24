import React, { useState, useEffect } from "react";
import TkInput from "../forms/TkInput";
import TkSelect from "../forms/TkSelect";
import TkButton from "../TkButton";
import TkCard, { TkCardBody, TkCardTitle } from "../TkCard";
import TkForm from "../forms/TkForm";
import TkRow, { TkCol } from "../TkRow";
import TkDate from "../forms/TkDate";
import TkLoader from "../TkLoader";
import { timeEntryStatus } from "../../../lib/constants";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../../../src/components/forms/ErrorText";

import {
  API_BASE_URL,
  bigInpuMaxLength,
  filterFields,
  MaxNameLength,
  modes,
  RQ,
  urls,
} from "../../../src/utils/Constants";

import { TkToastSuccess } from "../TkToastContainer";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import TkNoData from "../TkNoData";
import { formatDateForAPI } from "../../utils/date";
import { useRouter } from "next/router";
import { convertSecToTime, convertTimeToSec, convertToTime, convertToTimeFotTimeSheet } from "../../utils/time";
import TkPageHead from "../TkPageHead";
import TkEditCardHeader from "../TkEditCardHeader";
import DeleteModal from "../../utils/DeleteModal";

const schema = Yup.object({
  projectName: Yup.object().nullable().required("Project name is required"),

  taskName: Yup.object().nullable().required("Task name is required"),

  date: Yup.date().nullable().required("Date is required"),

  // duration: Yup.string().required("Duration is required"),

  duration: Yup.string()
    .required("Duration is required")
    .matches(/^\d+(:[0-5][0-9]){0,2}$/, "duration cannot contain characters")
    .test("duration", "Duration should be less than 24 hours", function (value) {
      if (convertTimeToSec(value) > 86400 || value > 24) {
        return false;
      }
      return true;
    }),

  description: Yup.string().max(bigInpuMaxLength, `Description must be at most ${bigInpuMaxLength} characters.`),
  ticket: Yup.string().max(MaxNameLength, `Ticket should be less than ${MaxNameLength} characters`).nullable(),
  rejectionNote: Yup.string().nullable().max(bigInpuMaxLength, `Notes must be at most ${bigInpuMaxLength} characters.`),

  status: Yup.string().nullable(),
}).required();

const EditTimeSheet = ({ id, mode }) => {
  const tid = Number(id);
  const queryClient = useQueryClient();
  const router = useRouter();
  const viewMode = mode === modes.view;
  const editMode = mode === modes.edit;

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [projectDropdown, setProjectDropdown] = useState([]);
  const [taskDropdown, setTaskDropdown] = useState([]);
  const [submittedForApproval, setSubmittedForApproval] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [ticketManditory, setTicketManditory] = useState(false);

  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allProjects, RQ.myProjects],
        queryFn: tkFetch.get(`${API_BASE_URL}/project/list?myProjects=true`),
      },
      {
        queryKey: [RQ.allTasks, selectedProjectId, RQ.myTasks],
        queryFn: tkFetch.get(
          `${API_BASE_URL}/task/list${selectedProjectId ? `?projectId=${selectedProjectId}&myTasks=true` : ""}`
        ),
        enabled: !!selectedProjectId,
      },
    ],
  });

  const [project, task] = results;

  const { data: projectData, isLoading: isProjectLoading, isError: isProjectError, error: projectError } = project;

  const { data: taskData, isLoading: isTaskLoading, isError: isTaskError, error: taskError } = task;

  useEffect(() => {
    if (isProjectError) {
      console.log("projectError", projectError);
      TkToastError(projectError?.message);
    }
    if (isTaskError) {
      console.log("taskError", taskError);
      TkToastError(taskError?.message);
    }
  }, [isProjectError, isTaskError, projectError, taskError]);

  useEffect(() => {
    if (projectData) {
      setProjectDropdown(projectData.map((item) => ({ value: item.id, label: item.name, ticket: item.ticket })));
    }
    if (!selectedProjectId) {
      // if project is not selected then  dont show any tasks, and task dropdown is even not loading
      // but react query gives it loading and data null or previous, so implemntd this condition
      setTaskDropdown([]);
      return;
    }
    if (taskData) {
      setTaskDropdown(taskData.map((item) => ({ value: item.id, label: item.name })));
    }
  }, [projectData, selectedProjectId, taskData]);

  const { data, isLoading, isFetched, isError, error } = useQuery({
    queryKey: [RQ.timesheet, tid],
    queryFn: tkFetch.get(`${API_BASE_URL}/timesheet/${tid}`),
    enabled: !!tid,
  });

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const { project, task, date, duration, description, rejectionNote, approvedBy } = data[0];

      console.log("approvedBy", approvedBy);
      setValue("projectName", { value: project.id, label: project.name });
      setValue("taskName", { value: task.id, label: task.name });
      setValue("date", date);
      setValue("duration", convertSecToTime(duration));
      setValue("description", description);
      setValue("rejectionNote", rejectionNote);
      setValue("status", data[0].status);
      setValue("approvedBy", approvedBy?.name);
      setValue("ticket", data[0].ticket);
      setValue("allocatedTime", convertSecToTime(data[0]?.resourceAllocation?.duration || 0));
      setSelectedProjectId(project.id);
      setTicketManditory(project.ticket);
    }
  }, [data, setValue]);

  // TODO: if error then report it to error reporting service
  const {
    data: approvalData,
    isLoading: isApprovalLoading,
    isError: isApprovalError,
    error: approvalError,
  } = useQuery({
    queryKey: [RQ.workspaceSettings, RQ.workspaceApprovalSettings],
    queryFn: tkFetch.postWithBody(`${API_BASE_URL}/workspace/public-settings`, { approvals: true }),
  });

  const updateTimesheet = useMutation({
    mutationFn: tkFetch.putWithIdInUrl(`${API_BASE_URL}/timesheet`),
  });

  const onSubmit = (formData) => {
    if (ticketManditory && (formData.ticket === "" || formData.ticket === null)) {
      setError("ticket", { type: "manual", message: "Ticket is required" });
      return;
    }
    const apiData = {
      projectId: formData.projectName.value,
      taskId: formData.taskName.value,
      date: formatDateForAPI(formData.date),
      duration: convertTimeToSec(formData.duration),
      ticket: formData.ticket,
      description: formData.description,
      submittedForApproval: data[0].status !== timeEntryStatus.Rejected ? data[0]?.submittedForApproval : undefined,
    };
    updateTimesheet.mutate(
      { ...apiData, id: tid },
      {
        onSuccess: (data) => {
          TkToastSuccess("Timesheet Updated Successfully");
          queryClient.invalidateQueries({
            queryKey: [RQ.timesheet, tid],
          });
          router.push(`${urls.timesheets}`);
        },
        onError: (error) => {
          console.log("error while updating timesheet", error);
        },
      }
    );
  };

  const onClickSubmitForApproval = () => {
    const formData = getValues();
    if (ticketManditory && (formData.ticket === "" || formData.ticket === null)) {
      setError("ticket", { type: "manual", message: "Ticket is required" });
      return;
    }
    if (formData.projectName === null) {
      setError("projectName", { type: "manual", message: "Project Name is required" });
      return;
    }
    if (formData.taskName === null) {
      setError("taskName", { type: "manual", message: "Task Name is required" });
      return;
    }
    if (formData.duration === "") {
      setError("duration", { type: "manual", message: "Duration is required" });
      return;
    }
    if (convertTimeToSec(formData.duration) > 360000000) {
      // show schema error
      setError("duration", {
        type: "manual",
        message: "Duration cannot be greater than 100000 hours",
      });
      return;
    }
    if (!formData.date) {
      setError("date", { type: "manual", message: "Date is required" });
      return;
    }
    setSubmittedForApproval(true);
    const apiData = {
      projectId: formData.projectName.value,
      taskId: formData.taskName.value,
      date: formatDateForAPI(formData.date),
      duration: convertTimeToSec(formData.duration),
      description: formData.description,
      submittedForApproval: true,
      status: timeEntryStatus.Pending,
      ticket: formData.ticket,
    };
    updateTimesheet.mutate(
      { ...apiData, id: tid },
      {
        onSuccess: (data) => {
          TkToastSuccess("Timesheet Submitted for Approval");
          queryClient.invalidateQueries({
            queryKey: [RQ.timesheet, tid],
          });
          router.push(`${urls.timesheets}`);
        },
        onError: (error) => {
          console.log("error while updating timesheet", error);
        },
      }
    );
  };

  const deleteTimesheet = useMutation({
    mutationFn: tkFetch.deleteWithIdInUrl(`${API_BASE_URL}/timesheet`),
  });

  const deleteTimesheetHandler = () => {
    if (data[0].status !== timeEntryStatus.Draft) return;
    const apiData = {
      id: tid,
    };
    deleteTimesheet.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Timesheet Deleted Successfully");
        queryClient.invalidateQueries({
          queryKey: [RQ.timesheet, tid],
        });
        router.push(`${urls.timesheets}`);
      },
      onError: (error) => {
        console.log("error while deleting timesheet", error);
      },
    });
  };

  const [duration, setDuration] = useState("");
  function updateDuration(e) {
    setDuration(e.target.value);
  }

  const toggleDeleteModel = () => {
    setDeleteModal(true);
  };
  return (
    <>
      <DeleteModal
        show={deleteModal}
        onDeleteClick={() => {
          setDeleteModal(false);
          deleteTimesheetHandler();
        }}
        onCloseClick={() => setDeleteModal(false)}
      />
      {/* <TkRow className="g-4">
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
                  options={{
                    altInput: true,
                    dateFormat: "d M, Y",
                  }}
                  requiredStarOnLabel={editMode}
                  // disabled={viewMode || data[0].status === timeEntryStatus.Approved ? true : false}
                />
              )}
            />
            {errors.date?.message ? <FormErrorText>{errors.date?.message}</FormErrorText> : null}
          </TkCol>

          <TkCol lg={4}>
            <Controller
              name="totalDuration"
              control={control}
              render={({ field }) => (
                <TkInput
                  labelName="Total Duration"
                  id={"totalDuration"}
                  type="text"
                  placeholder="Total Duration"
                  readOnly={true}
                  //HH:MM format
                  value={
                    data?.length > 0
                      ? convertSecToTime(
                          data?.reduce((acc, curr) => {
                            return acc + curr.duration;
                          }, 0)
                        )
                      : ""
                  }
                />
              )}
            />
          </TkCol>
        </TkRow> */}
      {isLoading ? (
        <TkLoader />
      ) : isError ? (
        <FormErrorBox errMessage={error?.message} />
      ) : data?.length > 0 ? (
        <>
          <TkPageHead>
            <title>{`Time: ${data[0].project.name}`}</title>
          </TkPageHead>
          {/* <TkCard> */}

          <TkEditCardHeader
            title={viewMode ? "Timesheet Details" : "Edit Timesheet"}
            onDeleteClick={deleteTimesheetHandler}
            isEditAccess={data[0].status === timeEntryStatus.Approved ? false : viewMode}
            disableDelete={viewMode || data[0].status !== timeEntryStatus.Draft}
            editLink={`${urls.timesheetEdit}/${tid}`}
            toggleDeleteModel={toggleDeleteModel}
          />
          {deleteTimesheet.isError ? <FormErrorBox errMessage={deleteTimesheet.error?.message} /> : null}
          <TkCardBody className="mt-4">
            <TkForm onSubmit={handleSubmit(onSubmit)}>
              <TkRow className="g-3">
                <TkCol lg={4}>
                  <Controller
                    name="projectName"
                    control={control}
                    render={({ field }) => (
                      <TkSelect
                        {...field}
                        labelName="Project"
                        // tooltip="Select Project Name"
                        // labelId={"_projectName"}
                        id="projectName"
                        placeholder="Select Project Name"
                        options={projectDropdown}
                        loading={isProjectLoading}
                        onChange={(e) => {
                          field.onChange(e);
                          setTicketManditory(e?.ticket === true ? true : false);
                          // invaliadte the query of tasks, and fetch new tasks
                          queryClient.invalidateQueries({
                            queryKey: [RQ.allTaskList, selectedProjectId, RQ.myTasks],
                          });
                          setSelectedProjectId(e ? e.value : null);
                          setValue("taskName", null); // remove the previous selected task
                        }}
                        {...(editMode && data[0].status !== timeEntryStatus.Approved
                          ? { requiredStarOnLabel: true }
                          : { requiredStarOnLabel: false })}
                        disabled={viewMode || data[0].status === timeEntryStatus.Approved ? true : false}
                      />
                    )}
                  />
                  {errors.projectName?.message ? <FormErrorText>{errors.projectName?.message}</FormErrorText> : null}
                </TkCol>

                <TkCol lg={4}>
                  <Controller
                    name="taskName"
                    control={control}
                    render={({ field }) => (
                      <TkSelect
                        {...field}
                        id="taskName"
                        labelName="Task"
                        // tooltip="Select Task Name"
                        // labelId={"_taskName"}
                        placeholder="Select Task Name"
                        options={taskDropdown}
                        loading={selectedProjectId && isTaskLoading}
                        {...(editMode && data[0].status !== timeEntryStatus.Approved
                          ? { requiredStarOnLabel: true }
                          : { requiredStarOnLabel: false })}
                        disabled={viewMode || data[0].status === timeEntryStatus.Approved ? true : false}
                      />
                    )}
                  />
                  {errors.taskName?.message ? <FormErrorText>{errors.taskName?.message}</FormErrorText> : null}
                </TkCol>

                <TkCol lg={4}>
                  <TkInput
                    {...register("duration")}
                    labelName="Duration (HH:MM)"
                    // tooltip="Enter Duration"
                    // labelId={"_duration"}
                    id="duration"
                    type="text"
                    placeholder="Enter Duration"
                    {...(editMode && data[0].status !== timeEntryStatus.Approved
                      ? { requiredStarOnLabel: true }
                      : { requiredStarOnLabel: false })}
                    onBlur={(e) => {
                      setValue("duration", convertToTimeFotTimeSheet(e.target.value));
                    }}
                    disabled={viewMode || data[0].status === timeEntryStatus.Approved ? true : false}
                  />
                  {errors.duration?.message ? <FormErrorText>{errors.duration?.message}</FormErrorText> : null}
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
                        options={{
                          altInput: true,
                          dateFormat: "d M, Y",
                        }}
                        {...(editMode && data[0].status !== timeEntryStatus.Approved
                          ? { requiredStarOnLabel: true }
                          : { requiredStarOnLabel: false })}
                        disabled={viewMode || data[0].status === timeEntryStatus.Approved ? true : false}
                      />
                    )}
                  />
                  {errors.date?.message ? <FormErrorText>{errors.date?.message}</FormErrorText> : null}
                </TkCol>

                <TkCol lg={4}>
                  <TkInput
                    {...register("status")}
                    id="status"
                    className="form-control"
                    type="text"
                    labelName="Status"
                    // tooltip="Enter Status"
                    // labelId={"_status"}
                    disabled={true}
                  />
                </TkCol>

                <TkCol lg={4}>
                  <TkInput
                    {...register("ticket")}
                    id="ticket"
                    className="form-control"
                    type="text"
                    labelName="Ticket"
                    placeholder="Enter Ticket Number"
                    // tooltip="Enter Status"
                    // labelId={"_status"}
                    {...(editMode && data[0].status !== timeEntryStatus.Approved && ticketManditory
                      ? { requiredStarOnLabel: true }
                      : { requiredStarOnLabel: false })}
                    // requiredStarOnLabel={ticketManditory}
                    disabled={viewMode || data[0].status === timeEntryStatus.Approved ? true : false}
                  />
                  {errors.ticket?.message ? <FormErrorText>{errors.ticket?.message}</FormErrorText> : null}
                </TkCol>

                <TkCol lg={4}>
                  <TkInput
                    {...register("allocatedTime")}
                    id="allocatedTime"
                    className="form-control"
                    type="text"
                    labelName="Allocated Time (HH:MM)"
                    disabled={true}
                  />
                </TkCol>

                <TkCol lg={4}>
                  <TkInput
                    {...register("approvedBy")}
                    id="approvedBy"
                    className="form-control"
                    type="text"
                    labelName="Approved By"
                    disabled={true}
                  />
                </TkCol>

                <TkCol lg={12}>
                  <div>
                    <TkInput
                      {...register("description", {
                        maxLength: { value: 2000, message: "Description should be less than 2000 characters" },
                      })}
                      labelName="Description"
                      // tooltip="Enter Description"
                      // labelId={"_description"}
                      id="description"
                      placeholder="Enter Description "
                      type="textarea"
                      disabled={viewMode || data[0].status === timeEntryStatus.Approved ? true : false}
                    />
                  </div>
                  {errors.description?.message ? <FormErrorText>{errors.description?.message}</FormErrorText> : null}
                </TkCol>

                <TkCol lg={12}>
                  <div>
                    <TkInput
                      {...register("rejectionNote")}
                      labelName="Rejection Note"
                      // tooltip="Enter Rejection Note"
                      // labelId={"_rejectionNote"}
                      id="rejectionNote"
                      placeholder="Enter Rejection Note "
                      type="textarea"
                      disabled={true}
                    />
                    {errors.rejectionNote?.message ? (
                      <FormErrorText>{errors.rejectionNote?.message}</FormErrorText>
                    ) : null}
                  </div>
                </TkCol>
                {updateTimesheet.isError ? <FormErrorBox errMessage={updateTimesheet.error?.message} /> : null}
                {editMode && data[0].status !== timeEntryStatus.Approved ? (
                  <div className="d-flex mt-4 space-childern">
                    <div className="ms-auto">
                      <TkButton type="button" onClick={() => router.push(`${urls.timesheets}`)} color="secondary">
                        Cancel
                      </TkButton>{" "}
                      <TkButton
                        disabled={submittedForApproval && updateTimesheet.isLoading}
                        loading={!submittedForApproval && updateTimesheet.isLoading}
                        type="submit"
                        color={
                          data[0].status === timeEntryStatus.Draft || data[0].status === timeEntryStatus.Rejected
                            ? "secondary"
                            : "primary"
                        }
                      >
                        Update
                      </TkButton>{" "}
                      {data[0].status !== timeEntryStatus.Pending && (
                        <TkButton
                          type="button"
                          disabled={!submittedForApproval && updateTimesheet.isLoading}
                          loading={submittedForApproval && updateTimesheet.isLoading}
                          onClick={handleSubmit(onClickSubmitForApproval)}
                          color="primary"
                        >
                          {!isApprovalLoading && !approvalData?.[0]?.approvalEnabledForTS
                            ? data[0].status === timeEntryStatus.Draft
                              ? "Submit"
                              : "Resubmit "
                            : data[0].status === timeEntryStatus.Rejected
                            ? "Resubmit For Approval"
                            : "Submit For Approval"}
                        </TkButton>
                      )}
                    </div>
                  </div>
                ) : null}
              </TkRow>
            </TkForm>
          </TkCardBody>
          {/* </TkCard> */}
        </>
      ) : (
        <TkNoData />
      )}
    </>
  );
};

export default EditTimeSheet;
