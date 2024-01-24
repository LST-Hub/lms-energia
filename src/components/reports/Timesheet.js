import React, { useState, useEffect, useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";
import TkIcon from "../TkIcon";
import TkRow, { TkCol } from "../TkRow";
import { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkTableContainer from "../TkTableContainer";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  API_BASE_URL,
  filterFields,
  perDefinedProjectManagerRoleID,
  RQ,
  searchParamName,
  statusFilterDropdownOptions,
} from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { convertSecToTime } from "../../utils/time";
import { formatDate } from "../../utils/date";
import TkSelect from "../forms/TkSelect";
import { useReducer } from "react";
import TkButton from "../TkButton";
import { convertToURLParamsString, isSearchonUI, searchFilterDateRangeData } from "../../utils/utilsFunctions";
import { CSVLink } from "react-csv";
import { FormErrorBox } from "../forms/ErrorText";
import TkDate from "../forms/TkDate";
import useSessionData from "../../utils/hooks/useSessionData";
import { UncontrolledTooltip } from "reactstrap";

const headers = [
  { label: "Created By", key: "createdBy" },
  { label: "Date", key: "date" },
  { label: "Allocated Time", key: "allocatedTime" },
  { label: "Duration", key: "duration" },
  { label: "Task", key: "task" },
  { label: "Project", key: "project" },
  { label: "Ticket", key: "ticket" },
  { label: "Approved By", key: "approvedBy" },
  { label: "Description", key: "description" },
  
];

function TableToolBar({ onEmployeeChange, onProjectChange, onTimesheetStatusChange, onDateChange, totalHrs }) {
  const sessionData = useSessionData();
  const [allEmployees, setAllEmployees] = useState([]);
  const [allProjects, setAllProjects] = useState([]);

  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allUsersList],
        queryFn: tkFetch.get(`${API_BASE_URL}/users/list?indexFilter=true`),
      },
      // {
      //   queryKey: [RQ.allProjectList],
      //   queryFn: tkFetch.get(
      //     `${API_BASE_URL}/project/list${
      //       sessionData?.user?.roleId === perDefinedProjectManagerRoleID ? "?PMprojects=true" : ""
      //     }`
      //   ),
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
    ],
  });

  const [employee, project, task] = results;

  const { data: employeeData, isLoading: employeeIsLoading, isError: employeeIsError, error: employeeError } = employee;
  const { data: projectData, isLoading: projectIsLoading, isError: projectIsError, error: projectError } = project;

  useEffect(() => {
    if (Array.isArray(employeeData)) {
      const allEmployeesList = employeeData.map((item) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
      setAllEmployees(allEmployeesList);
    }
  }, [employeeData]);

  useEffect(() => {
    if (Array.isArray(projectData)) {
      const allProjectsList = projectData.map((item) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
      setAllProjects(allProjectsList);
    }
  }, [projectData]);

  return (
    <>
      <TkCardBody className="table-toolbar mt-3 mb-3">
        <TkRow className="mb-3">
          <TkCol className="mt-1">
            <h4>Total Hrs: {totalHrs}</h4>
          </TkCol>
          <TkCol>
            <TkSelect
              placeholder="Select Project"
              loading={projectIsLoading}
              options={allProjects}
              onChange={onProjectChange}
            />
          </TkCol>
          <TkCol>
            <TkSelect
              placeholder="Select Employee"
              loading={employeeIsLoading}
              options={allEmployees}
              onChange={onEmployeeChange}
            />
          </TkCol>
          <TkCol>
            <TkSelect
              placeholder="Select Status"
              options={statusFilterDropdownOptions}
              // defaultValue={statusFilterDropdownOptions[2]}
              onChange={onTimesheetStatusChange}
            />
          </TkCol>

          <TkCol>
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

const ReportTimesheet = () => {
  const [timesheetData, setTimesheetData] = useState([]);
  const [timesheeetBackendData, setTimesheetBackendData] = useState([]); // this is used to store the data which is fetched from backend when user search or filter the data
  const [urlParamsStr, setUrlParamsStr] = useState("");
  // const [isHovering, setIsHovering] = useState(false);
  const [filters, updateFilters] = useReducer((state, newState) => ({ ...state, ...newState }), {
    [filterFields.timesheetReport.user]: null,
    [filterFields.timesheetReport.project]: null,
    [filterFields.timesheetReport.startDate]: null,
    [filterFields.timesheetReport.endDate]: null,
  });
  const [csvData, setCsvData] = useState([]);
  const [totalHrs, setTotalHrs] = useState(0);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.reportTimesheet],
    queryFn: tkFetch.get(`${API_BASE_URL}/reports/timesheet`),
  });

  const {
    data: backData,
    isLoading: backIsLoading,
    isError: backIsError,
    error: backError,
  } = useQuery({
    queryKey: [RQ.reportTimesheet, urlParamsStr],
    queryFn: tkFetch.get(`${API_BASE_URL}/reports/timesheet${urlParamsStr ? `?${urlParamsStr}` : ""}`),
    enabled: !!urlParamsStr,
  });

  useEffect(() => {
    if (data) {
      setTimesheetData(data);
    }
  }, [data]);

  useEffect(() => {
    if (backData) {
      setTimesheetBackendData(backData);
    }
  }, [backData]);

  useEffect(() => {
    let doFilter = true;
    if (Object.values(filters).every((val) => val === null || val === undefined || val === "")) {
      doFilter = false;
    }
    if (!doFilter) {
      setTimesheetData(data || []);
      setUrlParamsStr("");
      return;
    }
    if (isSearchonUI(data)) {
      const newData = searchFilterDateRangeData(data, null, null, filters);
      setTimesheetData(newData);
    } else {
      const urlParams = convertToURLParamsString({ [searchParamName]: null, ...filters });
      setUrlParamsStr(urlParams);
    }
  }, [filters, data]);
  // const handleMouseEnter = () => {
  //   setIsHovering(true);
  // };

  // const handleMouseLeave = () => {
  //   setIsHovering(false);
  // };

  const backendData = urlParamsStr.length > 0 ? timesheeetBackendData : null;

  const columns = useMemo(
    () => [
      {
        Header: "Created By",
        accessor: "createdBy.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <span>{cellProps.value}</span>
            </>
          );
        },
      },
      {
        Header: "Date",
        accessor: "date",
        filterable: false,
        Cell: (cellProps) => {
          return <>{formatDate(cellProps?.value)}</>;
        },
      },
      {
        Header: "Allocated Time",
        accessor: "resourceAllocation.duration",
        filterable: false,
        Cell: (cellProps) => {
          return <>{convertSecToTime(cellProps?.value)}</>;
        },
      },
      {
        Header: "Duration",
        accessor: "duration",
        filterable: false,
        Cell: (cellProps) => {
          return <>{convertSecToTime(cellProps?.value)}</>;
        },
      },
      {
        Header: "Project",
        accessor: "project.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div>
              {cellProps.value.length > 13 ? (
                <>
                  <span id={`project${cellProps.row.index}`}>{cellProps.value.substring(0, 13) + "..."}</span>
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
        Header: "Task",
        accessor: "task.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div>
              {cellProps.value?.length > 13 ? (
                <>
                  <span id={`task${cellProps.row.index}`}>{cellProps.value.substring(0, 13) + "..."}</span>
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
        Header: "Ticket",
        accessor: "ticket",
        filterable: false,
        Cell: (cellProps) => {
          console.log("ticket", cellProps.row);
          return (
            <div>
              {cellProps.value?.length > 10 ? (
                <>
                  <span id={`ticket${cellProps.row.index}`}>{cellProps.value.substring(0, 10) + "..."}</span>
                  <UncontrolledTooltip
                    target={`ticket${cellProps.row.index}`}
                    className="custom-tooltip-style"
                    style={{ backgroundColor: "#dfe6eb", color: "#212529" }}
                  >
                    {cellProps.value}
                  </UncontrolledTooltip>
                </>
              ) : cellProps.value ? (
                cellProps.value
              ) : (
                "—"
              )}
            </div>
          );
        },
      },
      {
        Header: "Status",
        accessor: "status",
        filterable: false,
        Cell: (cellProps) => {
          return <>{cellProps.value}</>;
        },
      },
      {
        Header: "Approved By",
        accessor: "approvedBy.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              {cellProps.value?.length > 13 ? (
                <>
                  <span id={`approvedBy${cellProps.row.index}`}>{cellProps.value.substring(0, 13) + "..."}</span>
                  <UncontrolledTooltip
                    target={`approvedBy${cellProps.row.index}`}
                    className="custom-tooltip-style"
                    style={{ backgroundColor: "#dfe6eb", color: "#212529" }}
                  >
                    {cellProps.value}
                  </UncontrolledTooltip>
                </>
              ) : cellProps.value ? (
                cellProps.value
              ) : (
                "—"
              )}
            </>
          );
        },
      },
      {
        Header: "Description",
        accessor: "description",
        filterable: false,
        Cell: (cellProps) => {
          return (
            // <div>
            //   {cellProps.value ? (
            //     <>
            //       {cellProps.value?.length > 20 ? (
            //         <>
            //           <span
            //             id={`toolTip${cellProps.row.original.id}`}
            //             onMouseEnter={handleMouseEnter}
            //             onMouseLeave={handleMouseLeave}
            //           >
            //             {cellProps.value.substring(0, 20) + "..."}
            //           </span>
            //           <UncontrolledTooltip
            //             target={`toolTip${cellProps.row.original.id}`}
            //             delay={{ show: 250, hide: 400 }}
            //             trigger="hover "
            //             disable={!isHovering}
            //             className={`custom-tooltip-style${isHovering ? ' active' : ''}`}
            //             style={{ backgroundColor: "#dfe6eb", color: "#212529", maxHeight: "200px", overflowY: "auto" }}
            //           >
            //             {cellProps.value}
            //           </UncontrolledTooltip>
            //         </>
            //       ) : (
            //         cellProps.value
            //       )}
            //     </>
            //   ) : (
            //     "—"
            //   )}
            // </div>
            <div>
              {cellProps.value ? (
                <>
                  {cellProps.value?.length > 20 ? (
                    <>
                      <span
                        id={`toolTip${cellProps.row.original.id}`}
                        // onMouseEnter={handleMouseEnter}
                        // onMouseLeave={handleMouseLeave}
                      >
                        {cellProps.value.substring(0, 20) + "..."}
                      </span>
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
    if (timesheetData?.length > 0) {
      const csvData = timesheetData.map((item) => {
        return {
          createdBy: item.createdBy?.name,
          date: formatDate(item.date),
          allocatedTime: convertSecToTime(item.resourceAllocation?.duration),
          duration: convertSecToTime(item.duration),
          task: item.task?.name,
          project: item.project?.name,
          ticket: item?.ticket,
          approvedBy: item?.approvedBy?.name,
          description: item?.description,
        };
      });
      setCsvData(csvData);
    }
  }, [timesheetData]);

  useEffect(() => {
    if (backendData?.length > 0) {
      const csvData = backendData.map((item) => {
        return {
          createdBy: item.createdBy?.name,
          date: formatDate(item.date),
          allocatedTime: convertSecToTime(item.resourceAllocation?.duration),
          duration: convertSecToTime(item.duration),
          task: item.task?.name,
          project: item.project?.name,
          ticket: item?.ticket,
          approvedBy: item?.approvedBy?.name,
          description: item?.description,
        };
      });
      setCsvData(csvData);
    }
  }, [backendData]);

  useEffect(() => {
    if (backendData?.length === 0) {
      setTotalHrs(0);
      return;
    }
    if (backendData?.length > 0) {
      const totalHrs = backendData.reduce((acc, item) => {
        return acc + item.duration;
      }, 0);
      setTotalHrs(convertSecToTime(totalHrs));
    } else if (timesheetData?.length > 0) {
      const totalHrs = timesheetData.reduce((acc, item) => {
        return acc + item.duration;
      }, 0);
      setTotalHrs(convertSecToTime(totalHrs));
    } else {
      setTotalHrs(0);
    }
  }, [timesheetData, backendData]);

  return (
    <>
      <TkRow>
        <TkCol lg={12}>
          {/* <TkCard id="tasksList"> */}
          {isError && <FormErrorBox errMessage={error?.message} />}
          <TkCardHeader className="tk-card-header">
            <div className="d-flex align-items-center">
              <TkCardTitle className="mb-0 flex-grow-1">
                <h3>Timesheets</h3>
              </TkCardTitle>
              <div className="d-flex flex-shrink-0">
                <div>
                  {/* <TkButton disabled={timesheetData.length === 0 || isLoading} className="btn btn-primary add-btn me-1"> */}
                  <CSVLink
                    data={csvData}
                    filename={"Timesheet.csv"}
                    headers={headers}
                    className={`btn btn-primary add-btn text-white ${
                      timesheetData.length === 0 || isLoading ? "disabled" : ""
                    }`}
                  >
                    <TkIcon className="ri-download-2-line align-bottom me-1"></TkIcon> Export
                  </CSVLink>
                  {/* </TkButton> */}
                </div>
              </div>
            </div>
          </TkCardHeader>
          {/* {backIsError && <FormErrorBox errMessage={backError?.message} />} */}
          <TkCardBody className="pt-0">
            <TkTableContainer
              columns={columns}
              data={backendData || timesheetData}
              Toolbar={
                <TableToolBar
                  onEmployeeChange={(item) => {
                    updateFilters({
                      [filterFields.timesheetReport.user]: item ? item.value : null,
                    });
                  }}
                  onProjectChange={(item) => {
                    updateFilters({
                      [filterFields.timesheetReport.project]: item ? item.value : null,
                    });
                  }}
                  onTimesheetStatusChange={(item) => {
                    updateFilters({
                      [filterFields.timesheetReport.status]: item ? item.value : null,
                    });
                  }}
                  onDateChange={(dates) => {
                    updateFilters({
                      [filterFields.timesheetReport.startDate]: dates ? dates[0] : null,
                    });
                    updateFilters({
                      [filterFields.timesheetReport.endDate]: dates ? dates[1] : null,
                    });
                  }}
                  totalHrs={totalHrs}
                />
              }
              isSearch={true}
              defaultPageSize={10}
              customPageSize={true}
              showPagination={true}
              isFilters={true}
              //   loading={urlParamsStr.length > 0 && backIsLoading}
            />

            {/* <ToastContainer closeButton={false} /> */}
          </TkCardBody>
          {/* </TkCard> */}
        </TkCol>
      </TkRow>
    </>
  );
};

export default ReportTimesheet;
