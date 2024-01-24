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
import { TkToastSuccess } from "../TkToastContainer";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";
import {
  API_BASE_URL,
  approvalsTab,
  bigInpuMaxLength,
  bigInpuMinLength,
  MaxAmountLength,
  MaxAttachmentSize,
  RQ,
  urls,
} from "../../utils/Constants";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import { useEffect } from "react";
import TkLoader from "../TkLoader";
import TkNoData from "../TkNoData";
import { formatBytes } from "../../utils/formatFileSize";
import useUser from "../../utils/hooks/useUser";
import TkAccessDenied from "../TkAccessDenied";

const schema = Yup.object({
  selectdate: Yup.date().required("Date is required"),

  currency: Yup.object().nullable().required("Currency is required"),

  category: Yup.object().nullable().required("Category is required"),

  amount: Yup.string()
    .max(MaxAmountLength, `Amount must be less than ${MaxAmountLength}`)
    .required("Amount is required"),

    description: Yup.string().max(bigInpuMaxLength, `Description must be less than ${bigInpuMaxLength} characters.`)
    .nullable(),

  rejectionNote: Yup.string()
    .min(bigInpuMinLength, `Notes should have at least ${bigInpuMinLength} character.`)
    .max(bigInpuMaxLength, `Notes should have at most ${bigInpuMaxLength} characters.`)
    .required("Rejection note is required"),

  status: Yup.string().nullable(),
}).required();

