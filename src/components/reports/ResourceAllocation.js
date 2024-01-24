import React, { useState, useEffect, useMemo, useCallback } from "react";
import "react-toastify/dist/ReactToastify.css";
import TkIcon from "../TkIcon";
import TkRow, { TkCol } from "../TkRow";
import { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkTableContainer from "../TkTableContainer";
import { useQueries, useQuery } from "@tanstack/react-query";
import { API_BASE_URL, filterFields, repeatOptions, RQ, serachFields, searchParamName, perDefinedProjectManagerRoleID } from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { convertSecToTime } from "../../utils/time";
import { formatDate } from "../../utils/date";
import TkSelect from "../forms/TkSelect";
import { useReducer } from "react";
import TkButton from "../TkButton";
import { convertToURLParamsString, isSearchonUI, searchFilterDateRangeData } from "../../utils/utilsFunctions";
import { CSVLink } from "react-csv";
import { FormErrorBox } from "../forms/ErrorText";
import TkLoader from "../TkLoader";
import TkNoData from "../TkNoData";
import TkDate from "../forms/TkDate";
import useSessionData from "../../utils/hooks/useSessionData";
import { UncontrolledTooltip } from "reactstrap";

const headers = [
  { label: "Project Name", key: "projectName" },
  { label: "Task Name", key: "taskName" },
  { label: "Resource Allocated", key: "resourceAllocated" },
  { label: "Date", key: "date" },
  { label: "Duration", key: "duration" },
];

function TableToolBar({ onProjectChange, onEmployeeChange, onRepetaionChange, onDateChange }) {
  const sessionData = useSessionData();
  const [allProjects, setAllProjects] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);

  const results = useQueries({
    queries: [
      // {
      //   queryKey: [RQ.allProjectList],
      //   queryFn: tkFetch.get(`${API_BASE_URL}/project/list${
      //     sessionData?.user?.roleId === perDefinedProjectManagerRoleID ? "?PMprojects=true"  
      //     : ""
      //   }`),
      // },
      {
        queryKey: [RQ.allProjectList],
        queryFn: tkFetch.get(
          `${API_BASE_URL}/project/list${
            sessionData?.user?.roleId === perDefinedProjectManagerRoleID
              ? "?PMprojects=true&indexFilter=true"
              : "?indexFilter=true"
          }`
        ),
      },
      {
        queryKey: [RQ.allUsersList],
        queryFn: tkFetch.get(`${API_BASE_URL}/users/list?indexFilter=true`),
      },
    ],
  });

  const [projects, users] = results;

  const { data: projectData, isLoading: projectIsLoading, isError: projectIsError, error: projectError } = projects;
  const { data: userData, isLoading: userIsLoading, isError: userIsError, error: userError } = users;

  useEffect(() => {
    if (Array.isArray(projectData)) {
      const allProjects = projectData.map((project) => {
        return {
          label: project.name,
          value: project.id,
        };
      });
      setAllProjects(allProjects);
    }
  }, [projectData]);

  useEffect(() => {
    if (Array.isArray(userData)) {
      const allEmployees = userData.map((user) => {
        return {
          label: user.name,
          value: user.id,
        };
      });
      setAllEmployees(allEmployees);
    }
  }, [userData]);

  return (
    <>
      <TkCardBody className="table-toolbar mt-3">
        <TkRow className="mb-3">
          <TkCol lg={3}>
            <TkSelect
              placeholder="Select Project"
              loading={projectIsLoading}
              options={allProjects}
              onChange={onProjectChange}
            />
          </TkCol>

          <TkCol lg={3}>
            <TkSelect
              placeholder="Select Employee"
              loading={userIsLoading}
              options={allEmployees}
              onChange={onEmployeeChange}
            />
          </TkCol>

          <TkCol lg={3}>
            <TkSelect options={repeatOptions} placeholder="Select Repetition" onChange={onRepetaionChange} />
          </TkCol>

          <TkCol lg={3}>
            <TkDate
              className="form-control"
              placeholder="Select Date Range"
              options={{
                mode: "range",
                dateFormat: "d M, Y",
              }}
              // defaultValue={new Date().toDateString()}
              // value={new Date().toDateString()}
              onChange={onDateChange}
            />
          </TkCol>
        </TkRow>
      </TkCardBody>
    </>
  );
}

