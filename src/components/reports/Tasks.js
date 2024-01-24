import React, { useState, useEffect, useMemo, useReducer } from "react";
import TkIcon from "../TkIcon";
import TkRow, { TkCol } from "../TkRow";
import { TkCardHeader, TkCardBody, TkCardTitle } from "../TkCard";
import TkTableContainer from "../TkTableContainer";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL, RQ, filterFields, perDefinedProjectManagerRoleID, searchParamName } from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { useQueries, useQuery } from "@tanstack/react-query";
import { convertSecToTime } from "../../utils/time";
import { formatDate } from "../../utils/date";
import TkSelect from "../forms/TkSelect";
import { convertToURLParamsString, isSearchonUI, searchAndFilterData } from "../../utils/utilsFunctions";
import TkButton from "../TkButton";
import { CSVLink } from "react-csv";
import useSessionData from "../../utils/hooks/useSessionData";
import { UncontrolledTooltip } from "reactstrap";

const headers = [
  { label: "Task Name", key: "taskName" },
  { label: "Project", key: "projectName" },
  { label: "Start Date", key: "startDate" },
  { label: "Estimated Time", key: "estimatedTime" },
  { label: "Estimated End Date", key: "estimatedEndDate" },
  { label: "Actual Time", key: "actualTime" },
  { label: "Status", key: "status" },
  { label: "Priority", key: "priority" },
  { label: "Assign Users", key: "assignUsers" },
  { label: "Billable", key: "billable" },
];

function TableToolBar({ onTaskChange, onProjectChange, totalHrs }) {
  const sessionData = useSessionData();
  const [allTasks, setAllTasks] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const results = useQueries({
    queries: [
      // {
      //   queryKey: [RQ.allTaskList],
      //   queryFn: tkFetch.get(
      //     `${API_BASE_URL}/task/list${selectedProjectId ? `?projectId=${selectedProjectId}&myTasks=true` : ""}`
      //     ),
      //     enabled: !!selectedProjectId,
      // },
      {
        queryKey: [RQ.allTaskList],
        queryFn: tkFetch.get(
          `${API_BASE_URL}/task/list${
            selectedProjectId ? `?projectId=${selectedProjectId}&myTasks=true&indexFilter=true` : "?indexFilter=true"
          }`
        ),
        enabled: !!selectedProjectId,
      },

      // {
      //   queryKey: [RQ.allProjectList],
      //   queryFn: tkFetch.get(
      //     `${API_BASE_URL}/project/list${
      //       sessionData?.user?.role?.id === perDefinedProjectManagerRoleID ? "?PMprojects=true" : ""
      //     }`
      //   ),
      // },
      {
        queryKey: [RQ.allProjectList],
        queryFn: tkFetch.get(
          `${API_BASE_URL}/project/list${
            sessionData?.user?.roleId === perDefinedProjectManagerRoleID
              ? `?PMprojects=true&indexFilter=true`
              : "?indexFilter=true"
          }`
        ),
      },
    ],
  });

  const [taskList, projectList] = results;
  const { data: tasks, isLoading: taskLoading, isError: isTaskError, error: taskErr } = taskList;
  const { data: projects, isLoading: projectLoading, isError: isProjectError, error: projectErr } = projectList;

  useEffect(() => {
    if (Array.isArray(tasks)) {
      const t = tasks.map((item) => {
        return { label: item.name, value: item.id };
      });
      setAllTasks(t);
    }
  }, [tasks]);

  useEffect(() => {
    if (Array.isArray(projects)) {
      const p = projects.map((item) => {
        return { label: item.name, value: item.id };
      });
      setAllProjects(p);
    }
  }, [projects]);
  useEffect(() => {
    if (!selectedProjectId) {
      setAllTasks([]);
    }
  }, [selectedProjectId]);

  return (
    <>
      <TkCardBody className="table-toolbar mt-3 mb-3">
        <TkRow className="mb-3">
          <TkCol lg={3} className="mt-1">
            <h4>Total Hrs: {totalHrs}</h4>
          </TkCol>

          <TkCol lg={3}>
            <TkSelect
              placeholder="Select Project"
              loading={projectLoading}
              options={allProjects}
              onChange={(e) => {
                setSelectedProjectId(e ? e.value : null);
                onProjectChange(e);
              }}
            />
          </TkCol>
          <TkCol lg={3}>
            <TkSelect
              placeholder="Select Task"
              loading={selectedProjectId && taskLoading}
              options={allTasks}
              onChange={onTaskChange}
            />
          </TkCol>
        </TkRow>
      </TkCardBody>
    </>
  );
}

