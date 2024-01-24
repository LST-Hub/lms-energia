import React, { useState, useEffect, useRef, useCallback } from "react";
import TkButton from "../TkButton";
import TkRow, { TkCol } from "../TkRow";
import TkInput from "../forms/TkInput";
import TkSelect from "../forms/TkSelect";
import TkDate from "../forms/TkDate";
import { convertSecToTime, convertTimeToSec, convertToTimeFotTimeSheet } from "../../utils/time";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";
import { RQ, API_BASE_URL, urls } from "../../utils/Constants";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import { formatDateForAPI } from "../../utils/date";
import TkCard, { TkCardBody, TkCardHeader } from "../TkCard";
import { useRouter } from "next/router";
import TkIcon from "../TkIcon";
import TkLoader from "../TkLoader";

const defaultTimeEntryValues = ({
  projectName,
  taskName,
  allocatedTime,
  duration,
  description,
  allocationId,
  disableFields,
  conversion,
  ticket,
} = {}) => {
  return {
    projectName: projectName || null,
    taskName: taskName || null,
    date: null,
    allocatedTime: allocatedTime || 0,
    duration: conversion ? duration : allocatedTime || 0,
    description: description || "",
    uniqueId: new Date().getTime() + Math.floor(Math.random() * 100),
    allocationId: allocationId || null,
    disableFields: disableFields || false,
    ticket: ticket || "",
  };
};

// this var will be used to track the form submission, of all timesheet filled by user in this page
const formSubmitted = {};
const fieldArrayName = "timesheet";

