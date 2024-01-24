import TkDate from "../forms/TkDate";
import TkForm from "../forms/TkForm";
import TkInput from "../forms/TkInput";
import TkSelect from "../forms/TkSelect";
import TkButton from "../TkButton";
import { TkCardBody } from "../TkCard";
import TkRow, { TkCol } from "../TkRow";
import React, { useState, useEffect } from "react";
import { convertSecToTime, convertTimeToSec, convertToDayTime, convertToTimeFotTimeSheet } from "../../utils/time";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import { useForm, Controller } from "react-hook-form";
import FormErrorText from "../forms/ErrorText";
import { RQ, API_BASE_URL, urls } from "../../utils/Constants";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import { formatDateForAPI } from "../../utils/date";
import { useRouter } from "next/router";
import { repeatOptions } from "../../utils/Constants";
import { perAccessIds } from "../../../DBConstants";
import DeleteModal from "../../utils/DeleteModal";
import WarningModal from "../../utils/WarningModal.";

function PopupForm({ editResourceAllocationData, toggle, accessLevel, viewOnly }) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({});

  const router = useRouter();
  const queryClient = useQueryClient();

  const [projectDropdown, setProjectDropdown] = useState([]);
  const [allUsersData, setAllUsersData] = useState([]);
  const [taskDropdown, setTaskDropdown] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showDateRange, setShowDateRange] = useState("single");
  const [deletePopupModal, setDeletePopupModal] = useState(false);

  useEffect(() => {
    if (editResourceAllocationData && editResourceAllocationData.length > 0) {
      const { id, repeatId, repetationType, project, task, date, duration, allocatedUser } =
        editResourceAllocationData[0];
      setSelectedProjectId(project.id);
      setSelectedTaskId(task.id);
      setValue("project", {
        value: project.id,
        label: project.name,
      });
      setValue("task", {
        value: task.id,
        label: task.name,
      });
      setValue("date", date);
      setValue("duration", convertSecToTime(duration));
      setValue("employee", {
        value: allocatedUser.id,
        label: allocatedUser.name,
      });
      setValue(
        "repeat",
        repeatOptions.find((item) => item.value === repetationType)
      );
    }
  }, [editResourceAllocationData, setValue]);

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
    mutationFn: tkFetch.put(`${API_BASE_URL}/resource-allocation`),
  });

  const onSubmit = (formData) => {
    const apiData = {
      id: editResourceAllocationData[0]?.id,
      projectId: formData.project.value,
      taskId: formData.task.value,
      date: formatDateForAPI(formData.date),
      duration: convertTimeToSec(formData.duration),
      allocatedUserId: formData.employee.value,
    };
    updateResourceAllocation.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Resource Allocation Updated Successfully");
        queryClient.invalidateQueries({
          queryKey: [RQ.resourceAllocation],
        });
      },
      onError: (error) => {
        TkToastError(error?.response?.data?.message || "Something went wrong");
      },
    });
  };

  const onConvertToTimesheet = () => {
    router.push(`${urls.timesheetAdd}?selfAllocatedId=${editResourceAllocationData[0]?.id}`);
  };

  const deleteResourceAllocation = useMutation({
    mutationFn: tkFetch.deleteWithIdInUrl(`${API_BASE_URL}/resource-allocation`),
  });

  const handleDeleteResourceAllocation = () => {
    console.log("function called");
    const apiData = {
      id: editResourceAllocationData[0]?.id,
    };
    console.log("apiData", apiData);
    deleteResourceAllocation.mutate(apiData, {
      onSuccess: (data) => {
        console.log("data", data);
        TkToastSuccess("Resource Allocation Deleted Successfully");
        queryClient.invalidateQueries({
          queryKey: [RQ.resourceAllocation],
        });
      },
      onError: (err) => {
        console.log("error while deleting project", err);
      },
    });
  };

  const toggleDeleteModelPopup = () => {
    setDeletePopupModal(true);
  };
  return (
    <>
      <DeleteModal
        show={deletePopupModal}
        onDeleteClick={() => {
          handleDeleteResourceAllocation();
          setDeletePopupModal(false);
          toggle();
        }}
        onCloseClick={() => setDeletePopupModal(false)}
      />

      <TkForm onSubmit={handleSubmit(onSubmit)}>
        <TkCardBody className="mt-4">
          <TkRow className="g-3 gx-4 gy-4">
            <TkCol lg={4}>
              <Controller
                name="project"
                control={control}
                rules={{ required: "Project is required" }}
                render={({ field }) => (
                  <TkSelect
                    {...field}
                    labelName="Project Name"
                    id={"project"} //  we cannot ahev same id epeated twice in page, so adding index
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
                      setValue("task", null); // remove the previous selected task
                      setValue("employee", null); // remove the previous selected users
                    }}
                    requiredStarOnLabel={accessLevel === perAccessIds.view || viewOnly ? false : true}
                    disabled={accessLevel === perAccessIds.view || viewOnly}
                  />
                )}
              />
              {errors.project?.message ? <FormErrorText>{errors.project?.message}</FormErrorText> : null}
            </TkCol>

            <TkCol lg={4}>
              <Controller
                name="task"
                control={control}
                rules={{ required: "Task is required" }}
                render={({ field }) => (
                  <TkSelect
                    {...field}
                    labelName="Task Name"
                    id={"task"}
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
                      setValue("employee", null);
                    }}
                    requiredStarOnLabel={accessLevel === perAccessIds.view || viewOnly ? false : true}
                    disabled={accessLevel === perAccessIds.view || viewOnly}
                  />
                )}
              />
              {errors.task?.message ? <FormErrorText>{errors.task?.message}</FormErrorText> : null}
            </TkCol>

            <TkCol lg={4}>
              <TkInput
                {...register("duration", {
                  required: "Duration is required",
                  validate: (value) => {
                    if (value && !/^[0-9]*([.:][0-9]+)?$/.test(value)) {
                      return "Invalid Duration";
                    }
                    if (convertTimeToSec(value) > 86400 || value > 24) {
                      return "Duration should be less than 24 hours";
                    }
                  },
                })}
                labelName="Duration (HH:MM)"
                id={"duration"}
                type="text"
                placeholder="Enter Duration"
                requiredStarOnLabel={accessLevel === perAccessIds.view || viewOnly ? false : true}
                onBlur={(e) => {
                  setValue("duration", convertToTimeFotTimeSheet(e.target.value));
                }}
                disabled={accessLevel === perAccessIds.view || viewOnly}
              />
              {errors.duration?.message ? <FormErrorText>{errors.duration?.message}</FormErrorText> : null}
            </TkCol>

            <TkCol lg={4}>
              <Controller
                name="employee"
                control={control}
                rules={{ required: "Users is required" }}
                render={({ field }) => (
                  <TkSelect
                    {...field}
                    labelName="Assign Users"
                    id="employee"
                    placeholder="Assign Users"
                    loading={selectedTaskId && isUsersLoading}
                    options={allUsersData}
                    requiredStarOnLabel={accessLevel === perAccessIds.view || viewOnly ? false : true}
                    disabled={accessLevel === perAccessIds.view || viewOnly}
                  />
                )}
              />
              {errors.employee?.message ? <FormErrorText>{errors.employee?.message}</FormErrorText> : null}
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
                    labelName="Repeat"
                    id="repeat"
                    isClearable={false}
                    onChange={(e) => {
                      field.onChange(e);
                      setValue("date", null);
                      e.value === "Daily" ? setShowDateRange("range") : setShowDateRange("single");
                    }}
                    requiredStarOnLabel={accessLevel === perAccessIds.view || viewOnly ? false : true}
                    // disabled={accessLevel === perAccessIds.view || viewOnly}
                    disabled={true}
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
                      mode: "single",
                      altInput: true,
                      dateFormat: "d M, Y",
                    }}
                    requiredStarOnLabel={accessLevel === perAccessIds.view || viewOnly ? false : true}
                    disabled={accessLevel === perAccessIds.view || viewOnly}
                  />
                )}
              />
              {errors.date?.message ? <FormErrorText>{errors.date?.message}</FormErrorText> : null}
            </TkCol>
          </TkRow>
        </TkCardBody>

        <div className="d-flex mt-4 space-childern">
          <TkButton
            // disabled={projectData.isLoading || uploadingFiles}
            type="button"
            color="secondary"
            name="cancel"
            className="ms-auto"
            onClick={toggle}
            disabled={updateResourceAllocation.isLoading}
          >
            Cancel
          </TkButton>
          {viewOnly ? null : accessLevel >= perAccessIds.edit ? (
            <TkButton loading={updateResourceAllocation.isLoading} type="submit" color="primary" name="create">
              Update
            </TkButton>
          ) : null}
          {viewOnly ? null : accessLevel >= perAccessIds.edit ? (
            <TkButton color="primary" type="button" onClick={toggleDeleteModelPopup}>
              Delete
            </TkButton>
          ) : null}

          {accessLevel < perAccessIds.edit || viewOnly ? (
            <TkButton color="primary" type="button" onClick={onConvertToTimesheet}>
              Convert To Timesheet
            </TkButton>
          ) : null}
        </div>
      </TkForm>
    </>
  );
}

export default PopupForm;
