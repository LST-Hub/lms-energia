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
  RQ,
  serachFields,
  searchParamName,
  perDefinedProjectManagerRoleID,
  perDefinedAdminRoleID,
} from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { convertSecToTime } from "../../utils/time";
import { formatDate } from "../../utils/date";
import TkSelect from "../forms/TkSelect";
import { useReducer } from "react";
import TkButton from "../TkButton";
import { convertToURLParamsString, isSearchonUI, searchAndFilterData } from "../../utils/utilsFunctions";
import { TkToastError } from "../TkToastContainer";
import { CSVLink } from "react-csv";
import { FormErrorBox } from "../forms/ErrorText";
import useSessionData from "../../utils/hooks/useSessionData";
import { UncontrolledTooltip } from "reactstrap";

const headers = [
  { label: "Project Name", key: "projectName" },
  { label: "Project Manager", key: "projectManager" },
  { label: "Client", key: "client" },
  { label: "Estimated Time", key: "estimatedTime" },
  { label: "Estimated End Date", key: "estimatedEndDate" },
  { label: "Actual Time", key: "actualTime" },
  { label: "Status", key: "status" },
  { label: "Priority", key: "priority" },
  { label: "Assign Users", key: "assignUsers" },
];

function TableToolBar({ onProjectChange, onPmChange, onClientChange, totalHrs }) {
  const sessionData = useSessionData();
  const [allProjects, setAllProjects] = useState([]);
  const [allPms, setAllPms] = useState([]);
  const [allClients, setAllClients] = useState([]);

  const results = useQueries({
    queries: [
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

      {
        queryKey: [RQ.allUsersList, "projectManager"],
        queryFn: tkFetch.get(`${API_BASE_URL}/users/list?indexFilter=true`),
      },
      {
        queryKey: [RQ.allClientList],
        queryFn: tkFetch.get(`${API_BASE_URL}/client/list?indexFilter=true`),
      },
    ],
  });

  const [projectList, pmList, clientList, actualTime] = results;
  const { data: projects, isLoading: projectLoading, isError: projectError, error: projectErr } = projectList;
  const { data: pms, isLoading: pmLoading, isError: pmError, error: pmErr } = pmList;
  const { data: clients, isLoading: clientLoading, isError: clientError, error: clientErr } = clientList;

  useEffect(() => {
    if (projectError) {
      TkToastError("Error occured while fetching projects");
      console.log("projectError", projectErr);
    }
  }, [projectErr, projectError]);

  useEffect(() => {
    if (pmError) {
      TkToastError("Error occured while fetching project managers");
      console.log("pmError", pmErr);
    }
  }, [pmError, pmErr]);

  useEffect(() => {
    if (clientError) {
      TkToastError("Error occured while fetching clients");
      console.log("clientError", clientErr);
    }
  }, [clientError, clientErr]);

  useEffect(() => {
    if (Array.isArray(projects)) {
      const p = projects.map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });
      setAllProjects(p);
    }
  }, [projects]);

  useEffect(() => {
    if (Array.isArray(pms)) {
      const p = pms.map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });
      setAllPms(p);
    }
  }, [pms]);

  useEffect(() => {
    if (Array.isArray(clients)) {
      const c = clients.map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });
      setAllClients(c);
    }
  }, [clients]);

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
              onChange={onProjectChange}
            />
          </TkCol>

          {sessionData?.user?.roleId !== perDefinedProjectManagerRoleID ? (
            <TkCol lg={3}>
              <TkSelect
                placeholder="Select Project Manager"
                loading={pmLoading}
                options={allPms}
                onChange={onPmChange}
              />
            </TkCol>
          ) : null}

          <TkCol lg={3}>
            <TkSelect
              placeholder="Select Client"
              loading={clientLoading}
              options={allClients}
              onChange={onClientChange}
            />
          </TkCol>
        </TkRow>
      </TkCardBody>
    </>
  );
}

