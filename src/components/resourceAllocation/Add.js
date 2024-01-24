import React, { useState, useEffect } from "react";
import TkButton from "../TkButton";
import TkRow, { TkCol } from "../TkRow";
import TkInput from "../forms/TkInput";
import TkSelect from "../forms/TkSelect";
import TkDate from "../forms/TkDate";
import { convertTimeToSec, convertToDayTime, convertToTimeFotTimeSheet } from "../../utils/time";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import FormErrorText from "../forms/ErrorText";
import {
  RQ,
  API_BASE_URL,
  urls,
  repeatType,
  daysOfWeek,
  datesOfMonth,
  perDefinedProjectManagerRoleID,
} from "../../utils/Constants";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import { formatDateForAPI } from "../../utils/date";
import { useRouter } from "next/router";
import TkForm from "../forms/TkForm";
import { repeatOptions } from "../../utils/Constants";
import TkTableContainer from "../TkTableContainer";
import useSessionData from "../../utils/hooks/useSessionData";

const AddResorceAllocation = () => {
  const sessionData = useSessionData();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({});
  const router = useRouter();
  const [projectDropdown, setProjectDropdown] = useState([]);
  const [allUsersData, setAllUsersData] = useState([]);
  const [taskDropdown, setTaskDropdown] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showDateRange, setShowDateRange] = useState("single");
  const [daysOfWeekActive, setDaysOfWeekActive] = useState(false);
  const [datesOfMonthActive, setDatesOfMonthActive] = useState(false);
  const [rows, setRows] = useState([{ task: "", employee: "", duration: "" }]);
  const queryClient = useQueryClient();
  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allProjectList],
        queryFn: tkFetch.get(
          `${API_BASE_URL}/project/list${
            sessionData.user.roleId === perDefinedProjectManagerRoleID ? `?PMprojects=true` : ""
          }`
        ),
      },
      {
        queryKey: [RQ.allTaskList, selectedProjectId],
        queryFn: tkFetch.get(`${API_BASE_URL}/task/list${selectedProjectId ? `?projectId=${selectedProjectId}` : ""}`),
        // queryFn: tkFetch.get(`${API_BASE_URL}/task/list`),
        enabled: !!selectedProjectId,
      },
      {
        queryKey: [RQ.allUsersList, selectedTaskId],
        queryFn: tkFetch.get(`${API_BASE_URL}/users/list${selectedTaskId ? `?taskId=${selectedTaskId}` : ""}`),
        // queryFn: tkFetch.get(`${API_BASE_URL}/users/list`),
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

  const { remove: removeTask } = useFieldArray({
    control,
    name: "task",
  });
  const { remove: removeEmployee } = useFieldArray({
    control,
    name: "employee",
  });
  const { remove: removeDuration } = useFieldArray({
    control,
    name: "duration",
  });

  const resourceAllocationData = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/resource-allocation`),
  });

  const columns = [
    {
      Header: "Task",
      accessor: "task",
      Cell: (cellProps) => {
        return (
          <>
            <Controller
              control={control}
              name={`task[${cellProps.row.index}]`}
              rules={{ required: "Task is required" }}
              render={({ field }) => (
                <TkSelect
                  {...field}
                  id={"task"}
                  // make this dropdown loading when project is selected, else it is not loading state
                  loading={selectedProjectId && isTaskLoading}
                  options={taskDropdown}
                  onChange={(e) => {
                    field.onChange(e);
                    queryClient.invalidateQueries({
                      queryKey: [RQ.allUsersList, selectedTaskId],
                    });
                    setSelectedTaskId(e ? e.value : null);
                    setValue(`employee[${cellProps.row.index}]`, null);
                  }}
                  requiredStarOnLabel={true}
                />
              )}
            />
            {errors?.task?.[cellProps.row.index] && (
              <FormErrorText>{errors?.task?.[cellProps.row.index]?.message}</FormErrorText>
            )}
          </>
        );
      },
    },
    {
      Header: "Employee",
      accessor: "employee",
      Cell: (cellProps) => {
        return (
          <Controller
            control={control}
            name={`employee[${cellProps.row.index}]`}
            rules={{ required: "Employee is required" }}
            render={({ field }) => (
              <>
                <TkSelect
                  {...field}
                  id="employee"
                  placeholder="Assign Users"
                  loading={selectedTaskId && isUsersLoading}
                  options={allUsersData}
                  // menuPlacement="top"
                />
                {errors?.employee?.[cellProps.row.index] && (
                  <FormErrorText>{errors?.employee?.[cellProps.row.index]?.message}</FormErrorText>
                )}
              </>
            )}
          />
        );
      },
    },
    {
      Header: "Duration (HH:MM)",
      accessor: "duration",
      Cell: (cellProps) => {
        return (
          <>
            <TkInput
              type="text"
              placeholder="Enter Duration"
              {...register(`duration[${cellProps.row.index}]`, {
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
              onBlur={(e) => {
                setValue(`duration[${cellProps.row.index}]`, convertToTimeFotTimeSheet(e.target.value));
              }}
            />
            {errors?.duration?.[cellProps.row.index] && (
              <FormErrorText>{errors?.duration?.[cellProps.row.index]?.message}</FormErrorText>
            )}
          </>
        );
      },
    },
    {
      Header: "Action",
      accessor: "action",
      Cell: (cellProps) => {
        return (
          <>
            <TkButton
              type={"button"}
              onClick={() => {
                handleRemoveRow(cellProps.row.index);
              }}
              disabled={rows.length === 1}
            >
              Delete
            </TkButton>
          </>
        );
      },
    },
  ];

  const onSubmit = (formData) => {
    const taskTableData = [];
    formData.task.forEach((task, index) => {
      taskTableData.push({
        taskId: task.value,
        employeeId: formData.employee[index].value,
        duration: convertTimeToSec(formData.duration[index]),
      });
    });
    const days = [];
    if (formData.repeat.value === repeatType.weekly) {
      formData.daysOfWeek.forEach((day) => {
        days.push(day.value);
      });
    }
    const dates = [];
    if (formData.repeat.value === repeatType.monthly) {
      formData.datesOfMonth.forEach((day) => {
        dates.push(day.value);
      });
    }
    const apiData = {
      projectId: formData.project.value,
      date: Array.isArray(formData.date) ? undefined : formatDateForAPI(formData.date),
      daysOfWeek: Array.isArray(formData.daysOfWeek) ? days : undefined,
      datesOfMonth: Array.isArray(formData.datesOfMonth) ? dates : undefined,
      startDate: Array.isArray(formData.date) ? formatDateForAPI(formData.date[0]) : undefined,
      endDate: Array.isArray(formData.date) ? formatDateForAPI(formData.date[1]) : undefined,
      repetationType: formData.repeat.value,
      tasksData: taskTableData,
    };

    resourceAllocationData.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Resource Allocated Successfully");
        router.push(`${urls.resourceAllocation}`);
      },
      onError: (error) => {
        TkToastError(error?.response?.data?.message || "Something went wrong");
      },
    });
  };

  const handleAddRow = () => {
    setRows([...rows, { task: null, employee: null, duration: "" }]);
  };

  const handleRemoveRow = (index) => {
    removeTask(index);
    removeEmployee(index);
    removeDuration(index);
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  const handleCancel = () => {
    router.push(`${urls.resourceAllocation}`);
  };

  return (
    <TkRow className="justify-content-center">
      <TkCol lg={12}>
        <TkForm onSubmit={handleSubmit(onSubmit)}>
          <TkRow className="mb-3">
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
                      queryClient.invalidateQueries({ queryKey: [RQ.allTaskList, selectedProjectId] });
                      setSelectedProjectId(e ? e.value : null);
                      setValue("task", null); // remove the previous selected task
                      setValue("employee", null); // remove the previous selected users
                    }}
                    requiredStarOnLabel={true}
                  />
                )}
              />
              {errors.project?.message ? <FormErrorText>{errors.project?.message}</FormErrorText> : null}
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
                      e.value === repeatType.dontRepeat && setShowDateRange("single");
                      e.value === repeatType.daily && setShowDateRange("range");
                      e.value === repeatType.weekly && setShowDateRange("range");
                      e.value === repeatType.monthly && setShowDateRange("range");
                      e.value !== repeatType.weekly && setValue("daysOfWeek", null);
                      e.value !== repeatType.monthly && setValue("datesOfMonth", null);
                      setDaysOfWeekActive(e ? e.value === repeatType.weekly : false);
                      setDatesOfMonthActive(e ? e.value === repeatType.monthly : false);
                    }}
                    requiredStarOnLabel={true}
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
                  />
                )}
              />
              {errors.date?.message ? <FormErrorText>{errors.date?.message}</FormErrorText> : null}
            </TkCol>

            <TkCol lg={6} className="mt-3">
              <Controller
                name="daysOfWeek"
                control={control}
                rules={daysOfWeekActive ? { required: "Days of Week is required" } : { required: false }}
                render={({ field }) => (
                  <TkSelect
                    {...field}
                    options={daysOfWeek}
                    labelName="Days of Week"
                    id="daysOfWeek"
                    isMulti={true}
                    disabled={!daysOfWeekActive}
                    requiredStarOnLabel={daysOfWeekActive}
                  />
                )}
              />
              {errors.daysOfWeek?.message ? <FormErrorText>{errors.daysOfWeek?.message}</FormErrorText> : null}
            </TkCol>

            <TkCol lg={6} className="mt-3">
              <Controller
                name="datesOfMonth"
                control={control}
                rules={datesOfMonthActive ? { required: "Date of month is required" } : { required: false }}
                render={({ field }) => (
                  <TkSelect
                    {...field}
                    options={datesOfMonth}
                    labelName="Date of Month"
                    id="datesOfMonth"
                    isMulti={true}
                    disabled={!datesOfMonthActive}
                    requiredStarOnLabel={datesOfMonthActive}
                  />
                )}
              />
              {errors.datesOfMonth?.message ? <FormErrorText>{errors.datesOfMonth?.message}</FormErrorText> : null}
            </TkCol>
          </TkRow>

          <TkTableContainer
            customPageSize={true}
            showPagination={true}
            showAddButton={true}
            onClickAdd={handleAddRow}
            disableAddButton={resourceAllocationData.isLoading}
            columns={columns}
            data={rows}
            thClass="text-dark"
            dynamicTable={true}
          />

          {/* <TkButton disabled={resourceAllocationData.isLoading} onClick={handleAddRow} type="button">
            Add Row
          </TkButton> */}
          <div className="ms-auto" id="update-expense-category-submit-btns">
            <TkButton loading={resourceAllocationData.isLoading} color="primary" type="submit">
              Submit
            </TkButton>
            {"  "}
            <TkButton
              disabled={resourceAllocationData.isLoading}
              color="secondary"
              className="ms-auto"
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </TkButton>
          </div>
        </TkForm>
      </TkCol>
    </TkRow>
  );
};

export default AddResorceAllocation;
