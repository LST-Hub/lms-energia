import React, { useState } from "react";

import TkInput from "../forms/TkInput";
import TkRow, { TkCol } from "../TkRow";
import TkButton from "../TkButton";
import TkForm from "../forms/TkForm";
import TkCard, { TkCardBody, TkCardHeader } from "../TkCard";
import TkEditCardHeader from "../TkEditCardHeader";
import { useRouter } from "next/router";

import { TkToastSuccess } from "../TkToastContainer";

import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../../../src/components/forms/ErrorText";
import {
  MinNameLength,
  MaxNameLength,
  bigInpuMaxLength,
  smallInputMaxLength as MaxCategoryIdLength,
  API_BASE_URL,
  RQ,
  settingsTab,
  urls,
  modes,
} from "../../../src/utils/Constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import { useEffect } from "react";
import TkLoader from "../TkLoader";
import TkNoData from "../TkNoData";
import useUserRole from "../../utils/hooks/useUserRole";
import TkAccessDenied from "../TkAccessDenied";
import TkLabel from "../forms/TkLabel";
import TkCheckBox from "../forms/TkCheckBox";
import { perAccessIds } from "../../../DBConstants";
import DeleteModal from "../../utils/DeleteModal";

const schema = Yup.object({
  categoryName: Yup.string()
    .min(MinNameLength, `Category name should have at least ${MinNameLength} character.`)
    .max(MaxNameLength, `Category name should have at most ${MaxNameLength} characters.`)
    .required("Category name  is required"),

  description: Yup.string()
    .nullable()
    .max(bigInpuMaxLength, `Description should have at most ${bigInpuMaxLength} characters.`),
}).required();

const EditExpenseCategories = ({ id, mode }) => {
  const viewMode = mode === modes.view;
  const editMode = mode === modes.edit;

  const accessLevel = useUserRole().isAdmin;
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const ecid = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteModal, setDeleteModal] = useState(false);

  const { data, isLoading, isFetched, isError, error } = useQuery({
    queryKey: [RQ.expenseCategory, ecid],
    queryFn: tkFetch.get(`${API_BASE_URL}/expense-category/${ecid}`),
    enabled: !!ecid,
  });

  useEffect(() => {
    if (isFetched && Array.isArray(data) && data.length > 0) {
      const { name, description, active } = data[0];
      setValue("categoryName", name);
      setValue("description", description);
      setValue("inactive", !active);
    }
  }, [data, setValue, isFetched]);

  const updatedExpenseCategory = useMutation({
    mutationFn: tkFetch.putWithIdInUrl(`${API_BASE_URL}/expense-category`),
  });

  const onSubmit = (formData) => {
    const apiData = {
      id: ecid,
      name: formData.categoryName,
      active: !formData.inactive,
      description: formData.description,
    };
    updatedExpenseCategory.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Expense Category Updated Successfully.");
        router.push(`${urls.settings}?tab=${settingsTab.expenseCategory}`);
      },
      onError: (error) => {
        console.log("error", error);
      },
    });
  };

  const deletedExpenseCategory = useMutation({
    mutationFn: tkFetch.deleteWithIdInUrl(`${API_BASE_URL}/expense-category`),
  });

  const deleteExpenseCategoryHandler = () => {
    const apiData = {
      id: ecid,
    };
    deletedExpenseCategory.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Expense Category Deleted Successfully.");
        queryClient.invalidateQueries({
          queryKey: [RQ.expenseCategory, ecid],
        });
        router.push(`${urls.settings}?tab=${settingsTab.expenseCategory}`);
      },
      onError: (error) => {
        console.log("error", error);
      },
    });
  };

  if (!accessLevel) {
    return <TkAccessDenied />;
  }
  const toggleDeleteModel = () => {
    setDeleteModal(true);
  };
  // console.log("view", viewMode);

  return (
    <>
    <DeleteModal
      show={deleteModal}
      onDeleteClick={() => {
        setDeleteModal(false);
        deleteExpenseCategoryHandler();
      }}
      onCloseClick={() => setDeleteModal(false)}
    />
      {isLoading ? (
        <TkLoader />
      ) : isError ? (
        <FormErrorText errMessage={error?.message} />
      ) : data?.length > 0 ? (
        <TkRow>
          <TkCol>
            <TkRow className="justify-content-center">
              <TkCol>
                {/* <TkCard> */}
                <TkEditCardHeader
                  title={viewMode ? "Expense Category Details" : "Edit Expense Category"}
                  onDeleteClick={deleteExpenseCategoryHandler}
                  isEditAccess={viewMode}
                  disableDelete={viewMode}
                  editLink={`${urls.expenseCategoryEdit}/${ecid}`}
                  toggleDeleteModel={toggleDeleteModel}
                />
                {deletedExpenseCategory.isError ? (
                  <FormErrorBox errMessage={deletedExpenseCategory.error?.message} />
                ) : null}
                <TkCardBody className="mt-3">
                  <TkForm onSubmit={handleSubmit(onSubmit)}>
                    <div>
                      <TkRow className="g-3">
                        <TkCol lg={4}>
                          <TkInput
                            {...register("categoryName")}
                            id="categoryName"
                            type="text"
                            labelName="Category Name"
                            tooltip="Enter Category Name"
                            labelId={"_description"}
                            placeholder="Enter Category Name"
                            requiredStarOnLabel={editMode}
                            disabled={viewMode}
                          />
                          {errors.categoryName && <FormErrorText>{errors.categoryName.message}</FormErrorText>}
                        </TkCol>

                        <TkCol lg={4}>
                          <div className="mt-4">
                            <TkLabel className="me-3 ms-lg-5">Inactive</TkLabel>
                            <TkCheckBox {...register("inactive")} id="inactive" disabled={viewMode} />
                          </div>
                        </TkCol>

                        <TkCol lg={12}>
                          <TkInput
                            {...register("description")}
                            id="description"
                            name="description"
                            type="textarea"
                            labelName="Description"
                            tooltip="Enter Description"
                            labelId={"_description"}
                            placeholder="Enter Description"
                            disabled={viewMode}
                          />
                          {errors.description && <FormErrorText>{errors.description.message}</FormErrorText>}
                        </TkCol>
                      </TkRow>
                      {updatedExpenseCategory.isError ? (
                        <FormErrorBox errMessage={updatedExpenseCategory.error?.message} />
                      ) : null}
                      <div className="d-flex mt-4 space-childern">
                        {editMode ? (
                          <div className="ms-auto" id="update-expense-category-submit-btns">
                            <TkButton
                              disabled={updatedExpenseCategory.isLoading}
                              color="secondary"
                              className="ms-auto"
                              type="button"
                              onClick={() => router.push(`${urls.settings}?tab=${settingsTab.expenseCategory}`)}
                            >
                              Cancel
                            </TkButton>{" "}
                            <TkButton loading={updatedExpenseCategory.isLoading} color="primary" type="submit">
                              {" "}
                              Update
                            </TkButton>{" "}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </TkForm>
                </TkCardBody>
                {/* </TkCard> */}
              </TkCol>
            </TkRow>
          </TkCol>
        </TkRow>
      ) : (
        <TkNoData />
      )}
    </>
  );
};

export default EditExpenseCategories;
