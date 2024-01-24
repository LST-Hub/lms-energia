import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";
import TkForm from "../forms/TkForm";
import TkInput from "../forms/TkInput";
import TkSelect from "../forms/TkSelect";
import TkButton from "../TkButton";
import { TkCardBody } from "../TkCard";
import TkRow, { TkCol } from "../TkRow";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL, bigInpuMaxLength, MaxNameLength, modes, RQ, urls } from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { timeEntryStatus } from "../../../lib/constants";
import { useEffect } from "react";
import { TkToastSuccess } from "../TkToastContainer";
import { useRouter } from "next/router";
import { convertSecToTime, convertTimeToSec, convertToTimeFotTimeSheet } from "../../utils/time";
import TkLoader from "../TkLoader";
import TkNoData from "../TkNoData";
import TkDate from "../forms/TkDate";
import { formatDateForAPI } from "../../utils/date";
import WarningModal from "../../utils/WarningModal.";
import TkPageHead from "../TkPageHead";
import TkEditCardHeader from "../TkEditCardHeader";
import DeleteModal from "../../utils/DeleteModal";

const schema = Yup.object({
  projectName: Yup.object().nullable().required("Project Name is required"),

  taskName: Yup.object().nullable().required("Task name is required"),
  date: Yup.date().nullable().required("Date is required"),
  // duration: Yup.string().required("Duration is required"), // we are handling it manually with usestate
  duration: Yup.string()
    .required("Duration is required")
    .matches(/^\d+(:[0-5][0-9]){0,2}$/, "Duration can not contains characters")
    .test("duration", "Duration should be less than 24 hours", function (value) {
      if (convertTimeToSec(value) > 86400 || value > 24) {
        return false;
      }
      return true;
    }),
  ticket: Yup.string().max(MaxNameLength, `Ticket should be less than ${MaxNameLength} characters`).nullable(),
  description: Yup.string().max(bigInpuMaxLength, `Description must be at most ${bigInpuMaxLength} characters.`),
  status: Yup.string(),
}).required();

