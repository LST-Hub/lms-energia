import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import TkRow, { TkCol } from "../TkRow";
import TkIcon from "../TkIcon";
import TkTableContainer from "../TkTableContainer";
import {
  API_BASE_URL,
  filterFields,
  filterStatusOptions,
  minSearchLength,
  perDefinedEmployeeRoleID,
  perDefinedProjectManagerRoleID,
  RQ,
  searchParamName,
  serachFields,
  urls,
} from "../../utils/Constants";
import { useQueries, useQuery } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import TkNoData from "../TkNoData";
import { FormErrorBox } from "../forms/ErrorText";
import TkLoader from "../TkLoader";
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
import { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import { useReducer } from "react";
import useSessionData from "../../utils/hooks/useSessionData";
import TkButton from "../TkButton";
import { convertSecToTime } from "../../utils/time";
import { UncontrolledTooltip } from "reactstrap";

function TableToolBar({ onSearchChange, onProjectChange, onStatusChange, onPriorityChange, onActiveChange }) {
  const sessionData = useSessionData();
  const [allProjects, setAllProjects] = React.useState([]);
  const [allPriority, setAllPriority] = React.useState([]);
  const [allStatus, setAllStatus] = React.useState([]);

  const resuls = useQueries({
    queries: [
      {
        queryKey: [RQ.allProjectList],
        queryFn: tkFetch.get(
          `${API_BASE_URL}/project/list${
            sessionData.user.roleId === perDefinedProjectManagerRoleID
              ? `?PMprojects=true&indexFilter=true`
              : sessionData.user.roleId === perDefinedEmployeeRoleID
              ? `?myProjects=true&indexFilter=true`
              : `?indexFilter=true`
          }`
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
    ],
  });
  const [project, priority, status] = resuls;
  const { isLoading: isProjectLoading, isError: isProjectError, error: projectError, data: projectData } = project;
  const { isLoading: isPriorityLoading, isError: isPriorityError, error: priorityError, data: priorityData } = priority;
  const { isLoading: isStatusLoading, isError: isStatusError, error: statusError, data: statusData } = status;

  useEffect(() => {
    if (isProjectError) {
      console.log("error", projectError);
      TkToastError(projectError?.message);
    }
    if (isPriorityError) {
      console.log("error", priorityError);
      TkToastError(priorityError?.message);
    }
    if (isStatusError) {
      console.log("error", statusError);
      TkToastError(statusError?.message);
    }
  }, [projectError, isProjectError, isPriorityError, priorityError, isStatusError, statusError]);

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
    if (Array.isArray(projectData)) {
      const p = projectData.map((project) => ({
        value: project.id,
        label: project.name,
      }));
      setAllProjects(p);
    }
  }, [projectData]);

  useEffect(() => {
    if (Array.isArray(statusData)) {
      const s = statusData.map((status) => ({
        value: status.id,
        label: status.name,
      }));
      setAllStatus(s);
    }
  }, [statusData]);

  return (
    <>
      <TkCardBody className="table-toolbar mt-3">
        <TkRow className="mb-3">
          <TkCol lg={2}>
            <TkInput onChange={onSearchChange} placeholder="Search Tasks" isSearchField={true} />
          </TkCol>
          <TkCol lg={2}>
            <TkSelect
              placeholder="Select Project"
              loading={isProjectLoading}
              options={allProjects}
              onChange={onProjectChange}
            />
          </TkCol>
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

const AllTasks = ({ accessLevel }) => {
  // console.log("acess", Number(accessLevel) >= perAccessIds.view);

  // Checked All
  //TODO: here check all checkboxes are checked with javascript and not with react , it may produce problem. See if problem occures and fix it
  // const checkedAll = () => {
  //   const checkall = document.getElementById("checkBoxAll");
  //   const ele = document.querySelectorAll(".taskCheckBox");

  //   if (checkall.checked) {
  //     ele.forEach((ele) => {
  //       ele.checked = true;
  //     });
  //   } else {
  //     ele.forEach((ele) => {
  //       ele.checked = false;
  //     });
  //   }
  // };

  const [taskData, setTaskData] = useState([]);
  const [taskBackendData, setTaskBackendData] = useState([]); // for backend data [url params
  const [urlParamsStr, setUrlParamsStr] = React.useState("");
  const [searchText, setSearchText] = useState("");
  const [filters, updateFilters] = useReducer((state, newState) => ({ ...state, ...newState }), {
    [filterFields.tasks.project]: null, // keep the initial values to null for filters
    [filterFields.tasks.priority]: null, // keep the initial values to null for filters
    [filterFields.tasks.status]: null, // keep the initial values to null for filters
  });

  const addActualTime = (data, tasksTime) => {
    const newData = data?.map((item) => {
      const time = tasksTime?.find((t) => t.id === item.id);
      return { ...item, actualTime: time?.actualTime };
    });
    return newData;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allTasks],
    queryFn: tkFetch.get(`${API_BASE_URL}/task`),
    enabled: Number(accessLevel) >= perAccessIds.view,
  });

  const {
    data: backData,
    isLoading: isBackLoading,
    isError: isBackError,
    error: backError,
  } = useQuery({
    queryKey: [RQ.allTasks, urlParamsStr],
    queryFn: tkFetch.get(`${API_BASE_URL}/task${urlParamsStr ? `?${urlParamsStr}` : ""}`),
    enabled: Number(accessLevel) >= perAccessIds.view && !!urlParamsStr,
  });

  const {
    data: tasksTime,
    isLoading: actualTimeLoading,
    isError: actualTimeError,
    error: actualTimeErr,
  } = useQuery({
    queryKey: [RQ.allTaskActualTime],
    queryFn: tkFetch.get(`${API_BASE_URL}/task/actual-time`),
  });

  useEffect(() => {
    if (actualTimeError) {
      console.log("error", actualTimeErr);
    }
  }, [actualTimeErr, actualTimeError]);

  useEffect(() => {
    if (data && tasksTime) {
      const newData = addActualTime(data, tasksTime);
      setTaskData(newData);
    }
  }, [data, tasksTime]);

  useEffect(() => {
    if (backData && tasksTime) {
      const newData = addActualTime(backData, tasksTime);
      setTaskBackendData(newData);
    }
  }, [backData, tasksTime]);

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
                  <Link href={`${urls.taskView}/${cellProps.value}`}>
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
                  <Link href={`${urls.taskEdit}/${cellProps.value}`}>
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
        Header: "Tasks Name",
        accessor: "name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div className="d-flex">
                <Link href={`${urls.taskView}/${cellProps.row.original.id}`}>
                  <a className="flex-grow-1 fw-medium table-link text-primary">
                    <div className="flex-grow-1 tasks_name">
                      {cellProps.value.length > 13 ? (
                        <>
                          <span id={`task${cellProps.row.index}`}>
                            {cellProps.value.substring(0, 13) + "..."}
                          </span>
                          <UncontrolledTooltip
                            target={`task${cellProps.row.index}`}
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
        Header: "Project",
        accessor: "project.name",
        filterable: false,
        Cell: (cellProps) => {
          // console.log("ellProps.data.project.id", cellProps.row);
          return (
           <div className="table-text">
              {cellProps.value?.length > 13 ? (
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
          );
        },
      },
      {
        Header: "Actual Time",
        accessor: "actualTime",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div>{cellProps.value === null ? <span>NA</span> : <span>{convertSecToTime(cellProps.value)}</span>}</div>
            </>
          );
        },
      },
      // {
      //   Header: "Estimated End Date",
      //   accessor: "estimatedEndDate",
      //   filterable: false,
      //   Cell: (cellProps) => {
      //     // return <DueDate {...cellProps} />;
      //     if (cellProps.value === null || cellProps.value === undefined) {
      //       return <div className="table-text">Not Defined</div>;
      //     } else {
      //       return <div className="table-text">{formatDate(cellProps.value)}</div>;
      //     }
      //   },
      // },
      /*TODO: fix client name getting change after status is changed*/
      {
        Header: "Status",
        accessor: "status.name",
        filterable: false,
        Cell: (cellProps) => {
          // return <Status {...cellProps} />;
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
          // return <Priority {...cellProps} />;
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

  useEffect(() => {
    if (data) {
      setTaskData(data);
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
      const newData = addActualTime(data, tasksTime);
      setTaskData(newData || []);
      setUrlParamsStr("");
      return;
    }
    if (isSearchonUI(data)) {
      const newData = searchAndFilterData(data, searchText, serachFields.tasks, filters);
      const newDataWithTime = addActualTime(newData, tasksTime);
      setTaskData(newDataWithTime);
    } else {
      const urlParamString = convertToURLParamsString({ [searchParamName]: searchText, ...filters });
      setUrlParamsStr(urlParamString);
    }
  }, [data, searchText, filters, tasksTime]);

  const searchonUI = isSearchonUI(data);
  const backendData = urlParamsStr.length > 0 ? taskBackendData : null;
  const updateSearchText = (e) => {
    if (e.target.value.length >= minSearchLength) {
      setSearchText(e.target.value);
    } else {
      setSearchText("");
    }
  };

  if (!accessLevel) {
    return <TkAccessDenied />;
  }

  return (
    <React.Fragment>
      {isLoading ? (
        <TkLoader />
      ) : isError ? (
        <FormErrorBox errMessage={error.message} />
      ) : data.length > 0 ? (
        <>
          {/* <Widgets data={data} /> */}
          <div className="row">
            <TkCol lg={12}>
              {/* <div className="card" id="tasksList"> */}
              {/* <TkCardHeader className="tk-card-header">
                <div className="d-flex align-items-center">
                  <TkCardTitle tag="h3" className="mb-0 flex-grow-1">
                    <h3>All Tasks</h3>
                  </TkCardTitle>
                </div>
              </TkCardHeader> */}
              <TkCardBody>
                {isBackError ? (
                  <FormErrorBox errMessage={backError.message} />
                ) : (
                  <TkTableContainer
                    columns={columns}
                    data={backendData || taskData}
                    // isSearch={true}
                    Toolbar={
                      <TableToolBar
                        onSearchChange={searchDebounce(updateSearchText, searchonUI)}
                        onProjectChange={(item) => {
                          updateFilters({
                            [filterFields.tasks.project]: item ? item.value : null,
                          });
                        }}
                        onStatusChange={(item) => {
                          updateFilters({
                            [filterFields.tasks.status]: item ? item.value : null,
                          });
                        }}
                        onPriorityChange={(item) => {
                          updateFilters({
                            [filterFields.tasks.priority]: item ? item.value : null,
                          });
                        }}
                        onActiveChange={(item) => {
                          updateFilters({
                            [filterFields.tasks.active]: item ? item.value : null, // pass null if you want to remove the filter
                          });
                        }}
                      />
                    }
                    defaultPageSize={10}
                    customPageSize={true}
                    // isFilters={false}
                    showPagination={true}
                    // rowSelection={true} // pass it true to enable row selection
                    loading={urlParamsStr.length > 0 && isBackLoading}
                    // onRowSelection={(rows) => {
                    //   // pass a use callback for this function as it will rerender the tabel in not usecallabck
                    //   //you will get all rows selected data here
                    // }}
                    showSelectedRowCount={true} // pass it true to show the selected row count
                  />
                )}
              </TkCardBody>
              {/* </div> */}
            </TkCol>
          </div>
        </>
      ) : (
        <TkNoData />
      )}
    </React.Fragment>
  );
};

export default AllTasks;
