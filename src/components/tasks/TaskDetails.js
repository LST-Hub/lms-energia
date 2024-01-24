import React, { useEffect, useLayoutEffect, useState } from "react";

import { useRouter } from "next/router";
import DeleteModal from "../../utils/DeleteModal";
import TkInput from "../forms/TkInput";
import TkSelect from "../forms/TkSelect";
import TkButton from "../TkButton";
import { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkIcon from "../TkIcon";
import TkForm from "../forms/TkForm";
import TkRow, { TkCol } from "../TkRow";
import TkDate from "../forms/TkDate";
import TkEditCardHeader from "../TkEditCardHeader";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import classnames from "classnames";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../../../src/components/forms/ErrorText";
import {
  MinNameLength,
  MaxNameLength,
  bigInpuMaxLength,
  bigInpuMinLength,
  MaxAttachmentSize,
  RQ,
  API_BASE_URL,
  modes,
  timesheetHighlightColumn,
  urls,
  todaysTaskHighlightColumn,
} from "../../../src/utils/Constants";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import TkLoader from "../TkLoader";
import TkNoData from "../TkNoData";
import axios from "axios";
import { formatDate, formatDateForAPI } from "../../utils/date";
import TkUploadFiles from "../TkUploadFile";
import { formatBytes } from "../../utils/formatFileSize";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import hasPageModeAccess from "../../utils/hasPageAccess";
import useUserAccessLevel from "../../utils/hooks/useUserAccessLevel";
import TkAccessDenied from "../TkAccessDenied";
import { convertSecToTime, convertTimeToSec, convertToTime } from "../../utils/time";
import TkLabel from "../forms/TkLabel";
import TkCheckBox from "../forms/TkCheckBox";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import TkTableContainer from "../TkTableContainer";
import TkPageHead from "../TkPageHead";
import useSessionData from "../../utils/hooks/useSessionData";

const tabs = {
  timesheets: "timesheets",
  todaysTasks: "todaysTasks",
};

const tabValues = Object.values(tabs);

const schema = Yup.object({
  taskName: Yup.string()
    .min(MinNameLength, `Task name should have at least ${MinNameLength} character.`)
    .max(MaxNameLength, `Task name should have at most ${MaxNameLength} characters.`)
    .required("Task name is required"),

  project: Yup.object().nullable().required("Select a Project"),

  description: Yup.string().max(bigInpuMaxLength, `Description should have at most ${bigInpuMaxLength} characters.`),

  taskPriority: Yup.object().nullable(),

  taskStatus: Yup.object().required("Status is required").nullable(),

  startDate: Yup.date().nullable(),

  estimatedEndDate: Yup.date().nullable(),

  actualEndDate: Yup.date().nullable(),

  // estimatedTime: Yup.string(),

  estimatedTime: Yup.string()
    .matches(/^\d+(:[0-5][0-9]){0,2}$/, "Estimated time cannot contain characters")
    .test("estimatedTime", "Estimated time cannot be greater than 100000", function (value) {
      if (value) {
        const time = convertTimeToSec(value);
        if (time > 360000000) {
          return false;
        }
      }
      return true;
    }),

  actualTime: Yup.string(),

  assignedUsers: Yup.array().nullable().required("Assign Users is Required").min(1, "Assign Users is Required"),

  inactive: Yup.boolean().nullable(),

  billable: Yup.boolean().nullable(),
}).required();

const TaskDetails = ({ id, mode }) => {
  const accessLevel = useUserAccessLevel(permissionTypeIds.projAndTask);
  const viewMode = mode === modes.view;
  const editMode = mode === modes.edit;
  const router = useRouter();
  const sessionData = useSessionData();

  const tid = Number(id);
  const queryClient = useQueryClient();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
  });

  //default values for select
  const [userDropdown, setUserDropdown] = useState([]);
  const [statusDropdown, setStatusDropdown] = useState([]);
  const [priorityDropdown, setPriorityDropdown] = useState([]);
  const [isTaskActive, setIsTaskActive] = useState(true);
  const [activeTab, setActiveTab] = useState(tabs.timesheets);

  //Dropzone file upload
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [backendFiles, setBackendFiles] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletePageModal, setDeletePageModal] = useState(false);
  const [deleteFileData, setDeleteFileData] = useState();
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loadUpdateBtn, setLoadUpdateBtn] = useState(false);

  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allUsersList, selectedProjectId],
        queryFn: tkFetch.get(`${API_BASE_URL}/users/list${selectedProjectId ? `?projectId=${selectedProjectId}` : ""}`),
        enabled: !!selectedProjectId && hasPageModeAccess(mode, accessLevel),
      },
      {
        queryKey: [RQ.allStatus],
        queryFn: tkFetch.get(`${API_BASE_URL}/status/list`),
        enabled: hasPageModeAccess(mode, accessLevel),
      },
      {
        queryKey: [RQ.allPriority],
        queryFn: tkFetch.get(`${API_BASE_URL}/priority/list`),
        enabled: hasPageModeAccess(mode, accessLevel),
      },
      {
        queryKey: [RQ.task, tid, RQ.actualTime],
        queryFn: tkFetch.get(`${API_BASE_URL}/task/${tid}/actual-time`),
        enabled: !!tid && hasPageModeAccess(mode, accessLevel),
      },
    ],
  });

  const [users, status, priority, actualTime] = results;

  const {
    data: userData,
    isLoading: isUserLoading,
    isFetched: isUserFetched,
    isError: isUserError,
    error: userError,
  } = users;
  const {
    data: statusData,
    isLoading: isStatusLoading,
    isFetched: isStatusFetched,
    isError: isStatusError,
    error: statusError,
  } = status;
  const {
    data: priorityData,
    isLoading: isPriorityLoading,
    isFetched: isPriorityFetched,
    isError: isPriorityError,
    error: priorityError,
  } = priority;

  // TODO: report this to error reporting service, loading and error here is not important
  const {
    data: actualTimeData,
    isLoading: isActualTimeLoading,
    isError: isActualTimeError,
    error: actualTimeError,
  } = actualTime;

  const {
    data: timesheetHighlightsData,
    isLoading: isTimesheetHighlightsLoading,
    isError: isTimesheetHighlightsError,
    error: timesheetHighlightsError,
  } = useQuery({
    queryKey: [RQ.timesheetHighlights],
    queryFn: tkFetch.get(`${API_BASE_URL}/highlights/timesheets?taskId=${tid}`),
    enabled: !!tid && hasPageModeAccess(mode, accessLevel) && activeTab === tabs.timesheets,
  });

  const {
    data: todaysTaskHighlightsData,
    isLoading: isTodaysTaskHighlightsLoading,
    isError: isTodaysTaskHighlightsError,
    error: todaysTaskHighlightsError,
  } = useQuery({
    queryKey: [RQ.todaysTaskHighlights],
    queryFn: tkFetch.get(`${API_BASE_URL}/highlights/todays-tasks?taskId=${tid}`),
    enabled: !!tid && hasPageModeAccess(mode, accessLevel) && activeTab === tabs.todaysTasks,
  });

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      viewMode
        ? router.push(`${urls.taskView}/${tid}?tab=${tab}`, undefined, {
            scroll: false,
          })
        : router.push(`${urls.taskEdit}/${tid}?tab=${tab}`, undefined, {
            scroll: false,
          });
    }
  };

  //IMP: if readign fr reference, then try not to use useLayoutEffect, try always using useEffect instead
  // used layout effect because we need to get the tab from url, and settab before rendering the component
  useLayoutEffect(() => {
    // did not use router.query.tab because it was not updating the state, before component is rendered
    // const tab = router.query.tab;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tabValues.includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab(tabs.timesheets);
    }
  }, []);

  useEffect(() => {
    if (isUserError) {
      console.log("userError", userError);
      TkToastError(userError?.message);
    }
    if (isStatusError) {
      console.log("statusError", statusError);
      TkToastError(statusError?.message);
    }
    if (isPriorityError) {
      console.log("priorityError", priorityError);
      TkToastError(priorityError?.message);
    }
  });

  useEffect(() => {
    if (isStatusFetched && Array.isArray(statusData) && statusData.length > 0) {
      const statusOptions = statusData.map((status) => {
        return { value: status.id, label: status.name, active: status.active };
      });
      setStatusDropdown(statusOptions);
    }

    if (isPriorityFetched && Array.isArray(priorityData) && priorityData.length > 0) {
      const priorityOptions = priorityData.map((priority) => {
        return {
          value: priority.id,
          label: priority.name,
          active: priority.active,
        };
      });
      setPriorityDropdown(priorityOptions);
    }

    if (!selectedProjectId) {
      setUserDropdown([]);
      return;
    }
    if (isUserFetched && Array.isArray(userData) && userData.length > 0) {
      const userOptions = userData.map((user) => {
        return { value: user.id, label: user.name, active: user.active };
      });
      setUserDropdown(userOptions);
    }
  }, [isUserFetched, userData, isStatusFetched, statusData, isPriorityFetched, priorityData, selectedProjectId]);

  const { data, isLoading, isFetched, isError, error } = useQuery({
    queryKey: [RQ.task, tid],
    queryFn: tkFetch.get(`${API_BASE_URL}/task/${tid}`),
    enabled: !!tid && hasPageModeAccess(mode, accessLevel),
  });

  useEffect(() => {
    if (!isDirty && isFetched && Array.isArray(data) && data.length > 0) {
      setValue("taskName", data[0].name);
      setValue("startDate", data[0].startDate);
      setValue("estimatedEndDate", data[0].estimatedEndDate);
      setValue("actualEndDate", data[0].actualEndDate);
      setValue("estimatedTime", convertSecToTime(data[0].estimatedTime));
      setValue("description", data[0].description);
      setValue("billable", data[0].billable);
      setValue("inactive", !data[0].active);
      setIsTaskActive(data[0].active);
      setSelectedProjectId(data[0].project.id);
      //set name key and size from data[0].attachments to setBackendFiles
      setBackendFiles(
        data[0].attachments.map((file) => {
          return { name: file.name, sizeInKb: file.sizeInKb, key: file.key };
        })
      );
      setValue(
        "project",
        data[0].project
          ? {
              id: data[0].project?.id,
              value: data[0].project?.id,
              label: data[0].project?.name,
              active: data[0].project?.active,
            }
          : null
      );

      if (isPriorityFetched && Array.isArray(priorityData) && priorityData.length > 0) {
        // if (!isDirty && isFetched && Array.isArray(data) && data.length > 0) {
        //   const selectedPriority = priorityData.find((priority) => priority.id === data[0].priorityId);
        //   setValue(
        //     "taskPriority",
        //     selectedPriority
        //       ? { value: selectedPriority.id, label: selectedPriority.name, active: selectedPriority.active }
        //       : null
        //   );
        // }
        setValue(
          "taskPriority",
          data[0].priority
            ? {
                id: data[0].priority?.id,
                value: data[0].priority?.id,
                label: data[0].priority?.name,
                active: data[0].priority?.active,
              }
            : null
        );
      }

      if (isStatusFetched && Array.isArray(statusData) && statusData.length > 0) {
        // if (!isDirty && isFetched && Array.isArray(data) && data.length > 0) {
        //   const selectedStatus = statusData.find((status) => status.id === data[0].statusId);
        //   setValue(
        //     "taskStatus",
        //     selectedStatus
        //       ? { value: selectedStatus.id, label: selectedStatus.name, active: selectedStatus.active }
        //       : null
        //   );
        // }
        setValue(
          "taskStatus",
          data[0].status
            ? {
                id: data[0].status?.id,
                value: data[0].status?.id,
                label: data[0].status?.name,
                active: data[0].status?.active,
              }
            : null
        );
      }

      // if (isUserFetched && Array.isArray(userData) && userData.length > 0) {
      //   if (!isDirty && isFetched && Array.isArray(data) && data.length > 0) {
      //     const values = userData.filter((user) => data[0].taskUsers.map((u) => u.userId).includes(user.id));
      //     const selectedUser = values.map((user) => {
      //       return { value: user.id, label: user.name };
      //     });
      //     setValue("assignedUsers", values ? selectedUser : null);
      //   }
      // }
      if (!isDirty && isFetched && Array.isArray(data) && data.length > 0) {
        const selectedUser = data[0].taskUsers.map((user) => {
          return {
            id: user.user.id,
            value: user.user.id,
            label: user.user.name,
            active: user.user.active,
          };
        });
        setValue("assignedUsers", selectedUser ? selectedUser : null);
      }
    }
  }, [
    isFetched,
    data,
    isDirty,
    setValue,
    priorityData,
    isPriorityFetched,
    statusData,
    isStatusFetched,
    userData,
    isUserFetched,
  ]);

  useEffect(() => {
    if (Array.isArray(actualTimeData) && actualTimeData.length > 0) {
      setValue("actualTime", convertSecToTime(actualTimeData[0].actualTime));
    }
  }, [actualTimeData, setValue]);

  // const activeTask = useMutation({
  //   mutationFn: tkFetch.patchWithIdInUrl(`${API_BASE_URL}/task`),
  // });

  // const activeTaskChange = () => {
  //   if (!editMode) return;
  //   const apiData = {
  //     id: tid,
  //     active: !isTaskActive,
  //   };
  //   activeTask.mutate(apiData, {
  //     onSuccess: (data) => {
  //       setIsTaskActive(!isTaskActive);
  //       {
  //         isTaskActive
  //           ? TkToastSuccess("Task Inactivated Successfully")
  //           : TkToastSuccess("Task Activated Successfully");
  //       }
  //       queryClient.invalidateQueries({
  //         queryKey: [RQ.task, tid],
  //       });
  //     },
  //     onError: (error) => {
  //       console.log("error while updating task status", error);
  //       // TkToastError("Error in updating task status");
  //     },
  //   });
  // };

  const presignedUrls = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/attachments/presigned-urls`),
  });

  const onSubmit = (data) => {
    if (!editMode) return;
    if (selectedFiles.length > 0) {
      setUploadingFiles(true);
      const files = selectedFiles.map((file) => ({
        name: file.name,
        type: file.type,
      }));
      presignedUrls.mutate(
        { files },
        {
          onSuccess: async (urls) => {
            if (Array.isArray(urls)) {
              // TODO: two files with same name will cause bug as only first file will ge uploaded for both
              // as we generate presigned urls accordign to filenames and conttent type, so if 2 files wiil be having same name we will gerate diffrent urls in backend as 2 files are passed
              // but as we use file name as unque id to recognize which url is will be used to upload to which url,
              // so here though we will have 2 urls but same file name will lead to selecting same file both times,
              // it will not only happen for 2 files but for any numebr of files with same name, uploaded once
              const uploadPromises = [],
                fileKeys = [];
              const config = {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              };
              urls.forEach((urlInfo) => {
                const file = selectedFiles.find((file) => file.name === urlInfo.name);
                if (file) uploadPromises.push(axios.put(urlInfo.url, file, config));
              });
              // we are using promise.allSetlled for parallel uploading of all files
              const upload = await Promise.allSettled(uploadPromises);
              let rejectedCount = 0;
              upload.forEach((fileReq) => {
                if (fileReq.status === "fulfilled") {
                  const reqFile = fileReq.value?.config?.data; // get request data from axios
                  if (reqFile) {
                    const urlData = urls.find((urlInfo) => urlInfo.name === reqFile?.name);
                    if (urlData) {
                      fileKeys.push({
                        name: reqFile.name,
                        key: urlData.key,
                        sizeInKb: Math.ceil(reqFile.size / 1000),
                      });
                    }
                  }
                }
                if (fileReq.status === "rejected") {
                  rejectedCount++;
                }
              });
              if (rejectedCount > 0) {
                //TODO: show error that, we got problems while uploading ${rejectedCount} attachments, saving the project without ${rejectedCount} attachments
                TkToastError(`We got problems while uploading ${rejectedCount} attachments, continuing without that.`);
              }
              setUploadingFiles(false);
              updatedTask(data, fileKeys);
            }
          },
          onError: (error) => {
            console.log("error while uploading files", error);
            setUploadingFiles(false);
            updatedTask(data);
          },
        }
      );
    } else {
      setUploadingFiles(false);
      updatedTask(data);
    }
  };

  const updateTask = useMutation({
    mutationFn: tkFetch.putWithIdInUrl(`${API_BASE_URL}/task`),
  });

  const updatedTask = (formData, fileKeys) => {
    if (formData.assignedUsers.length > 0) {
      const user = formData.assignedUsers.find((user) => user.active === false);
      if (user) {
        setError("assignedUsers", {
          type: "manual",
          message: `Selected user "${user.label}" is inactive, cannot assign inactive user to project`,
        });
        return;
      }
    }

    // if (formData.taskStatus?.active === false && formData.taskPriority?.active === false) {
    //   setError("taskStatus", {
    //     type: "manual",
    //     message: "Selected status is inactive",
    //   });
    //   setError("taskPriority", {
    //     type: "manual",
    //     message: "Selected priority is inactive",
    //   });
    //   return;
    // }

    // if (formData.taskStatus?.active === false) {
    //   setError("taskStatus", {
    //     type: "manual",
    //     message: "Selected status is inactive",
    //   });
    //   return;
    // }

    // if (formData.taskPriority?.active === false) {
    //   setError("taskPriority", {
    //     type: "manual",
    //     message: "Selected priority is inactive",
    //   });
    //   return;
    // }

    if (formData.taskStatus?.active === false) {
      setError("taskStatus", {
        type: "manual",
        message: "Selected status is inactive",
      });
      return;
    } else if (formData.taskPriority?.active === false) {
      setError("taskPriority", {
        type: "manual",
        message: "Selected priority is inactive",
      });
      return;
    }
    setLoadUpdateBtn(true);
    // return;
    const files = fileKeys ? fileKeys : [];
    const apiData = {
      taskName: formData.taskName,
      description: formData.description,
      priorityId: formData.taskPriority?.value ?? null,
      statusId: formData.taskStatus?.value ?? null,
      startDate: formatDateForAPI(formData.startDate),
      estimatedEndDate: formatDateForAPI(formData.estimatedEndDate),
      actualEndDate: formatDateForAPI(formData.actualEndDate),
      estimatedTime: convertTimeToSec(formData.estimatedTime),
      assignedUsers: formData.assignedUsers,
      billable: formData.billable,
      active: !formData.inactive,
      attachmentsData: [...backendFiles, ...files],
    };
    updateTask.mutate(
      { ...apiData, id: tid },
      {
        onSuccess: (data) => {
          TkToastSuccess("Task Updated Successfully");
          queryClient.invalidateQueries({
            queryKey: [RQ.task, tid],
          });
          setLoadUpdateBtn(false);
          router.push(`${urls.tasks}`);
        },
        onError: (error) => {
          setLoadUpdateBtn(false);
          console.log("error while updating task", error);
        },
      }
    );
  };

  const onClickDownload = async (fileName, key) => {
    const keys = [{ name: fileName, key }];
    presignedUrls.mutate(
      { keys },
      {
        onSuccess: async (urls) => {
          if (Array.isArray(urls)) {
            const urlData = urls.find((urlInfo) => urlInfo.name === fileName);
            if (urlData) {
              const link = document.createElement("a");
              link.href = urlData.url;
              link.style.display = "none";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }
        },
      }
    );
  };

  const deleteAttachment = useMutation({
    mutationFn: tkFetch.put(`${API_BASE_URL}/attachments/delete`),
  });

  const onClickDelete = async (fileName, key, sizeInKb) => {
    const newBackendFiles = backendFiles.filter((file) => file.key !== key && file.name !== fileName);
    const apiData = {
      attachmentsData: newBackendFiles,
    };

    updateTask.mutate(
      { ...apiData, id: tid, deleteAttachment: true },
      {
        onSuccess: (data) => {
          setBackendFiles(newBackendFiles);
          TkToastSuccess("Attachment Deleted Successfully");
          setDeleteModal(false);
          queryClient.invalidateQueries({
            queryKey: [RQ.task, tid],
          });
        },
        onError: (error) => {
          console.log("error while deleting attachment", error);
          setDeleteModal(false);
        },
      }
    );

    const keys = [{ name: fileName, key, sizeInKb }];

    deleteAttachment.mutate(
      { keys },
      {
        onSuccess: async (data) => {},
        onError: (error) => {
          console.log("error while deleting attachment", error);
        },
      }
    );
  };

  const deleteTask = useMutation({
    mutationFn: tkFetch.deleteWithIdInUrl(`${API_BASE_URL}/task`),
  });

  const deleteTaskHandler = () => {
    if (!editMode) return;
    const apiData = {
      id: tid,
    };
    deleteTask.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Task Deleted Successfully");
        queryClient.invalidateQueries({
          queryKey: [RQ.task, tid],
        });
        router.push(`${urls.tasks}`);
      },
      onError: (error) => {
        console.log("error while deleting task", error);
      },
    });
  };

  const toggleDeleteModelPopup = () => {
    setDeletePageModal(true);
  };

  const toggleDeleteModal = (attachmentData) => {
    attachmentData.map((file) => {
      setDeleteFileData({
        fileName: file.name,
        key: file.key,
        sizeInKb: file.sizeInKb,
      });
    });
    setDeleteModal(true);
  };

  if (!hasPageModeAccess(mode, accessLevel)) {
    return <TkAccessDenied />;
  }

  return (
    <>
      {isLoading ? (
        <TkLoader />
      ) : isError ? (
        <FormErrorBox errMessage={error.message} />
      ) : data.length > 0 ? (
        <>
          <TkPageHead>
            <title>{`Task: ${data[0].name}`}</title>
          </TkPageHead>
          <DeleteModal
            show={deleteModal}
            onDeleteClick={() => onClickDelete(deleteFileData.fileName, deleteFileData.key, deleteFileData.sizeInKb)}
            onCloseClick={() => setDeleteModal(false)}
            loading={deleteAttachment.isLoading}
          />

          <DeleteModal
            show={deletePageModal}
            onDeleteClick={() => {
              deleteTaskHandler();
              setDeletePageModal(false);
            }}
            onCloseClick={() => setDeletePageModal(false)}
          />

          <TkRow>
            <TkCol>
              <TkRow className="justify-content-center">
                <TkCol>
                  {/* <TkCard> */}
                  <TkEditCardHeader
                    title={viewMode ? "Task Details" : "Edit Task"}
                    // active={isTaskActive}
                    // onActiveClick={activeTaskChange}
                    onDeleteClick={deleteTaskHandler}
                    isEditAccess={viewMode && accessLevel >= perAccessIds.edit}
                    disableDelete={viewMode}
                    editLink={`${urls.taskEdit}/${tid}`}
                    toggleDeleteModel={toggleDeleteModelPopup}
                  />
                  {deleteTask.isError ? <FormErrorBox errMessage={deleteTask.error?.message} /> : null}
                  <TkCardBody className="mt-4">
                    <TkForm onSubmit={handleSubmit(onSubmit)}>
                      <div>
                        <TkRow className="g-3 gx-4 gy-4">
                          <TkCol lg={4}>
                            <TkInput
                              {...register("taskName")}
                              labelName="Task Name"
                              id="taskName"
                              type="text"
                              autoFocus
                              placeholder="Enter Task Name"
                              disabled={viewMode}
                              requiredStarOnLabel={editMode}
                            />
                            {errors.taskName?.message ? (
                              <FormErrorText>{errors.taskName?.message}</FormErrorText>
                            ) : null}
                          </TkCol>

                          <TkCol lg={4}>
                            <Controller
                              name="project"
                              control={control}
                              render={({ field }) => (
                                <TkSelect
                                  {...field}
                                  labelName="Project"
                                  id="project"
                                  placeholder="Select Project"
                                  loading={isLoading}
                                  onChange={(e) => {
                                    // invalidate the query of users, and fetch new users
                                    field.onChange(e);
                                    queryClient.invalidateQueries({
                                      queryKey: [RQ.allUsersList, selectedProjectId],
                                    });
                                    setSelectedProjectId(e ? e.value : null);
                                    setValue("assignedUsers", null);
                                  }}
                                  disabled={true}
                                  requiredStarOnLabel={editMode}
                                />
                              )}
                            />
                            {errors.project?.message ? <FormErrorText>{errors.project?.message}</FormErrorText> : null}
                          </TkCol>

                          <TkCol lg={4}>
                            <Controller
                              name="taskStatus"
                              control={control}
                              render={({ field }) => (
                                <TkSelect
                                  {...field}
                                  labelName="Status"
                                  id="taskStatus"
                                  placeholder="Select Status"
                                  loading={isStatusLoading}
                                  onChange={(e) => {
                                    // fileds.onChange(e) is controllers onChange
                                    field.onChange(e);
                                  }}
                                  options={statusDropdown}
                                  disabled={viewMode}
                                  requiredStarOnLabel={editMode}
                                />
                              )}
                            />
                            {errors.taskStatus?.message ? (
                              <FormErrorText>{errors.taskStatus?.message}</FormErrorText>
                            ) : null}
                          </TkCol>

                          <TkCol lg={4}>
                            <Controller
                              name="taskPriority"
                              control={control}
                              render={({ field }) => (
                                <TkSelect
                                  {...field}
                                  labelName="Priority"
                                  id="taskPriority"
                                  placeholder="Select Priority"
                                  loading={isPriorityLoading}
                                  onChange={(e) => {
                                    // fileds.onChange(e) is controllers onChange
                                    field.onChange(e);
                                  }}
                                  options={priorityDropdown}
                                  disabled={viewMode}
                                />
                              )}
                            />
                            {errors.taskPriority?.message ? (
                              <FormErrorText>{errors.taskPriority?.message}</FormErrorText>
                            ) : null}
                          </TkCol>

                          <TkCol lg={4}>
                            <Controller
                              name="startDate"
                              control={control}
                              render={({ field }) => (
                                <TkDate
                                  {...field}
                                  labelName="Start Date"
                                  id="startDate"
                                  type="text"
                                  placeholder="Enter Start Date"
                                  options={{
                                    altInput: true,
                                  }}
                                  disabled={viewMode}
                                />
                              )}
                            />
                          </TkCol>

                          <TkCol lg={4}>
                            <Controller
                              name="estimatedEndDate"
                              control={control}
                              render={({ field }) => (
                                <TkDate
                                  {...field}
                                  labelName="Estimated End Date"
                                  id="estimatedEndDate"
                                  type="text"
                                  options={{
                                    altInput: true,
                                  }}
                                  placeholder="Enter Estimated End Date"
                                  disabled={viewMode}
                                />
                              )}
                            />
                          </TkCol>

                          <TkCol lg={4}>
                            <Controller
                              name="actualEndDate"
                              control={control}
                              render={({ field }) => (
                                <TkDate
                                  {...field}
                                  labelName="Actual End Date"
                                  id="actualEndDate"
                                  type="text"
                                  options={{
                                    altInput: true,
                                  }}
                                  placeholder="Enter Actual End Date"
                                  disabled={viewMode}
                                />
                              )}
                            />
                          </TkCol>

                          <TkCol lg={4}>
                            <TkInput
                              {...register("estimatedTime")}
                              labelName="Estimated Time (HH:MM)"
                              id="estimatedTime"
                              type="text"
                              placeholder="Enter Estimated Time"
                              onBlur={(e) => {
                                setValue("estimatedTime", convertToTime(e.target.value));
                              }}
                              disabled={viewMode}
                            />
                            {errors.estimatedTime?.message ? (
                              <FormErrorText>{errors.estimatedTime?.message}</FormErrorText>
                            ) : null}
                          </TkCol>

                          <TkCol lg={4}>
                            <TkInput
                              {...register("actualTime")}
                              labelName="Actual Time (HH:MM)"
                              id="actualTime"
                              type="text"
                              disabled={true}
                            />
                          </TkCol>

                          <TkCol lg={4}>
                            <div>
                              <Controller
                                name="assignedUsers"
                                control={control}
                                render={({ field }) => (
                                  <TkSelect
                                    {...field}
                                    labelName="Assign Users"
                                    id="assignedUsers"
                                    options={userDropdown}
                                    loading={selectedProjectId && isUserLoading}
                                    isMulti={true}
                                    placeholder="Assign Users"
                                    requiredStarOnLabel={editMode}
                                    // onChange={(e) => {
                                    //   onChange();
                                    //   handleAssignUsers(e);
                                    // }}
                                    disabled={viewMode}
                                  />
                                )}
                              />
                              {errors.assignedUsers?.message ? (
                                <FormErrorText>{errors.assignedUsers?.message}</FormErrorText>
                              ) : null}
                            </div>
                          </TkCol>

                          <TkRow>
                            <TkCol lg={4}>
                              <div className="mt-4">
                                <TkCheckBox
                                  {...register("inactive")}
                                  id="inactive"
                                  labelName="Inactive"
                                  disabled={viewMode}
                                />
                                <TkLabel className="me-3 ms-lg-3">Inactive</TkLabel>
                              </div>
                            </TkCol>

                            <TkCol lg={4}>
                              <div className="mt-4 ms-2">
                                <TkCheckBox
                                  {...register("billable")}
                                  id="billable"
                                  labelName="billable"
                                  disabled={viewMode}
                                />
                                <TkLabel className="me-3 ms-lg-3">Billable</TkLabel>
                              </div>
                            </TkCol>
                          </TkRow>

                          <TkCol lg={12}>
                            <TkInput
                              {...register("description")}
                              labelName="Description"
                              id="description"
                              type="textarea"
                              placeholder="Enter Description"
                              validate={{
                                required: { value: true },
                              }}
                              defaultValue="Create the Admin side for archival for managing users"
                              invalid={errors.description?.message ? true : false}
                              disabled={viewMode}
                            />
                            {errors.description?.message ? (
                              <FormErrorText>{errors.description?.message}</FormErrorText>
                            ) : null}
                          </TkCol>

                          <TkCol lg={12}>
                            {(viewMode && backendFiles.length > 0) || editMode ? (
                              // <TkCard>
                              <TkCardBody>
                                {/* TODO: render attachments dynamically from the database */}
                                <TkCardHeader>
                                  <TkCardTitle tag="h5" className="mb-3">
                                    Attachments
                                  </TkCardTitle>
                                </TkCardHeader>
                                <div className="vstack gap-2">
                                  {backendFiles?.map((attachment) => (
                                    <div key={attachment.key} className="border rounded border-dashed p-2">
                                      <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0 me-3">
                                          <div className="avatar-sm">
                                            <div className="avatar-title bg-light text-secondary rounded fs-24">
                                              <TkIcon className="ri-folder-zip-line"></TkIcon>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex-grow-1 overflow-hidden">
                                          <h5 className="fs-13 mb-1">
                                            <p className="text-body text-truncate d-block mb-0">{attachment.name}</p>
                                            {/* <Link href="#">
                                                </Link> */}
                                          </h5>
                                          <div>{formatBytes(Number(attachment.sizeInKb) * 1000)}</div>
                                        </div>
                                        <div className="flex-shrink-0 ms-2">
                                          <div className="d-flex gap-1">
                                            <button
                                              onClick={() => onClickDownload(attachment.name, attachment.key)}
                                              type="button"
                                              className="btn btn-icon text-muted btn-sm fs-18"
                                            >
                                              <TkIcon className="ri-download-2-line"></TkIcon>
                                            </button>
                                            {editMode ? (
                                              <button
                                                onClick={() =>
                                                  toggleDeleteModal([
                                                    {
                                                      name: attachment.name,
                                                      key: attachment.key,
                                                      sizeInKb: attachment.sizeInKb,
                                                    },
                                                  ])
                                                }
                                                type="button"
                                                className="btn btn-icon text-muted btn-sm fs-18"
                                              >
                                                <TkIcon className="ri-delete-bin-fill"></TkIcon>
                                              </button>
                                            ) : null}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {editMode ? (
                                  <TkUploadFiles
                                    onFilesDrop={(successFiles, errorFiles) => {
                                      setSelectedFiles(successFiles);
                                    }}
                                    uploading={uploadingFiles}
                                  >
                                    <h4 className="pt-2">Drop files here or click to Add more files.</h4>
                                  </TkUploadFiles>
                                ) : null}
                              </TkCardBody>
                            ) : // </TkCard>
                            null}
                          </TkCol>
                        </TkRow>
                        {updateTask.isError ? <FormErrorBox errMessage={updateTask.error?.message} /> : null}
                        <div className="d-flex mt-4 space-childern">
                          {editMode ? (
                            <div className="ms-auto">
                              <TkButton
                                disabled={updateTask.isLoading || uploadingFiles}
                                onClick={() => router.push(`${urls.tasks}`)}
                                type="button"
                                color="secondary"
                              >
                                Cancel
                              </TkButton>{" "}
                              <TkButton loading={loadUpdateBtn} type="submit" color="primary">
                                Update
                              </TkButton>
                            </div>
                          ) : null}
                          {/* {viewMode && accessLevel >= perAccessIds.edit ? (
                            <div className="ms-auto">
                              <TkButton
                                onClick={() => router.push(`${urls.taskEdit}/${tid}`)}
                                type="button"
                                color="primary"
                              >
                                Edit
                              </TkButton>
                            </div>
                          ) : null} */}
                        </div>
                      </div>
                    </TkForm>
                  </TkCardBody>
                  {/* </TkCard> */}
                </TkCol>
                <Nav className="nav-tabs dropdown-tabs nav-tabs-custom mb-3">
                  <NavItem>
                    <NavLink
                      href="#"
                      className={classnames({
                        active: activeTab === tabs.timesheets,
                      })}
                      onClick={() => {
                        toggleTab(tabs.timesheets);
                      }}
                    >
                      Timesheets
                    </NavLink>
                  </NavItem>
                  {sessionData?.todaysTaskEnabled ? (
                    <NavItem>
                      <NavLink
                        href="#"
                        className={classnames({
                          active: activeTab === tabs.todaysTasks,
                        })}
                        onClick={() => {
                          toggleTab(tabs.todaysTasks);
                        }}
                      >
                        Today&apos;s Tasks
                      </NavLink>
                    </NavItem>
                  ) : null}
                </Nav>
                <TabContent activeTab={activeTab}>
                  <TabPane tabId={tabs.timesheets}>
                    {/* <TkCard> */}
                    <TkCardBody>
                      {timesheetHighlightsData?.length > 0 ? (
                        <TkTableContainer
                          columns={timesheetHighlightColumn}
                          data={timesheetHighlightsData || []}
                          loading={isTimesheetHighlightsLoading}
                          noDataMessage="No timesheets found"
                          defaultPageSize={10}
                          customPageSize={true}
                          showPagination={true}
                        />
                      ) : (
                        <TkNoData />
                      )}
                    </TkCardBody>
                    {/* </TkCard> */}
                  </TabPane>
                  <TabPane tabId={tabs.todaysTasks}>
                    {/* <TkCard> */}
                    <TkCardBody>
                      {todaysTaskHighlightsData?.length > 0 ? (
                        <TkTableContainer
                          columns={todaysTaskHighlightColumn}
                          data={todaysTaskHighlightsData || []}
                          loading={isTodaysTaskHighlightsLoading}
                          noDataMessage="No Todays task found"
                          defaultPageSize={10}
                          customPageSize={true}
                          showPagination={true}
                        />
                      ) : (
                        <TkNoData />
                      )}
                    </TkCardBody>
                    {/* </TkCard> */}
                  </TabPane>
                </TabContent>
              </TkRow>
            </TkCol>
          </TkRow>
        </>
      ) : (
        <TkNoData />
      )}
    </>
  );
};

export default TaskDetails;
