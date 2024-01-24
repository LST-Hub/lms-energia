import React, { useState } from "react";

import TkInput from "../forms/TkInput";
import TkSelect from "../forms/TkSelect";
import TkRow, { TkCol } from "../TkRow";
import TkCard, { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkButton from "../TkButton";
import TkForm from "../forms/TkForm";
import TkDate from "../forms/TkDate";
import TkIcon from "../TkIcon";
import { useRouter } from "next/router";
import DeleteModal from "../../utils/DeleteModal";

import { TkToastError, TkToastSuccess } from "../TkToastContainer";

// import { Link } from "react-router-dom";
import Link from "next/link";

import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../../../src/components/forms/ErrorText";
import {
  API_BASE_URL,
  bigInpuMaxLength,
  MaxAmountLength,
  MaxAttachmentSize,
  modes,
  RQ,
  urls,
} from "../../../src/utils/Constants";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import { useEffect } from "react";
import TkLoader from "../TkLoader";
import TkNoData from "../TkNoData";
import { formatDateForAPI } from "../../utils/date";
import { timeEntryStatus } from "../../../lib/constants";
import TkUploadFiles from "../TkUploadFile";
import axios from "axios";
import TkLabel from "../forms/TkLabel";
import TkCheckBox from "../forms/TkCheckBox";
import { formatBytes } from "../../utils/formatFileSize";
import TkEditCardHeader from "../TkEditCardHeader";

const schema = Yup.object({
  selectdate: Yup.date()
    .nullable()
    .required("Date is required")
    //we are using transform to convert the date to null if it is invalid because yup will throw an error if the date is invalid
    .transform((v) => (v instanceof Date && !isNaN(v) ? v : null)),

  currency: Yup.object().nullable().required("Currency is required"),

  category: Yup.object().nullable().required("Expense Category is required"),

  amount: Yup.string()
    .required("Amount is required")
    .test("isNumber", "Amount must be a number", (value) => {
      return !isNaN(value);
    })
    .test("isLessThanOneBillion", "Amount must be less than 1 billion", (value) => {
      return value <= 1000000000;
    })
    .max(MaxAmountLength, `Amount must be less than ${MaxAmountLength} characters.`),

  description: Yup.string()
    .max(bigInpuMaxLength, `Description must be less than ${bigInpuMaxLength} characters.`)
    .nullable(),
  projectName: Yup.object().nullable().required("Project is required"),
  status: Yup.string().nullable(),
}).required();

const EditExpense = ({ id, mode }) => {
  const viewMode = mode === modes.view;
  const editMode = mode === modes.edit;
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

  const [allExpenseCategories, setAllExpenseCategories] = useState([]);
  const [allCurrencies, setAllCurrencies] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletePageModal, setDeletePageModal] = useState(false);
  const [deleteFileData, setDeleteFileData] = useState();
  const [backendFiles, setBackendFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false); //Dropzone files
  const [submitForApproval, setSubmitForApproval] = useState(false);
  const [loadUpdateBtn, setLoadUpdateBtn] = useState(false);
  const [allProjects, setAllProjects] = useState([]);

  //Dropzone file upload
  const [selectedFiles, setSelectedFiles] = useState([]);

  const eid = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();

  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allExpenseCategories],
        queryFn: tkFetch.get(`${API_BASE_URL}/expense-category/list`),
      },
      {
        queryKey: [RQ.allCurrenciesList],
        queryFn: tkFetch.get(`${API_BASE_URL}/currency/list`),
      },
      {
        queryKey: [RQ.allProjectList, RQ.myProjects],
        queryFn: tkFetch.get(`${API_BASE_URL}/project/list?myProjects=true`),
      },
    ],
  });

  const [expenseCategories, currency, project] = results;

  const {
    data: expenseCategoryData,
    isLoading: expenseCategoryLoading,
    error: expenseCategoryError,
  } = expenseCategories;

  const { data: currencyData, isLoading: currencyLoading, error: currencyError } = currency;
  const { data: projectData, isLoading: projectLoading, error: projectError } = project;

  useEffect(() => {
    if (expenseCategoryData) {
      setAllExpenseCategories(
        expenseCategoryData?.map((expenseCategory) => ({
          value: expenseCategory.id,
          label: expenseCategory.name,
        }))
      );
    }
    if (currencyData) {
      setAllCurrencies(
        currencyData?.map((currency) => ({
          value: currency.id,
          label: currency.currency.code,
          active: currency.active,
        }))
      );
    }
    if (projectData) {
      setAllProjects(
        projectData?.map((project) => ({
          value: project.id,
          label: project.name,
        }))
      );
    }
  }, [expenseCategoryData, currencyData, projectData]);

  const { data, isLoading, isFetched, isError, error } = useQuery({
    queryKey: [RQ.expense, eid],
    queryFn: tkFetch.get(`${API_BASE_URL}/expense/${eid}`),
  });

  useEffect(() => {
    if (!isDirty && isFetched && Array.isArray(data) && data.length > 0) {
      const approvedBy = data[0].approvedBy;
      setValue("selectdate", data[0].date);
      setValue("amount", data[0].amount);
      setValue("description", data[0].memo);
      setValue("rejectionNote", data[0].rejectionNote);
      setValue("status", data[0].status);
      setValue("approvedBy", approvedBy?.name);
      setValue("projectName", {
        value: data[0].project.id,
        label: data[0].project.name,
      });
      setBackendFiles(
        data[0].attachments.map((file) => {
          return { name: file.name, sizeInKb: file.sizeInKb, key: file.key };
        })
      );
      setValue("currency", {
        value: data[0].currency.id,
        label: data[0].currency.currency.code,
        active: data[0].currency.active,
      });
      setValue("category", {
        value: data[0].expenseCategory.id,
        label: data[0].expenseCategory.name,
      });
      // const selectedCurrency = allCurrencies?.find((currency) => currency.value === data[0].currency.id);
      // setValue("currency", {
      //   value: selectedCurrency?.value,
      //   label: selectedCurrency?.label,
      //   active: selectedCurrency?.active,
      // });

      //   const selectedExpenseCategory = allExpenseCategories?.find(
      //     (expenseCategory) => expenseCategory.value === data[0].expenseCategory.id
      //   );
      //   setValue("category", { value: selectedExpenseCategory?.value, label: selectedExpenseCategory?.label });
    }
  }, [data, isDirty, isFetched, setValue, allCurrencies, allExpenseCategories]);

  const updateExpense = useMutation({
    mutationFn: tkFetch.putWithIdInUrl(`${API_BASE_URL}/expense`),
  });

  const presignedUrls = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/attachments/presigned-urls`),
  });

  const deleteAttachment = useMutation({
    mutationFn: tkFetch.put(`${API_BASE_URL}/attachments/delete`),
  });

  const onSubmit = async (data) => {
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
              }
              setUploadingFiles(false);
              updatedExpense(data, fileKeys);
            }
          },
          onError: (error) => {
            console.log("error while uploading file", error);
          },
        }
      );
    } else {
      setUploadingFiles(false);
      updatedExpense(data);
    }
  };

  const updatedExpense = (formData, fileKeys) => {
    if (formData.currency.active === false) {
      setError("currency", {
        type: "manual",
        message: "Currency is not active",
      });
      return;
    }
    setLoadUpdateBtn(true);
    const files = fileKeys ? fileKeys : [];
    const apiData = {
      id: eid,
      date: formatDateForAPI(formData.selectdate),
      amount: formData.amount,
      currencyId: formData.currency.value,
      categoryId: formData.category.value,
      projectId: formData.projectName.value,
      description: formData.description,
      attachmentsData: [...backendFiles, ...files],
    };
    updateExpense.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Expense Updated Successfully");
        setLoadUpdateBtn(false);
        router.push(`${urls.expense}`);
      },
      onError: (error) => {
        setLoadUpdateBtn(false);
        console.log("error", error);
      },
    });
  };

  const onClickSubmitForApproval = () => {
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
              sendForApproval(fileKeys);
            }
          },
          onError: (error) => {
            console.log("error while uploading file", error);
          },
        }
      );
    } else {
      setUploadingFiles(false);
      sendForApproval();
    }
  };

  const sendForApproval = (fileKeys) => {
    const formData = getValues();

    setSubmitForApproval(true);
    const files = fileKeys ? fileKeys : [];
    const apiData = {
      id: eid,
      date: formatDateForAPI(formData.selectdate),
      amount: formData.amount,
      currencyId: formData.currency.value,
      categoryId: formData.category.value,
      projectId: formData.projectName.value,
      description: formData.description,
      attachmentsData: [...backendFiles, ...files],
      submittedForApproval: true,
    };
    updateExpense.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Expense Submitted for Approval");
        queryClient.invalidateQueries({
          queryKey: [RQ.expense, eid],
        });
        setSubmitForApproval(false);
        router.push(`${urls.expense}`);
      },
      onError: (error) => {
        setSubmitForApproval(false);
        console.log("error while updating expense", error);
        TkToastError(error?.message);
      },
    });
  };

  const onClickDownload = async (fileName, key) => {
    const keys = [{ name: fileName, key: key }];
    presignedUrls.mutate(
      { keys },
      {
        onSuccess: (urls) => {
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

  const onClickDelete = async (fileName, key, sizeInKb) => {
    const keys = [{ name: fileName, key, sizeInKb }];
    deleteAttachment.mutate(
      { keys },
      {
        onSuccess: async (data) => {
          const newBackendFiles = backendFiles.filter((file) => file.key !== key && file.name !== fileName);
          const apiData = {
            attachmentsData: newBackendFiles,
          };
          updateExpense.mutate(
            { ...apiData, id: eid, deleteAttachment: true },
            {
              onSuccess: (data) => {
                setBackendFiles(newBackendFiles);
                TkToastSuccess("Attachment Deleted Successfully");
                setDeleteModal(false);
                queryClient.invalidateQueries({
                  queryKey: [RQ.expense, eid],
                });
              },
              onError: (error) => {
                console.log("error while deleting attachment", error);
                setDeleteModal(false);
              },
            }
          );
        },
        onError: (error) => {
          console.log("error while deleting attachment", error);
        },
      }
    );
  };

  const deleteExpense = useMutation({
    mutationFn: tkFetch.deleteWithIdInUrl(`${API_BASE_URL}/expense`),
  });

  const onClickDeleteExpense = () => {
    if (data[0].status !== timeEntryStatus.Draft) return;
    const apiData = {
      id: eid,
    };
    deleteExpense.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Expense Deleted Successfully");

        router.push(`${urls.expense}`);
      },
      onError: (error) => {
        console.log("error while deleting expense", error);
        TkToastError("Error occured while deleting expense");
      },
    });
  };

  const toggleDeleteModelPopup = () => {
    setDeletePageModal(true);
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

  return (
    <>
      <TkRow>
        {isLoading ? (
          <TkLoader />
        ) : isError ? (
          <FormErrorBox errMessage={error.message} />
        ) : data.length > 0 ? (
          <>
            <DeleteModal
              show={deleteModal}
              onDeleteClick={() => onClickDelete(deleteFileData.fileName, deleteFileData.key, deleteFileData.sizeInKb)}
              onCloseClick={() => setDeleteModal(false)}
              loading={deleteAttachment.isLoading}
            />

            <DeleteModal
              show={deletePageModal}
              onDeleteClick={() => {
                onClickDeleteExpense();
                setDeletePageModal(false);
              }}
              onCloseClick={() => setDeletePageModal(false)}
            />

            <TkCol>
              <TkRow className="justify-content-center">
                <TkCol>
                  {/* <TkCard> */}
                  {/* <TkCardHeader className="tk-card-header">
                    <TkCardTitle>
                      <h4>Edit Expense</h4>
                    </TkCardTitle>
                  </TkCardHeader> */}
                  <TkEditCardHeader
                    title={viewMode ? "Expense Details" : "Edit Expense"}
                    viewMode={viewMode}
                    isEditAccess={data[0].status === timeEntryStatus.Approved ? false : viewMode}
                    disableDelete={viewMode || data[0].status !== timeEntryStatus.Draft}
                    editLink={`${urls.expenseEdit}/${eid}`}
                    onDeleteClick={onClickDeleteExpense}
                    toggleDeleteModel={toggleDeleteModelPopup}
                  />
                  <TkCardBody className="mt-4">
                    <TkForm onSubmit={handleSubmit(onSubmit)}>
                      <div>
                        <TkRow className="g-3 gx-4 gy-4">
                          <TkCol lg={4}>
                            <Controller
                              name="selectdate"
                              control={control}
                              render={({ field }) => (
                                <TkDate
                                  {...field}
                                  id="selectdate"
                                  labelName="Date"
                                  // tooltip="Select Date"
                                  // labelId={"_selectdate"}
                                  placeholder="Select Date"
                                  options={{
                                    altInput: true,
                                    dateFormat: "d M, Y",
                                  }}
                                  required={true}
                                  {...(editMode && data[0].status !== timeEntryStatus.Approved
                                    ? { requiredStarOnLabel: true }
                                    : { requiredStarOnLabel: false })}
                                  disabled={data[0].status === timeEntryStatus.Approved ? true : viewMode}
                                />
                              )}
                            />
                            {errors.selectdate?.message ? (
                              <FormErrorText>{errors.selectdate?.message}</FormErrorText>
                            ) : null}
                          </TkCol>

                          <TkCol lg={4}>
                            <Controller
                              name="currency"
                              control={control}
                              render={({ field }) => (
                                <TkSelect
                                  {...field}
                                  labelName="Currency"
                                  // tooltip="Select Currency"
                                  // labelId={"_currency"}
                                  placeholder="Select Currency"
                                  id="currency"
                                  options={allCurrencies}
                                  loading={currencyLoading}
                                  {...(editMode && data[0].status !== timeEntryStatus.Approved
                                    ? { requiredStarOnLabel: true }
                                    : { requiredStarOnLabel: false })}
                                  disabled={data[0].status === timeEntryStatus.Approved ? true : false || viewMode}
                                />
                              )}
                            />
                            {errors.currency?.message ? (
                              <FormErrorText>{errors.currency?.message}</FormErrorText>
                            ) : null}
                          </TkCol>

                          <TkCol lg={4}>
                            <TkInput
                              {...register("amount")}
                              id="amount"
                              placeholder="Enter Amount"
                              className="form-control"
                              type="text"
                              labelName="Amount"
                              // tooltip="Enter Amount"
                              // labelId={"_amount"}
                              {...(editMode && data[0].status !== timeEntryStatus.Approved
                                ? { requiredStarOnLabel: true }
                                : { requiredStarOnLabel: false })}
                              disabled={data[0].status === timeEntryStatus.Approved ? true : false || viewMode}
                            />
                            {errors.amount?.message && <FormErrorText>{errors.amount?.message}</FormErrorText>}
                          </TkCol>

                          <TkCol lg={4}>
                            <Controller
                              name="category"
                              control={control}
                              render={({ field }) => (
                                <TkSelect
                                  {...field}
                                  labelName="Category"
                                  // tooltip="Select Category"
                                  // labelId={"_category"}
                                  placeholder="Select Category"
                                  id="category"
                                  options={allExpenseCategories}
                                  loading={expenseCategoryLoading}
                                  {...(editMode && data[0].status !== timeEntryStatus.Approved
                                    ? { requiredStarOnLabel: true }
                                    : { requiredStarOnLabel: false })}
                                  disabled={data[0].status === timeEntryStatus.Approved ? true : false || viewMode}
                                />
                              )}
                            />
                            {errors.category?.message ? (
                              <FormErrorText>{errors.category?.message}</FormErrorText>
                            ) : null}
                          </TkCol>

                          <TkCol lg={4}>
                            <Controller
                              name="projectName"
                              control={control}
                              render={({ field }) => (
                                <TkSelect
                                  {...field}
                                  labelName="Project Name"
                                  // tooltip="Select Project Name"
                                  // labelId={"_projectName"}
                                  id={"projectName"} //  we cannot ahev same id epeated twice in page, so adding index
                                  placeholder="Select Project Name"
                                  loading={projectLoading}
                                  options={allProjects}
                                  onChange={(e) => {
                                    field.onChange(e);
                                  }}
                                  {...(editMode && data[0].status !== timeEntryStatus.Approved
                                    ? { requiredStarOnLabel: true }
                                    : { requiredStarOnLabel: false })}
                                  disabled={data[0].status === timeEntryStatus.Approved ? true : false || viewMode}
                                />
                              )}
                            />
                            {errors.projectName?.message ? (
                              <FormErrorText>{errors.projectName?.message}</FormErrorText>
                            ) : null}
                          </TkCol>

                          <TkCol lg={4}>
                            <TkInput
                              {...register("status")}
                              id="status"
                              className="form-control"
                              type="text"
                              labelName="Status"
                              // tooltip="Status"
                              // labelId={"_status"}
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
                            <TkInput
                              {...register("description")}
                              id="description"
                              placeholder="Enter Description"
                              className="form-control"
                              type="textarea"
                              labelName="Description"
                              // tooltip="Enter Description"
                              // labelId={"_description"}
                              disabled={data[0].status === timeEntryStatus.Approved ? true : false || viewMode}
                            />
                            {errors.description?.message ? (
                              <FormErrorText>{errors.description?.message}</FormErrorText>
                            ) : null}
                          </TkCol>

                          <TkCol lg={12}>
                            <TkInput
                              {...register("rejectionNote")}
                              labelName="Rejection Note"
                              // tooltip="Enter Rejection Note"
                              // labelId={"_rejectionNote"}
                              id="rejectionNote"
                              placeholder="Enter Rejection Note"
                              type="text"
                              disabled={true}
                            />
                            {errors.rejectionNote && <FormErrorText>{errors.rejectionNote.message}</FormErrorText>}
                          </TkCol>
                        </TkRow>

                        <TkCol lg={12}>
                          {/* <TkCard> */}
                          {/* TODO: render attachments dynamically from the database */}

                          <>
                            <TkCardHeader className="mt-3">
                              <TkCardTitle tag="h5" className="mb-3">
                                Attached Files
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
                                          <Link href="#">
                                            <a className="text-body text-truncate d-block">{attachment.name}</a>
                                          </Link>
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
                                          {viewMode ? null : (
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
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {data[0].status === timeEntryStatus.Approved || viewMode ? null : (
                                <TkUploadFiles
                                  onFilesDrop={(successFiles, errorFiles) => {
                                    setSelectedFiles(successFiles);
                                  }}
                                  uploading={uploadingFiles}
                                >
                                  <h4 className="pt-2">Drop files here or click to Add more files.</h4>
                                </TkUploadFiles>
                              )}
                            </TkCardBody>
                            {/* </TkCard> */}
                          </>
                        </TkCol>

                        {updateExpense.isError ? <FormErrorBox errMessage={updateExpense.error?.message} /> : null}

                        {data[0].status === timeEntryStatus.Approved ? null : viewMode ? null : (
                          <div className="d-flex mt-4 space-childern">
                            <div className="ms-auto">
                              <TkButton
                                onClick={() => router.push(`${urls.expense}`)}
                                disabled={updateExpense.isLoading || submitForApproval || uploadingFiles}
                                color="secondary"
                                type="button"
                              >
                                Cancel
                              </TkButton>{" "}
                              <TkButton
                                disabled={submitForApproval || uploadingFiles}
                                loading={loadUpdateBtn}
                                type="submit"
                                color={data[0].status === timeEntryStatus.Pending ? "primary" : "secondary"}
                              >
                                Update
                              </TkButton>{" "}
                              {data[0].status !== timeEntryStatus.Pending && (
                                <TkButton
                                  onClick={handleSubmit(onClickSubmitForApproval)}
                                  disabled={updateExpense.isLoading || uploadingFiles}
                                  loading={submitForApproval && updateExpense.isLoading}
                                  type="button"
                                  color="primary"
                                >
                                  {data[0].status === timeEntryStatus.Rejected
                                    ? "Resubmit For Approval"
                                    : "Submit For Approval"}
                                </TkButton>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </TkForm>
                  </TkCardBody>
                  {/* </TkCard> */}
                </TkCol>
              </TkRow>
            </TkCol>
          </>
        ) : (
          <TkNoData />
        )}
      </TkRow>
    </>
  );
};

export default EditExpense;
