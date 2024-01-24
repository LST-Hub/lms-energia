import React, { useEffect, useState } from "react";
import TkInput from "../forms/TkInput";
import TkSelect from "../forms/TkSelect";
import TkButton from "../TkButton";
import TkCard, { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkRow, { TkCol } from "../TkRow";
import TkForm from "../forms/TkForm";
import TkDate from "../forms/TkDate";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../../../src/components/forms/ErrorText";
import { MinNameLength, MaxNameLength, bigInpuMaxLength, API_BASE_URL, RQ, modes, perDefinedProjectManagerRoleID } from "../../../src/utils/Constants";
import axios from "axios";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import { useRouter } from "next/router";
import { formatDateForAPI } from "../../utils/date";
import TkUploadFiles from "../TkUploadFile";
import useUserAccessLevel from "../../utils/hooks/useUserAccessLevel";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import hasPageModeAccess from "../../utils/hasPageAccess";
import TkAccessDenied from "../TkAccessDenied";
import { convertTimeToSec, convertToTime } from "../../utils/time";
import TkLabel from "../forms/TkLabel";
import TkCheckBox from "../forms/TkCheckBox";
import { urls } from "../../../src/utils/Constants";
import useSessionData from "../../utils/hooks/useSessionData";

const schema = Yup.object({
  taskName: Yup.string()
    .min(MinNameLength, `Task name should have at least ${MinNameLength} character.`)
    .max(MaxNameLength, `Task name should have at most ${MaxNameLength} characters.`)
    .required("Task name is required"),

  project: Yup.object().nullable().required("Select a Project"),

  assignedTo: Yup.object().nullable(),

  status: Yup.object().required("Status is required").nullable(),

  priority: Yup.object().nullable(),

  startDate: Yup.date().nullable(),

  endDate: Yup.date().nullable(),

  // estimatedTime: Yup.string(),

  estimatedTime: Yup.string()
    .matches(/^[0-9]*([.:][0-9]+)?$/, "Estimated time cannot contain characters")
    .test("estimatedTime", "Estimated time cannot be greater than 100000", function (value) {
      if (value) {
        const time = convertTimeToSec(value);
        if (time > 360000000) {
          return false;
        }
      }
      return true;
    }),

  assignUsers: Yup.array().required("Assign Users is Required").min(1, "Assign Users is Required").nullable(),

  description: Yup.string().max(bigInpuMaxLength, `Description should have at most ${bigInpuMaxLength} characters.`),
}).required();

const AddTask = () => {
  const accessLevel = useUserAccessLevel(permissionTypeIds.projAndTask);
  const sessionData = useSessionData();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const router = useRouter();
  const queryClient = useQueryClient();

  //Dropzone file upload
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [projectDropdown, setProjectDropdown] = useState([]);
  const [statusDropdown, setStatusDropdown] = useState([]);
  const [priorityDropdown, setPriorityDropdown] = useState([]);
  const [userDropdown, setUserDropdown] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allProjectList],
        queryFn: tkFetch.get(
          `${API_BASE_URL}/project/list${
            sessionData.user.roleId === perDefinedProjectManagerRoleID ? `?PMprojects=true` : ""
          }`
        ),
        enabled: hasPageModeAccess(modes.create, accessLevel),
      },
      {
        queryKey: [RQ.allUsersList, selectedProjectId],
        queryFn: tkFetch.get(`${API_BASE_URL}/users/list${selectedProjectId ? `?projectId=${selectedProjectId}` : ""}`),
        enabled: !!selectedProjectId && hasPageModeAccess(modes.create, accessLevel),
      },
      {
        queryKey: [RQ.allStatus],
        queryFn: tkFetch.get(`${API_BASE_URL}/status/list`),
        enabled: hasPageModeAccess(modes.create, accessLevel),
      },
      {
        queryKey: [RQ.allPriority],
        queryFn: tkFetch.get(`${API_BASE_URL}/priority/list`),
        enabled: hasPageModeAccess(modes.create, accessLevel),
      },
    ],
  });

  const [project, users, status, priority] = results;

  const { data: projectData, isLoading: isProjectLoading, isError: isProjectError, error: projectError } = project;

  const { data: usersData, isLoading: isUsersLoading, isError: isUsersError, error: usersError } = users;

  const {
    data: statusData,
    isLoading: isStatusLoading,
    isError: isStatusError,
    isFetched: isStatusFetched,
    error: statusError,
  } = status;

  const { data: priorityData, isLoading: isPriorityLoading, isError: isPriorityError, error: priorityError } = priority;

  useEffect(() => {
    if (isProjectError) {
      console.log("projectError", projectError);
      TkToastError(projectError?.message);
    }
    if (isUsersError) {
      console.log("usersError", usersError);
      TkToastError(usersError?.message);
    }
    if (isStatusError) {
      console.log("statusError", statusError);
      TkToastError(statusError?.message);
    }
    if (isPriorityError) {
      console.log("priorityError", priorityError);
      TkToastError(priorityError?.message);
    }
  }, [
    isProjectError,
    projectError,
    isUsersError,
    usersError,
    isStatusError,
    statusError,
    isPriorityError,
    priorityError,
  ]);

  useEffect(() => {
    if (projectData) {
      setProjectDropdown(
        projectData?.map((item) => ({
          id: item.id,
          value: item.id,
          label: item.name,
        }))
      );
    }
    if (statusData) {
      setStatusDropdown(
        statusData?.map((item) => ({
          id: item.id,
          value: item.id,
          label: item.name,
          active: item.active,
        }))
      );
    }
    if (priorityData) {
      setPriorityDropdown(
        priorityData?.map((item) => ({
          id: item.id,
          value: item.id,
          label: item.name,
          active: item.active,
        }))
      );
    }
    if (!selectedProjectId) {
      setUserDropdown([]);
      return;
    }
    if (usersData) {
      setUserDropdown(
        usersData?.map((item) => ({
          id: item.id,
          value: item.id,
          label: item.name,
        }))
      );
    }
  }, [projectData, usersData, statusData, priorityData, selectedProjectId]);

  const presignedUrls = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/attachments/presigned-urls`),
  });

  //get query params
  const { projectId } = router.query;

  // match query params with project dropdown and set selected project
  useEffect(() => {
    if (projectId && projectData?.length > 0) {
      const selectedProject = projectData.find((item) => item.id === Number(projectId));
      if (selectedProject) {
        setSelectedProjectId(selectedProject.id);
        setValue("project", {
          id: selectedProject.id,
          value: selectedProject.id,
          label: selectedProject.name,
        });
      }
    }
  }, [projectId, setValue, projectData]);

  const onSubmit = async (data) => {
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
                  "content-type": "multipart/form-data",
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
              saveTask(data, fileKeys);
            }
          },
          onError: (error) => {
            //TODO: show error that, we got problems while uploading attachments, saving the project without attachments
            console.log("error", error);
            setUploadingFiles(false);
            saveTask(data);
          },
        }
      );
    } else {
      setUploadingFiles(false);
      saveTask(data);
    }
  };

  const taskData = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/task`),
  });

  const saveTask = (data, fileKeys) => {
    const apiData = {
      taskName: data.taskName,
      projectId: data.project?.id,
      statusId: data.status?.id,
      priorityId: data.priority?.id,
      startDate: formatDateForAPI(data.startDate),
      endDate: formatDateForAPI(data.endDate),
      estimatedTime: convertTimeToSec(data.estimatedTime),
      billable: data.billable,
      description: data.description,
      assignUsers: data.assignUsers,
      filesData: fileKeys,
    };
    taskData.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Task Created Successfully");
        router.push(`${urls.tasks}`);
      },
      onError: (error) => {
        console.log("error", error);
      },
    });
  };

  if (!(Number(accessLevel) >= perAccessIds.create)) {
    return <TkAccessDenied />;
  }

  return (
    <>
      {/* TODO: create a form for below fields */}
      <TkRow className="justify-content-center">
        <TkCol lg={12}>
          {/* <TkCard> */}
          {/* <TkCardHeader className="tk-card-header">
            <h3>Add Task</h3>
          </TkCardHeader> */}
          <TkCardBody className="mt-4">
            <TkForm onSubmit={handleSubmit(onSubmit)}>
              <div>
                <TkRow className="g-3 gx-4 gy-4">
                  <TkCol lg={4}>
                    <TkInput
                      {...register("taskName")}
                      labelName="Task Name"
                      type="text"
                      id="_task_name"
                      placeholder="Enter Task Name"
                      requiredStarOnLabel={true}
                      invalid={errors.taskName?.message ? true : false}
                    />
                    {errors.taskName?.message ? <FormErrorText>{errors.taskName?.message}</FormErrorText> : null}
                  </TkCol>
                  <TkCol lg={4}>
                    <div className="mb-3 mb-lg-0">
                      <Controller
                        name="project"
                        control={control}
                        render={({ field }) => (
                          <TkSelect
                            {...field}
                            labelName="Project"
                            id="_task_project"
                            placeholder="Select Project"
                            requiredStarOnLabel={true}
                            loading={isProjectLoading}
                            options={projectDropdown}
                            onChange={(e) => {
                              field.onChange(e);
                              // invalidate the query of users, and fetch new users
                              queryClient.invalidateQueries({
                                queryKey: [RQ.allUsersList, selectedProjectId],
                              });
                              setSelectedProjectId(e ? e.value : null);
                              setValue("assignUsers", null);
                            }}
                          />
                        )}
                      />
                      {errors.project?.message ? <FormErrorText>{errors.project?.message}</FormErrorText> : null}
                    </div>
                  </TkCol>

                  <TkCol lg={4}>
                    <div className="mb-3 mb-lg-0">
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <TkSelect
                            {...field}
                            labelName="Status"
                            id="_task_status"
                            placeholder="Select Status"
                            loading={isStatusLoading}
                            options={statusDropdown}
                            requiredStarOnLabel={true}
                          />
                        )}
                      />
                      {errors.status?.message ? <FormErrorText>{errors.status?.message}</FormErrorText> : null}
                    </div>
                  </TkCol>

                  <TkCol lg={4}>
                    <div className="mb-3 mb-lg-0">
                      <Controller
                        name="priority"
                        control={control}
                        render={({ field }) => (
                          <TkSelect
                            {...field}
                            labelName="Priority"
                            id="priority"
                            placeholder="Select Priority"
                            loading={isPriorityLoading}
                            options={priorityDropdown}
                          />
                        )}
                      />
                      {errors.priority?.message ? <FormErrorText>{errors.priority?.message}</FormErrorText> : null}
                    </div>
                  </TkCol>

                  <TkCol lg={4}>
                    <div className="mb-3 mb-lg-0">
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
                            }}
                          />
                        )}
                      />
                    </div>
                  </TkCol>

                  <TkCol lg={4}>
                    <div className="mb-3 mb-lg-0">
                      <Controller
                        name="endDate"
                        control={control}
                        render={({ field }) => (
                          <TkDate
                            {...field}
                            labelName="Estimated End Date"
                            id="endDate"
                            placeholder="Select Estimated End Date"
                            options={{
                              altInput: true,
                            }}
                          />
                        )}
                      />
                    </div>
                  </TkCol>

                  <TkCol lg={4}>
                    <TkInput
                      {...register("estimatedTime")}
                      labelName="Estimated Time (HH:MM)"
                      type="text"
                      id="estimatedTime"
                      placeholder="Enter Estimated Time"
                      onBlur={(e) => {
                        setValue("estimatedTime", convertToTime(e.target.value));
                      }}
                    />
                    {errors.estimatedTime?.message ? (
                      <FormErrorText>{errors.estimatedTime?.message}</FormErrorText>
                    ) : null}
                  </TkCol>

                  <TkCol lg={4}>
                    <Controller
                      name="assignUsers"
                      control={control}
                      render={({ field }) => (
                        <TkSelect
                          {...field}
                          labelName="Assign Users"
                          id="assignUsers"
                          placeholder="Assign Users"
                          requiredStarOnLabel={true}
                          isMulti={true}
                          loading={selectedProjectId && isUsersLoading}
                          options={userDropdown}
                        />
                      )}
                    />
                    {errors.assignUsers?.message ? <FormErrorText>{errors.assignUsers?.message}</FormErrorText> : null}
                  </TkCol>

                  <TkCol lg={4}>
                    <div className="mt-4">
                      <TkCheckBox {...register("billable")} id="billable" labelName="billable" />
                      <TkLabel className="ms-lg-3">Billable</TkLabel>
                    </div>
                  </TkCol>

                  <TkCol lg={12}>
                    <TkInput
                      {...register("description")}
                      labelName="Description"
                      type="textarea"
                      id="_task_description"
                      placeholder="Enter Description"
                    />
                    {errors.description?.message ? <FormErrorText>{errors.description?.message}</FormErrorText> : null}
                  </TkCol>

                  <TkCol lg={12}>
                    {/* <TkCard> */}
                    <TkCardHeader>
                      <TkCardTitle tag="h5" className="mb-3">
                        Attach Files
                      </TkCardTitle>
                    </TkCardHeader>
                    <TkCardBody className="mt-3">
                      <TkUploadFiles
                        onFilesDrop={(successFiles, errorFiles) => {
                          setSelectedFiles(successFiles);
                        }}
                        uploading={uploadingFiles}
                      >
                        <h4 className="pt-2">Drop files here or click to Add more files.</h4>
                      </TkUploadFiles>
                    </TkCardBody>
                    {/* </TkCard> */}
                  </TkCol>
                </TkRow>
                {taskData.isError ? <FormErrorBox errMessage={taskData.error?.message} /> : null}
                <div className="d-flex mt-4 space-childern">
                  <TkButton
                    onClick={() => router.push(`${urls.tasks}`)}
                    disabled={taskData.isLoading || uploadingFiles}
                    color="secondary"
                    type="button"
                    className="ms-auto"
                  >
                    Cancel
                  </TkButton>
                  <TkButton loading={taskData.isLoading || uploadingFiles} color="primary" type="submit">
                    Save
                  </TkButton>
                </div>
              </div>
            </TkForm>
          </TkCardBody>
          {/* </TkCard> */}
        </TkCol>
      </TkRow>
    </>
  );
};

export default AddTask;
