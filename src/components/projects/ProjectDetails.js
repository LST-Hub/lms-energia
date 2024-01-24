import React, { useState, useEffect } from "react";
import TkInput from "../forms/TkInput";
import TkForm from "../forms/TkForm";
import TkRow, { TkCol } from "../TkRow";
import TkDate from "../forms/TkDate";
import TkSelect from "../forms/TkSelect";
import TkButton from "../TkButton";
import { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkIcon from "../TkIcon";
import TkEditCardHeader from "../TkEditCardHeader";
import { useRouter } from "next/router";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../../../src/components/forms/ErrorText";
import {
  bigInpuMaxLength,
  RQ,
  API_BASE_URL,
  modes,
  smallInputMaxLength,
  smallInputMinLength,
  timesheetHighlightColumn,
  taskHighlightColumn,
  urls,
  todaysTaskHighlightColumn,
  projectTypes,
} from "../../../src/utils/Constants";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import TkLoader from "../TkLoader";
import TkNoData from "../TkNoData";
import axios from "axios";
import DeleteModal from "../../utils/DeleteModal";
import { formatDateForAPI } from "../../utils/date";
import TkUploadFiles from "../TkUploadFile";
import { formatBytes } from "../../utils/formatFileSize";
import useUserAccessLevel from "../../utils/hooks/useUserAccessLevel";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import hasPageModeAccess from "../../utils/hasPageAccess";
import TkAccessDenied from "../TkAccessDenied";
import { convertSecToTime, convertTimeToSec, convertToTime } from "../../utils/time";
import TkLabel from "../forms/TkLabel";
import TkCheckBox from "../forms/TkCheckBox";
import WarningModal from "../../utils/WarningModal.";
import { Nav, NavItem, NavLink, TabContent, TabPane, UncontrolledTooltip } from "reactstrap";
import classnames from "classnames";
import TkTableContainer from "../TkTableContainer";
import { useLayoutEffect } from "react";
import TkPageHead from "../TkPageHead";
import useSessionData from "../../utils/hooks/useSessionData";

const tabs = {
  timesheets: "timesheets",
  todaysTasks: "todaysTasks",
  tasks: "tasks",
};

const tabValues = Object.values(tabs);

const schema = Yup.object({
  projectName: Yup.string()
    .min(smallInputMinLength, `Project name should have at least ${smallInputMinLength} character.`)
    .max(smallInputMaxLength, `Project name should have at most ${smallInputMaxLength} characters.`)
    .required("Project name is required"),

  clientName: Yup.object().nullable().required("Client is Required"),

  projectManager: Yup.object().nullable().required("Project Manager is Required"),

  projectStatus: Yup.object().nullable().required("Project Status is Required"),

  projectPriority: Yup.object().nullable(),

  startDate: Yup.date().nullable(),
  endDate: Yup.date().nullable(),
  actualEndDate: Yup.date().nullable(),

  asignUsers: Yup.array().required("Assign Users is Required").min(1, "Assign Users is Required"),

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

  projectDescription: Yup.string().max(
    bigInpuMaxLength,
    `Description should have at most ${bigInpuMaxLength} characters.`
  ),

  inactive: Yup.boolean().nullable(),

  canSupervisorApprove: Yup.boolean().nullable(),
}).required();

const ProjectDetails = ({ id, mode }) => {
  const accessLevel = useUserAccessLevel(permissionTypeIds.projAndTask);
  const viewMode = mode === modes.view;
  const editMode = mode === modes.edit;
  const sessionData = useSessionData();
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

  const router = useRouter();

  const pid = Number(id);
  const queryClient = useQueryClient();

  const { data, isLoading, isFetched, isError, error } = useQuery({
    queryKey: [RQ.project, pid],
    queryFn: tkFetch.get(`${API_BASE_URL}/project/${pid}`),
    enabled: !!pid && hasPageModeAccess(mode, accessLevel),
  });

  // const activeProject = useMutation({ mutationFn: tkFetch.patchWithIdInUrl(`${API_BASE_URL}/project`) });

  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allUsersList],
        queryFn: tkFetch.get(`${API_BASE_URL}/users/list`),
        enabled: hasPageModeAccess(mode, accessLevel),
      },
      {
        queryKey: [RQ.allUsersList, "projectManager"],
        queryFn: tkFetch.get(`${API_BASE_URL}/users/list?filter=projectManager`),
        enabled: hasPageModeAccess(mode, accessLevel),
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
        queryKey: [RQ.project, pid, RQ.actualTime],
        queryFn: tkFetch.get(`${API_BASE_URL}/project/${pid}/actual-time`),
        enabled: !!pid && hasPageModeAccess(mode, accessLevel),
      },
    ],
  });

  const [users, pms, status, priority, actualTime] = results;

  const {
    data: userData,
    isLoading: isUserLoading,
    isFetched: isUserFetched,
    isError: isUserError,
    error: userError,
  } = users;
  const { data: pmData, isLoading: ispmLoading, isFetched: ispmFetched, isError: ispmError, error: pmError } = pms;
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

  const [activeTab, setActiveTab] = useState(tabs.tasks);

  const {
    data: timesheetHighlightsData,
    isLoading: isTimesheetHighlightsLoading,
    isError: isTimesheetHighlightsError,
    error: timesheetHighlightsError,
  } = useQuery({
    queryKey: [RQ.timesheetHighlights],
    queryFn: tkFetch.get(`${API_BASE_URL}/highlights/timesheets?projectId=${pid}`),
    enabled: !!pid && hasPageModeAccess(mode, accessLevel) && activeTab === tabs.timesheets,
  });

  const {
    data: todaysTaskHighlightsData,
    isLoading: isTodaysTaskHighlightsLoading,
    isError: isTodaysTaskHighlightsError,
    error: todaysTaskHighlightsError,
  } = useQuery({
    queryKey: [RQ.todaysTaskHighlights],
    queryFn: tkFetch.get(`${API_BASE_URL}/highlights/todays-tasks?projectId=${pid}`),
    enabled: !!pid && hasPageModeAccess(mode, accessLevel) && activeTab === tabs.todaysTasks,
  });

  const {
    data: taskHighlightsData,
    isLoading: isTaskHighlightsLoading,
    isError: isTaskHighlightsError,
    error: taskHighlightsError,
  } = useQuery({
    queryKey: [RQ.taskHighlights],
    queryFn: tkFetch.get(`${API_BASE_URL}/highlights/tasks?projectId=${pid}`),
    enabled: !!pid && hasPageModeAccess(mode, accessLevel) && activeTab === tabs.tasks,
  });

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

  const [statusDropdown, setStatusDropdown] = useState([]);
  const [priorityDropdown, setPriorityDropdown] = useState([]);
  const [userDropdown, setUserDropdown] = useState([]);
  const [pmDropdown, setPMDropdown] = useState([]);
  const [isProjectActive, setIsProjectActive] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false); //Dropzone files
  const [backendFiles, setBackendFiles] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletePageModal, setDeletePageModal] = useState(false);
  const [deleteFileData, setDeleteFileData] = useState();
  const [confirmModal, setConfirmModal] = useState(false);
  const [loadUpdateBtn, setLoadUpdateBtn] = useState(false);

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      viewMode
        ? router.push(`${urls.projectView}/${pid}?tab=${tab}`, undefined, {
            scroll: false,
          })
        : router.push(`${urls.projectEdit}/${pid}?tab=${tab}`, undefined, {
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
      setActiveTab(tabs.tasks);
    }
  }, []);

  useEffect(() => {
    if (!isDirty && isFetched && Array.isArray(data) && data.length > 0) {
      setValue("projectName", data[0].name);
      setValue("startDate", data[0].startDate);
      setValue("endDate", data[0].estimatedEndDate);
      setValue("estimatedTime", convertSecToTime(data[0].estimatedTime));
      // setValue("emailTimeSheet", data[0].emailsCC[0]);
      setValue("projectDescription", data[0].description);
      setValue("actualEndDate", data[0].actualEndDate);
      setValue("inactive", !data[0].active);
      setValue("canSupervisorApprove", data[0].canSupervisorApproveTime);
      setValue("ticket", data[0].ticket);
      // check if projectType and data[0].projectType is same then set the value
      if (data[0].projectType) {
        setValue(
          "projectType",
          projectTypes.find((projectType) => projectType.value === data[0].projectType)
        );
      }
      setIsProjectActive(data[0].active);
      setBackendFiles(
        data[0].attachments.map((file) => {
          return { name: file.name, sizeInKb: file.sizeInKb, key: file.key };
        })
      );
      setValue(
        "clientName",
        data[0].client
          ? {
              id: data[0].client?.id,
              value: data[0].client?.id,
              label: data[0].client?.name,
              active: data[0].client?.active,
            }
          : null
      );
    }

    if (isUserFetched && Array.isArray(userData) && userData.length > 0) {
      const userNames = userData.map((user) => {
        return {
          id: user.id,
          value: user.id,
          label: user.name,
          active: user.active,
        };
      });
      setUserDropdown(userNames);
      if (!isDirty && isFetched && Array.isArray(data) && data.length > 0) {
        const selectedUser = data[0].projectUsers.map((user) => {
          return {
            id: user.user.id,
            value: user.user.id,
            label: user.user.name,
            active: user.user.active,
          };
        });
        setValue("asignUsers", selectedUser);
      }
    }

    if (ispmFetched && Array.isArray(pmData) && pmData.length > 0) {
      const pmNames = pmData.map((pm) => {
        return { id: pm.id, value: pm.id, label: pm.name };
      });
      setPMDropdown(pmNames);
      if (!isDirty && isFetched && Array.isArray(data) && data.length > 0) {
        const selectedPM = pmData.find((pm) => pm.id === data[0]?.pm?.id);
        setValue(
          "projectManager",
          selectedPM
            ? {
                id: selectedPM.id,
                value: selectedPM.id,
                label: selectedPM.name,
              }
            : null
        );
      }
    }

    if (isStatusFetched && Array.isArray(statusData) && statusData.length > 0) {
      const statusNames = statusData.map((status) => {
        return {
          id: status.id,
          value: status.id,
          label: status.name,
          active: status.active,
        };
      });
      setStatusDropdown(statusNames);

      // set value to status name if the name match in project data
      if (!isDirty && isFetched && Array.isArray(data) && data.length > 0) {
        // const selectedStatus = statusData.find((status) => status.id === data[0].statusId);
        // setValue(
        //   "projectStatus",
        //   selectedStatus
        //     ? {
        //         id: selectedStatus.id,
        //         value: selectedStatus.id,
        //         label: selectedStatus.name,
        //         active: selectedStatus.active,
        //       }
        //     : null
        // );

        setValue(
          "projectStatus",
          data[0].status
            ? {
                values: data[0].status?.id,
                label: data[0].status?.name,
                id: data[0].status?.id,
                active: data[0].status?.active,
              }
            : null
        );
      }
    }

    if (isPriorityFetched && Array.isArray(priorityData) && priorityData.length > 0) {
      const priorityNames = priorityData.map((priority) => {
        return {
          id: priority.id,
          value: priority.id,
          label: priority.name,
          active: priority.active,
        };
      });
      setPriorityDropdown(priorityNames);

      // set value to priority name if the name match in project data
      if (!isDirty && isFetched && Array.isArray(data) && data.length > 0) {
        // const selectedPriority = priorityData.find((priority) => priority.id === data[0].priorityId);
        // setValue(
        //   "projectPriority",
        //   selectedPriority
        //     ? {
        //         id: selectedPriority.id,
        //         value: selectedPriority.id,
        //         label: selectedPriority.name,
        //         active: selectedPriority.active,
        //       }
        //     : null
        // );
        setValue(
          "projectPriority",
          data[0].priority
            ? {
                value: data[0].priority?.id,
                label: data[0].priority?.name,
                id: data[0].priority?.id,
                active: data[0].priority?.active,
              }
            : null
        );
      }
    }
  }, [
    data,
    isFetched,
    isDirty,
    setValue,
    statusData,
    isStatusFetched,
    priorityData,
    isPriorityFetched,
    userData,
    isUserFetched,
    pmData,
    ispmFetched,
  ]);

  useEffect(() => {
    if (Array.isArray(actualTimeData) && actualTimeData.length > 0) {
      setValue("actualTime", convertSecToTime(actualTimeData[0].actualTime));
    }
  }, [actualTimeData, setValue]);

  // const activeProjectChange = () => {
  //   if (!editMode) return;
  //   const apiData = {
  //     id: pid,
  //     active: !isProjectActive,
  //   };
  //   activeProject.mutate(apiData, {
  //     onSuccess: (data) => {
  //       setIsProjectActive(!isProjectActive);
  //       {
  //         isProjectActive
  //           ? TkToastSuccess("Project Inactivated Successfully")
  //           : TkToastSuccess("Project Activated Successfully");
  //       }
  //       queryClient.invalidateQueries({
  //         queryKey: [RQ.project, pid],
  //       });
  //     },
  //     onError: (error) => {
  //       console.log("error while updating project status", error);
  //       TkToastError("Something went wrong");
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
              updatedProject(data, fileKeys);
            }
          },
          onError: (error) => {
            console.log("error while uploading files", error);
            setUploadingFiles(false);
            updatedProject(data);
          },
        }
      );
    } else {
      setUploadingFiles(false);
      updatedProject(data);
    }
  };

  const updateProject = useMutation({
    mutationFn: tkFetch.putWithIdInUrl(`${API_BASE_URL}/project`),
  });

  const updatedProject = (formData, fileKeys) => {
    // if (formData.clientName?.active === false) {
    //   setError("clientName", {
    //     type: "manual",
    //     message: "Selected client is inactive",
    //   });
    //   return;
    // }

    // if (formData.projectStatus?.active === false && formData.projectPriority?.active === false) {
    //   setError("projectStatus", {
    //     type: "manual",
    //     message: "Selected status is inactive",
    //   });
    //   setError("projectPriority", {
    //     type: "manual",
    //     message: "Selected priority is inactive",
    //   });
    //   return;
    // }

    // if (formData.projectStatus?.active === false) {
    //   setError("projectStatus", {
    //     type: "manual",
    //     message: "Selected status is inactive",
    //   });
    //   return;
    // }

    // if (formData.projectPriority?.active === false) {
    //   setError("projectPriority", {
    //     type: "manual",
    //     message: "Selected priority is inactive",
    //   });
    //   return;
    // }

    if (formData.projectStatus?.active === false) {
      setError("projectStatus", {
        type: "manual",
        message: "Selected status is inactive",
      });
      return;
    } else if (formData.projectPriority?.active === false) {
      setError("projectPriority", {
        type: "manual",
        message: "Selected priority is inactive",
      });
      return;
    }

    if (formData.asignUsers.length > 0) {
      const user = formData.asignUsers.find((user) => user.active === false);
      if (user) {
        setError("asignUsers", {
          type: "manual",
          message: `Selected user "${user.label}" is inactive, cannot assign inactive user to project`,
        });
        return;
      }
    }
    setLoadUpdateBtn(true);
    const files = fileKeys ? fileKeys : [];
    const apiData = {
      projectName: formData.projectName,
      description: formData.projectDescription,
      statusId: formData.projectStatus?.id ?? null,
      priorityId: formData.projectPriority?.id ?? null,
      pmId: formData.projectManager?.id ?? null,
      startDate: formatDateForAPI(formData.startDate),
      estimatedEndDate: formatDateForAPI(formData.endDate),
      actualEndDate: formatDateForAPI(formData.actualEndDate),
      estimatedTime: convertTimeToSec(formData.estimatedTime),
      assignUsers: formData.asignUsers,
      projectType: formData.projectType?.value,
      emailTimeSheet: formData.emailTimeSheet,
      active: !formData.inactive,
      canSupervisorApproveTime: formData.canSupervisorApprove,
      attachmentsData: [...backendFiles, ...files],
      ticket: formData.ticket,
    };
    updateProject.mutate(
      { ...apiData, id: pid },
      {
        onSuccess: (data) => {
          TkToastSuccess("Project Updated Successfully");
          queryClient.invalidateQueries({
            queryKey: [RQ.client, pid],
          });
          setLoadUpdateBtn(false);
          router.push(`${urls.projects}`);
        },
        onError: (error) => {
          setLoadUpdateBtn(false);
          console.log("error while updating project", error);
        },
      }
    );
  };

  const onClickDownload = async (fileName, key) => {
    const keys = [{ name: fileName, key: key }];
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
    updateProject.mutate(
      { ...apiData, id: pid, deleteAttachment: true },
      {
        onSuccess: (data) => {
          setBackendFiles(newBackendFiles);
          TkToastSuccess("Attachment Deleted Successfully");
          setDeleteModal(false);
          queryClient.invalidateQueries({
            queryKey: [RQ.project, pid],
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

  const toggleDeleteModel = (attachmentsData) => {
    attachmentsData.map((file) => {
      setDeleteFileData({
        fileName: file.name,
        key: file.key,
        sizeInKb: file.sizeInKb,
      });
    });
    setDeleteModal(true);
  };

  const deleteProject = useMutation({
    mutationFn: tkFetch.deleteWithIdInUrl(`${API_BASE_URL}/project`),
  });

  const handleDeleteProject = () => {
    if (!editMode) return;
    const apiData = {
      id: pid,
    };

    deleteProject.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Project Deleted Successfully");
        queryClient.invalidateQueries({
          queryKey: [RQ.project, pid],
        });
        router.push(`${urls.projects}`);
      },
      onError: (error) => {
        console.log("error while deleting project", error);
      },
    });
  };

  const onClickAddTask = () => {
    if (isDirty) {
      setConfirmModal(true);
    } else {
      router.push(`${urls.taskAdd}/?projectId=${pid}`);
    }
  };

  const toggleDeleteModelPopup = () => {
    setDeletePageModal(true);
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
            <title>{`Proj: ${data[0].name}`}</title>
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
              handleDeleteProject();
              setDeletePageModal(false);
            }}
            onCloseClick={() => setDeletePageModal(false)}
          />
          <WarningModal
            show={confirmModal}
            warnText="You have unsaved changes. Do you want to continue?"
            onOkClick={() => {
              setConfirmModal(false);
              router.push(`${urls.taskAdd}/?projectId=${pid}`);
            }}
            onCancelClick={() => setConfirmModal(false)}
          />
          <TkRow className="justify-content-center">
            <TkCol>
              {/* <TkCard> */}
              <TkEditCardHeader
                title={viewMode ? "Project Details" : "Edit Project"}
                // active={isProjectActive}
                // onActiveClick={activeProjectChange}
                onDeleteClick={handleDeleteProject}
                isEditAccess={viewMode && accessLevel >= perAccessIds.edit}
                disableDelete={viewMode}
                editLink={`${urls.projectEdit}/${pid}`}
                toggleDeleteModel={toggleDeleteModelPopup}
              />
              {deleteProject.isError ? <FormErrorBox errMessage={deleteProject.error?.message} /> : null}
              <TkCardBody className="mt-4">
                <TkForm onSubmit={handleSubmit(onSubmit)}>
                  <div>
                    <TkRow className="g-3 gx-4 gy-4">
                      <TkCol lg={4}>
                        <TkInput
                          {...register("projectName")}
                          id="projectName"
                          type="text"
                          labelName="Project Name"
                          placeholder="Enter Project Name"
                          requiredStarOnLabel={editMode}
                          disabled={viewMode}
                        />
                        {errors.projectName?.message ? (
                          <FormErrorText>{errors.projectName?.message}</FormErrorText>
                        ) : null}
                      </TkCol>
                      <TkCol lg={4}>
                        <div className="mb-3 mb-lg-0">
                          <Controller
                            name="clientName"
                            control={control}
                            render={({ field }) => (
                              <TkSelect
                                {...field}
                                id="clientName"
                                labelName="Client Name"
                                placeholder="Enter Client Name"
                                requiredStarOnLabel={editMode}
                                loading={isLoading}
                                disabled={true}
                              />
                            )}
                          />
                          {errors.clientName?.message ? (
                            <FormErrorText>{errors.clientName?.message}</FormErrorText>
                          ) : null}
                        </div>
                      </TkCol>
                      <TkCol lg={4}>
                        <div className="mb-3 mb-lg-0">
                          <Controller
                            name="projectManager"
                            control={control}
                            render={({ field }) => (
                              <TkSelect
                                {...field}
                                id="projectManager"
                                labelName="Project Manager"
                                placeholder="Select Project Manager"
                                options={pmDropdown}
                                loading={ispmLoading}
                                requiredStarOnLabel={editMode}
                                disabled={viewMode}
                              />
                            )}
                          />
                          {errors.projectManager?.message ? (
                            <FormErrorText>{errors.projectManager?.message}</FormErrorText>
                          ) : null}
                        </div>
                      </TkCol>
                      <TkCol lg={4}>
                        <div className="mb-3 mb-lg-0">
                          <Controller
                            name="projectStatus"
                            control={control}
                            render={({ field }) => (
                              <TkSelect
                                {...field}
                                id="projectStatus"
                                labelName="Status"
                                placeholder="Select Status"
                                requiredStarOnLabel={editMode}
                                loading={isStatusLoading}
                                options={statusDropdown}
                                disabled={viewMode}
                              />
                            )}
                          />
                          {errors.projectStatus?.message ? (
                            <FormErrorText>{errors.projectStatus?.message}</FormErrorText>
                          ) : null}
                        </div>
                      </TkCol>
                      <TkCol lg={4}>
                        <div className="mb-3 mb-lg-0">
                          <Controller
                            name="projectPriority"
                            control={control}
                            render={({ field }) => (
                              <TkSelect
                                {...field}
                                id="projectPriority"
                                labelName="Priority"
                                placeholder="Select Priority"
                                loading={isPriorityLoading}
                                options={priorityDropdown}
                                disabled={viewMode}
                              />
                            )}
                          />
                          {errors.projectPriority?.message ? (
                            <FormErrorText>{errors.projectPriority?.message}</FormErrorText>
                          ) : null}
                        </div>
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
                              placeholder="Select Start Date"
                              options={{
                                altInput: true,
                                dateFormat: "d M, Y",
                              }}
                              disabled={viewMode}
                            />
                          )}
                        />
                      </TkCol>
                      <TkCol lg={4}>
                        <Controller
                          name="endDate"
                          control={control}
                          render={({ field }) => (
                            <TkDate
                              {...field}
                              labelName="Estimated End Date"
                              id="endDate"
                              placeholder="Select End Date"
                              options={{
                                altInput: true,
                                dateFormat: "d M, Y",
                              }}
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
                              placeholder="Select End Date"
                              options={{
                                altInput: true,
                                dateFormat: "d M, Y",
                              }}
                              disabled={viewMode}
                            />
                          )}
                        />
                      </TkCol>
                      <TkCol lg={4}>
                        <TkInput
                          {...register("estimatedTime")}
                          id="estimatedTime"
                          type="text"
                          labelName="Estimated Time (HH:MM)"
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
                          id="actualTime"
                          type="text"
                          labelName="Actual Time (HH:MM)"
                          placeholder="Enter Actual Time"
                          disabled={true} // actula timme is always diisabled
                        />
                      </TkCol>
                      <TkCol lg={4}>
                        <div>
                          <Controller
                            name="asignUsers"
                            control={control}
                            render={({ field }) => (
                              <TkSelect
                                {...field}
                                labelName="Assign Users"
                                id="asignUsers"
                                placeholder="Assign Users"
                                requiredStarOnLabel={editMode}
                                options={userDropdown}
                                loading={isUserLoading}
                                isMulti={true}
                                disabled={viewMode}
                              />
                            )}
                          />
                          {errors.asignUsers?.message ? (
                            <FormErrorText>{errors.asignUsers?.message}</FormErrorText>
                          ) : null}
                        </div>
                      </TkCol>
                      {/* {viewMode ? null : ( */}
                      <TkCol lg={4} className="d-flex justify-content-center align align-items-center mt-5">
                        {/* <div>
                            <a className="fw-semibold text-primary text-decoration-underline" onClick={onClickAddTask}>
                              <p>Add Task</p>
                            </a>
                          </div> */}
                        <div>
                          <TkButton onClick={onClickAddTask} type="button" color="primary" id="addTask">
                            Add Task
                          </TkButton>
                          <UncontrolledTooltip
                            target="addTask"
                            className="custom-tooltip-style"
                            style={{
                              backgroundColor: "#ffff",
                              color: "#5A5F63",
                            }}
                          >
                            Add a task to this project.
                          </UncontrolledTooltip>
                        </div>
                      </TkCol>

                      <TkCol lg={4}>
                        <Controller
                          name="projectType"
                          control={control}
                          render={({ field }) => (
                            <TkSelect
                              {...field}
                              labelName="Project Type"
                              id="projectType"
                              placeholder="Select Project Type"
                              options={projectTypes}
                              disabled={viewMode}
                            />
                          )}
                        />
                        {errors.projectType?.message ? (
                          <FormErrorText>{errors.projectType?.message}</FormErrorText>
                        ) : null}
                      </TkCol>
                      {/* )} */}
                      <TkRow>
                        <TkCol lg={4}>
                          <div className="mt-4">
                            <TkCheckBox
                              {...register("inactive")}
                              id="inactive"
                              labelName="Inactive"
                              disabled={viewMode}
                            />
                            <TkLabel className="ms-3">Inactive</TkLabel>
                          </div>
                        </TkCol>
                        <TkCol lg={12}>
                          <div>
                            <TkCheckBox {...register("ticket")} id="ticket" labelName="Ticket" disabled={viewMode} />
                            <TkLabel className="ms-3">Ticket</TkLabel>
                          </div>
                        </TkCol>
                        {/*  we are currently removing can supervisor approve because there is no logic on supervisor currently */}

                        {/* <TkCol lg={4}>
                          <div className="mt-4 ms-2">
                            <TkCheckBox
                              {...register("canSupervisorApprove")}
                              id="canSupervisorApprove"
                              labelName="Can Supervisor approve Time"
                              disabled={viewMode}
                            />
                            <TkLabel className="ms-3">Can Supervisor approve Time</TkLabel>
                          </div>
                        </TkCol> */}
                      </TkRow>
                      {/* <TkCol lg={4}>
                          <div>
                            <TkInput
                              {...register("emailTimeSheet")}
                              id="emailTimeSheet"
                              type="text"
                              labelName="Email Timesheet (cc)"
                              placeholder="Enter Email Timesheet (cc)"
                              disabled={viewMode}
                            />
                            {errors.emailTimeSheet?.message ? (
                              <FormErrorText>{errors.emailTimeSheet?.message}</FormErrorText>
                            ) : null}
                          </div>
                        </TkCol> */}
                      <TkCol lg={12}>
                        <TkInput
                          {...register("projectDescription")}
                          labelName="Description"
                          id="projectDescription"
                          placeholder="Enter Description"
                          type="textarea"
                          disabled={viewMode}
                        />
                        {errors.projectDescription?.message ? (
                          <FormErrorText>{errors.projectDescription?.message}</FormErrorText>
                        ) : null}
                      </TkCol>
                    </TkRow>
                    <TkRow className="mt-4">
                      <TkCol lg={12}>
                        {(viewMode && backendFiles.length > 0) || editMode ? (
                          <>
                            {/* TODO: render attachments dynamically from the database */}
                            <TkCardHeader>
                              <TkCardTitle tag="h5" className="mb-3">
                                Attachments
                              </TkCardTitle>
                            </TkCardHeader>
                            <TkCardBody className="mt-3">
                              <div className="vstack gap-2">
                                {data[0]?.attachments?.map((attachment) => (
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
                                                toggleDeleteModel([
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
                          </>
                        ) : null}
                      </TkCol>
                    </TkRow>
                    {updateProject.isError ? <FormErrorBox errMessage={updateProject.error?.message} /> : null}
                    <div className="d-flex mt-4 space-childern">
                      {editMode ? (
                        <div className="ms-auto">
                          <TkButton
                            disabled={updateProject.isLoading || uploadingFiles}
                            type="button"
                            color="secondary"
                            className="ms-auto"
                            onClick={() => router.push(`${urls.projects}`)}
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
                              onClick={() => router.push(`${urls.projectEdit}/${pid}`)}
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
                  className={classnames({ active: activeTab === tabs.tasks })}
                  onClick={() => {
                    toggleTab(tabs.tasks);
                  }}
                >
                  Tasks
                </NavLink>
              </NavItem>
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
              <TabPane tabId={tabs.tasks}>
                {/* <TkCard> */}
                <TkCardBody>
                  {taskHighlightsData?.length > 0 ? (
                    <TkTableContainer
                      columns={taskHighlightColumn}
                      data={taskHighlightsData || []}
                      loading={isTaskHighlightsLoading}
                      noDataMessage="No data found"
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
              <TabPane tabId={tabs.timesheets}>
                {/* <TkCard> */}
                <TkCardBody>
                  {timesheetHighlightsData?.length > 0 ? (
                    <TkTableContainer
                      columns={timesheetHighlightColumn}
                      data={timesheetHighlightsData || []}
                      loading={isTimesheetHighlightsLoading}
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
        </>
      ) : (
        <TkNoData />
      )}
    </>
  );
};

export default ProjectDetails;
