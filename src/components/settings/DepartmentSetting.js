import React, { useState, useEffect, useCallback } from "react";

import TkCard, { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkRow, { TkCol } from "../TkRow";
import TkInput from "../forms/TkInput";
import TkForm from "../forms/TkForm";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import SimpleBar from "simplebar-react";
import Link from "next/link";
import Image from "next/image";

import { API_BASE_URL, MinNameLength, MaxNameLength, urls } from "../../utils/Constants";

import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";

import { RQ } from "../../utils/Constants";
import TkLoader from "../TkLoader";
import { TkToastSuccess } from "../TkToastContainer";
import { TkDropdownItem, TkDropdownMenu, TkDropdownToggle, TkUncontrolledDropdown } from "../TkDropdown";
import TkIcon from "../TkIcon";
import TkModal, { TkModalBody, TkModalHeader } from "../TkModal";
import TkNoData from "../TkNoData";
import TkButton from "../TkButton";
import TkTableContainer from "../TkTableContainer";
import { useMemo } from "react";
import DeleteModal from "../../utils/DeleteModal";

const schema = Yup.object({

  departmentName: Yup.string()
    .min(MinNameLength, `Department name must be at least ${MinNameLength} character.`)
    .max(MaxNameLength, `Department name must be at most ${MaxNameLength} characters.`)
    .required("Department name is required"),

}).required();

function HeaderForm({  isLoading }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const queryClient = useQueryClient();

  const departmentData = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/department`),
  });

  const onSubmit = (formData) => {
    const apiData = {
      departmentName: formData.departmentName,
    };
    departmentData.mutate(apiData, {
      onSuccess: (data) => {
        // setDepartmentName("");
        setValue("departmentName", "");
        queryClient.invalidateQueries({
          queryKey: [RQ.allDepts],
        });
        TkToastSuccess("Department Created Successfully");
      },
      onError: (error) => {
        console.log("error while adding Department", error);
      },
    });
  };

  return (
    <>
      {isLoading ? null : (
        <TkForm onSubmit={handleSubmit(onSubmit)}>
          {/* <div className="page-title-box  p-1"> */}
          <TkRow className="d-sm-flex mt-3 mb-4 ms-auto">
            <TkCol lg={4}>
              <TkInput
                {...register("departmentName")}
                id="departmentName"
                type="text"
                labelName="Department Name"
                tooltip="Enter Department Name"
                labelId={"_departmentName"}
                placeholder="Enter Department Name"
                // value={departmentName}
                requiredStarOnLabel={true}
                // onChange={(e) => setDepartmentName(e.target.value)}
              />
            </TkCol>

            <TkCol lg={4} className="align-self-end">
              <TkButton
                loading={departmentData.isLoading}
                color="primary"
                className="btn btn-primary align-self-end"
                type="submit"
              >
                <i className="ri-add-fill align-bottom"></i> Add
              </TkButton>
            </TkCol>
            {errors.departmentName?.message ? <FormErrorText>{errors.departmentName?.message}</FormErrorText> : null}

            {departmentData.isError ? <FormErrorBox errMessage={departmentData.error.message} /> : null}
          </TkRow>
          {/* </div> */}
        </TkForm>
      )}
    </>
  );
}

function EditForm({ editDepartmentData, toggle }) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [dId, setDid] = useState(0);
  useEffect(() => {
    if (editDepartmentData && editDepartmentData.length > 0) {
      setValue("departmentName", editDepartmentData[0].name);
      setDid(editDepartmentData[0].id);
    }
  }, [editDepartmentData, setValue]);

  const queryClient = useQueryClient();
  const updateDepartment = useMutation({
    mutationFn: tkFetch.putWithIdInUrl(`${API_BASE_URL}/department`),
  });

  const onSubmit = (formData) => {
    const apiData = {
      id: dId,
      departmentName: formData.departmentName,
    };
    updateDepartment.mutate(apiData, {
      onSuccess: (data) => {
        toggle();
        queryClient.invalidateQueries({
          queryKey: [RQ.allDepts],
        });
        TkToastSuccess("Department Updated Successfully");
      },
      onError: (error) => {
        console.log("error while updating department status", error);
      },
    });
  };

  return (
    <TkForm onSubmit={handleSubmit(onSubmit)}>
      <TkRow className="mt-3 mb-3 ms-auto">
        <TkCol lg={4}>
          <TkInput
            {...register("departmentName")}
            id="departmentName"
            type="text"
            labelName="Department Name"
            // tooltip="Enter Department Name"
            // labelId={"_departmentName"}
            placeholder="Enter Department Name"
            requiredStarOnLabel={true}
          />
        </TkCol>

        <TkCol lg={4} className="align-self-end">
          <TkButton
            color="primary"
            loading={updateDepartment.isLoading}
            className="btn btn-primary align-self-end"
            type="submit"
          >
            <i className="ri-fill align-bottom"></i> Update
          </TkButton>
        </TkCol>
        {errors.departmentName?.message ? <FormErrorText>{errors.departmentName?.message}</FormErrorText> : null}
        {updateDepartment.isError ? <FormErrorBox errMessage={updateDepartment.error.message} /> : null}
      </TkRow>
    </TkForm>
  );
}

function Members({ memberData }) {
  return (
    <TkRow>
      {memberData?.length > 0 ? (
        memberData?.map((item, index) => (
          <>
            <TkCol lg={4} key={index} className="mb-4">
              <div className="row align-items-center">
                <TkCol lg={2}>
                  <div className="avatar-xs flex-shrink-0 me-3">
                    <Link href={`${urls.userView}/${item.id}`}>
                      <a>
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt="avatar"
                            height={20}
                            width={20}
                            layout="responsive"
                            className="img-fluid rounded-circle"
                          />
                        ) : (
                          <div className="avatar-title text-uppercase border rounded-circle bg-light text-primary">
                            {String(item.firstName).charAt(0) + String(item.lastName).charAt(0)}
                          </div>
                        )}
                      </a>
                    </Link>
                  </div>
                </TkCol>
                <TkCol lg={6}>
                  <div className="flex-grow-1">
                    <h5 className="fs-13 mb-0">
                      <Link href={`${urls.userView}/${item.id}`}>
                        <a className="text-primary ">{item.name}</a>
                      </Link>
                    </h5>
                  </div>
                </TkCol>
              </div>
            </TkCol>
          </>
        ))
      ) : (
        <TkNoData />
      )}
    </TkRow>
  );
}

//TODO: add delete functionality and edit functionality

function DepartmentSetting({ mounted }) {
  const [modal, setModal] = useState(false);

  const [editDepartmentData, setEditDepartmentData] = useState();

  const [memberData, setMemberData] = useState([]);
  const [modalMembers, setModalMembers] = useState(false);
 const [deleteDepartmentData, setDeleteDepartmentData] = useState();
 const [deleteModal, setDeleteModal] = useState(false);

 const toggleDeleteModel = (value) => {
  setDeleteDepartmentData(value);
    setDeleteModal(true);
  };
  const toggle = useCallback(
    (editDepartmentData) => {
      setEditDepartmentData(editDepartmentData);
      if (modal) {
        setModal(false);
      } else {
        setModal(true);
      }
    },
    [modal]
  );

  const toggleMembers = useCallback(
    (usersData) => {
      setMemberData(usersData);
      if (modalMembers) {
        setModalMembers(false);
        // setMemberData([]);
      } else {
        setModalMembers(true);
      }
    },
    [modalMembers]
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allDepts],
    queryFn: tkFetch.get(`${API_BASE_URL}/department`),
    enabled: mounted,
  });

  //   useEffect(() => {
  //     setMemberData(data[0].users);
  //   }, [data]);

  const queryClient = useQueryClient();

  const activeDepartment = useMutation({
    mutationFn: tkFetch.patchWithIdInUrl(`${API_BASE_URL}/department`),
  });

  const activeDepartmentChange = useCallback(
    (pid, active) => {
      const apiData = {
        id: pid,
        active: !active,
      };

      activeDepartment.mutate(apiData, {
        onSuccess: (data) => {
          TkToastSuccess(`Department ${active === true ? "Inactivated" : "Activated"} Successfully`);
          queryClient.invalidateQueries({
            queryKey: [RQ.allDepts],
          });
        },

        onError: (error) => {
          console.log("Error while updating status in Department", error);
        },
      });
    },
    [activeDepartment, queryClient]
  );

  const deleteDepartment = useMutation({
    mutationFn: tkFetch.deleteWithIdInUrl(`${API_BASE_URL}/department`),
  });

  const deleteDepartmentChange = useCallback(
    (pid) => {
      const apiData = {
        id: pid,
      };
      deleteDepartment.mutate(apiData, {
        onSuccess: (data) => {
          TkToastSuccess("Department Deleted Successfully");
          queryClient.invalidateQueries({
            queryKey: [RQ.allDepts],
          });
        },
        onError: (error) => {
          console.log("Error while deleting Department", error);
        },
      });
    },
    [deleteDepartment, queryClient]
  );


  const columns = useMemo(
    () => [
      {
        Header: "Department",
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
        Header: "Users",
        accessor: "users",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div
              onClick={() => toggleMembers(cellProps.value)}
              className="avatar-xxs table-text rounded-circle bg-light border d-flex justify-content-center align-items-center cursor-pointer"
            >
              <span>{cellProps?.value?.length}</span>
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
                  onClick={() =>
                    toggle([
                      {
                        id: cellProps.row.original.id,
                        name: cellProps.row.original.name,
                        color: cellProps.row.original.color,
                      },
                    ])
                  }
                  className="edit-list"
                >
                  <TkIcon className="ri-pencil-line me-2 align-bottom text-muted"></TkIcon>
                  {"Edit"}
                </TkDropdownItem>
                <TkDropdownItem
                  className="edit-list"
                  onClick={() => activeDepartmentChange(cellProps.row.original.id, cellProps.row.original.active)}
                >
                  <TkIcon className="ri-indeterminate-circle-line me-2 align-bottom text-muted"></TkIcon>
                  {cellProps.row.original.active === false ? "Active" : "Inactive"}
                </TkDropdownItem>
                <TkDropdownItem className="edit-list" onClick={() => toggleDeleteModel(cellProps.row.original.id)}>
                  <TkIcon className="ri-delete-bin-line me-2 align-bottom text-muted"></TkIcon>
                  {"Delete"}
                </TkDropdownItem>
              </TkDropdownMenu>
            </TkUncontrolledDropdown>
          );
        },
      },
    ],
    [activeDepartmentChange, toggle, toggleMembers]
  );

  return (
    <div>
      {/* <TkCard style={{ minHeight: "300px" }}> */}
      {/* <TkCardHeader className="tk-card-header">
        <div className="d-flex align-items-center">
          <TkCardTitle className="mt-1 flex-grow-1">
            <h3>Department Setting</h3>
          </TkCardTitle>
        </div>
      </TkCardHeader> */}
      <HeaderForm isLoading={isLoading} />
      {deleteDepartment.isError ? <FormErrorBox errMessage={deleteDepartment.error.message} /> : null}
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
          <h4 className="modal-title">Edit Department</h4>
        </TkModalHeader>
        <TkModalBody>
          <EditForm editDepartmentData={editDepartmentData} toggle={toggle} />
        </TkModalBody>
      </TkModal>

      <TkModal
        isOpen={modalMembers}
        toggle={toggleMembers}
        centered
        size="lg"
        contentClassName="border-0"
        dialogClassName="modal-dialog-centered"
      >
        <TkModalHeader toggle={toggleMembers} className="border-0">
          <h4 className="modal-title">Members</h4>
        </TkModalHeader>
        <TkModalBody>
          <Members memberData={memberData} />
        </TkModalBody>
      </TkModal>

      <DeleteModal
        show={deleteModal}
        onDeleteClick={() => {
          setDeleteModal(false);
          deleteDepartmentChange(deleteDepartmentData);
        }}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
}

export default DepartmentSetting;
