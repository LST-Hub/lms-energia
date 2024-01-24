import React, { useState, useEffect, useCallback, useMemo } from "react";

import TkCard, { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkRow, { TkCol } from "../TkRow";
import TkInput from "../forms/TkInput";
import TkSelect from "../forms/TkSelect";
import TkForm from "../forms/TkForm";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";

import { API_BASE_URL, MinNameLength, MaxNameLength } from "../../utils/Constants";

import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";

import { RQ } from "../../utils/Constants";
import TkLoader from "../TkLoader";
import { TkToastSuccess } from "../TkToastContainer";
import { TkDropdownItem, TkDropdownMenu, TkDropdownToggle, TkUncontrolledDropdown } from "../TkDropdown";
import TkIcon from "../TkIcon";
import TkModal, { TkModalBody, TkModalHeader } from "../TkModal";
import TkButton from "../TkButton";
import TkTableContainer from "../TkTableContainer";
import TkNoData from "../TkNoData";
import DeleteModal from "../../utils/DeleteModal";

const schema = Yup.object({
  priorityName: Yup.string()
    .min(MinNameLength, `Priority name must be at least ${MinNameLength} character.`)
    .max(MaxNameLength, `Priority name must be at most ${MaxNameLength} characters.`)
    .required("Priority name is required"),

  // priorityColor: Yup.object().required("Priority color is required"),
}).required();

function HeaderForm({ editPriorityData, isLoading }) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    () => {
      if (editPriorityData) {
        setValue("priorityName", editPriorityData[0].name);
        setValue("color", editPriorityData[0].color);
        // setPriorityName(editPriorityData[0].name);
      }
    };
  }, [editPriorityData, setValue]);

  const priorityData = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/priority`),
  });

  const onSubmit = (formData) => {
    const apiData = {
      priorityName: formData.priorityName,
    };
    priorityData.mutate(apiData, {
      onSuccess: (data) => {
        // setPriorityName("");
        setValue("priorityName", "");
        queryClient.invalidateQueries({
          queryKey: [RQ.allPriority],
        });
        TkToastSuccess("Priority Created Successfully");
      },
      onError: (error) => {
        console.log("error while adding priority status", error);
      },
    });
  };

  return (
    <>
      {isLoading ? null : (
        <TkForm onSubmit={handleSubmit(onSubmit)}>
          <TkRow className="mt-3 mb-4 ms-auto">
            <TkCol lg={4}>
              <TkInput
                {...register("priorityName")}
                id="priorityName"
                type="text"
                labelName="Enter Priority Name"
                // tooltip="Enter Priority Name"
                // labelId={"_priorityName"}
                placeholder="Enter Priority Name"
                // value={priorityName}
                requiredStarOnLabel={true}
                // onChange={(e) => setPriorityName(e.target.value)}
              />
            </TkCol>

            <TkCol lg={4} className="align-self-end">
              <TkButton
                color="primary"
                loading={priorityData.isLoading}
                className="btn btn-primary align-self-end"
                type="submit"
              >
                <i className="ri-add-fill align-bottom"></i> Add
              </TkButton>
            </TkCol>
            {errors.priorityName?.message ? <FormErrorText>{errors.priorityName?.message}</FormErrorText> : null}

            {priorityData.isError ? <FormErrorBox errMessage={priorityData.error.message} /> : null}
          </TkRow>
        </TkForm>
      )}
    </>
  );
}

function EditForm({ editPriorityData, toggle, deleteModal, toggleDeleteModal }) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [pId, setPid] = useState(0);

  useEffect(() => {
    if (editPriorityData && editPriorityData.length > 0) {
      setValue("priorityName", editPriorityData[0].name);

      setPid(editPriorityData[0].id);
    }
  }, [editPriorityData, setValue]);

  const queryClient = useQueryClient();
  const updatePriority = useMutation({
    mutationFn: tkFetch.putWithIdInUrl(`${API_BASE_URL}/priority`),
  });

  const onSubmit = (formData) => {
    const apiData = {
      id: pId,
      priorityName: formData.priorityName,
    };
    updatePriority.mutate(apiData, {
      onSuccess: (data) => {
        toggle();
        queryClient.invalidateQueries({
          queryKey: [RQ.allPriority],
        });
        TkToastSuccess("Priority Updated Successfully");
      },
      onError: (error) => {
        console.log("error while updating priority status", error);
      },
    });
  };

  return (
    <TkForm onSubmit={handleSubmit(onSubmit)}>
      <TkRow className="mt-3 mb-3 ms-auto">
        <TkCol lg={4}>
          <TkInput
            {...register("priorityName")}
            id="priorityName"
            type="text"
            placeholder="Enter Priority Name"
            labelName="Priority Name"
            tooltip="Enter Priority Name"
            labelId={"_priorityName"}
            requiredStarOnLabel={true}
          />
        </TkCol>

        <TkCol lg={4} className="align-self-end">
          <TkButton
            color="primary"
            loading={updatePriority.isLoading}
            className="btn btn-primary align-self-end"
            type="submit"
          >
            <i className="ri-fill align-bottom"></i> Update
          </TkButton>
        </TkCol>
        {errors.priorityName?.message ? <FormErrorText>{errors.priorityName?.message}</FormErrorText> : null}
        {updatePriority.isError ? <FormErrorBox errMessage={updatePriority.error.message} /> : null}
      </TkRow>
    </TkForm>
  );
}

//TODO: add delete functionality and edit functionality

function PrioritySetting({ mounted }) {
  const [modal, setModal] = useState(false);

  const [editPriorityData, setEditPriorityData] = useState();
  const [deletePriorityData, setDeletePriorityData] = useState();
  const [deleteModal, setDeleteModal] = useState(false);

  const toggleDeleteModel = (value) => {
    setDeletePriorityData(value);
    setDeleteModal(true);
  };


  const toggle = useCallback(
    (editPriorityData) => {
      setEditPriorityData(editPriorityData);
      if (modal) {
        setModal(false);
      } else {
        setModal(true);
      }
    },
    [modal]
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allPriority],
    queryFn: tkFetch.get(`${API_BASE_URL}/priority`),
    enabled: mounted,
  });

  const queryClient = useQueryClient();

  const activePriority = useMutation({
    mutationFn: tkFetch.patchWithIdInUrl(`${API_BASE_URL}/priority`),
  });

  const activePriorityChange = useCallback(
    (pid, active) => {
      const apiData = {
        id: pid,
        active: !active,
      };
      activePriority.mutate(apiData, {
        onSuccess: (data) => {
          TkToastSuccess(`Priority ${active === true ? "Inactivated" : "Activated"} Successfully`);
          queryClient.invalidateQueries({
            queryKey: [RQ.allPriority],
          });
        },
        onError: (error) => {
          console.log("Error while updating status in priority", error);
        },
      });
    },
    [queryClient, activePriority]
  );

  const deletePriority = useMutation({
    mutationFn: tkFetch.deleteWithIdInUrl(`${API_BASE_URL}/priority`),
  });

  const deletePriorityHandler = useCallback(
    (pid) => {
      const apiData = {
        id: pid,
      };
      deletePriority.mutate(apiData, {
        onSuccess: (data) => {
          TkToastSuccess("Priority Deleted Successfully");
          queryClient.invalidateQueries({
            queryKey: [RQ.allPriority],
          });
        },
        onError: (error) => {
          console.log("Error while deleting priority", error);
        },
      });
    },
    [deletePriority, queryClient]
  );

  const columns = useMemo(
    () => [
      {
        Header: "Priority",
        accessor: "name",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Status",
        accessor: "active",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div>
              {cellProps.value === true ? (
                <span className="badge badge-soft-success rounded-pill text-uppercase">{`Active`}</span>
              ) : (
                <span className="badge badge-soft-danger rounded-pill text-uppercase">{`Inactive`}</span>
              )}
            </div>
          );
        },
      },
      {
        Header: "Options",
        accessor: "",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <TkUncontrolledDropdown direction="start" className="text-start">
              <TkDropdownToggle tag="a" id="dropdownMenuLink2" role="button">
                <TkIcon className="ri-more-fill fs-4"></TkIcon>
              </TkDropdownToggle>
              <TkDropdownMenu>
                <TkDropdownItem
                  className="edit-list"
                  onClick={() =>
                    toggle([
                      {
                        id: cellProps.row.original.id,
                        name: cellProps.row.original.name,
                        color: cellProps.row.original.color,
                      },
                    ])
                  }
                >
                  <TkIcon className="ri-pencil-line me-2 align-bottom text-muted"></TkIcon>
                  Edit
                </TkDropdownItem>
                <TkDropdownItem
                  className="edit-list"
                  onClick={() => activePriorityChange(cellProps.row.original.id, cellProps.row.original.active)}
                >
                  <TkIcon className="ri-indeterminate-circle-line me-2 align-bottom text-muted"></TkIcon>
                  {cellProps.row.original.active === false ? "Active" : "Inactive"}
                </TkDropdownItem>
                <TkDropdownItem className="edit-list" onClick={() => toggleDeleteModel(cellProps.row.original.id)}>
                  <TkIcon className="ri-delete-bin-line me-2 align-bottom text-muted"></TkIcon>
                  Delete
                </TkDropdownItem>
              </TkDropdownMenu>
            </TkUncontrolledDropdown>
          );
        },
      },
    ],
    [activePriorityChange, toggle]
  );

  return (
    <div>
      {/* <TkCard style={{ minHeight: "300px" }}> */}
      {/* <TkCardHeader className="tk-card-header">
        <div className="d-flex align-items-center">
          <TkCardTitle className="mt-1 flex-grow-1">
            <h3>Priority Setting</h3>
          </TkCardTitle>
        </div>
      </TkCardHeader> */}
      <HeaderForm isLoading={isLoading} />
      {deletePriority.isError ? <FormErrorBox errMessage={deletePriority.error.message} /> : null}
      <TkCardBody className="table-padding pt-0">
        {isLoading ? (
          <TkLoader />
        ) : isError ? (
          <FormErrorBox errMessage={error} />
        ) : data?.length > 0 ? (
          <TkTableContainer
            columns={columns}
            data={data || []}
            customPageSize={true}
            defaultPageSize={10}
            showPagination={true}
          />
        ) : (
          <TkNoData />
        )}
      </TkCardBody>
      {/* </TkCard> */}
      <TkModal
        isOpen={modal}
        toggle={toggle}
        centered
        size="lg"
        contentClassName="border-0"
        dialogClassName="modal-dialog-centered"
      >
        <TkModalHeader toggle={toggle} className="border-0">
          <h4 className="modal-title">Edit Priority</h4>
        </TkModalHeader>
        <TkModalBody>
          <EditForm editPriorityData={editPriorityData} toggle={toggle} />
        </TkModalBody>
      </TkModal>

      {/* <TkModal
        isOpen={modal}
        toggle={deleteModal}
        centered
        size="lg"
        contentClassName="border-0"
        dialogClassName="modal-dialog-centered"
      >
        <TkModalHeader toggle={deleteModal} className="border-0">
          <h4 className="modal-title">Delete Priority</h4>
        </TkModalHeader>
        <TkModalBody> */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={() => {
          setDeleteModal(false);
          deletePriorityHandler(deletePriorityData);
        }}
        onCloseClick={() => setDeleteModal(false)}
      />
      {/* </TkModalBody>
      </TkModal> */}
    </div>
  );
}

export default PrioritySetting;