const TimeEntry = ({
  update,
  index,
  value,
  updateFormData,
  setAllDurations,
  setTicketManditory,
  ticketManditory,
  setIsTicketError,
  setIsTicketValueError,
  isTicketErrror,
  styleButton,
  allocationId,
}) => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    getValues,
    formState: { errors },
  } = useForm({
    // resolver: yupResolver(schema),
    defaultValues: value,
  });
  const [projectDropdown, setProjectDropdown] = useState([]);
  const [taskDropdown, setTaskDropdown] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  if (updateFormData && !formSubmitted[index]) {
    // submit this time entry form
    handleSubmit((data) => {
      let newData = data;
      if (allocationId) {
        newData = { ...data, allocationId };
      }
      update(index, newData);
    })();
    formSubmitted[index] = true;
  }

  //TODO: in new design page, use loading and error states for showing that data is loading or error
  // const { data, isLoading, isFetched, isError, error } = useQuery({
  //   queryKey: [RQ.allTodayTask],
  //   queryFn: tkFetch.get(`${API_BASE_URL}/todays-tasks/${dbTodaysTaskId}`),
  //   enabled: !!dbTodaysTaskId,
  // });

  // const {
  //   data: selfAllocatedData,
  //   isLoading: selfAllocatedIsLoading,
  //   isError: selfAllocatedIsError,
  // } = useQuery({
  //   queryKey: [RQ.allSelfAllocatedTask],
  //   queryFn: tkFetch.get(`${API_BASE_URL}/resource-allocation/${dbSelfAllocatedId}`),
  //   enabled: !!dbSelfAllocatedId,
  // });

  // useEffect(() => {
  //   if (dbTodaysTaskId && data?.length > 0 && projectDropdown.length) {
  //     const project = projectDropdown.find((project) => project.value === data[0].project.id);
  //     setValue(
  //       "projectName",
  //       project || {
  //         id: data[0].project.id,
  //         value: data[0].project.id,
  //         label: data[0].project.name,
  //       }
  //     );
  //     setTicketManditory((prev) => {
  //       return {
  //         ...prev,
  //         [value.uniqueId]: project?.ticket === true,
  //       };
  //     });
  //     setSelectedProjectId(project ? project.value : null);
  //     setValue("taskName", {
  //       id: data[0].task.id,
  //       value: data[0].task.id,
  //       label: data[0].task.name,
  //     });
  //     // setValue("date", data[0].date);
  //     setValue("duration", convertSecToTime(data[0].duration));
  //     setValue("description", data[0].description);
  //     setValue("ticket", data[0].ticket);
  //     if (data[0].resourceAllocation && data[0].resourceAllocation.duration) {
  //       setValue("allocatedTime", convertSecToTime(data[0].resourceAllocation.duration));
  //     }
  //   }
  // }, [data, dbTodaysTaskId, setValue, projectDropdown, setTicketManditory, value.uniqueId]);

  // useEffect(() => {
  //   if (dbSelfAllocatedId && selfAllocatedData?.length > 0 && projectDropdown.length) {
  //     const project = projectDropdown.find((project) => project.value === selfAllocatedData[0].project.id);
  //     setValue(
  //       "projectName",
  //       project || {
  //         id: selfAllocatedData[0].project.id,
  //         value: selfAllocatedData[0].project.id,
  //         label: selfAllocatedData[0].project.name,
  //       }
  //     );
  //     setTicketManditory((prev) => {
  //       return {
  //         ...prev,
  //         [value.uniqueId]: project?.ticket === true,
  //       };
  //     });
  //     setSelectedProjectId(project ? project.value : null);
  //     setValue("taskName", {
  //       id: selfAllocatedData[0].task.id,
  //       value: selfAllocatedData[0].task.id,
  //       label: selfAllocatedData[0].task.name,
  //     });
  //     // setValue("date", selfAllocatedData[0].date);
  //     setValue("duration", convertSecToTime(selfAllocatedData[0].duration));
  //     setValue("allocatedTime", convertSecToTime(selfAllocatedData[0].duration));
  //   }
  // }, [selfAllocatedData, dbSelfAllocatedId, setValue, projectDropdown, setTicketManditory, value.uniqueId]);

  useEffect(() => {
    if (value?.projectName && projectDropdown.length) {
      const project = projectDropdown.find((project) => project.value === value.projectName?.value);
      setValue("projectName", project || value?.projectName);
      setTicketManditory((prev) => {
        return {
          ...prev,
          [value.uniqueId]: project?.ticket === true,
        };
      });
      setSelectedProjectId(project ? project.value : null);
    }
  }, [setValue, value.projectName, projectDropdown, value.uniqueId, setTicketManditory]);

  const queryClient = useQueryClient();
  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allProjectList, RQ.myProjects],
        queryFn: tkFetch.get(`${API_BASE_URL}/project/list?myProjects=true`),
      },
      {
        queryKey: [RQ.allTaskList, selectedProjectId, RQ.myTasks],
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
      TkToastError(projectError.message);
    }
    if (isTaskError) {
      console.log("taskError", taskError);
      TkToastError(taskError.message);
    }
  }, [isProjectError, isTaskError, projectError, taskError]);

  useEffect(() => {
    if (projectData) {
      setProjectDropdown(
        projectData.map((project) => ({
          value: project.id,
          label: project.name,
          ticket: project.ticket,
        }))
      );
    }
  }, [projectData]);

  useEffect(() => {
    if (!selectedProjectId) {
      // if project is not selected then  dont show any tasks, and task dropdown is even not loading
      // but react query gives it loading and data null or previous, so implemntd this condition
      setTaskDropdown([]);
      return;
    }
    if (taskData) {
      setTaskDropdown(taskData.map((task) => ({ value: task.id, label: task.name })));
    }
  }, [taskData, selectedProjectId]);

  return (
    <TkRow className={`g-3 ${styleButton ? "mb-3" : ""}`}>
      <TkCol>
        <Controller
          name="projectName"
          control={control}
          rules={{ required: "Project is required" }}
          render={({ field }) => (
            <TkSelect
              {...field}
              labelName="Project Name"
              id={"projectName" + index} //  we cannot ahev same id epeated twice in page, so adding index
              placeholder="Select Project Name"
              loading={isProjectLoading}
              options={projectDropdown}
              disabled={value.disableFields}
              onChange={(e) => {
                field.onChange(e);
                setTicketManditory((prev) => {
                  return {
                    ...prev,
                    [value.uniqueId]: e?.ticket === true,
                  };
                });
                // invaliadte the query of tasks, and fetch new tasks
                queryClient.invalidateQueries({
                  queryKey: [RQ.allTaskList, selectedProjectId, RQ.myTasks],
                });
                setSelectedProjectId(e ? e.value : null);
                setValue("taskName", null); // remove the previous selected task
              }}
              requiredStarOnLabel={true}
              styles={{
                placeholder: (baseStyles) => ({
                  ...baseStyles,
                  whiteSpace: "nowrap",
                }),
              }}
            />
          )}
        />
        {errors.projectName?.message ? <FormErrorText>{errors.projectName?.message}</FormErrorText> : null}
      </TkCol>

      <TkCol>
        <Controller
          name="taskName"
          control={control}
          rules={{ required: "Task is required" }}
          render={({ field }) => (
            <TkSelect
              {...field}
              labelName="Task Name"
              id={"taskName" + index}
              placeholder="Select Task Name"
              disabled={value.disableFields}
              // make this dropdown loading when project is selected, else it is not loading state
              loading={selectedProjectId && isTaskLoading}
              options={taskDropdown}
              requiredStarOnLabel={true}
              styles={{
                placeholder: (baseStyles) => ({
                  ...baseStyles,
                  whiteSpace: "nowrap",
                }),
              }}
            />
          )}
        />
        {errors.taskName?.message ? <FormErrorText>{errors.taskName?.message}</FormErrorText> : null}
      </TkCol>

      {/* <TkCol>
        <Controller
          name="date"
          control={control}
          rules={{ required: "Date is required" }}
          render={({ field }) => (
            <TkDate
              {...field}
              labelName="Date"
              id={"date" + index}
              placeholder="Select Date"
              options={{
                altInput: true,
                dateFormat: "d M, Y",
              }}
              requiredStarOnLabel={true}
            />
          )}
        />
        {errors.date?.message ? <FormErrorText>{errors.date?.message}</FormErrorText> : null}
      </TkCol> */}
      <TkCol>
        <TkInput
          {...register("allocatedTime")}
          labelName="Allocated Time (HH:MM)"
          id={"allocatedTime" + index}
          type="text"
          disabled
        />
      </TkCol>
      <TkCol>
        <TkInput
          {...register("duration", {
            required: "Duration is required",
            validate: (value) => {
              if (value && !/^[0-9]*([.:][0-9]+)?$/.test(value)) {
                return "Duration cannot contain characters";
              }
              if (convertTimeToSec(value) > 86400 || value > 24) {
                return "Duration should be less than 24 hours";
              }
            },
          })}
          labelName="Duration (HH:MM)"
          id={"duration" + index}
          type="text"
          placeholder="Enter Duration"
          requiredStarOnLabel={true}
          onBlur={(e) => {
            setValue("duration", convertToTimeFotTimeSheet(e.target.value));
            if (e.target.value && /^[0-9]*([.:][0-9]+)?$/.test(e.target.value)) {
              setAllDurations((prev) => {
                return {
                  ...prev,
                  [index]: convertTimeToSec(e.target.value),
                };
              });
            } else {
              setAllDurations((prev) => {
                return {
                  ...prev,
                  [index]: 0,
                };
              });
            }
          }}
          // onChange={(e) => {
          //   if (e.target.value && /^[0-9]*([.:][0-9]+)?$/.test(e.target.value)) {
          //     setAllDurations((prev) => {
          //       return {
          //         ...prev,
          //         [index]: convertTimeToSec(e.target.value),
          //       };
          //     });
          //   } else {
          //     setAllDurations((prev) => {
          //       return {
          //         ...prev,
          //         [index]: 0,
          //       };
          //     });
          //   }
          // }}
        />
        {errors.duration?.message ? <FormErrorText>{errors.duration?.message}</FormErrorText> : null}
      </TkCol>

      <TkCol>
        <TkInput
          {...register("ticket")}
          labelName="Ticket"
          id={"ticket" + index}
          placeholder="Enter Ticket Number"
          type="text"
          requiredStarOnLabel={ticketManditory[value.uniqueId]}
          onChange={(e) => {
            setValue("ticket", e.target.value);
            setIsTicketError((prev) => {
              return {
                ...prev,
                [value.uniqueId]: false,
              };
            });
          }}
        />
        {isTicketErrror[value.uniqueId] ? <FormErrorText>{`Ticket is required`}</FormErrorText> : null}
      </TkCol>

      {/* <TkCol>
        <TkInput
          {...register("ticket")}
          labelName="Ticket"
          id={"ticket" + index}
          placeholder="Enter Ticket Number"
          type="text"
          rules={{ required: ticketManditory[value.uniqueId] }}
          requiredStarOnLabel={ticketManditory[value.uniqueId]}
          onChange={(e) => {
            const ticketValue = e.target.value;
            setValue("ticket", ticketValue);

            if (isNaN(ticketValue)) {
              setIsTicketError((prev) => ({
                ...prev,
                [value.uniqueId]: true,
              }));
            } else {
              setIsTicketError((prev) => ({
                ...prev,
                [value.uniqueId]: false,
              }));

              if (parseInt(ticketValue) >= 50) {
                setIsTicketError((prev) => ({
                  ...prev,
                  [value.uniqueId]: true,
                }));
              } else {
                setIsTicketError((prev) => ({
                  ...prev,
                  [value.uniqueId]: false,
                }));
              }
            }
          }}
        />
        {isTicketErrror[value.uniqueId] ? <FormErrorText>Ticket is required</FormErrorText> : null}
        {isTicketErrror[value.uniqueId] ? <FormErrorText>Ticket must be less than 50</FormErrorText> : null}
      </TkCol> */}

      <TkCol>
        <TkInput
          {...register("description", {
            maxLength: {
              value: 2000,
              message: "Description should be less than 2000 characters",
            },
          })}
          labelName="Description"
          id={"description" + index}
          placeholder="Enter Description"
          type="textarea"
        />
        {errors.description?.message ? <FormErrorText>{errors.description?.message}</FormErrorText> : null}
      </TkCol>
    </TkRow>
  );
};

