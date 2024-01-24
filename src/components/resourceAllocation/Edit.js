import React, { useState, useEffect } from "react";
import TkButton from "../TkButton";
import TkRow, { TkCol } from "../TkRow";
import TkInput from "../forms/TkInput";
import TkSelect from "../forms/TkSelect";
import TkDate from "../forms/TkDate";
import { convertSecToTime, convertTimeToSec, convertToDayTime } from "../../utils/time";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import { useForm, Controller } from "react-hook-form";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";
import { RQ, API_BASE_URL, urls, modes } from "../../utils/Constants";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import { formatDateForAPI } from "../../utils/date";
import { TkCardBody } from "../TkCard";
import { useRouter } from "next/router";
import TkForm from "../forms/TkForm";
import TkEditCardHeader from "../TkEditCardHeader";
import TkLoader from "../TkLoader";
import TkNoData from "../TkNoData";
import { repeatOptions } from "../../utils/Constants";

const EditResourceAllocation = ({ id, mode }) => {
  //   const accessLevel = useUserAccessLevel(permissionTypeIds.projAndTask);
  const viewMode = mode === modes.view;
  const editMode = mode === modes.edit;
  const rid = Number(id);
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm({});
  const router = useRouter();
  const [projectDropdown, setProjectDropdown] = useState([]);
  const [allUsersData, setAllUsersData] = useState([]);
  const [taskDropdown, setTaskDropdown] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showDateRange, setShowDateRange] = useState("single");

  const queryClient = useQueryClient();

  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allProjectList],
        queryFn: tkFetch.get(`${API_BASE_URL}/project/list`),
      },
      {
        queryKey: [RQ.allTaskList, selectedProjectId],
        queryFn: tkFetch.get(`${API_BASE_URL}/task/list${selectedProjectId ? `?projectId=${selectedProjectId}` : ""}`),
        enabled: !!selectedProjectId,
      },
      {
        queryKey: [RQ.allUsersList, selectedTaskId],
        queryFn: tkFetch.get(`${API_BASE_URL}/users/list${selectedTaskId ? `?taskId=${selectedTaskId}` : ""}`),
        enabled: !!selectedTaskId,
      },
    ],
  });

  const { data, isLoading, isFetched, isError, error } = useQuery({
    queryKey: [RQ.resourceAllocation, rid],
    queryFn: tkFetch.get(`${API_BASE_URL}/resource-allocation/${rid}`),
    enabled: !!rid,
  });

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const { project, task, date, startDate, endDate, duration, allocatedUser, repetationType } = data[0];
      setSelectedProjectId(project.id);
      setValue("projectName", {
        value: project.id,
        label: project.name,
      });
      setSelectedTaskId(task.id);
      setValue("taskName", { value: task.id, label: task.name });
      setValue("date", date === null ? [new Date(startDate), new Date(endDate)] : new Date(date));
      setValue("duration", convertSecToTime(duration));
      const repeatOption = repeatOptions.find((item) => item.value === repetationType);
      setValue("repeat", repeatOption);
      setShowDateRange(repetationType === "Daily" ? "range" : "single");
      setValue("asignUsers", { value: allocatedUser.id, label: allocatedUser.name });
    }
  }, [data, setValue]);

  const [project, task, users] = results;
  const { data: projectData, isLoading: isProjectLoading, isError: isProjectError, error: projectError } = project;
  const { data: taskData, isLoading: isTaskLoading, isError: isTaskError, error: taskError } = task;
  const { data: usersData, isLoading: isUsersLoading, isError: isUsersError, error: usersError } = users;

  useEffect(() => {
    if (projectData) {
      setProjectDropdown(projectData?.map((item) => ({ id: item.id, value: item.id, label: item.name })));
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
    if (!selectedTaskId) {
      setAllUsersData([]);
      return;
    }
    if (usersData) {
      setAllUsersData(usersData?.map((item) => ({ value: item.id, id: item.id, label: item.name })));
    }
  }, [projectData, taskData, usersData, selectedProjectId, selectedTaskId]);

  const updateResourceAllocation = useMutation({
    mutationFn: tkFetch.putWithIdInUrl(`${API_BASE_URL}/resource-allocation`),
  });

  const onSubmit = (formData) => {
    const apiData = {
      id: rid,
      projectId: formData.projectName.value,
      taskId: formData.taskName.value,
      date: Array.isArray(formData.date) ? undefined : formatDateForAPI(formData.date),
      startDate: Array.isArray(formData.date) ? formatDateForAPI(formData.date[0]) : undefined,
      endDate: Array.isArray(formData.date) ? formatDateForAPI(formData.date[1]) : undefined,
      repetationType: formData.repeat.value,
      hours: convertTimeToSec(formData.duration),
      assignedUsers: formData.asignUsers,
    };
    updateResourceAllocation.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Resource Allocated Successfully");
        router.push(`${urls.resourceAllocation}`);
      },
      onError: (error) => {
        TkToastError(error?.response?.data?.message || "Something went wrong");
      },
    });
  };

  return (
    <>
      {isLoading ? (
        <TkLoader />
      ) : isError ? (
        <FormErrorBox errMessage={error.message} />
      ) : data.length > 0 ? (
        <TkRow className="justify-content-center">
          <TkCol lg={12}>
            <TkEditCardHeader
              title="Resource Allocation"
              // onDeleteClick={}
              isEditAccess={viewMode}
              disableDelete={viewMode}
              editLink={`${urls.resourceAllocationEdit}/${id}`}
            />
            <TkForm onSubmit={handleSubmit(onSubmit)}>
              <TkCardBody className="mt-4">
                <TkRow className="g-3 gx-4 gy-4">
                  <TkCol lg={4}>
                    <Controller
                      name="projectName"
                      control={control}
                      rules={{ required: "Project is required" }}
                      render={({ field }) => (
                        <TkSelect
                          {...field}
                          labelName="Project Name"
                          id={"projectName"} //  we cannot ahev same id epeated twice in page, so adding index
                          placeholder="Select Project Name"
                          loading={isProjectLoading}
                          options={projectDropdown}
                          onChange={(e) => {
                            field.onChange(e);
                            // invaliadte the query of tasks, and fetch new tasks
                            queryClient.invalidateQueries({
                              queryKey: [RQ.allTaskList, selectedProjectId],
                            });

                            setSelectedProjectId(e ? e.value : null);
                            setValue("taskName", null); // remove the previous selected task
                            setValue("asignUsers", null); // remove the previous selected users
                          }}
                          requiredStarOnLabel={true}
                          disabled={viewMode}
                        />
                      )}
                    />
                    {errors.projectName?.message ? <FormErrorText>{errors.projectName?.message}</FormErrorText> : null}
                  </TkCol>

                  <TkCol lg={4}>
                    <Controller
                      name="taskName"
                      control={control}
                      rules={{ required: "Task is required" }}
                      render={({ field }) => (
                        <TkSelect
                          {...field}
                          labelName="Task Name"
                          id={"taskName"}
                          placeholder="Select Task Name"
                          // make this dropdown loading when project is selected, else it is not loading state
                          loading={selectedProjectId && isTaskLoading}
                          options={taskDropdown}
                          onChange={(e) => {
                            field.onChange(e);
                            queryClient.invalidateQueries({
                              queryKey: [RQ.allUsersList, selectedTaskId],
                            });
                            setSelectedTaskId(e ? e.value : null);
                            setValue("asignUsers", null);
                          }}
                          requiredStarOnLabel={true}
                          disabled={viewMode}
                        />
                      )}
                    />
                    {errors.taskName?.message ? <FormErrorText>{errors.taskName?.message}</FormErrorText> : null}
                  </TkCol>

                  <TkCol lg={4}>
                    <TkInput
                      {...register("duration", { required: "Duration is required" })}
                      labelName="Duration (HH:MM)"
                      id={"duration"}
                      type="text"
                      placeholder="Enter Duration"
                      requiredStarOnLabel={true}
                      onBlur={(e) => {
                        setValue("duration", convertToDayTime(e.target.value));
                      }}
                      disabled={viewMode}
                    />
                    {errors.duration?.message ? <FormErrorText>{errors.duration?.message}</FormErrorText> : null}
                  </TkCol>

                  <TkCol lg={4}>
                    <Controller
                      name="asignUsers"
                      control={control}
                      rules={{ required: "Users is required" }}
                      render={({ field }) => (
                        <TkSelect
                          {...field}
                          labelName="Assign Users"
                          id="asignUsers"
                          placeholder="Assign Users"
                          loading={selectedTaskId && isUsersLoading}
                          options={allUsersData}
                          isMulti={true}
                          requiredStarOnLabel={true}
                          disabled={viewMode}
                        />
                      )}
                    />
                    {errors.asignUsers?.message ? <FormErrorText>{errors.asignUsers?.message}</FormErrorText> : null}
                  </TkCol>

                  <TkCol lg={4}>
                    <Controller
                      name="repeat"
                      control={control}
                      rules={{ required: "Repetition Type is required" }}
                      render={({ field }) => (
                        <TkSelect
                          {...field}
                          options={repeatOptions}
                          defaultValue={repeatOptions[0]}
                          labelName="Repeat"
                          id="repeat"
                          isClearable={false}
                          onChange={(e) => {
                            field.onChange(e);
                            setValue("date", null);
                            e.value === "Daily" ? setShowDateRange("range") : setShowDateRange("single");
                          }}
                          requiredStarOnLabel={true}
                          disabled={viewMode}
                        />
                      )}
                    />
                    {errors.repeat?.message ? <FormErrorText>{errors.repeat?.message}</FormErrorText> : null}
                  </TkCol>

                  <TkCol lg={4}>
                    <Controller
                      name="date"
                      control={control}
                      rules={{ required: "Date is required" }}
                      render={({ field }) => (
                        <TkDate
                          {...field}
                          labelName="Date"
                          id={"date"}
                          placeholder="Select Date"
                          options={{
                            mode: showDateRange,
                            altInput: true,
                            dateFormat: "d M, Y",
                          }}
                          requiredStarOnLabel={true}
                          disabled={viewMode}
                        />
                      )}
                    />
                    {errors.date?.message ? <FormErrorText>{errors.date?.message}</FormErrorText> : null}
                  </TkCol>
                </TkRow>
              </TkCardBody>

              {editMode ? (
                <div className="d-flex mt-4 space-childern">
                  <TkButton
                    // disabled={projectData.isLoading || uploadingFiles}
                    type="button"
                    color="secondary"
                    name="cancel"
                    className="ms-auto"
                    onClick={() => router.push(`${urls.resourceAllocation}`)}
                    disabled={updateResourceAllocation.isLoading}
                  >
                    Cancel
                  </TkButton>
                  <TkButton loading={updateResourceAllocation.isLoading} type="submit" color="primary" name="create">
                    Update
                  </TkButton>
                </div>
              ) : null}
            </TkForm>
          </TkCol>
        </TkRow>
      ) : (
        <TkNoData />
      )}
    </>
  );
};

export default EditResourceAllocation;
