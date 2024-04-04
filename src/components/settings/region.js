import React, { useState, useEffect, useCallback, useMemo } from "react";

import TkCard, { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkRow, { TkCol } from "../TkRow";
import TkInput from "../forms/TkInput";
import TkSelect from "../forms/TkSelect";
import TkForm from "../forms/TkForm";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";

import {
  API_BASE_URL,
  MinNameLength,
  MaxNameLength,
} from "../../utils/Constants";

import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";

import { RQ } from "../../utils/Constants";
import TkLoader from "../TkLoader";
import { TkToastSuccess } from "../TkToastContainer";
import {
  TkDropdownItem,
  TkDropdownMenu,
  TkDropdownToggle,
  TkUncontrolledDropdown,
} from "../TkDropdown";
import TkIcon from "../TkIcon";
import TkModal, { TkModalBody, TkModalHeader } from "../TkModal";
import TkButton from "../TkButton";
import TkTableContainer from "../TkTableContainer";
import TkNoData from "../TkNoData";
import DeleteModal from "../../utils/DeleteModal";

const schema = Yup.object({
  name: Yup.string()
    .min(
      MinNameLength,
      `Lead status name must be at least ${MinNameLength} character.`
    )
    .max(
      MaxNameLength,
      `Lead status name must be at most ${MaxNameLength} characters.`
    )
    .required("Lead status name is required"),

  // priorityColor: Yup.object().required("Priority color is required"),
}).required();

function HeaderForm({ editLeadData, isLoading }) {
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

  // useEffect(() => {
  //   () => {
  //     if (editLeadData) {
  //       setValue("leadStatusName", editLeadData[0].name);
  //     }
  //   };
  // }, [editLeadData, setValue]);

  // const leadStatuseData = useMutation({
  //   mutationFn: tkFetch.post(`${API_BASE_URL}/lead-status`),
  // });

  // const onSubmit = (formData) => {
  //   const apiData = {
  //     name: formData.name,
  //   };
  //   leadStatuseData.mutate(apiData, {
  //     onSuccess: (data) => {
  //       setValue("name", "");
  //       queryClient.invalidateQueries({
  //         queryKey: [RQ.allLeadStatus],
  //       });
  //       TkToastSuccess("Lead Status Created Successfully");
  //     },
  //     onError: (error) => {
  //       console.log("error while adding lead category status", error);
  //     },
  //   });
  // };

  return (
    <>
      {/* {isLoading ? null : ( */}
      <TkForm>
        <TkRow className="mt-3 mb-4 ms-auto">
          <TkCol lg={4}>
            <TkInput
              {...register("name")}
              id="name"
              type="text"
              labelName="Enter Region Name"
              placeholder="Enter Region Name"
              requiredStarOnLabel={true}
            />
          </TkCol>

          <TkCol lg={4} className="align-self-end">
            <TkButton
              color="primary"
              // loading={leadStatuseData.isLoading}
              className="btn btn-primary align-self-end"
              type="submit"
            >
              <i className="ri-add-fill align-bottom"></i> Add
            </TkButton>
          </TkCol>
        </TkRow>
      </TkForm>
      {/* )} */}
    </>
  );
}

function EditForm({ editLeadData, toggle, deleteModal, toggleDeleteModal }) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // const [lcId, setLcId] = useState(0);
  // useEffect(() => {
  //   if (editLeadData && editLeadData.length > 0) {
  //     setValue("name", editLeadData[0].name);

  //     setLcId(editLeadData[0].id);
  //   }
  // }, [editLeadData, setValue]);

  // const queryClient = useQueryClient();
  // const updateLeadStatus = useMutation({
  //   mutationFn: tkFetch.putWithIdInUrl(`${API_BASE_URL}/lead-status`),
  // });

  // const onSubmit = (formData) => {
  //   const apiData = {
  //     id: lcId,
  //     name: formData.name,
  //   };
  //   updateLeadStatus.mutate(apiData, {
  //     onSuccess: (data) => {
  //       toggle();
  //       queryClient.invalidateQueries({
  //         queryKey: [RQ.allLeadStatus],
  //       });
  //       TkToastSuccess("Lead Status Updated Successfully");
  //     },
  //     onError: (error) => {
  //       console.log("error while updating lead status", error);
  //     },
  //   });
  // };

  return (
    <TkForm>
      <TkRow className="mt-3 mb-3 ms-auto">
        <TkCol lg={4}>
          <TkInput
            {...register("name")}
            id="name"
            type="text"
            placeholder="Enter Region Name"
            labelName="Lead Region Name"
            tooltip="Enter Region Name"
            labelId={"_name"}
            requiredStarOnLabel={true}
          />
        </TkCol>

        <TkCol lg={4} className="align-self-end">
          <TkButton
            color="primary"
            loading={updateLeadStatus.isLoading}
            className="btn btn-primary align-self-end"
            type="submit"
          >
            <i className="ri-fill align-bottom"></i> Update
          </TkButton>
        </TkCol>
        {/* {errors.leadStatusName?.message ? (
          <FormErrorText>{errors.leadStatusName?.message}</FormErrorText>
        ) : null}
        {updateLeadStatus.isError ? (
          <FormErrorBox errMessage={updateLeadStatus.error.message} />
        ) : null} */}
      </TkRow>
    </TkForm>
  );
}

