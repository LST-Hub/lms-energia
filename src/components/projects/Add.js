import React, { useEffect, useState } from "react";
import Link from "next/link";

import TkInput from "../forms/TkInput";
import TkSelect from "../forms/TkSelect";
import TkForm from "../forms/TkForm";
import TkDate from "../forms/TkDate";
import TkCard, { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkButton from "../TkButton";
import TkRow, { TkCol } from "../TkRow";
import TkDropzone from "../TkDropzone";
import { useRouter } from "next/router";

import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../../../src/components/forms/ErrorText";
import {
  MinNameLength,
  MaxNameLength,
  bigInpuMaxLength,
  MinEmailLength,
  MaxEmailLength,
  MaxAttachmentSize,
  API_BASE_URL,
  RQ,
  modes,
  smallInputMaxLength,
  smallInputMinLength,
  urls,
  projectTypes,
} from "../../../src/utils/Constants";

import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import axios from "axios";
import { formatDateForAPI } from "../../utils/date";
import TkUploadFiles from "../TkUploadFile";
import useUserAccessLevel from "../../utils/hooks/useUserAccessLevel";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import hasPageModeAccess from "../../utils/hasPageAccess";
import TkAccessDenied from "../TkAccessDenied";
import { convertTimeToSec, convertToTime } from "../../utils/time";
import TkLabel from "../forms/TkLabel";
import TkCheckBox from "../forms/TkCheckBox";

const schema = Yup.object({
  projectName: Yup.string()
    .min(smallInputMinLength, `Project name should have at least ${smallInputMinLength} character.`)
    .max(smallInputMaxLength, `Project name should have at most ${smallInputMaxLength} characters.`)
    .required("Project name is required"),

  client: Yup.object().nullable().required("Client is Required"),

  projectManager: Yup.object().nullable().required("Project Manager is Required"),

  priority: Yup.object().nullable(),

  projectStatus: Yup.object().nullable().required("Status is Required"),

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

  asignUsers: Yup.array().required("Assign Users is Required").min(1, "Assign Users is Required"),

  projectDescription: Yup.string().max(
    bigInpuMaxLength,
    `Description should have at most ${bigInpuMaxLength} characters.`
  ),

  startDate: Yup.date().nullable(),
  endDate: Yup.date().nullable(),

  canSupervisorApprove: Yup.boolean().nullable(),
}).required();

const AddProject = () => {
  const accessLevel = useUserAccessLevel(permissionTypeIds.projAndTask);

  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const router = useRouter();

  //Dropzone file upload
  const [selectedFiles, setselectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const [allClientsData, setAllClientsData] = useState([]);
  const [allUsersData, setAllUsersData] = useState([]);
  const [allPriorityData, setAllPriorityData] = useState([]);
  const [allStatusData, setAllStatusData] = useState([]);
  const [pmDropdown, setPmDropdown] = useState([]);

  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allClientList],
        queryFn: tkFetch.get(`${API_BASE_URL}/client/list`),
        enabled: hasPageModeAccess(modes.create, accessLevel),
      },
      {
        queryKey: [RQ.allUsersList],
        queryFn: tkFetch.get(`${API_BASE_URL}/users/list`),
        enabled: hasPageModeAccess(modes.create, accessLevel),
      },
      {
        queryKey: [RQ.allProjectManager, "projectmanager"],
        queryFn: tkFetch.get(`${API_BASE_URL}/users/list?filter=projectmanager`),
        enabled: hasPageModeAccess(modes.create, accessLevel),
      },
    ],
  });

  const [priority, status] = useQueries({
    queries: [
      {
        queryKey: [RQ.allPriorityList],
        queryFn: tkFetch.get(`${API_BASE_URL}/priority/list`),
        enabled: hasPageModeAccess(modes.create, accessLevel),
      },
      {
        querykey: [RQ.allStatusList],
        queryFn: tkFetch.get(`${API_BASE_URL}/status/list`),
        enabled: hasPageModeAccess(modes.create, accessLevel),
      },
    ],
  });

  const [client, users, pms] = results;

  const { data: statusData, isLoading: statusLoading, isError: statusIsError, error: statusError } = status;
  const { data: clientData, isLoading: clientLoading, isError: clientIsError, error: clientError } = client;

  const { data: userData, isLoading: userLoading, isError: userIsError, error: userError } = users;

  const { data: priorityData, isLoading: priorityLoading, isError: priorityIsError, error: priorityError } = priority;

  const { data: pmData, isLoading: ispmLoading, isError: ispmError, error: pmError } = pms;

  useEffect(() => {
    if (statusIsError) {
      console.log("error", statusError);
      TkToastError(statusError);
    }
    if (clientIsError) {
      console.log("error", clientError);
      TkToastError(clientError);
    }
    if (userIsError) {
      console.log("error", userError);
      TkToastError(userError);
    }
    if (priorityIsError) {
      console.log("error", priorityError);
      TkToastError(priorityError);
    }
    if (ispmError) {
      console.log("error", pmError);
      TkToastError(pmError);
    }
  }, [
    statusIsError,
    clientIsError,
    userIsError,
    priorityIsError,
    statusError,
    clientError,
    userError,
    priorityError,
    ispmError,
    pmError,
  ]);

  useEffect(() => {
    if (clientData) {
      setAllClientsData(
        clientData?.map((item) => ({
          value: item.id,
          id: item.id,
          label: item.name,
          active: item.active,
        }))
      );
    }
    if (userData) {
      setAllUsersData(
        userData?.map((item) => ({
          value: item.id,
          id: item.id,
          label: item.name,
        }))
      );
    }
    if (pmData) {
      setPmDropdown(
        pmData?.map((item) => ({
          value: item.id,
          id: item.id,
          label: item.name,
        }))
      );
    }
    if (priorityData) {
      setAllPriorityData(
        priorityData?.map((item) => ({
          value: item.id,
          id: item.id,
          label: item.name,
          active: item.active,
        }))
      );
    }
    if (statusData) {
      setAllStatusData(
        statusData?.map((item) => ({
          value: item.id,
          id: item.id,
          label: item.name,
          active: item.active,
        }))
      );
    }
  }, [clientData, userData, priorityData, statusData, pmData]);

  const presignedUrls = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/attachments/presigned-urls`),
  });

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
              const uploadPrmoises = [],
                fileKeys = [];
              const config = {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              };
              urls.forEach((urlInfo) => {
                const file = selectedFiles.find((file) => file.name === urlInfo.name);
                if (file) uploadPrmoises.push(axios.put(urlInfo.url, file, config));
              });
              const upload = await Promise.allSettled(uploadPrmoises);
              let rejectedCount = 0;
              upload.forEach((fileReq) => {
                if (fileReq.status === "fulfilled") {
                  const reqFile = fileReq.value?.config?.data;
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
              saveProject(data, fileKeys);
            }
          },
          onError: (error) => {
            //TODO: show error that, we got problems while uploading attachments, saving the project without attachments
            console.log("error", error);
            setUploadingFiles(false);
            saveProject(data);
          },
        }
      );
    } else {
      setUploadingFiles(false);
      saveProject(data);
    }
  };

  const projectData = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/project`),
  });

  const saveProject = (formData, fileKeys) => {
    const apiData = {
      projectName: formData.projectName,
      description: formData.projectDescription,
      clientId: formData.client?.id,
      statusId: formData.projectStatus?.id,
      priorityId: formData.projectPriority?.id,
      pmId: formData.projectManager?.id,
      startDate: formatDateForAPI(formData.startDate),
      estimatedEndDate: formatDateForAPI(formData.endDate),
      estimatedTime: convertTimeToSec(formData.estimatedTime),
      assignUsers: formData.asignUsers,
      projectType: formData.projectType?.value,
      emailTimeSheet: formData.emailTimeSheet,
      ticket: formData.ticket,
      canSupervisorApproveTime: formData.canSupervisorApprove,
      attachmentsData: fileKeys ? [...fileKeys] : undefined,
    };
    projectData.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Project Created Successfully");
        router.push(`${urls.projects}`);
      },
      onError: (error) => {
        console.log("error while creating project", error);
        // TkToastError("Project Creation Failed");
      },
    });
  };

  const validateEmailcc = (value) => {
    //split emails on comma andd validate them
    setError("emailTimeSheet", {
      type: "manual",
      message: "Please enter valid email address",
    });
    // let emails = value.split(",");
    // if(emails.length > 1) {
    //   return true;
    // }
    // let valid = true;
    // emails.forEach((email) => {
    //   if (!email) {
    //     valid = false;
    //   }
    // });
    // return valid;
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
            <h3> Add Project</h3>
          </TkCardHeader> */}
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
                      requiredStarOnLabel={true}
                      invalid={errors.projectName?.message ? true : false}
                    />
                    {errors.projectName?.message ? <FormErrorText>{errors.projectName?.message}</FormErrorText> : null}
                  </TkCol>

                  <TkCol lg={4}>
                    <div className="mb-3 mb-lg-0">
                      <Controller
                        name="client"
                        control={control}
                        render={({ field }) => (
                          <TkSelect
                            {...field}
                            labelName="Client Name"
                            id="client"
                            placeholder="Select Client Name"
                            requiredStarOnLabel={true}
                            loading={clientLoading}
                            options={allClientsData}
                          />
                        )}
                      />
                      {errors.client?.message ? <FormErrorText>{errors.client?.message}</FormErrorText> : null}
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
                            labelName="Project Manager"
                            id="projectManager"
                            placeholder="Select Project Manager"
                            requiredStarOnLabel={true}
                            loading={ispmLoading}
                            options={pmDropdown}
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
                            labelName="Status"
                            id="projectStatus"
                            placeholder="Select Status"
                            requiredStarOnLabel={true}
                            loading={statusLoading}
                            options={allStatusData}
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
                            labelName="Priority"
                            id="projectPriority"
                            placeholder="Select Priority"
                            loading={priorityLoading}
                            options={allPriorityData}
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
                        />
                      )}
                    />
                    {errors.startDate?.message ? <FormErrorText>{errors.startDate?.message}</FormErrorText> : null}
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
                        />
                      )}
                    />
                    {errors.endDate?.message ? <FormErrorText>{errors.endDate?.message}</FormErrorText> : null}
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
                      name="asignUsers"
                      control={control}
                      render={({ field }) => (
                        <TkSelect
                          {...field}
                          labelName="Assign Users"
                          id="asignUsers"
                          placeholder="Assign Users"
                          requiredStarOnLabel={true}
                          loading={userLoading}
                          options={allUsersData}
                          isMulti={true}
                        />
                      )}
                    />
                    {errors.asignUsers?.message ? <FormErrorText>{errors.asignUsers?.message}</FormErrorText> : null}
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
                        />
                      )}
                    />
                    {errors.projectType?.message ? <FormErrorText>{errors.projectType?.message}</FormErrorText> : null}
                  </TkCol>

                  {/*we are currently removing can supervisor approve because there is no logic on supervisor currently */}

                  {/* <TkCol lg={4}>
                    <div className="mt-3">
                      <TkCheckBox
                        {...register("canSupervisorApprove")}
                        id="canSupervisorApprove"
                        labelName="Can Supervisor approve Time"
                      />
                      <TkLabel className="ms-3">Can Supervisor approve Time</TkLabel>
                    </div>
                  </TkCol> */}

                  {/* <TkCol lg={4}>
                      <Controller
                        name="emailTimeSheet"
                        control={control}
                        render={({ field }) => (
                          <TkInput
                            {...field}
                            labelName="Email Timesheet (cc)"
                            id="emailTimeSheet"
                            placeholder="Enter Email Timesheet (cc)"
                            type="text"
                            // options={{
                            //   dateFormat: "d M, Y",
                            // }}
                            onChange={(e) => {
                              validateEmailcc(e.target.value);
                              field.onChange(e.target.value);
                            }}
                          />
                        )}
                      /> */}
                  {/* <TkInput
                        {...register("emailTimeSheet")}
                        id="emailTimeSheet"
                        type="email"
                        name="emailTimeSheet"
                        labelName="Email TimeSheet (cc)"
                        placeholder="Email TimeSheet (cc)"
                        invalid={errors.emailTimeSheet?.message ? true : false}
                      /> */}
                  {/* {errors.emailTimeSheet?.message ? (
                        <FormErrorText>{errors.emailTimeSheet?.message}</FormErrorText>
                      ) : null}
                    </TkCol> */}

                  <TkCol lg={12}>
                    <TkInput
                      {...register("projectDescription")}
                      id="projectDescription"
                      name="projectDescription"
                      type="textarea"
                      labelName="Description"
                      placeholder="Enter Description"
                      invalid={errors.projectDescription?.message ? true : false}
                    />
                    {errors.projectDescription?.message ? (
                      <FormErrorText>{errors.projectDescription?.message}</FormErrorText>
                    ) : null}
                  </TkCol>
                  <TkCol lg={12}>
                    <div>
                      <TkCheckBox {...register("ticket")} id="icket" labelName="Ticket" />
                      <TkLabel className="ms-3">Ticket</TkLabel>
                    </div>
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
                          setselectedFiles(successFiles);
                        }}
                        uploading={uploadingFiles}
                      >
                        <h4 className="pt-2">Drop files here or click to Add more files.</h4>
                      </TkUploadFiles>
                    </TkCardBody>
                    {/* </TkCard> */}
                  </TkCol>
                </TkRow>
                {projectData.isError ? <FormErrorBox errMessage={projectData.error?.message} /> : null}
                <div className="d-flex mt-4 space-childern">
                  <TkButton
                    disabled={projectData.isLoading || uploadingFiles}
                    type="button"
                    color="secondary"
                    name="cancel"
                    className="ms-auto"
                    onClick={() => router.push(`${urls.projects}`)}
                  >
                    Cancel
                  </TkButton>
                  <TkButton
                    loading={projectData.isLoading || uploadingFiles}
                    type="submit"
                    color="primary"
                    name="create"
                  >
                    Save
                  </TkButton>
                </div>
              </div>
            </TkForm>
          </TkCardBody>
          {/* </TkCard> */}
        </TkCol>
      </TkRow>
      {/* <TkToastContainer /> */}
    </>
  );
};

export default AddProject;
