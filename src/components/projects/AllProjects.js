import React, { useState, useEffect, useMemo, useReducer } from "react";
import Link from "next/link";
import { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkRow, { TkCol } from "../TkRow";
import TkTableContainer from "../TkTableContainer";
import tkFetch from "../../utils/fetch";
import {
  API_BASE_URL,
  filterFields,
  filterStatusOptions,
  minSearchLength,
  perDefinedProjectManagerRoleID,
  RQ,
  searchParamName,
  serachFields,
  urls,
} from "../../utils/Constants";
import { useQueries, useQuery } from "@tanstack/react-query";
import TkLoader from "../TkLoader";
import { FormErrorBox } from "../forms/ErrorText";
import TkNoData from "../TkNoData";
import TkAccessDenied from "../TkAccessDenied";
import { perAccessIds } from "../../../DBConstants";
import {
  convertToURLParamsString,
  isSearchonUI,
  searchAndFilterData,
  searchDebounce,
} from "../../utils/utilsFunctions";
import TkSelect from "../forms/TkSelect";
import TkInput from "../forms/TkInput";
import useSessionData from "../../utils/hooks/useSessionData";
import TkButton from "../TkButton";
import TkIcon from "../TkIcon";
import { convertSecToTime } from "../../utils/time";
import { UncontrolledTooltip } from "reactstrap";

function TableToolBar({
  onSearchChange,
  onPmChange,
  onStatusChange,
  onPriorityChange,
  onClientChange,
  onActiveChange,
}) {
  const sessionData = useSessionData();
  const [allPms, setAllPms] = React.useState([]);
  const [allPriority, setAllPriority] = React.useState([]);
  const [allStatus, setAllStatus] = React.useState([]);
  const [allClients, setAllClients] = React.useState([]);

  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allUsersList, "projectManager"],
        queryFn: tkFetch.get(
          `${API_BASE_URL}/users/list?indexFilter=true${
            sessionData?.user?.role?.id === perDefinedProjectManagerRoleID ? `id=${sessionData?.user?.id}` : ""
          }&indexFilter=projectmanager`
        ),
      },
      {
        queryKey: [RQ.allPriority],
        queryFn: tkFetch.get(`${API_BASE_URL}/priority/list?indexFilter=true`),
      },
      {
        queryKey: [RQ.allStatus],
        queryFn: tkFetch.get(`${API_BASE_URL}/status/list?indexFilter=true`),
      },
      {
        queryKey: [RQ.allClientList],
        queryFn: tkFetch.get(`${API_BASE_URL}/client/list?indexFilter=true`),
      },
    ],
  });
  const [pm, priority, status, client] = results;
  const { isLoading: isPmLoading, isError: isPmError, error: pmError, data: pmData } = pm;
  const { isLoading: isPriorityLoading, isError: isPriorityError, error: priorityError, data: priorityData } = priority;
  const { isLoading: isStatusLoading, isError: isStatusError, error: statusError, data: statusData } = status;
  const { isLoading: isClientLoading, isError: isClientError, error: clientError, data: clientData } = client;

  useEffect(() => {
    if (isPmError) {
      console.log("error", pmError);
      TkToastError(pmError?.message);
    }
    if (isPriorityError) {
      console.log("error", priorityError);
      TkToastError(priorityError?.message);
    }
    if (isStatusError) {
      console.log("error", statusError);
      TkToastError(statusError?.message);
    }
    if (isClientError) {
      console.log("error", clientError);
      TkToastError(clientError?.message);
    }
  }, [pmError, isPmError, isPriorityError, priorityError, isStatusError, statusError, isClientError, clientError]);

  useEffect(() => {
    if (Array.isArray(priorityData)) {
      const p = priorityData.map((priority) => ({
        value: priority.id,
        label: priority.name,
      }));
      setAllPriority(p);
    }
  }, [priorityData]);

  useEffect(() => {
    if (Array.isArray(pmData)) {
      const p = pmData.map((pm) => ({
        value: pm.id,
        label: pm.firstName + " " + pm.lastName,
      }));
      setAllPms(p);
    }
  }, [pmData]);

  useEffect(() => {
    if (Array.isArray(statusData)) {
      const s = statusData.map((status) => ({
        value: status.id,
        label: status.name,
      }));
      setAllStatus(s);
    }
  }, [statusData]);

  useEffect(() => {
    if (Array.isArray(clientData)) {
      const c = clientData.map((client) => ({
        value: client.id,
        label: client.name,
      }));
      setAllClients(c);
    }
  }, [clientData]);

  return (
    <>
      <TkCardBody className="table-toolbar mt-3">
        <TkRow className="mb-3">
          <TkCol lg={2}>
            <TkInput onChange={onSearchChange} placeholder="Search Projects" isSearchField={true} />
          </TkCol>

          <TkCol lg={2}>
            <TkSelect
              placeholder="Select Client"
              loading={isClientLoading}
              options={allClients}
              onChange={onClientChange}
            />
          </TkCol>

          {sessionData?.user?.role?.id !== perDefinedProjectManagerRoleID ? (
            <TkCol lg={2}>
              <TkSelect placeholder="Select Manager" loading={isPmLoading} options={allPms} onChange={onPmChange} />
            </TkCol>
          ) : null}

          {/* <TkCol lg={2}>
              <TkSelect 
              placeholder="Select Manager" 
              loading={isPmLoading} 
              options={allPms} 
              onChange={onPmChange} 
              />
            </TkCol> */}

          <TkCol lg={2}>
            <TkSelect
              placeholder="Select Priority"
              loading={isPriorityLoading}
              options={allPriority}
              onChange={onPriorityChange}
            />
          </TkCol>
          <TkCol lg={2}>
            <TkSelect
              placeholder="Select Status"
              loading={isStatusLoading}
              options={allStatus}
              onChange={onStatusChange}
            />
          </TkCol>
          <TkCol lg={2}>
            <TkSelect placeholder="Active/Inactive" options={filterStatusOptions} onChange={onActiveChange} />
          </TkCol>
        </TkRow>
      </TkCardBody>
    </>
  );
}