const ReportsResourceAllocation = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.reportResourceAllocation],
    queryFn: tkFetch.get(`${API_BASE_URL}/reports/resource-allocation`),
    // enabled: Number(accessLevel) >= perAccessIds.view,
  });

  const [resourceAllocationData, setResourceAllocationData] = useState([]);
  const [urlParamsStr, setUrlParamsStr] = useState("");
  const [filters, updateFilters] = useReducer((state, newState) => ({ ...state, ...newState }), {
    [filterFields.resourceAllocation.project]: null,
    [filterFields.resourceAllocation.allocatedUser]: null,
    [filterFields.resourceAllocation.repetation]: null,
    [filterFields.resourceAllocation.startDate]: null,
    [filterFields.resourceAllocation.endDate]: null,
  });
  const [csvData, setCsvData] = useState([]);

  const {
    data: backData,
    isLoading: backIsLoading,
    isError: backIsError,
    error: backError,
  } = useQuery({
    queryKey: [RQ.resourceAllocation, urlParamsStr],
    queryFn: tkFetch.get(`${API_BASE_URL}/resource-allocation${urlParamsStr ? `?${urlParamsStr}` : ""}`),
    enabled: !!urlParamsStr,
  });

  useEffect(() => {
    if (data) {
      setResourceAllocationData(data);
    }
  }, [data]);

  useEffect(() => {
    if (backendData) {
      setResourceAllocationData(backendData);
    }
  }, [backendData]);

  useEffect(() => {
    let doFilter = true;
    if (Object.values(filters).every((val) => val === null || val === undefined || val === "")) {
      doFilter = false;
    }
    if (!doFilter) {
      // if data is undefined then set it to empty array
      setResourceAllocationData(data || []);
      setUrlParamsStr("");
      return;
    }
    if (isSearchonUI(data)) {
      const newData = searchFilterDateRangeData(data, null, null, filters);
      setResourceAllocationData(newData);
    } else {
      const urlParamString = convertToURLParamsString({ [searchParamName]: null, ...filters });
      setUrlParamsStr(urlParamString);
    }
  }, [filters, data]);

  const backendData = urlParamsStr.length > 0 ? backData : null;

  const columns = useMemo(
    () => [
      {
        Header: "Project Name",
        accessor: "project.name",
        filterable: false,
        Cell: (cellProps) => {
          console.log("cellProps", cellProps.row);

          return (
            <>
              <div className="d-flex">
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
            </>
          );
        },
      },
      {
        Header: "Task Name",
        accessor: "task.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div>
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
          );
        },
      },
      {
        Header: "Resource Allocated",
        accessor: "allocatedUser.name",
        filterable: false,
        Cell: (cellProps) => {
          return <div>{cellProps.value}</div>;
        },
      },
      {
        Header: "Date",
        accessor: "date",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div>
              {cellProps.value
                ? formatDate(cellProps.value)
                : `${formatDate(cellProps.row.original.startDate)} To ${formatDate(cellProps.row.original.endDate)}`}
            </div>
          );
        },
      },
      {
        Header: "Duration",
        accessor: "duration",
        filterable: false,
        Cell: (cellProps) => {
          return <div>{convertSecToTime(cellProps.value)}</div>;
        },
      },
    ],
    []
  );

  useEffect(() => {
    if (data?.length > 0) {
      if (resourceAllocationData?.length > 0) {
        const exportData = resourceAllocationData.map((item) => {
          return {
            projectName: item.project?.name,
            taskName: item.task?.name,
            resourceAllocated: item.allocatedUser?.name,
            date: item.date ? formatDate(item.date) : `${formatDate(item.startDate)} To ${formatDate(item.endDate)}`,
            duration: convertSecToTime(item.duration),
          };
        });
        setCsvData(exportData);
      }
      if (backData?.length > 0) {
        const exportData = backData.map((item) => {
          return {
            projectName: item.project?.name,
            taskName: item.task?.name,
            resourceAllocated: item.allocatedUser?.name,
            date: item.date ? formatDate(item.date) : `${formatDate(item.startDate)} To ${formatDate(item.endDate)}`,
            duration: convertSecToTime(item.duration),
          };
        });
        setCsvData(exportData);
      }
    }
  }, [data, resourceAllocationData, backData]);

  return (
    <TkRow>
      <TkCol lg={12}>
        <TkCardHeader className="tk-card-header">
          <div className="d-flex align-items-center">
            <TkCardTitle className="mb-0 flex-grow-1">
              <h3>Resource Allocation</h3>
            </TkCardTitle>
            <div>
              {/* <TkButton
                disabled={resourceAllocationData.length === 0 || isLoading}
                className="btn btn-primary add-btn me-1"
              > */}
                <CSVLink data={csvData} filename={"Resource Allocation.csv"} headers={headers} className={`btn btn-primary add-btn text-white ${resourceAllocationData.length === 0 || isLoading ? 'disabled' : ''}`}>
                  <TkIcon className="ri-download-2-line align-bottom me-1"></TkIcon> Export
                </CSVLink>
              {/* </TkButton> */}
            </div>
          </div>
        </TkCardHeader>
        <TkCardBody>
          {backIsError ? (
            <FormErrorBox errMessage={backError.message} />
          ) : (
            <TkTableContainer
              columns={columns}
              data={backendData || resourceAllocationData}
              customPageSize={true}
              showPagination={true}
              loading={urlParamsStr.length > 0 && backIsLoading}
              Toolbar={
                <TableToolBar
                  onProjectChange={(item) => {
                    updateFilters({
                      [filterFields.resourceAllocation.project]: item ? item.value : null,
                    });
                  }}
                  onEmployeeChange={(item) => {
                    updateFilters({
                      [filterFields.resourceAllocation.allocatedUser]: item ? item.value : null,
                    });
                  }}
                  onRepetaionChange={(item) => {
                    updateFilters({
                      [filterFields.resourceAllocation.repetation]: item ? item.value : null,
                    });
                  }}
                  onDateChange={(dates) => {
                    updateFilters({
                      [filterFields.resourceAllocation.startDate]: dates ? dates[0] : null,
                    });
                    updateFilters({
                      [filterFields.resourceAllocation.endDate]: dates ? dates[1] : null,
                    });
                  }}
                />
              }
              defaultPageSize={10}
              // isFilters={false} // make it true to see filetrs
              // rowSelection={true} // pass it true to enable row selection
              onRowSelection={(rows) => {
                // pass a use callback for this function as it will rerender the tabel in not usecallabck
                //you will get all rows selected data here
              }}
              showSelectedRowCount={true} // pass it true to show the selected row count
            />
          )}
        </TkCardBody>
      </TkCol>
    </TkRow>
  );
};

export default ReportsResourceAllocation;