const ReportTasks = () => {
  const [taskData, setTaskData] = useState([]);
  const [taskBackendData, setTaskBackendData] = useState([]); // for backend data [url params
  const [urlParamsStr, setUrlParamsStr] = useState("");
  const [csvData, setCsvData] = useState([]);
  const [totalHrs, setTotalHrs] = useState(0);

  const addActualTime = (data, tasksTime) => {
    const newData = data?.map((item) => {
      const time = tasksTime?.find((t) => t.id === item.id);
      return { ...item, actualTime: time?.actualTime };
    });
    return newData;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allTasks],
    queryFn: tkFetch.get(`${API_BASE_URL}/reports/task`),
    // enabled: Number(accessLevel) >= perAccessIds.view,
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

  const {
    data: backData,
    isLoading: backIsLoading,
    isError: backIsError,
    error: backError,
  } = useQuery({
    queryKey: [RQ.allProjects, urlParamsStr],
    queryFn: tkFetch.get(`${API_BASE_URL}/reports/task${urlParamsStr ? `?${urlParamsStr}` : ""}`),
    enabled: !!urlParamsStr,
  });

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

  const [filters, updateFilters] = useReducer((state, newState) => ({ ...state, ...newState }), {
    [filterFields.taskReport.task]: null,
    [filterFields.taskReport.project]: null,
  });

  useEffect(() => {
    let doFilter = true;
    if (Object.values(filters).every((val) => val === null || val === undefined || val === "")) {
      doFilter = false;
    }
    if (!doFilter) {
      // if data is undefined then set it to empty array
      const newData = addActualTime(data, tasksTime);
      setTaskData(newData || []);
      setUrlParamsStr("");
      return;
    }
    if (isSearchonUI(data)) {
      const newData = searchAndFilterData(data, null, null, filters);
      const newDataWithTime = addActualTime(newData, tasksTime);
      setTaskData(newDataWithTime);
    } else {
      const urlParamString = convertToURLParamsString({ [searchParamName]: null, ...filters });
      setUrlParamsStr(urlParamString);
    }
  }, [filters, data, tasksTime]);

  const backendData = urlParamsStr.length > 0 ? taskBackendData : null;

  const columns = useMemo(
    () => [
      {
        Header: "Task Name",
        accessor: "name",
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
        Header: "Project",
        accessor: "project.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div>
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
          );
        },
      },
      {
        Header: "Start Date",
        accessor: "startDate",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div>{cellProps.value === null ? <span> — </span> : <span>{formatDate(cellProps.value)}</span>}</div>
            </>
          );
        },
      },

      {
        Header: "Estimated Time",
        accessor: "estimatedTime",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div>
              <span>{convertSecToTime(cellProps.value)}</span>
            </div>
          );
        },
      },
      {
        Header: "Estimated End Date",
        accessor: "estimatedEndDate",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div>{cellProps.value === null ? <span> — </span> : <span>{formatDate(cellProps.value)}</span>}</div>
            </>
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
              <div>
                {cellProps.value === null ? <span> — </span> : <span>{convertSecToTime(cellProps.value)}</span>}
              </div>
            </>
          );
        },
      },
      {
        Header: "Status",
        accessor: "status.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div>{cellProps.value === undefined ? <span> — </span> : <span> {cellProps.value}</span>}</div>
            </>
          );
        },
      },
      {
        Header: "Priority",
        accessor: "priority.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div>{cellProps.value === undefined ? <span> — </span> : <span> {cellProps.value}</span>}</div>
            </>
          );
        },
      },
    ],
    []
  );

  useEffect(() => {
    if (data?.length > 0) {
      if (taskData?.length > 0) {
        const exportData = taskData.map((item) => {
          return {
            taskName: item.name,
            projectName: item.project.name,
            startDate: item.startDate === null ? "NA" : formatDate(item.startDate),
            estimatedTime: convertSecToTime(item.estimatedTime),
            estimatedEndDate: item.estimatedEndDate === null ? "NA" : formatDate(item.estimatedEndDate),
            actualTime: item.actualTime === null ? "NA" : convertSecToTime(item.actualTime),
            status: item.status === null ? "NA" : item.status?.name,
            priority: item.priority === null ? "NA" : item.priority?.name,
            assignUsers: item.taskUsers?.map((user) => user.user.name).join(", "),
            billable: item.billable ? "Yes" : "No",
          };
        });
        setCsvData(exportData);
      }
      if (backendData?.length > 0) {
        const exportData = backendData.map((item) => {
          return {
            taskName: item.name,
            projectName: item.project.name,
            startDate: item.startDate === null ? "NA" : formatDate(item.startDate),
            estimatedTime: convertSecToTime(item.estimatedTime),
            estimatedEndDate: item.estimatedEndDate === null ? "NA" : formatDate(item.estimatedEndDate),
            actualTime: item.actualTime === null ? "NA" : convertSecToTime(item.actualTime),
            status: item.status === null ? "NA" : item.status?.name,
            priority: item.priority === null ? "NA" : item.priority?.name,
            assignUsers: item.taskUsers?.map((user) => user.user.name).join(", "),
            billable: item.billable ? "Yes" : "No",
          };
        });
        setCsvData(exportData);
      }
    }
  }, [data, backendData, taskData]);

  useEffect(() => {
    if (backendData?.length === 0) {
      setTotalHrs(0);
      return;
    }
    if (backendData?.length > 0) {
      const totalHrs = backendData.reduce((acc, item) => {
        return acc + item.actualTime;
      }, 0);
      setTotalHrs(convertSecToTime(totalHrs));
    } else if (taskData?.length > 0) {
      const totalHrs = taskData.reduce((acc, item) => {
        return acc + item.actualTime;
      }, 0);
      setTotalHrs(convertSecToTime(totalHrs));
    } else {
      setTotalHrs(0);
    }
  }, [taskData, backendData]);

  return (
    <>
      <div className="row">
        <TkCol lg={12}>
          {/* <TkCard id="tasksList"> */}
          <TkCardHeader className="tk-card-header">
            <div className="d-flex align-items-center">
              <TkCardTitle className="mb-0 flex-grow-1">
                <h3>Tasks</h3>
              </TkCardTitle>
              <div className="flex-shrink-0">
                {/* <TkButton disabled={taskData.length === 0 || isLoading} className="btn btn-primary add-btn me-1"> */}
                <CSVLink
                  data={csvData}
                  filename={"Tasks.csv"}
                  headers={headers}
                  className={`btn btn-primary add-btn text-white ${
                    taskData.length === 0 || isLoading ? "disabled" : ""
                  }`}
                >
                  <TkIcon className="ri-download-2-line align-bottom me-1"></TkIcon> Export
                </CSVLink>
                {/* </TkButton> */}
              </div>
            </div>
          </TkCardHeader>
          <TkCardBody className="pt-0">
            <TkTableContainer
              columns={columns}
              data={backendData || taskData}
              Toolbar={
                <TableToolBar
                  onTaskChange={(item) => {
                    updateFilters({
                      [filterFields.taskReport.task]: item ? item.value : null,
                    });
                  }}
                  onProjectChange={(item) => {
                    updateFilters({
                      [filterFields.taskReport.project]: item ? item.value : null,
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
              loading={urlParamsStr.length > 0 && backIsLoading}
            />

            {/* <ToastContainer closeButton={false} /> */}
          </TkCardBody>
          {/* </TkCard> */}
        </TkCol>
      </div>
    </>
  );
};

export default ReportTasks;
