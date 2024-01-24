import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";

import TkCard, { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkRow, { TkCol } from "../TkRow";
import TkLoader from "../TkLoader";
import TkNoData from "../TkNoData";
import TkTableContainer from "../TkTableContainer";
import { useQuery } from "@tanstack/react-query";
import tkFetch from "../../../src/utils/fetch";
import {
  API_BASE_URL,
  filterFields,
  filterStatusOptions,
  minSearchLength,
  roleRestrictionLabels,
  RQ,
  searchParamName,
  serachFields,
  urls,
} from "../../utils/Constants";
import { FormErrorBox } from "../forms/ErrorText";
import TkAccessDenied from "../TkAccessDenied";
import { perAccessIds, roleRestrictionIds } from "../../../DBConstants";
import {
  convertToURLParamsString,
  isSearchonUI,
  searchAndFilterData,
  searchData,
  searchDebounce,
} from "../../utils/utilsFunctions";
import TkSelect from "../forms/TkSelect";
import TkInput from "../forms/TkInput";
import { useReducer } from "react";
import { UncontrolledTooltip } from "reactstrap";
import TkIcon from "../TkIcon";
import TkButton from "../TkButton";

const restrictionOptions = [
  { value: roleRestrictionIds.own, label: roleRestrictionLabels.own },
  { value: roleRestrictionIds.subordinates, label: roleRestrictionLabels.subordinates },
  { value: roleRestrictionIds.none, label: roleRestrictionLabels.none },
];

function TableToolBar({ onSearchChange, onRestrictionChange, onActiveChange }) {
  return (
    <>
      <TkCardBody className="table-toolbar mt-3 mb-4">
        <TkRow className="mb-3">
          <TkCol lg={3}>
            <TkInput onChange={onSearchChange} type="text" placeholder="Search Role Name" isSearchField={true} />
          </TkCol>
          <TkCol lg={3}>
            <TkSelect placeholder="Select Restriction" options={restrictionOptions} onChange={onRestrictionChange} />
          </TkCol>
          <TkCol lg={3}>
            <TkSelect placeholder="Active/Inactive" options={filterStatusOptions} onChange={onActiveChange} />
          </TkCol>
        </TkRow>
      </TkCardBody>
    </>
  );
}

const AllRoles = ({ accessLevel }) => {
  const [urlParamsStr, setUrlParamsStr] = React.useState("");
  const [searchText, setSearchText] = useState("");
  const [roles, setRoles] = useState([]);
  const [filters, updateFilters] = useReducer((state, newState) => ({ ...state, ...newState }), {
    [filterFields.roles.restriction]: null, // keep the initial values to null for filters
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allRoles],
    queryFn: tkFetch.get(`${API_BASE_URL}/roles`),
    enabled: Number(accessLevel) >= perAccessIds.view,
  });

  const {
    data: backData,
    isLoading: isBackLoading,
    isError: isBackError,
    error: backError,
  } = useQuery({
    queryKey: [RQ.allRoles, urlParamsStr],
    queryFn: tkFetch.get(`${API_BASE_URL}/roles${urlParamsStr ? `?${urlParamsStr}` : ""}`),
    enabled: Number(accessLevel) >= perAccessIds.view && !!urlParamsStr,
  });

  useEffect(() => {
    if (data) {
      setRoles(data);
    }
  }, [data]);

  useEffect(() => {
    let doSearch = true;
    let doFilter = true;
    if (searchText === "") {
      doSearch = false;
    }
    if (Object.values(filters).every((val) => val === null || val === undefined || val === "")) {
      doFilter = false;
    }

    if (!doSearch && !doFilter) {
      // if data is undefined then set it to empty array
      setRoles(data || []);
      setUrlParamsStr("");
      return;
    }
    if (isSearchonUI(data)) {
      const newData = searchAndFilterData(data, searchText, serachFields.roles, filters);
      setRoles(newData);
    } else {
      const urlParamString = convertToURLParamsString({ [searchParamName]: searchText, ...filters });
      setUrlParamsStr(urlParamString);
    }
  }, [searchText, filters, data]);

  const searchOnUI = isSearchonUI(data);
  const backendData = urlParamsStr.length > 0 ? backData : null;
  const updateSearchText = (e) => {
    if (e.target.value.length >= minSearchLength) {
      setSearchText(e.target.value);
    } else {
      setSearchText("");
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: "View",
        accessor: "view",
        filterable: false,
        Cell: (cellProps) => {
          return (
            //   <div className="flex-grow-1 tasks_name">{cellProps.value}</div>
            <div className="d-flex align-items-center">
              <ul className="ps-0 mb-0">
                <li className="list-inline-item">
                <Link href={`${urls.roleView}/${cellProps.row.original.id}`}>
                    <a>
                      <TkButton color="none">
                        <TkIcon className="ri-eye-fill align-bottom me-2 text-muted"></TkIcon>
                      </TkButton>
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
          );
        },
      },
      {
        Header: "Roles",
        accessor: "name",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        }, 
      },
      {
        Header: "Description",
        accessor: "description",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div className="table-text">
              {cellProps.row.original.description.length > 100 ? (
                <>
                  <span id={`toolTip${cellProps.row.id}`}>
                    {cellProps.row.original.description.substring(0, 100) + "..."}
                  </span>
                  <UncontrolledTooltip
                    target={`toolTip${cellProps.row.id}`}
                    className="custom-tooltip-style"
                    style={{ backgroundColor: "#dfe6eb", color: "#212529" }}
                  >
                    {cellProps.row.original.description}
                  </UncontrolledTooltip>
                </>
              ) : (
                cellProps.row.original.description
              )}
            </div>
          );
        },
      },
      
    ],
    []
  );

  if (!accessLevel) {
    return <TkAccessDenied />;
  }

  return (
    <>
      <TkRow>
        {isLoading ? (
          <TkLoader />
        ) : isError ? (
          <FormErrorBox errMessage={error.message} />
        ) : data?.length > 0 ? (
          <TkRow>
            <TkCol lg={12}>
              {/* <TkCardHeader className="tk-card-header border-bottom mb-4">
                <div className="d-flex align-items-center">
                  <TkCardTitle className="mb-0 flex-grow-1">
                    <h2>Roles And Permissions</h2>
                  </TkCardTitle>
                </div>
              </TkCardHeader> */}
              <TkCardBody>
                {isBackError ? (
                  <FormErrorBox errMessage={backError.message} />
                ) : (
                  <TkTableContainer
                    columns={columns}
                    data={backendData || roles}
                    // Toolbar={
                    //   <TableToolBar
                    //     onSearchChange={searchDebounce(updateSearchText, searchOnUI)}
                    //     onRestrictionChange={(item) => {
                    //       updateFilters({
                    //         [filterFields.roles.restriction]: item ? item.value : null,
                    //       });
                    //     }}
                    //     onActiveChange={(item) => {
                    //       updateFilters({
                    //         [filterFields.roles.active]: item ? item.value : null,
                    //       });
                    //     }}
                    //   />
                    // }
                    loading={urlParamsStr.length > 0 && isBackLoading}
                    defaultPageSize={10}
                    showPagination={true}
                  />
                )}
              </TkCardBody>
            </TkCol>
          </TkRow>
        ) : (
          <TkCol lg={10}>
            <TkNoData />
          </TkCol>
        )}
      </TkRow>
    </>
  );
};

export default AllRoles;