const AllProjects = ({ accessLevel }) => {
  const [urlParamsStr, setUrlParamsStr] = React.useState("");
  const [projectData, setProjectData] = useState([]);
  const [projectBackendData, setProjectBackendData] = useState([]); // this is used to store the data which is fetched from backend when user search or filter the data

  // kept this state to store search text, and filter values
  const [searchText, setSearchText] = useState("");
  const [filters, updateFilters] = useReducer((state, newState) => ({ ...state, ...newState }), {
    [filterFields.projects.pm]: null, // keep the initial values to null for filters
    [filterFields.projects.priority]: null, // keep the initial values to null for filters
    [filterFields.projects.status]: null, // keep the initial values to null for filters
    [filterFields.projects.active]: null, // keep the initial values to null for filters
  });

  const addActualTime = (data, projectsTime) => {
    const newData = data?.map((item) => {
      const time = projectsTime?.find((p) => p.id === item.id);
      return { ...item, actualTime: time?.actualTime };
    });
    return newData;
  };

  // this query to fetch all projects, while initial loading
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allProjects],
    queryFn: tkFetch.get(`${API_BASE_URL}/project`),
    enabled: Number(accessLevel) >= perAccessIds.view,
  });

  // this query to fetch all projects, while backend serach/filtering
  const {
    data: backData,
    isLoading: backIsLoading,
    isError: backIsError,
    error: backError,
  } = useQuery({
    queryKey: [RQ.allProjects, urlParamsStr],
    queryFn: tkFetch.get(`${API_BASE_URL}/project${urlParamsStr ? `?${urlParamsStr}` : ""}`),
    enabled: Number(accessLevel) >= perAccessIds.view && !!urlParamsStr,
  });

  const {
    data: projectsTime,
    isLoading: actualTimeLoading,
    isError: actualTimeError,
    error: actualTimeErr,
  } = useQuery({
    queryKey: [RQ.allProjectsActualTime],
    queryFn: tkFetch.get(`${API_BASE_URL}/project/actual-time`),
  });

  useEffect(() => {
    if (actualTimeError) {
      console.log("error", actualTimeErr);
    }
  }, [actualTimeErr, actualTimeError]);

  useEffect(() => {
    if (data && projectsTime) {
      const newDate = addActualTime(data, projectsTime);
      setProjectData(newDate);
    }
  }, [data, projectsTime]);

  useEffect(() => {
    if (backData && projectsTime) {
      const newDate = addActualTime(backData, projectsTime);
      setProjectBackendData(newDate);
    }
  }, [backData, projectsTime]);

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
      const newData = addActualTime(data, projectsTime);
      setProjectData(newData || []);
      setUrlParamsStr("");
      return;
    }
    if (isSearchonUI(data)) {
      const newData = searchAndFilterData(data, searchText, serachFields.projects, filters);
      const newDataWithTime = addActualTime(newData, projectsTime);
      setProjectData(newDataWithTime);
    } else {
      const urlParamString = convertToURLParamsString({ [searchParamName]: searchText, ...filters });
      setUrlParamsStr(urlParamString);
    }
  }, [data, filters, searchText, projectsTime]);

  const searchonUI = isSearchonUI(data);
  const backendData = urlParamsStr.length > 0 ? projectBackendData : null;
  const updateSearchText = (e) => {
    if (e.target.value.length >= minSearchLength) {
      setSearchText(e.target.value);
    } else {
      setSearchText(""); // dont pass any search text to search filter if saerch text is less than minSearchLength (currently 3)(at time of wirting this comment)
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: "View | Edit",
        accessor: "id",
        filterable: false,
        Cell: (cellProps) => {
          return (
            //   <div className="flex-grow-1 tasks_name">{cellProps.value}</div>
            <div className="d-flex align-items-center">
              <ul className="ps-0 mb-0">
                <li className="list-inline-item">
                  <Link href={`${urls.projectView}/${cellProps.value}`}>
                    <a>
                      <TkButton color="none">
                        <TkIcon className="ri-eye-fill align-bottom me-2 text-muted"></TkIcon>
                      </TkButton>
                    </a>
                  </Link>
                </li>
              </ul>
              |
              <ul className="ps-0 mb-0">
                <li className="list-inline-item">
                  <Link href={`${urls.projectEdit}/${cellProps.value}`}>
                    <a>
                      <TkButton color="none">
                        <TkIcon className="ri-edit-line fs-4 -fill align-bottom me-2 text-muted"></TkIcon>
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
        Header: "Project Name",
        accessor: "name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div className="d-flex">
                <Link href={`${urls.projectView}/${cellProps.row.original.id}`}>
                  <a className="flex-grow-1 fw-medium table-link text-primary">
                    <div className="flex-grow-1 tasks_name">
                      {cellProps.value.length > 13 ? (
                        <>
                          <span id={`project${cellProps.row.index}`}>
                            {cellProps.value.substring(0, 13) + "..."}
                          </span>
                          <UncontrolledTooltip
                            target={`project${cellProps.row.index}`}
                            className="custom-tooltip-style"
                            style={{ backgroundColor: "#dfe6eb", color: "#212529" }}
                          >
                            {cellProps.value}
                          </UncontrolledTooltip>
                        </>
                      ) : (
                        cellProps.value
                      )}
                    </div>
                  </a>
                </Link>
              </div>
            </>
          );
        },
      },
      {
        Header: "Client Name",
        accessor: "client.name",
        filterable: false,
        Cell: (cellProps) => {
          // return <div className="table-text">{cellProps.value || "Not Defined"}</div>;
          return (
            <div className="table-text">
              {cellProps.value?.length > 13 ? (
                <>
                  <span id={`client${cellProps.row.index}`}>
                    {cellProps.value.substring(0, 13) + "..."}
                  </span>
                  <UncontrolledTooltip
                    target={`client${cellProps.row.index}`}
                    className="custom-tooltip-style"
                    style={{ backgroundColor: "#dfe6eb", color: "#212529" }}
                  >
                    {cellProps.value}
                  </UncontrolledTooltip>
                </>
              ) : (
                cellProps.value
              )}
            </div>
          );
        },
      },
      // {
      //   Header: "Estimated End Date",
      //   accessor: "estimatedEndDate",
      //   filterable: false,
      //   Cell: (cellProps) => {
      //     return (
      //       <>
      //         <div className="table-text">{formatDate(cellProps.value) || "Not Defined"}</div>
      //       </>
      //     );
      //   },
      // },
      {
        Header: "Actual Hours",
        accessor: "actualTime",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div className="table-text">
                {cellProps.value === null ? <span>NA</span> : <span>{convertSecToTime(cellProps.value)}</span>}
              </div>
            </>
          );
        },
      },
      //add a column for project manager name here
      {
        Header: "Project Manager",
        accessor: "pm.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div className="table-text">
              {cellProps.value?.length > 13 ? (
                <>
                  <span id={`projectManager${cellProps.row.index}`}>{cellProps.value.substring(0, 13) + "..."}</span>
                  <UncontrolledTooltip
                    target={`projectManager${cellProps.row.index}`}
                    className="custom-tooltip-style"
                    style={{ backgroundColor: "#dfe6eb", color: "#212529" }}
                  >
                    {cellProps.value}
                  </UncontrolledTooltip>
                </>
              ) : (
                cellProps.value
              )}
            </div>
          );
        },
      },
      {
        Header: "Status",
        accessor: "status.name",
        filterable: false,
        Cell: (cellProps) => {
          if (cellProps.value === null || cellProps.value === undefined) {
            return <span className="table-text">—</span>;
          } else {
            return <span className="table-text">{cellProps.value}</span>;
          }
        },
      },
      {
        Header: "Priority",
        accessor: "priority.name",
        filterable: false,
        Cell: (cellProps) => {
          if (cellProps.value === null || cellProps.value === undefined) {
            return <span className="table-text">—</span>;
          } else {
            return <span className="table-text">{cellProps.value}</span>;
          }
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
      {isLoading ? (
        <TkLoader />
      ) : isError ? (
        <FormErrorBox errMessage={error.message} />
      ) : data.length > 0 ? (
        <div className="row">
          <TkCol lg={12}>
            {/* <TkCard id="tasksList"> */}
            {/* <TkCardHeader className="tk-card-header">
              <div className="d-flex align-items-center">
                <TkCardTitle tag="h3" className="mb-0 flex-grow-1">
                  <h3> All Projects</h3>
                </TkCardTitle>
              </div>
            </TkCardHeader> */}
            <TkCardBody>
              {backIsError ? (
                <FormErrorBox errMessage={backError.message} />
              ) : (
                <TkTableContainer
                  columns={columns}
                  data={backendData || projectData}
                  // isSearch={true}
                  Toolbar={
                    <TableToolBar
                      onSearchChange={searchDebounce(updateSearchText, searchonUI)}
                      onPmChange={(item) => {
                        updateFilters({
                          [filterFields.projects.pm]: item ? item.value : null, // pass null if you want to remove the filter
                        });
                      }}
                      onStatusChange={(item) => {
                        updateFilters({
                          [filterFields.projects.status]: item ? item.value : null, // pass null if you want to remove the filter
                        });
                      }}
                      onPriorityChange={(item) => {
                        updateFilters({
                          [filterFields.projects.priority]: item ? item.value : null, // pass null if you want to remove the filter
                        });
                      }}
                      onClientChange={(item) => {
                        updateFilters({
                          [filterFields.projects.client]: item ? item.value : null, // pass null if you want to remove the filter
                        });
                      }}
                      onActiveChange={(item) => {
                        updateFilters({
                          [filterFields.projects.active]: item ? item.value : null, // pass null if you want to remove the filter
                        });
                      }}
                    />
                  }
                  defaultPageSize={10}
                  customPageSize={true}
                  // isFilters={false} // make it true to see filetrs
                  showPagination={true}
                  // rowSelection={true} // pass it true to enable row selection
                  loading={urlParamsStr.length > 0 && backIsLoading}
                  // onRowSelection={(rows) => {
                  //   // pass a use callback for this function as it will rerender the tabel in not usecallabck
                  //   //you will get all rows selected data here
                  // }}
                  showSelectedRowCount={true} // pass it true to show the selected row count
                />
              )}
            </TkCardBody>
            {/* </TkCard> */}
          </TkCol>
        </div>
      ) : (
        <TkNoData />
      )}
    </>
  );
};

export default AllProjects;