const EditExpense = ({ id }) => {
  const userData = useUser();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const eid = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isApprove, setIsApprove] = useState(false);

  const { data, isLoading, isFetched, isError, error } = useQuery({
    queryKey: [RQ.expense, eid],
    queryFn: tkFetch.get(`${API_BASE_URL}/expense/${eid}`),
  });
  useEffect(() => {
    if (!isDirty && isFetched && Array.isArray(data) && data.length > 0) {
      setValue("selectdate", data[0]?.date);
      setValue("amount", data[0]?.amount);
      setValue("description", data[0]?.memo);
      setValue("currency", {
        value: data[0].currency.id,
        label: data[0].currency.currency.code,
        active: data[0].currency.active,
      });
      setValue("category", { value: data[0].expenseCategory?.id, label: data[0].expenseCategory?.name });
      setValue("status", data[0].status);
      setValue("projectName", data[0].project.name);
    }
  }, [data, isDirty, isFetched, setValue]);

  const updateAprovalStatus = useMutation({
    mutationFn: tkFetch.patch(`${API_BASE_URL}/approvals/expense`),
  });

  const presignedUrls = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/attachments/presigned-urls`),
  });

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

  const onClickApprove = (id) => {
    setIsApprove(true);

    const apiData = {
      id: [id],
      approved: true,
    };
    updateAprovalStatus.mutate(apiData, {
      onSuccess: () => {
        TkToastSuccess("Expense Approved");
        queryClient.invalidateQueries({
          queryKey: [RQ.allPendingExpenses],
        });
        router.push(`${urls.approvals}?tab=${approvalsTab.expense}`);
        setIsApprove(false);
      },
      onError: (error) => {
        console.log("err", error);
        setIsApprove(false);
      },
    });
  };

  const onSubmit = (formData) => {
    const apiData = {
      id: [id],
      rejected: true,
      rejectionNote: formData.rejectionNote,
    };
    updateAprovalStatus.mutate(apiData, {
      onSuccess: () => {
        TkToastSuccess("Expense Rejected");
        queryClient.invalidateQueries({
          queryKey: [RQ.allPendingExpenses],
        });
        router.push(`${urls.approvals}?tab=${approvalsTab.expense}`);
      },
      onError: (error) => {
        console.log("err", error);
      },
    });
  };

  //admin is always be going to be PM and supervisor, so we skip to check for admin
  if (userData.canBePM === false && userData.canBeSupervisor === false) {
    return <TkAccessDenied />;
  }

  return (
    <>
      <TkRow>
        {isLoading ? (
          <TkLoader />
        ) : isError ? (
          <FormErrorBox errMessage={error.message} />
        ) : data.length > 0 ? (
          <>
            <TkCol>
              <TkRow className="justify-content-center">
                <TkCol>
                  <TkCard>
                  <TkCardHeader>
                      <h4 className="card-title">Expense Details</h4>
                    </TkCardHeader>
                    <TkCardBody>
                      <TkForm onSubmit={handleSubmit(onSubmit)}>
                        <div>
                          <TkRow className="g-3">
                            <TkCol lg={4}>
                              <Controller
                                name="selectdate"
                                control={control}
                                render={({ field }) => (
                                  <TkDate
                                    {...field}
                                    id="selectdate"
                                    labelName="Date"
                                    options={{
                                      altInput: true,
                                      dateFormat: "d M, Y",
                                    }}
                                    required={true}
                                    disabled={true}
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
                                  <TkSelect {...field} labelName="Currency" id="currency" disabled={true} />
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
                                className="form-control"
                                type="text"
                                labelName="Amount"
                                disabled={true}
                              />
                              {errors.amount?.message && <FormErrorText>{errors.amount?.message}</FormErrorText>}
                            </TkCol>

                            <TkCol lg={4}>
                              <Controller
                                name="category"
                                control={control}
                                render={({ field }) => (
                                  <TkSelect {...field} labelName="Category" id="category" disabled={true} />
                                )}
                              />
                              {errors.category?.message ? (
                                <FormErrorText>{errors.category?.message}</FormErrorText>
                              ) : null}
                            </TkCol>

                            <TkCol lg={4}>
                              <TkInput
                                {...register("projectName")}
                                id="projectName"
                                className="form-control"
                                type="text"
                                labelName="Project Name"
                                disabled={true}
                              />
                              {errors.projectName?.message && (
                                <FormErrorText>{errors.projectName?.message}</FormErrorText>
                              )}
                            </TkCol>

                            <TkCol lg={4}>
                              <TkInput
                                {...register("status")}
                                id="status"
                                className="form-control"
                                type="text"
                                labelName="Status"
                                placeholder="Status"
                                disabled={true}
                              />
                            </TkCol>

                            <TkCol lg={12}>
                              <TkInput
                                {...register("description")}
                                id="description"
                                className="form-control"
                                type="textarea"
                                labelName="Description"
                                placeholder="Description"
                                disabled={true}
                              />
                              {errors.description?.message ? <FormErrorText>{errors.description?.message}</FormErrorText> : null}
                            </TkCol>

                            <TkCol lg={12}>
                              <TkInput
                                {...register("rejectionNote")}
                                labelName="Rejection Note"
                                id="rejectionNote"
                                type="text"
                                placeholder="Rejection Note"
                                requiredStarOnLabel={true}
                              />
                              {errors.rejectionNote && <FormErrorText>{errors.rejectionNote.message}</FormErrorText>}
                            </TkCol>
                          </TkRow>

                          {data[0]?.attachments.length > 0 ? (
                            <TkCol lg={12}>
                              <TkCard>
                                <TkCardBody>
                                  {/* TODO: render attachments dynamically from the database */}
                                  <TkCardTitle tag="h5" className="mb-3">
                                    Attached Files
                                  </TkCardTitle>
                                  <div className="vstack gap-2">
                                    {data[0]?.attachments?.map((attachment) => (
                                      <>
                                        <div className="border rounded border-dashed p-2">
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
                                                ></button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </>
                                    ))}
                                  </div>
                                </TkCardBody>
                              </TkCard>
                            </TkCol>
                          ) : null}

                          {updateAprovalStatus.isError ? (
                            <FormErrorBox errMessage={updateAprovalStatus.error?.message} />
                          ) : null}

                          <div className="d-flex mt-4 space-childern">
                            <div className="ms-auto" id="update-task-submit-btns">
                              <TkButton
                                disabled={updateAprovalStatus.isLoading}
                                onClick={() => router.push(`${urls.approvals}?tab=${approvalsTab.expense}`)}
                                color="secondary"
                                type="button"
                              >
                                Cancel
                              </TkButton>{" "}
                              <TkButton
                                loading={!isApprove && updateAprovalStatus.isLoading}
                                type="submit"
                                color="primary"
                              >
                                Reject
                              </TkButton>{" "}
                              <TkButton
                                onClick={() => onClickApprove(id)}
                                loading={isApprove && updateAprovalStatus.isLoading}
                                type="button"
                                color="primary"
                              >
                                Approve
                              </TkButton>
                            </div>
                          </div>
                        </div>
                      </TkForm>
                    </TkCardBody>
                  </TkCard>
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