function EditTodayTask({ id, mode }) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const router = useRouter();
  const did = Number(id);
  const viewMode = mode === modes.view;
  const editMode = mode === modes.edit;

  const [projectDropdown, setProjectDropdown] = useState([]);
  const [taskDropdown, setTaskDropdown] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [submittedForApproval, setSubmittedForApproval] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [ticketManditory, setTicketManditory] = useState(false);

  const queryClient = useQueryClient();
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
      setProjectDropdown(
        projectData.map((project) => ({
          value: project.id,
          label: project.name,
        }))
      );
    }
    if (!selectedProjectId) {
      // if project is not selected then  dont show any tasks, and task dropdown is even not loading
      // but react query gives it loading and data null or previous, so implemntd this condition
      setTaskDropdown([]);
      return;
    }
    if (taskData) {
      setTaskDropdown(taskData.map((task) => ({ value: task.id, label: task.name })));
    }
  }, [projectData, selectedProjectId, taskData]);

  // const addForm = () => {
  //   setFormIds([...formIds, formIds.length]);
  // };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.TodayTask, did],
    queryFn: tkFetch.get(`${API_BASE_URL}/todays-tasks/${did}`),
    enabled: !!did,
  });

  // TODO: if error then report it to error reporting service
  const {
    data: approvalData,
    isLoading: isApprovalLoading,
    isError: isApprovalError,
    error: approvalError,
  } = useQuery({
    queryKey: [RQ.workspaceSettings, RQ.workspaceApprovalSettings],
    queryFn: tkFetch.postWithBody(`${API_BASE_URL}/workspace/public-settings`, {
      approvals: true,
    }),
  });

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const { project, task, duration, description, rejectionNote, date,approvedBy } = data[0];
      setValue("projectName", { value: project.id, label: project.name });
      setValue("taskName", { value: task.id, label: task.name });
      setValue("date", date || null);
      setValue("description", description);
      setValue("rejectionNote", rejectionNote);
      setValue("status", data[0].status);
      setValue("ticket", data[0].ticket);
      setValue("duration", convertSecToTime(duration));
      // setSelectedDuration({ duration: convertSecToTime(duration) });
      setValue("allocatedTime", convertSecToTime(data[0]?.resourceAllocation?.duration || 0));
      setValue("approvedBy", approvedBy?.name);
      setSelectedProjectId(project.id);
      setTicketManditory(project.ticket);
    }
  }, [data, setValue]);

  const updateTodayTask = useMutation({
    mutationFn: tkFetch.putWithIdInUrl(`${API_BASE_URL}/todays-tasks`),
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
      description: formData.description,
      submittedForApproval: data[0].status !== timeEntryStatus.Rejected ? data[0]?.submittedForApproval : undefined,
      ticket: formData.ticket,
    };
    updateTodayTask.mutate(
      { ...apiData, id: did },
      {
        onSuccess: (data) => {
          TkToastSuccess("Today's Task Updated Successfully");
          router.push(`${urls.todaysTasks}`);
        },
        onError: (error) => {
          console.log("error", error);
        },
      }
    );
  };

  const onClickSubmitForApproval = () => {
    // console.log("getValues", getValues());
    const formData = getValues();
    if (ticketManditory && (formData.ticket === "" || formData.ticket === null)) {
      setError("ticket", { type: "manual", message: "Ticket is required" });
      return;
    }
    if (formData.duration > 24) {
      // show schema error
      setError("duration", {
        type: "manual",
        message: "Duration should be less than 24 hours",
      });
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
      ticket: formData.ticket,
    };
    updateTodayTask.mutate(
      { ...apiData, id: did },
      {
        onSuccess: (data) => {
          TkToastSuccess("Today's Task Submitted For Approval");
          router.push(`${urls.todaysTasks}`);
        },
        onError: (error) => {
          console.log("error", error);
        },
      }
    );
  };

  const onConvertToTimesheet = () => {
    const formData = getValues();
    if (isDirty || formData.date !== data[0].date || formData.duration !== convertSecToTime(data[0].duration)) {
      setConfirmModal(true);
    } else {
      router.push(`${urls.timesheetAdd}?todaysTaskId=${did}`);
    }
  };

  const deleteTodayTask = useMutation({
    mutationFn: tkFetch.deleteWithIdInUrl(`${API_BASE_URL}/todays-tasks`),
  });

  const deleteTodayTaskHandler = () => {
    if (data[0].status !== timeEntryStatus.Draft) return;
    const apiData = {
      id: did,
    };
    deleteTodayTask.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Today's Task Deleted Successfully");
        queryClient.invalidateQueries({
          queryKey: [RQ.TodayTask, did],
        });
        router.push(`${urls.todaysTasks}`);
      },
      onError: (error) => {
        console.log("error", error);
      },
    });
  };

  const toggleDeleteModel = () => {
    setDeleteModal(true);
  };

  return (
    <div>
      <DeleteModal
        show={deleteModal}
        onDeleteClick={() => {
          setDeleteModal(false);
          deleteTodayTaskHandler();
        }}
        onCloseClick={() => setDeleteModal(false)}
      />
      <WarningModal
        show={confirmModal}
        warnText="You have unsaved changes. Do you want to continue?"
        onOkClick={() => {
          setConfirmModal(false);
          router.push(`${urls.timesheetAdd}?todaysTaskId=${did}`);
        }}
        onCancelClick={() => setConfirmModal(false)}
      />
      <TkRow className="justify-content-center mx-auto">
        <TkCol lg={12}>
          {isLoading ? (
            <TkLoader />
          ) : isError ? (
            <FormErrorBox errMessage={error?.message} />
          ) : data?.length > 0 ? (
            <>
              <TkPageHead>
                <title>{`TTask: ${data[0].project.name}`}</title>
              </TkPageHead>
              {/* <TkCard id="tasksList"> */}
              {/* <TkCardHeader className="border-0">
                  <div className="d-flex align-items-center">
                    <TkCardTitle tag="h5" className="mb-0 flex-grow-1">
                      Today&apos;s Task
                    </TkCardTitle>
                  </div>
                </TkCardHeader> */}
              <TkEditCardHeader
                title={viewMode ? "Today's Task Details" : "Edit Today's Task"}
                onDeleteClick={deleteTodayTaskHandler}
                isEditAccess={data[0].status === timeEntryStatus.Approved ? false : viewMode}
                disableDelete={viewMode || data[0].status !== timeEntryStatus.Draft}
                editLink={`${urls.todaysTaskEdit}/${did}`}
                toggleDeleteModel={toggleDeleteModel}
              />
              {deleteTodayTask.isError ? <FormErrorBox errMessage={deleteTodayTask.error?.message} /> : null}
              <TkCardBody className="table-padding pt-0">
                <TkForm onSubmit={handleSubmit(onSubmit)}>
                  <div className="todays-tasks-forms">
                    <TkRow className="g-3 mt-5">
                      <TkCol lg={4}>
                        <div>
                          <Controller
                            name="projectName"
                            control={control}
                            render={({ field }) => (
                              <TkSelect
                                {...field}
                                labelName="Project Name"
                                // tooltip="Select Project Name"
                                // labelId={"_projectName"}
                                id="projectName"
                                placeholder="Select Project Name"
                                loading={isProjectLoading}
                                options={projectDropdown}
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
                                // requiredStarOnLabel={editMode}
                                disabled={viewMode || data[0].status === timeEntryStatus.Approved ? true : false}
                              />
                            )}
                          />
                          {errors.projectName && <FormErrorText>{errors.projectName.message}</FormErrorText>}
                        </div>
                      </TkCol>
                      <TkCol lg={4}>
                        <Controller
                          name="taskName"
                          control={control}
                          render={({ field }) => (
                            <TkSelect
                              {...field}
                              labelName="Task Name"
                              // tooltip="Select Task Name"
                              // labelId={"_taskName"}
                              id="taskName"
                              placeholder="Select Task Name"
                              loading={selectedProjectId && isTaskLoading}
                              options={taskDropdown}
                              {...(editMode && data[0].status !== timeEntryStatus.Approved
                                ? { requiredStarOnLabel: true }
                                : { requiredStarOnLabel: false })}
                              disabled={viewMode || data[0].status === timeEntryStatus.Approved ? true : false}
                            />
                          )}
                        />
                        {errors.taskName && <FormErrorText>{errors.taskName.message}</FormErrorText>}
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
                        {errors.duration ? <FormErrorText>{errors.duration?.message}</FormErrorText> : null}
                      </TkCol>
                      <TkCol lg={4}>
                        <Controller
                          name="date"
                          control={control}
                          render={({ field }) => (
                            <TkDate
                              {...field}
                              labelName="Date"
                              // tooltip="Select Date"
                              // labelId={"_date"}
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
                        <div>
                          <TkInput
                            {...register("status")}
                            labelName="Status"
                            // tooltip="Status" labelId={"_status"}
                            id="status"
                            type="text"
                            disabled={true}
                          />
                        </div>
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
                          {...(ticketManditory && editMode && data[0].status !== timeEntryStatus.Approved
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
                              maxLength: {
                                value: 2000,
                                message: "Description should be less than 2000 characters",
                              },
                            })}
                            labelName="Description"
                            // tooltip="Enter Description"
                            // labelId={"_description"}
                            id="description"
                            type="textarea"
                            placeholder="Enter Description"
                            disabled={viewMode || data[0].status === timeEntryStatus.Approved ? true : false}
                          />
                          {errors.description?.message ? (
                            <FormErrorText>{errors.description?.message}</FormErrorText>
                          ) : null}
                        </div>
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
                        </div>
                      </TkCol>
                    </TkRow>

                    <TkRow className="justify-content-center justify-content-md-end align-items-center mt-4 gap-1">
                      {updateTodayTask.isError ? <FormErrorBox errMessage={updateTodayTask.error?.message} /> : null}

                      <TkCol md={10} lg={6} className="space-childern-sm text-end">
                        {editMode && data[0].status !== timeEntryStatus.Approved ? (
                          <>
                            <TkButton
                              disabled={updateTodayTask.isLoading}
                              onClick={() => router.push(`${urls.todaysTasks}`)}
                              className="ms-auto"
                              color="secondary"
                              type="button"
                            >
                              Cancel
                            </TkButton>
                            <TkButton
                              disabled={submittedForApproval && updateTodayTask.isLoading}
                              loading={!submittedForApproval && updateTodayTask.isLoading}
                              color={data[0].status === timeEntryStatus.Pending ? "primary" : "secondary"}
                              type="submit"
                            >
                              Update
                            </TkButton>
                            {data[0].status !== timeEntryStatus.Pending && (
                              <TkButton
                                disabled={!submittedForApproval && updateTodayTask.isLoading}
                                loading={submittedForApproval && updateTodayTask.isLoading}
                                onClick={handleSubmit(onClickSubmitForApproval)}
                                type="button"
                                color={
                                  data[0].status === timeEntryStatus.Draft ||
                                  data[0].status === timeEntryStatus.Rejected
                                    ? "primary"
                                    : "secondary"
                                }
                              >
                                {!isApprovalLoading && !approvalData?.[0]?.approvalEnabledForTT
                                  ? data[0].status === timeEntryStatus.Draft
                                    ? "Submit"
                                    : "Resubmit "
                                  : data[0].status === timeEntryStatus.Rejected
                                  ? "Resubmit For Approval"
                                  : "Submit For Approval"}
                              </TkButton>
                            )}
                          </>
                        ) : null}
                        <TkButton
                          color={
                            data[0].status === timeEntryStatus.Draft ||
                            data[0].status === timeEntryStatus.Rejected ||
                            data[0].status === timeEntryStatus.Pending
                              ? "secondary"
                              : "primary"
                          }
                          disabled={updateTodayTask.isLoading}
                          onClick={onConvertToTimesheet}
                          type="button"
                        >
                          Convert To Timesheet
                        </TkButton>
                      </TkCol>
                    </TkRow>
                  </div>
                </TkForm>
              </TkCardBody>
              {/* </TkCard> */}
            </>
          ) : (
            <TkNoData />
          )}
        </TkCol>
      </TkRow>
    </div>
  );
}

export default EditTodayTask;
