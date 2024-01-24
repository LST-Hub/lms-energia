import React, { useState } from "react";

import TkCard, { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkRow, { TkCol } from "../TkRow";
import TkSelect from "../forms/TkSelect";
import TkForm from "../forms/TkForm";

import { API_BASE_URL, RQ, statusOptions } from "../../utils/Constants";

import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import TkLoader from "../TkLoader";
import { TkToastSuccess } from "../TkToastContainer";
import { TkDropdownItem, TkDropdownMenu, TkDropdownToggle, TkUncontrolledDropdown } from "../TkDropdown";
import TkIcon from "../TkIcon";
import TkButton from "../TkButton";
import TkNoData from "../TkNoData";
import TkTableContainer from "../TkTableContainer";
import { useMemo } from "react";
import { useCallback } from "react";

const schema = Yup.object({
  // statusName: Yup.string()
  //   .min(MinNameLength, `Status name must be at least ${MinNameLength} character.`)
  //   .max(MaxNameLength, `Status name must be at most ${MaxNameLength} characters.`)
  //   .required("Status name is required"),
  statusName: Yup.object().nullable().required("Status color is required"),
}).required();

function StatusSetting({ mounted }) {
  // const [statusList, setStatusList] = useState([]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allStatus],
    queryFn: tkFetch.get(`${API_BASE_URL}/status`),
    enabled: mounted,
  });

  const queryClient = useQueryClient();

  const activeStatus = useMutation({
    mutationFn: tkFetch.patchWithIdInUrl(`${API_BASE_URL}/status`),
  });

  const activeStatusChange = useCallback(
    (cid, active) => {
      const apiData = {
        id: cid,
        active: !active,
      };
      activeStatus.mutate(apiData, {
        onSuccess: (data) => {
          TkToastSuccess(`Status  ${active === true ? "Inactivated" : "Activated"} Successfully`);
          queryClient.invalidateQueries({
            queryKey: [RQ.allStatus],
          });
        },
        onError: (error) => {
          console.log("Error while updating status", error);
        },
      });
    },
    [activeStatus, queryClient]
  );

  const columns = useMemo(
    () => [
      {
        Header: "Status",
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
                  onClick={() => activeStatusChange(cellProps.row.original.id, cellProps.row.original.active)}
                >
                  <TkIcon className="ri-indeterminate-circle-line me-2 align-bottom text-muted"></TkIcon>
                  {cellProps.row.original.active === false ? "Active" : "Inactive"}
                </TkDropdownItem>
              </TkDropdownMenu>
            </TkUncontrolledDropdown>
          );
        },
      },
    ],
    [activeStatusChange]
  );

  // const addStatus = (name, color) => {
  //   const newStatusList = [...statusList, { name: name, color: color }];
  //   setStatusList(newStatusList);
  // };

  return (
    <div>
      {/* <TkCard> */}
      {/* <TkCardHeader className="tk-card-header">
        <div className="d-flex align-items-center">
          <TkCardTitle className="mt-1 flex-grow-1">
            <h3>Status Setting</h3>
          </TkCardTitle>
        </div>
      </TkCardHeader> */}
      <TkCardBody>
        {/* <HeaderForm addStatus={addStatus} /> */}
        <div className="text-reset notification-item d-block dropdown-item position-relative">
          <div className="d-flex align-items-center">
            <div className="flex-grow-1">
              {isLoading ? (
                <TkLoader />
              ) : isError ? (
                <FormErrorBox errMessage={error?.message} />
              ) : data?.length > 0 ? (
                // data?.map((status, index) => (
                //   <TkRow key={index} className="mb-3">
                //     <TkCol lg={3}>
                //       <h5 className="font-size-14 mb-1">{index + 1}</h5>
                //     </TkCol>
                //     <TkCol lg={3}>
                //       <h5>
                //         <span>{status.name}</span>
                //       </h5>
                //     </TkCol>
                //     <TkCol lg={3}>
                //       {status.active === false ? (
                //         <span className="badge badge-soft-danger rounded-pill text-uppercase">{`Inactive`}</span>
                //       ) : null}
                //     </TkCol>
                //     <TkCol lg={3}>
                //       <TkUncontrolledDropdown direction="start" className="text-end">
                //         <TkDropdownToggle tag="a" id="dropdownMenuLink2" role="button">
                //           <TkIcon className="ri-more-fill fs-4"></TkIcon>
                //         </TkDropdownToggle>
                //         <TkDropdownMenu>
                //           <TkDropdownItem
                //             className="edit-list"
                //             onClick={() => activeStatusChange(status.id, status.active)}
                //           >
                //             <TkIcon className="ri-indeterminate-circle-line me-2 align-bottom text-muted"></TkIcon>
                //             Inactive
                //           </TkDropdownItem>
                //         </TkDropdownMenu>
                //       </TkUncontrolledDropdown>
                //     </TkCol>
                //   </TkRow>
                // ))
                <TkCardBody className="table-padding pt-0 mt-2">
                  <TkTableContainer columns={columns} data={data || []} />
                </TkCardBody>
              ) : (
                <TkRow>
                  <TkNoData />
                </TkRow>
              )}
            </div>
          </div>
        </div>
      </TkCardBody>
      {/* </TkCard> */}
    </div>
  );
}

export default StatusSetting;