//TODO: add delete functionality and edit functionality

function RegionSetting({ mounted }) {
  const [modal, setModal] = useState(false);

  const [editLeadData, seteditLeadData] = useState();
  const [deleteLeadStatusData, setDeleteLeadStatusData] = useState();
  const [deleteModal, setDeleteModal] = useState(false);

  const toggleDeleteModel = (value) => {
    setDeleteLeadStatusData(value);
    setDeleteModal(true);
  };

  const toggle = useCallback(
    (editLeadData) => {
      seteditLeadData(editLeadData);
      if (modal) {
        setModal(false);
      } else {
        setModal(true);
      }
    },
    [modal]
  );

  // const { data, isLoading, isError, error } = useQuery({
  //   queryKey: [RQ.regionSettings],
  //   queryFn: tkFetch.get(`${API_BASE_URL}/lead-status`),
  //   enabled: mounted,
  // });

  const queryClient = useQueryClient();

  const activeLeadStatus = useMutation({
    mutationFn: tkFetch.patchWithIdInUrl(`${API_BASE_URL}/lead-status`),
  });

  const activeLeadStatusChange = useCallback(
    (lcid, active) => {
      const apiData = {
        id: lcid,
        active: !active,
      };
      activeLeadStatus.mutate(apiData, {
        onSuccess: (data) => {
          TkToastSuccess(
            `Lead Status ${
              active === true ? "Inactivated" : "Activated"
            } Successfully`
          );
          queryClient.invalidateQueries({
            queryKey: [RQ.allLeadStatus],
          });
        },
        onError: (error) => {
          console.log("Error while updating status in lead status", error);
        },
      });
    },
    [queryClient, activeLeadStatus]
  );

  const deleteLeadStatus = useMutation({
    mutationFn: tkFetch.deleteWithIdInUrl(`${API_BASE_URL}/lead-status`),
  });

  const deleteLeadStatusHandler = useCallback(
    (lcid) => {
      const apiData = {
        id: lcid,
      };
      deleteLeadStatus.mutate(apiData, {
        onSuccess: (data) => {
          TkToastSuccess("Lead Status Deleted Successfully");
          queryClient.invalidateQueries({
            queryKey: [RQ.allLeadStatus],
          });
        },
        onError: (error) => {
          console.log("Error while deleting lead status", error);
        },
      });
    },
    [deleteLeadStatus, queryClient]
  );

  const regionData = [
    {
      id: 1,
      name: "Region 1",
      active: true,
    },
    {
      id: 2,
      name: "Region 2",
      active: false,
    },
    {
      id: 3,
      name: "Region 3",
      active: true,
    },
    {
      id: 4,
      name: "Region 4",
      active: false,
    },
    {
      id: 5,
      name: "Region 5",
      active: true,
    },
    {
      id: 6,
      name: "Region 6",
      active: false,
    }
  ];

  const columns = useMemo(
    () => [
      {
        Header: "Region Name",
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
                  onClick={() =>
                    activeLeadStatusChange(
                      cellProps.row.original.id,
                      cellProps.row.original.active
                    )
                  }
                >
                  <TkIcon className="ri-indeterminate-circle-line me-2 align-bottom text-muted"></TkIcon>
                  {cellProps.row.original.active === false
                    ? "Active"
                    : "Inactive"}
                </TkDropdownItem>
                <TkDropdownItem
                  className="edit-list"
                  onClick={() => toggleDeleteModel(cellProps.row.original.id)}
                >
                  <TkIcon className="ri-delete-bin-line me-2 align-bottom text-muted"></TkIcon>
                  Delete
                </TkDropdownItem>
              </TkDropdownMenu>
            </TkUncontrolledDropdown>
          );
        },
      },
    ],
    [activeLeadStatusChange, toggle]
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
      <HeaderForm />
      {/* {deleteLeadStatus.isError ? (
        <FormErrorBox errMessage={deleteLeadStatus.error.message} />
      ) : null} */}
      <TkCardBody className="table-padding pt-0">
        <TkTableContainer
          columns={columns}
          data={regionData}
          customPageSize={true}
          defaultPageSize={10}
          showPagination={true}
        />
      </TkCardBody>
      <TkModal
        isOpen={modal}
        toggle={toggle}
        centered
        size="lg"
        contentClassName="border-0"
        dialogClassName="modal-dialog-centered"
      >
        <TkModalHeader toggle={toggle} className="border-0">
          <h4 className="modal-title">Edit Lead Status</h4>
        </TkModalHeader>
        <TkModalBody>
          <EditForm editLeadData={editLeadData} toggle={toggle} />
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
          deleteLeadStatusHandler(deleteLeadStatusData);
        }}
        onCloseClick={() => setDeleteModal(false)}
      />
      {/* </TkModalBody>
      </TkModal> */}
    </div>
  );
}

export default RegionSetting;
