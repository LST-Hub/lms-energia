import React, { useMemo } from "react";
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
  RQ,
  searchParamName,
  serachFields,
  urls,
} from "../../utils/Constants";
import { FormErrorBox } from "../forms/ErrorText";
import TkIcon from "../TkIcon";
import TkButton from "../TkButton"; 
import { useRouter } from "next/router";
import TkSelect from "../forms/TkSelect";
import { useReducer } from "react";
import { useEffect } from "react";
import { convertToURLParamsString, isSearchonUI, searchAndFilterData } from "../../utils/utilsFunctions";
import { UncontrolledTooltip } from "reactstrap";

function TableToolBar({ onActiveChange }) {
  return (
    <>
      <TkCardBody className="table-toolbar mt-3 mb-4">
        <TkRow className="mb-3">
          <TkCol lg={2}>
            <TkSelect placeholder="Active/Inactive" options={filterStatusOptions} onChange={onActiveChange} />
          </TkCol>
        </TkRow>
      </TkCardBody>
    </>
  );
}

// const urls = {
//   dashborad: '/dashboard'
//   workCalView: `/${ws}/work-calendar/view`
// }

const AllWorkCals = ({ mounted }) => {
  const router = useRouter();

  const [urlParamsStr, setUrlParamsStr] = React.useState("");
  const [workCals, setWorkCals] = React.useState([]);
  const [filters, updateFilters] = useReducer((state, newState) => ({ ...state, ...newState }), {
    [filterFields.workCalendar.active]: null, // keep the initial values to null for filters
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allWorkCals],
    queryFn: tkFetch.get(`${API_BASE_URL}/work-calendar`),
    enabled: mounted,
  });

  const {
    data: backData,
    isLoading: isBackLoading,
    isError: isBackError,
    error: backError,
  } = useQuery({
    queryKey: [RQ.allWorkCals, urlParamsStr],
    queryFn: tkFetch.get(`${API_BASE_URL}/work-calendar${urlParamsStr ? `?${urlParamsStr}` : ""}`),
    enabled: !!urlParamsStr,
  });

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
                <Link href={`${urls.workCalendarView}/${cellProps.row.original.id}`}>
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
        Header: "Work Calendars",
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
            // <div className="table-text">
            //   {cellProps.row.original.description?.length > 13 ? (
            //     <>
            //       <span id={`toolTip${cellProps.row.id}`}>
            //         {cellProps.row.original.description?.substring(0, 100) + "..."}
            //       </span>
            //       <UncontrolledTooltip
            //         target={`toolTip${cellProps.row.id}`}
            //         autohide={false}
            //         className="custom-tooltip-style"
            //         style={{ backgroundColor: "#dfe6eb", color: "#212529" }}
            //       >
            //         {cellProps.row.original.description?.substring(0, 100) + "..."}
            //       </UncontrolledTooltip>
            //     </>
            //   ) : (
            //     cellProps.row.original.description
            //   )}
            // </div>
            <div className="table-text">
            {cellProps.value ? (
              <>
                {cellProps.value?.length > 20 ? (
                  <>
                    <span id={`toolTip${cellProps.row.original.id}`}>{cellProps.value.substring(0, 60) + "..."}</span>
                    <UncontrolledTooltip
                      target={`toolTip${cellProps.row.original.id}`}
                      autohide={false}
                      className={`custom-tooltip-style`}
                      style={{
                        backgroundColor: "#dfe6eb",
                        color: "#212529",
                        maxHeight: "200px", // Set the maximum height of the tooltip
                        overflowY: "auto", // Enable vertical scrolling if the content exceeds maxHeight
                      }}
                    >
                      {cellProps.value}
                    </UncontrolledTooltip>
                  </>
                ) : (
                  cellProps.value
                )}
              </>
            ) : (
              "—"
            )}
          </div>
          );
        },
      },
      
    ],
    []
  );

  useEffect(() => {
    if (data) {
      setWorkCals(data);
    }
  }, [data]);

  useEffect(() => {
    let doFilter = true;

    if (Object.values(filters).every((val) => val === null || val === undefined || val === "")) {
      doFilter = false;
    }

    if (!doFilter) {
      // if data is undefined then set it to empty array
      setWorkCals(data || []);
      setUrlParamsStr("");
      return;
    }
    if (isSearchonUI(data)) {
      const newData = searchAndFilterData(data, null, null, filters);
      setWorkCals(newData);
    } else {
      const urlParamString = convertToURLParamsString({ [searchParamName]: null, ...filters });
      setUrlParamsStr(urlParamString);
    }
  }, [filters, data]);

  const backendData = urlParamsStr?.length > 0 ? backData : null;

  return (
    <div className="row justify-content-center">
      <TkCol lg={12}>
        {isLoading ? (
          <TkLoader />
        ) : isError ? (
          <FormErrorBox errMessage={error.message} />
        ) : (
          <div className="row">
            <TkCol lg={12}>
              <TkCardHeader className="tk-card-header">
                <div className="d-flex align-items-center">
                  <TkCardTitle className="mb-0 flex-grow-1">
                    <h3>Work Calendars</h3>
                  </TkCardTitle>
                  <TkButton
                    color="primary"
                    className="btn add-btn me-1"
                    onClick={() => {
                      router.push(`${urls.workCalendarAdd}`);
                    }}
                  >
                    <TkIcon className="ri-add-line align-bottom me-1"></TkIcon>
                    Add
                  </TkButton>
                </div>
              </TkCardHeader>
              <TkCardBody className="table-padding pt-0">
                {isBackError ? <FormErrorBox errMessage={backError.message} /> : null}
                {data?.length > 0 ? (
                  <TkTableContainer
                    columns={columns}
                    data={backendData || workCals}
                    Toolbar={
                      <TableToolBar
                        onActiveChange={(item) => {
                          updateFilters({
                            [filterFields.workCalendar.active]: item ? item.value : null, // pass null if you want to remove the filter
                          });
                        }}
                      />
                    }
                    defaultPageSize={10}
                    loading={urlParamsStr?.length > 0 && isBackLoading}
                    showPagination={true}
                  />
                ) : (
                  <TkNoData />
                )}
              </TkCardBody>
            </TkCol>
          </div>
        )}
      </TkCol>
    </div>
  );
};

export default AllWorkCals;
