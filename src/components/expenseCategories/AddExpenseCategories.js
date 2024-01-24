import React, { useState } from "react";

import TkCard, { TkCardBody, TkCardHeader, TkCardTitle } from "../../../src/components/TkCard";
import TkRow, { TkCol } from "../../../src/components/TkRow";
import TkButton from "../../../src/components/TkButton";
import TkForm from "../../../src/components/forms/TkForm";

import { TkToastSuccess } from "../../../src/components/TkToastContainer";

import TkInput from "../../../src/components/forms/TkInput";

import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../../../src/components/forms/ErrorText";
import {
  MinNameLength,
  MaxNameLength,
  smallInputMaxLength as MaxCategoryIdLength,
  bigInpuMaxLength,
  MaxAttachmentSize,
  API_BASE_URL,
  RQ,
  settingsTab,
  urls,
} from "../../../src/utils/Constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import { useRouter } from "next/router";
import useUserRole from "../../utils/hooks/useUserRole";
import TkAccessDenied from "../TkAccessDenied";

const schema = Yup.object({
  categoryName: Yup.string()
    .min(MinNameLength, `Category name should have at least ${MinNameLength} character.`)
    .max(MaxNameLength, `Category name should have at most ${MaxNameLength} characters.`)
    .required("Category name is required"),

  categoryId: Yup.string().max(
    MaxCategoryIdLength,
    `Category ID should have at most ${MaxCategoryIdLength} characters.`
  ),

  description: Yup.string().max(bigInpuMaxLength, `Description should have at most ${bigInpuMaxLength} characters.`),
}).required();

const AddExpenseCategories = () => {
  const isAdmin = useUserRole().isAdmin;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const router = useRouter();
  const queryClient = useQueryClient();

  const expenseCategoryData = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/expense-category`),
  });

  const onSubmit = (formData) => {
    const apiData = {
      name: formData.categoryName,
      description: formData.description,
    };
    expenseCategoryData.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Expense Category Created Successfully");
        queryClient.invalidateQueries({
          queryKey: [RQ.allExpenseCategories],
        });
        router.push(`${urls.settings}?tab=${settingsTab.expenseCategory}`);
      },
      onError: (error) => {
        console.log(error, "error");
      },
    });
  };

  if (!isAdmin) {
    return <TkAccessDenied />;
  }

  return (
    <>
      <TkRow>
        <TkCol>
          <TkForm onSubmit={handleSubmit(onSubmit)}>
            <TkRow className="justify-content-center">
              <TkCol>
                <TkCard>
                  <TkCardHeader>
                    <h5 className="card-title">Add Expense Category</h5>
                  </TkCardHeader>
                  <TkCardBody>
                    <div>
                      <TkRow className="g-3">
                        <TkCol lg={4}>
                          <TkInput
                            {...register("categoryName")}
                            id="categoryName"
                            type="text"
                            labelName="Enter Category Name"
                            placeholder="Enter Category Name"
                            requiredStarOnLabel={true}
                          />
                          {errors.categoryName && <FormErrorText>{errors.categoryName.message}</FormErrorText>}
                        </TkCol>

                        <TkCol lg={12}>
                          <TkInput
                            {...register("description")}
                            id="description"
                            name="description"
                            type="textarea"
                            labelName="Description"
                            placeholder="Enter Description"
                          />
                          {errors.description && <FormErrorText>{errors.description.message}</FormErrorText>}
                        </TkCol>
                      </TkRow>
                    </div>
                    {expenseCategoryData.isError ? (
                      <FormErrorBox errMessage={expenseCategoryData.error.message} />
                    ) : null}
                    <div className="d-flex mt-4 space-childern">
                      <div className="ms-auto" id="update-form-btns">
                        <TkButton
                          color="secondary"
                          disabled={expenseCategoryData.isLoading}
                          onClick={() => router.push(`${urls.settings}?tab=${settingsTab.expenseCategory}`)}
                          type="button"
                        >
                          Cancel
                        </TkButton>{" "}
                        <TkButton type="submit" loading={expenseCategoryData.isLoading} color="primary">
                          Save
                        </TkButton>
                      </div>
                    </div>
                  </TkCardBody>
                </TkCard>
              </TkCol>
            </TkRow>
          </TkForm>
        </TkCol>
      </TkRow>
    </>
  );
};

export default AddExpenseCategories;