function AddTimeSheet() {
  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({});
  // const { control, handleSubmit } = useForm();
  const router = useRouter();
  const { fields, append, update, remove } = useFieldArray({
    control,
    name: fieldArrayName,
  });
  const [allDurations, setAllDurations] = useState({});

  const formSubmit = useRef(false);
  const [sendForApproval, setSendForApproval] = useState(false);
  // this stata is used to show the loading state while we wait the foorm to submit in useEfect in settimeout
  // only diable the button for this state, and dnt show loading state
  const [waiting, setWaiting] = useState(false);
  // this state is only used to render the component
  const [render, setRerender] = useState(false);
  const [ticketManditory, setTicketManditory] = useState({});
  const [isTicketErrror, setIsTicketError] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [loader, setLoader] = useState(false);
  const [allocationId, setAllocationId] = useState(null);

  const { todaysTaskId, selfAllocatedId } = router.query;

  // below is the hack to update the form data of all entries
  // we used a useref to manage submitted state and a setState reneder the compnent
  // why we not used useState to manage formSubmit state?
  // becuase it was not woring as expected, dont kno wexactly why and not even have time for that
  useEffect(() => {
    // we have check the formSubmit.current, becuase we dont want to update the form data of all entries continusily
    // we just want to upadte it once and then stop, hence we have set the formSubmit.current to false below
    if (formSubmit.current) {
      fields.forEach((field, index) => {
        formSubmitted[index] = false;
      });
      formSubmit.current = false;
      setRerender(!render);
      // wait for some time to update the form data of all entires
      // without wating in settimeout, we dont get the data of all entries, need to wait some time
      // dont know why
      setTimeout(() => {
        setWaiting(false);
        handleSubmit(onSubmit)();
      }, 800);
      // set waiting to true to show disabled state in save and submit button
      setWaiting(true);
    }
  }, [fields, handleSubmit, render, onSubmit]);

  const queryClient = useQueryClient();
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

  const timesheetData = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/timesheet`),
  });

  const saveTimesheet = useCallback(
    (apiData) => {
      timesheetData.mutate(apiData, {
        onSuccess: (data) => {
          if (apiData.multipleTimesheetsData[0].submittedForApproval) {
            TkToastSuccess("Timesheet Submitted For Approval");
          } else {
            TkToastSuccess("Timesheet Saved Successfully");
          }

          router.push(`${urls.timesheets}`);
          queryClient.invalidateQueries({
            queryKey: [RQ.allTimesheets],
          });
        },
        onError: (error) => {
          console.log("error", error);
        },
      });
    },
    [queryClient, router, timesheetData]
  );

  const { data, isLoading, isFetched, isError, error } = useQuery({
    queryKey: [RQ.allTodayTask],
    queryFn: tkFetch.get(`${API_BASE_URL}/todays-tasks/${todaysTaskId}`),
    enabled: !!todaysTaskId,
  });

  const {
    data: selfAllocatedData,
    isLoading: selfAllocatedIsLoading,
    isError: selfAllocatedIsError,
  } = useQuery({
    queryKey: [RQ.allSelfAllocatedTask],
    queryFn: tkFetch.get(`${API_BASE_URL}/resource-allocation/${selfAllocatedId}`),
    enabled: !!selfAllocatedId,
  });

  const {
    data: resourceAllocationData,
    isLoading: isResourceAllocationLoading,
    isError: isResourceAllocationError,
    error: resourceAllocationError,
  } = useQuery({
    queryKey: [RQ.resourceAllocation, selectedDate],
    queryFn: tkFetch.get(
      `${API_BASE_URL}/resource-allocation/user-resource-allocation?date=${formatDateForAPI(selectedDate)}`
    ),
    enabled: !!selectedDate && !todaysTaskId && !selfAllocatedId,
  });

  useEffect(() => {
    if (isResourceAllocationLoading && selectedDate && !todaysTaskId && !selfAllocatedId) {
      setLoader(isResourceAllocationLoading);
    }
  }, [isResourceAllocationLoading, selfAllocatedId, selectedDate, todaysTaskId]);

  useEffect(() => {
    if (todaysTaskId && data?.length > 0) {
      setValue("date", data[0].date);
      setAllDurations((prev) => {
        return {
          ...prev,
          0: data[0].duration,
        };
      });
      remove();
      append(
        defaultTimeEntryValues({
          projectName: { value: data[0].project.id, label: data[0].project.name },
          taskName: { value: data[0].task.id, label: data[0].task.name },
          allocatedTime: data[0].resourceAllocation ? convertSecToTime(data[0].resourceAllocation?.duration) : 0,
          duration: convertSecToTime(data[0].duration),
          conversion: true,
          ticket: data[0].ticket,
          description: data[0].description,
        })
      );
      setAllocationId(data[0].resourceAllocation ? data[0].resourceAllocation.id : null);
      setLoader(false);
    }
  }, [data, todaysTaskId, append, remove, setValue]);

  useEffect(() => {
    if (selfAllocatedId && selfAllocatedData?.length > 0) {
      setValue("date", selfAllocatedData[0].date);
      setAllDurations((prev) => {
        return {
          ...prev,
          0: selfAllocatedData[0].duration,
        };
      });
      remove();
      append(
        defaultTimeEntryValues({
          projectName: { value: selfAllocatedData[0].project.id, label: selfAllocatedData[0].project.name },
          taskName: { value: selfAllocatedData[0].task.id, label: selfAllocatedData[0].task.name },
          allocatedTime: convertSecToTime(selfAllocatedData[0].duration),
          ticket: selfAllocatedData[0].ticket,
          description: selfAllocatedData[0].description,
        })
      );
      setAllocationId(selfAllocatedData[0].id);
    }
    setLoader(false);
  }, [selfAllocatedData, selfAllocatedId, setValue, append, remove]);

  const onSubmit = useCallback(
    (data) => {
      if (data.date === undefined) {
        TkToastError("Please Fill all required fields and submit again.");
        setWaiting(false);
        return;
      }
      // set waiting to false as onSubmit function is called and we an call API and depend on its loading state
      setWaiting(false);
      if (!data[fieldArrayName]) return;
      const fdata = data[fieldArrayName];
      for (const item of fdata) {
        const { projectName, taskName, duration } = item;
        if (!projectName || !taskName || !duration) {
          TkToastError("Please Fill all required fields and submit again.");
          return;
        }
        if (!projectName.value || !taskName.value) {
          TkToastError("Please Fill all required fields and submit again.");
          return;
        }
      }

      for (let i = 0; i < fdata.length; i++) {
        const item = fdata[i];
        if (ticketManditory[item.uniqueId] && !item.ticket) {
          setIsTicketError((prev) => {
            return {
              ...prev,
              [item.uniqueId]: true,
            };
          });
          TkToastError(`Please Fill all required fields and submit again.`);
          return;
        }
      }
      const finalData = fdata.map((item) => ({
        projectId: item.projectName.value,
        projectName: item.projectName.label,
        taskId: item.taskName.value,
        taskName: item.taskName.label,
        date: formatDateForAPI(data.date), // i have moved the date field out of the form so the date is not in data[fieldArrayName]
        duration: convertTimeToSec(item.duration),
        ticket: item.ticket,
        description: item.description,
        submittedForApproval: sendForApproval ? sendForApproval : undefined,
        resourceAllocationId: item.allocationId,
      }));
      const apiData = {
        multiple: true,
        totalHrs: convertSecToTime(Object.values(allDurations).reduce((a, b) => a + b, 0)),
        multipleTimesheetsData: finalData,
      };

      if (sendForApproval) {
        saveTimesheet(apiData, true);
      } else {
        saveTimesheet(apiData);
      }
    },
    [saveTimesheet, sendForApproval, ticketManditory, allDurations]
  );

  const onSubmitClick = () => {
    formSubmit.current = true;
    setRerender(!render);
  };

  const initialMount = useRef(false);
  useEffect(() => {
    if (!initialMount.current) {
      append(defaultTimeEntryValues());
      initialMount.current = true;
    }
  }, [append]);

  useEffect(() => {
    if (todaysTaskId || selfAllocatedId) {
      return;
    }
    if (isResourceAllocationError) {
      setLoader(false);
      append(defaultTimeEntryValues());
      return;
    }
    if (!isResourceAllocationLoading) {
      setLoader(false);
      // Remove all rows before appending new ones
      remove();
      if (Array.isArray(resourceAllocationData) && resourceAllocationData.length) {
        const totalDur = [];
        resourceAllocationData.forEach((data) => {
          if (data) {
            const { project, task } = data;
            append(
              defaultTimeEntryValues({
                projectName: { value: project.id, label: project.name },
                taskName: { value: task.id, label: task.name },
                allocatedTime: convertSecToTime(data.duration),
                allocationId: data.id,
                projectDisabled: true,
                taskDisabled: true,
                disableFields: true,
              })
            );
          }

          totalDur.push(data.duration);
        });

        setAllDurations((prev) => ({
          ...prev,
          ...totalDur.reduce((acc, dur, index) => ({ ...acc, [index]: dur }), {}),
        }));
      } else {
        setLoader(false);
        append(defaultTimeEntryValues());
      }
    }
  }, [
    append,
    remove,
    setValue,
    isResourceAllocationLoading,
    isResourceAllocationError,
    resourceAllocationData,
    todaysTaskId,
    selfAllocatedId,
  ]);

  // set default todays date
  // useEffect(() => {
  //   setValue("date", new Date());
  //   setSelectedDate(new Date());
  // }, [setValue]);

  return (
    <>
      <TkRow className="mb-3">
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
                  altInput: true,
                  dateFormat: "d M, Y",
                }}
                onChange={(e) => {
                  field.onChange(e);
                  setSelectedDate(e);
                  setAllDurations({});
                }}
                requiredStarOnLabel={true}
              />
            )}
          />
          {errors.date?.message ? <FormErrorText>{errors.date?.message}</FormErrorText> : null}
        </TkCol>

        <TkCol lg={4}>
          <Controller
            name="totalHrs"
            control={control}
            // rules={{ required: "Date is required" }}
            render={({ field }) => (
              <TkInput
                {...field}
                labelName="Total Hours"
                id={"totalHrs"}
                placeholder="Total Hours"
                type="text"
                disabled={true}
                value={convertSecToTime(Object.values(allDurations).reduce((a, b) => a + b, 0))}
              />
            )}
          />
          {/* {errors.date?.message ? <FormErrorText>{errors.date?.message}</FormErrorText> : null} */}
        </TkCol>

        {/* <TkCol>
          <h1 className="mt-4">
            Total Hrs- {convertSecToTime(Object.values(allDurations).reduce((a, b) => a + b, 0))}
          </h1>
        </TkCol> */}
      </TkRow>
      <TkCard className="time-entry-card">
        <TkCardHeader>
          <h4>Add Time</h4>
        </TkCardHeader>
        <TkCardBody>
          {loader ? (
            <TkLoader />
          ) : (
            <div>
              {fields.map((field, index) => (
                <fieldset key={field.id}>
                  <TimeEntry
                    update={update}
                    index={index}
                    value={field}
                    updateFormData={formSubmit.current}
                    // dbSelfAllocatedId={index === 0 ? selfAllocatedId : undefined}
                    setAllDurations={setAllDurations}
                    setTicketManditory={setTicketManditory}
                    ticketManditory={ticketManditory}
                    setIsTicketError={setIsTicketError}
                    isTicketErrror={isTicketErrror}
                    styleButton={field.disableFields}
                    allocationId={allocationId}
                  />
                  {fields.length > 1 && field.disableFields === false ? (
                    <TkButton
                      onClick={() => {
                        setAllDurations((prev) => {
                          const newPrev = { ...prev };
                          delete newPrev[index];
                          // Decrement other indexes by 1
                          Object.keys(newPrev).forEach((key) => {
                            if (parseInt(key) > index) {
                              newPrev[parseInt(key) - 1] = newPrev[key];
                              delete newPrev[key];
                            }
                          });
                          return newPrev;
                        });
                        remove(index);
                      }}
                      type="button"
                      className="bg-transparent border-0 ps-0 ms-0 text-center"
                    >
                      <span className="ms-auto badge p-1 rounded-circle badge-soft-danger fs-4 me-3">
                        <TkIcon className="ri-delete-bin-6-line"></TkIcon>
                      </span>
                    </TkButton>
                  ) : null}
                </fieldset>
              ))}

              <TkRow className="justify-content-center justify-content-md-end align-items-center mt-4 gap-1">
                <TkCol md={1} lg={5} className="text-center text-md-end">
                  <TkButton
                    type="button"
                    onClick={() => {
                      append(defaultTimeEntryValues());
                    }}
                    className="bg-transparent border-0 ps-0 ms-0 text-center"
                  >
                    <span className="add-timsheet-btn badge p-1 rounded-circle badge-soft-dark fs-4">
                      <TkIcon className="ri-add-line"></TkIcon>
                    </span>
                  </TkButton>
                </TkCol>
                {timesheetData.isError ? <FormErrorBox errMessage={timesheetData.error.message} /> : null}
                <TkCol md={10} lg={6} className="space-childern-sm text-end">
                  <TkButton
                    className="ms-auto"
                    color="secondary"
                    onClick={() => {
                      router.push(`${urls.timesheets}`);
                    }}
                    disabled={waiting || timesheetData.isLoading}
                  >
                    Cancel
                  </TkButton>
                  <TkButton
                    color="secondary"
                    onClick={onSubmitClick}
                    loading={!sendForApproval && timesheetData.isLoading}
                    disabled={waiting || (sendForApproval && timesheetData.isLoading)}
                  >
                    Save
                  </TkButton>
                  <TkButton
                    color="primary"
                    typr="submit"
                    onClick={() => {
                      setSendForApproval(true);
                      onSubmitClick();
                    }}
                    loading={sendForApproval && timesheetData.isLoading}
                    disabled={waiting || (!sendForApproval && timesheetData.isLoading)}
                  >
                    {!isApprovalLoading && !approvalData?.[0]?.approvalEnabledForTS ? "Submit" : "Submit For Approval"}
                  </TkButton>
                </TkCol>
              </TkRow>
            </div>
          )}
        </TkCardBody>
      </TkCard>
    </>
  );
}

export default AddTimeSheet;
