import React, { useState } from "react";

import TkRow, { TkCol } from "../../../src/components/TkRow";
import TkCard, { TkCardBody, TkCardHeader, TkCardTitle } from "../../../src/components/TkCard";
import TkButton from "../../../src/components/TkButton";
import TkDate from "../../../src/components/forms/TkDate";
import TkSelect from "../../../src/components/forms/TkSelect";
import TkInput from "../../../src/components/forms/TkInput";
import TkForm from "../../../src/components/forms/TkForm";
import { formatDateForAPI } from "../../utils/date";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import { useRouter } from "next/router";

import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../../../src/components/forms/ErrorText";
import { MaxAmountLength, RQ, API_BASE_URL, urls, bigInpuMaxLength } from "../../../src/utils/Constants";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import { useEffect } from "react";
import TkUploadFiles from "../TkUploadFile";
import axios from "axios";

const schema = Yup.object({
  selectdate: Yup.date()
    .nullable()
    .required("Date is required")
    //we are using transform to convert the date to null if it is invalid because yup will throw an error if the date is invalid
    .transform((v) => (v instanceof Date && !isNaN(v) ? v : null)),

  currency: Yup.object().nullable().required("Currency is required"),

  category: Yup.object().nullable().required("Category is required"),

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
}).required();

const AddExpense = () => {
  const {
    control,
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const queryClient = useQueryClient();
  const router = useRouter();

  const onChange = () => {
    const submitBtn = document.getElementById("update-task-submit-btns");
    if (submitBtn) {
      submitBtn.style.display = "block";
    }
  };

  const [allExpenseCategories, setAllExpenseCategories] = useState([]);
  const [allCurrencies, setAllCurrencies] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  //Dropzone file upload
  const [selectedFiles, setselectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [submitForApproval, setSubmitForApproval] = useState(false);
  const [loadSaveBtn, setLoadSaveBtn] = useState(false);

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

  const expenseData = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/expense`),
  });

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
              saveExpense(data, fileKeys);
            }
          },
          onError: (error) => {
            console.log("error while uploading file", error);
          },
        }
      );
    } else {
      setUploadingFiles(false);
      saveExpense(data);
    }
  };

  const saveExpense = (formData, fileKeys) => {
    const apiData = {
      date: formatDateForAPI(formData.selectdate),
      amount: formData.amount,
      currencyId: formData.currency.value,
      categoryId: formData.category.value,
      projectId: formData.projectName.value,
      description: formData.description,
      attachmentsData: fileKeys,
    };
    setLoadSaveBtn(true);
    expenseData.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Expense Added Succesfully");
        queryClient.invalidateQueries({
          queryKey: [RQ.allExpenses],
        });
        setLoadSaveBtn(false);
        router.push(`${urls.expense}`);
      },
      onError: (error) => {
        setLoadSaveBtn(false);
        console.log("error", error);
      },
    });
  };

  const onClickSubmitForApproval = () => {
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
      date: formatDateForAPI(formData.selectdate),
      amount: formData.amount,
      currencyId: formData.currency.value,
      categoryId: formData.category.value,
      projectId: formData.projectName.value,
      description: formData.description,
      attachmentsData: [...files],
      submittedForApproval: true,
    };
    expenseData.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Expense Submitted For Approval");
        queryClient.invalidateQueries({
          queryKey: [RQ.allExpenses],
        });
        setSubmitForApproval(false);
        router.push(`${urls.expense}`);
      },
      onError: (error) => {
        setSubmitForApproval(false);
        console.log("error", error);
      },
    });
  };

  const isFloatOrInt = (string) => {
    return /^-?\d*(\.\d+)?$/.test(string);
  };

  const validateAmount = (string) => {
    if (!isFloatOrInt(string)) {
      setError("amount", {
        type: "manual",
        message: "Amount must be a number",
      });
    } else {
      setError("amount", {
        type: "manual",
        message: "",
      });
    }
  };

  return (
    <>
      <TkRow>
        <TkCol>
          <TkRow className="justify-content-center">
            <TkCol>
              {/* <TkCard> */}
              <TkCardHeader className="tk-card-header">
                <TkCardTitle>
                  <h3>Add Expense</h3>
                </TkCardTitle>
              </TkCardHeader>
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
                              labelName="Date"
                              id="selectdate"
                              placeholder="Select Date"
                              options={{
                                altInput: true,
                                dateFormat: "d M, Y",
                              }}
                              required={true}
                              requiredStarOnLabel={true}
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
                              id="currency"
                              loading={currencyLoading}
                              options={allCurrencies}
                              placeholder="Select Currency"
                              requiredStarOnLabel={true}
                            />
                          )}
                        />
                        {errors.currency?.message ? <FormErrorText>{errors.currency?.message}</FormErrorText> : null}
                      </TkCol>

                      <TkCol lg={4}>
                        <TkInput
                          {...register("amount", { onChange })}
                          labelName="Amount"
                          id="amount"
                          placeholder="Enter Amount"
                          className="form-control"
                          type="text"
                          invalid={errors.amount?.message ? true : false}
                          requiredStarOnLabel={true}
                          // onChange={(e) => {
                          //   validateAmount(e.target.value);
                          // }}
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
                              id="category"
                              loading={expenseCategoryLoading}
                              options={allExpenseCategories}
                              placeholder="Select Category"
                              requiredStarOnLabel={true}
                            />
                          )}
                        />
                        {errors.category?.message ? <FormErrorText>{errors.category?.message}</FormErrorText> : null}
                      </TkCol>

                      <TkCol lg={4}>
                        <Controller
                          name="projectName"
                          control={control}
                          render={({ field }) => (
                            <TkSelect
                              {...field}
                              labelName="Project Name"
                              id={"projectName"} //  we cannot ahev same id epeated twice in page, so adding index
                              placeholder="Select Project Name"
                              loading={projectLoading}
                              options={allProjects}
                              onChange={(e) => {
                                field.onChange(e);
                              }}
                              requiredStarOnLabel={true}
                            />
                          )}
                        />
                        {errors.projectName?.message ? (
                          <FormErrorText>{errors.projectName?.message}</FormErrorText>
                        ) : null}
                      </TkCol>

                      <TkCol lg={12}>
                        <TkInput
                          {...register("description")}
                          id="description"
                          placeholder="Enter Description"
                          className="form-control"
                          type="textarea"
                          labelName="Description"
                        />
                      </TkCol>
                      {errors.description?.message ? (
                        <FormErrorText>{errors.description?.message}</FormErrorText>
                      ) : null}
                    </TkRow>

                    {expenseData.isError ? <FormErrorBox errMessage={expenseData.error?.message} /> : null}
                  </div>
                  {/* <TkCard> */}
                  <TkCardHeader className="mt-3">
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
                  <div className="d-flex mt-4 space-childern">
                    <div
                      className="ms-auto"
                      // style={{ display: "none" }}
                      id="update-task-submit-btns"
                    >
                      <TkButton
                        disabled={expenseData.isLoading || uploadingFiles}
                        color="secondary"
                        type="button"
                        onClick={() => router.push(`${urls.expense}`)}
                      >
                        Cancel
                      </TkButton>{" "}
                      <TkButton
                        disabled={uploadingFiles || submitForApproval}
                        loading={loadSaveBtn}
                        type="submit"
                        color="secondary"
                      >
                        Save
                      </TkButton>{" "}
                      <TkButton
                        disabled={expenseData.isLoading || uploadingFiles}
                        loading={submitForApproval}
                        onClick={handleSubmit(onClickSubmitForApproval)}
                        type="button"
                        color="primary"
                      >
                        Submit For Approval
                      </TkButton>
                    </div>
                  </div>
                </TkForm>
              </TkCardBody>
              {/* </TkCard> */}
            </TkCol>
          </TkRow>
        </TkCol>
      </TkRow>
    </>
  );
};

export default AddExpense;