const ReportsProjects = () => {
  const [filters, updateFilters] = useReducer((state, newState) => ({ ...state, ...newState }), {
    [filterFields.projectReport.project]: null,
    [filterFields.projectReport.pm]: null,
    [filterFields.projectReport.client]: null,
  });
  const [projectData, setProjectData] = useState([]);
  const [projectBackendData, setProjectBackendData] = useState([]); // this is used to store the data which is fetched from backend when user search or filter the data
  const [urlParamsStr, setUrlParamsStr] = React.useState("");
  const [csvData, setCsvData] = useState([]);
  const [totalHrs, setTotalHrs] = useState(0);

  const addActualTime = (data, projectsTime) => {
    const newData = data?.map((item) => {
      const time = projectsTime?.find((p) => p.id === item.id);
      return { ...item, actualTime: time?.actualTime };
    });
    return newData;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allProjects],
    queryFn: tkFetch.get(`${API_BASE_URL}/reports/project`),
    // enabled: Number(accessLevel) >= perAccessIds.view,
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

  const {
    data: backData,
    isLoading: backIsLoading,
    isError: backIsError,
    error: backError,
  } = useQuery({
    queryKey: [RQ.allProjects, urlParamsStr],
    queryFn: tkFetch.get(`${API_BASE_URL}/reports/project${urlParamsStr ? `?${urlParamsStr}` : ""}`),
    enabled: !!urlParamsStr,
  });

  useEffect(() => {
    if (actualTimeError) {
      console.log("error", actualTimeErr);
    }
  }, [actualTimeErr, actualTimeError]);

  useEffect(() => {
    if (data && projectsTime) {
      const newData = addActualTime(data, projectsTime);
      setProjectData(newData);
    }
  }, [data, projectsTime]);

  useEffect(() => {
    if (backData && projectsTime) {
      const newData = addActualTime(backData, projectsTime);
      setProjectBackendData(newData);
    }
  }, [backData, projectsTime]);

  useEffect(() => {
    let doFilter = true;
    if (Object.values(filters).every((val) => val === null || val === undefined || val === "")) {
      doFilter = false;
    }
    if (!doFilter) {
      // if data is undefined then set it to empty array
      const newData = addActualTime(data, projectsTime);
      setProjectData(newData || []);
      setUrlParamsStr("");
      return;
    }
    if (isSearchonUI(data)) {
      const newData = searchAndFilterData(data, null, null, filters);
      // add actual time to the data
      const newDataWithTime = addActualTime(newData, projectsTime);
      setProjectData(newDataWithTime);
    } else {
      const urlParamString = convertToURLParamsString({ [searchParamName]: null, ...filters });
      setUrlParamsStr(urlParamString);
    }
  }, [filters, data, projectsTime]);

  const backendData = urlParamsStr.length > 0 ? projectBackendData : null;

  const columns = useMemo(
    () => [
      {
        Header: "Project Name",
        accessor: "name",
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
        }
      },
      {
        Header: "Project Manager",
        accessor: "pm.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div>
              {cellProps.value.length > 13 ? (
                <>
                  <span id={`projectManager${cellProps.row.index}`}>
                    {cellProps.value.substring(0, 13) + "..."}
                  </span>
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
        }
      },
      {
        Header: "Client",
        accessor: "client.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div>
              {cellProps.value.length > 13 ? (
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
        }
       
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
              <div>{cellProps.value === undefined ? <span>—</span> : <span> {cellProps.value}</span>}</div>
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
              <div>{cellProps.value === undefined ? <span>—</span> : <span> {cellProps.value}</span>}</div>
            </>
          );
        },
      },
    ],
    []
  );
  useEffect(() => {
    if (projectData?.length > 0) {
      const exportData = projectData.map((item) => {
        return {
          projectName: item.name,
          projectManager: item.pm?.name,
          client: item.client?.name,
          estimatedTime: convertSecToTime(item.estimatedTime),
          estimatedEndDate: item.estimatedEndDate === null ? "NA" : formatDate(item.estimatedEndDate),
          actualTime: item.actualTime === null ? "NA" : convertSecToTime(item.actualTime),
          status: item.status === null ? "NA" : item.status?.name,
          priority: item.priority === null ? "NA" : item.priority?.name,
          assignUsers: item.projectUsers?.map((user) => user.user.name).join(", "),
        };
      });
      setCsvData(exportData);
    }
  }, [projectData, data]);

  useEffect(() => {
    if (backendData?.length > 0) {
      const exportData = backendData.map((item) => {
        return {
          projectName: item.name,
          projectManager: item.pm?.name,
          client: item.client?.name,
          estimatedTime: convertSecToTime(item.estimatedTime),
          estimatedEndDate: item.estimatedEndDate === null ? "NA" : formatDate(item.estimatedEndDate),
          actualTime: item.actualTime === null ? "NA" : convertSecToTime(item.actualTime),
          status: item.status === null ? "NA" : item.status?.name,
          priority: item.priority === null ? "NA" : item.priority?.name,
          assignUsers: item.projectUsers?.map((user) => user.user.name).join(", "),
        };
      });
      setCsvData(exportData);
    }
  }, [backendData]);

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
    } else if (projectData?.length > 0) {
      const totalHrs = projectData.reduce((acc, item) => {
        return acc + item.actualTime;
      }, 0);
      setTotalHrs(convertSecToTime(totalHrs));
    } else {
      setTotalHrs(0);
    }
  }, [projectData, backendData]);

  return (
    <>
      <TkRow>
        <TkCol lg={12}>
          {/* <TkCard id="tasksList"> */}
          {isError && <FormErrorBox errMessage={error?.message} />}
          <TkCardHeader className="tk-card-header">
            <div className="d-flex align-items-center">
              <TkCardTitle className="mb-0 flex-grow-1">
                <h3>Projects</h3>
              </TkCardTitle>
              <div className="d-flex flex-shrink-0">
                <div>
                  {/* <TkButton disabled={projectData.length === 0 || isLoading} className="btn btn-primary add-btn me-1" > */}
                  <CSVLink
                    data={csvData}
                    filename={"Project.csv"}
                    headers={headers}
                    className={`btn btn-primary add-btn text-white ${
                      projectData.length === 0 || isLoading ? "disabled" : ""
                    }`}
                  >
                    <TkIcon className="ri-download-2-line align-bottom me-1"></TkIcon> Export
                  </CSVLink>
                  {/* </TkButton> */}
                </div>
              </div>
            </div>
          </TkCardHeader>
          {backIsError && <FormErrorBox errMessage={backError?.message} />}
          <TkCardBody className="pt-0">
            <TkTableContainer
              columns={columns}
              data={backendData || projectData}
              Toolbar={
                <TableToolBar
                  onProjectChange={(item) => {
                    updateFilters({
                      [filterFields.projectReport.project]: item ? item.value : null,
                    });
                  }}
                  onPmChange={(item) => {
                    updateFilters({
                      [filterFields.projectReport.pm]: item ? item.value : null,
                    });
                  }}
                  onClientChange={(item) => {
                    updateFilters({
                      [filterFields.projectReport.client]: item ? item.value : null,
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
      </TkRow>
    </>
  );
};

export default ReportsProjects;
