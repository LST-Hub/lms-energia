import React, { useState, useEffect, useMemo, useCallback } from "react";
import "react-toastify/dist/ReactToastify.css";
import TkRow, { TkCol } from "../TkRow";
import { TkCardBody } from "../TkCard";
import TkTableContainer from "../TkTableContainer";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  API_BASE_URL,
  filterFields,
  perDefinedEmployeeRoleID,
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
import { convertToURLParamsString, isSearchonUI, searchFilterDateRangeData } from "../../utils/utilsFunctions";
import { FormErrorBox } from "../forms/ErrorText";
import TkContainer from "../TkContainer";
import useUserRole from "../../utils/hooks/useUserRole";
import TkAccessDenied from "../TkAccessDenied";
import useSessionData from "../../utils/hooks/useSessionData";
import TkDate from "../forms/TkDate";
import { Controller, useForm } from "react-hook-form";
import { UncontrolledTooltip } from "reactstrap";
import { yupResolver } from "@hookform/resolvers/yup";
import TkModal, { TkModalBody, TkModalHeader } from "../TkModal";
import TkInput from "../forms/TkInput";
import TkForm from "../forms/TkForm";

function TableToolBar({
  onEmployeeChange,
  onProjectChange,
  onTaskChange,
  onTodaysTaskStatusChange,
  onDateChange,
  totalHrs,
}) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({});
  const queryClient = useQueryClient();
  const [allEmployees, setAllEmployees] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const sessionData = useSessionData();
  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allUsersList],
        queryFn: tkFetch.get(
          `${API_BASE_URL}/users/list${
            sessionData.user.roleId === perDefinedProjectManagerRoleID
              ? `?PMusers=true&indexFilter=true`
              : "?indexFilter=true"
          }`
        ),
      },
      {
        queryKey: [RQ.allProjectList],
        queryFn: tkFetch.get(
          `${API_BASE_URL}/project/list${
            sessionData.user.roleId === perDefinedProjectManagerRoleID
              ? `?PMprojects=true&indexFilter=true`
              : "?indexFilter=true"
          }`
        ),
      },
      {
        queryKey: [RQ.allTaskList, selectedProjectId],
        queryFn: tkFetch.get(
          `${API_BASE_URL}/task/list${
            selectedProjectId ? `?projectId=${selectedProjectId}&indexFilter=true` : "?indexFilter=true"
          }${sessionData.user.roleId === perDefinedProjectManagerRoleID ? `&PMtasks=true` : ""}`
        ),
        enabled: !!selectedProjectId,
      },
    ],
  });

  const [employee, project, task] = results;

  const { data: employeeData, isLoading: employeeIsLoading, isError: employeeIsError, error: employeeError } = employee;
  const { data: projectData, isLoading: projectIsLoading, isError: projectIsError, error: projectError } = project;
  const { data: taskData, isLoading: taskIsLoading, isError: taskIsError, error: taskError } = task;

  useEffect(() => {
    if (!selectedProjectId) {
      setAllTasks([]);
    }
  }, [selectedProjectId]);

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

  useEffect(() => {
    if (Array.isArray(taskData)) {
      const allTasksList = taskData.map((item) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
      setAllTasks(allTasksList);
    }
  }, [taskData]);

  return (
    <>
      <TkCardBody className="table-toolbar mb-4">
        <TkRow className="mb-3">
          <TkCol lg={2} className="mt-1">
            <h4>Total Hrs: {totalHrs}</h4>
          </TkCol>
          <TkCol lg={2}>
            <Controller
              name="project"
              control={control}
              render={({ field }) => (
                <TkSelect
                  {...field}
                  placeholder="Select Project"
                  loading={projectIsLoading}
                  options={allProjects}
                  onChange={(e) => {
                    field.onChange(e);
                    queryClient.invalidateQueries({ queryKey: [RQ.allTaskList, selectedProjectId] });
                    setSelectedProjectId(e ? e.value : null);
                    onProjectChange(e);
                    // setValue("task", null);
                  }}
                />
              )}
            />
          </TkCol>
          <TkCol lg={2}>
            <Controller
              name="task"
              control={control}
              render={({ field }) => (
                <TkSelect
                  {...field}
                  id="task"
                  placeholder="Select Task"
                  loading={selectedProjectId && taskIsLoading}
                  options={allTasks}
                  onChange={onTaskChange}
                />
              )}
            />
          </TkCol>

          <TkCol lg={2}>
            <TkSelect
              placeholder="Select Employee"
              loading={employeeIsLoading}
              options={allEmployees}
              onChange={onEmployeeChange}
            />
          </TkCol>

          <TkCol lg={2}>
            <TkSelect
              placeholder="Select Status"
              options={statusFilterDropdownOptions}
              onChange={onTodaysTaskStatusChange}
            />
          </TkCol>

          <TkCol lg={2}>
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

const ReportTodaysTask = () => {
  const accessLevel = useUserRole().id;
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(),
  });

  const [timesheetData, setTimesheetData] = useState([]);
  const [timesheeetBackendData, setTimesheetBackendData] = useState([]); // this is used to store the data which is fetched from backend when user search or filter the data
  const [urlParamsStr, setUrlParamsStr] = useState("");

  const [filters, updateFilters] = useReducer((state, newState) => ({ ...state, ...newState }), {
    [filterFields.timesheetReport.user]: null,
    [filterFields.timesheetReport.project]: null,
    [filterFields.timesheetReport.task]: null,
    [filterFields.timesheetReport.status]: null,
    [filterFields.timesheetReport.startDate]: null,
    [filterFields.timesheetReport.endDate]: null,
  });
  const [totalHrs, setTotalHrs] = useState(0);
  const [modal, setModal] = useState(false);
  const toggle = useCallback(() => setModal(!modal), [modal]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.reportTodaysTask],
    queryFn: tkFetch.get(`${API_BASE_URL}/reports/todays-tasks`),
  });

  const {
    data: backData,
    isLoading: backIsLoading,
    isError: backIsError,
    error: backError,
  } = useQuery({
    queryKey: [RQ.reportTodaysTask, urlParamsStr],
    queryFn: tkFetch.get(`${API_BASE_URL}/reports/todays-tasks${urlParamsStr ? `?${urlParamsStr}` : ""}`),
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

  const backendData = urlParamsStr.length > 0 ? timesheeetBackendData : null;

  const columns = useMemo(
    () => [
      {
        Header: "Created By",
        accessor: "createdBy.name",
        filterable: false,
        Cell: (cellProps) => {
          console.log("cellProps", cellProps.row);

          return (
            <>
              <span
                className="flex-grow-1 fw-medium table-link text-primary cursor-pointer"
                onClick={() => {
                  toggle();
                  setValue("createdBy", cellProps.value);
                  setValue("date", formatDate(cellProps.row.original.date));
                  setValue("duration", convertSecToTime(cellProps.row.original.duration));
                  setValue("project", cellProps.row.original.project.name);
                  setValue("task", cellProps.row.original.task.name);
                  setValue("ticket", cellProps.row.original.ticket);
                  setValue("status", cellProps.row.original.status);
                  setValue(
                    "approvedBy",
                    cellProps.row.original.approvedBy ? cellProps.row.original.approvedBy.name : "—"
                  );
                  setValue("description", cellProps.row.original.description);
                  setValue(
                    "allocatedTime",
                    convertSecToTime(
                      cellProps.row.original.resourceAllocation ? cellProps.row.original.resourceAllocation.duration : 0
                    )
                  );
                }}
              >
                <div className="flex-grow-1 fs-6">{cellProps.value}</div>
              </span>
              {/* <span>
                <Link href={`${urls.approvalTodaysTask}/${cellProps.row.original.id}`}>
                  <a className="flex-grow-1 fw-medium table-link text-primary">
                    <div className="flex-grow-1 fs-6">{cellProps.value}</div>
                  </a>
                </Link>
              </span> */}
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
        accessor: "resourceAllocation.duration", // this is the duration of the task
        filterable: false,
        Cell: (cellProps) => {
          return <>{convertSecToTime(cellProps.value)}</>;
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
            //           <span id={`toolTip${cellProps.row.original.id}`}
            //           >{cellProps.value.substring(0, 20) + "..."}</span>
            //           <UncontrolledTooltip
            //             target={`toolTip${cellProps.row.original.id}`}
            //             className="custom-tooltip-style"
            //             style={{ backgroundColor: "#dfe6eb", color: "#212529" }}
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
                      <span id={`toolTip${cellProps.row.original.id}`}>{cellProps.value.substring(0, 20) + "..."}</span>
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
    [setValue, toggle]
  );

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

  if (accessLevel === perDefinedEmployeeRoleID) {
    return <TkAccessDenied />;
  }

  return (
    <>
      <TkRow>
        <TkCol lg={12}>
          {/* <TkCard id="tasksList"> */}
          {isError && <FormErrorBox errMessage={error?.message} />}
          {/* <TkCardHeader className="tk-card-header">
            <div className="d-flex align-items-center">
              <TkCardTitle className="mb-0 flex-grow-1">
                <h3>Timesheets</h3>
              </TkCardTitle>
              <div className="d-flex flex-shrink-0">
                <div>
                  <TkButton disabled={timesheetData.length === 0 || isLoading} className="btn btn-primary add-btn me-1">
                    <CSVLink data={csvData} filename={"Timesheet.csv"} headers={headers} className="text-white">
                      <TkIcon className="ri-download-2-line align-bottom me-1"></TkIcon> Export
                    </CSVLink>
                  </TkButton>
                </div>
              </div>
            </div>
          </TkCardHeader> */}
          <TkContainer>
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
                    onTaskChange={(item) => {
                      updateFilters({
                        [filterFields.timesheetReport.task]: item ? item.value : null,
                      });
                    }}
                    onTodaysTaskStatusChange={(item) => {
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
          </TkContainer>
          {/* </TkCard> */}
        </TkCol>

        <TkModal
          isOpen={modal}
          toggle={toggle}
          centered
          size="lg"
          className="border-0"
          modalClassName="modal fade zoomIn"
        >
          <TkModalHeader className="p-3 bg-soft-info" toggle={toggle}>
            {"Today's Task Details"}
          </TkModalHeader>
          <TkForm onSubmit={handleSubmit()}>
            <TkModalBody className="modal-body">
              <TkRow className="g-3">
                <TkCol lg={4}>
                  <TkInput {...register("createdBy")} id="createdBy" type="text" labelName="Created By" disabled />
                </TkCol>

                <TkCol lg={4}>
                  <TkInput {...register("date")} id="date" type="text" labelName="Date" disabled />
                </TkCol>

                <TkCol lg={4}>
                  <TkInput {...register("duration")} id="duration" type="text" labelName="Duration" disabled />
                </TkCol>
                <TkCol lg={4}>
                  <TkInput {...register("approvedBy")} id="approvedBy" type="text" labelName="Approved By" disabled />
                </TkCol>
                <TkCol lg={4}>
                  <TkInput {...register("project")} id="project" type="text" labelName="Project" disabled />
                </TkCol>

                <TkCol lg={4}>
                  <TkInput {...register("task")} id="task" type="text" labelName="Task" disabled />
                </TkCol>

                <TkCol lg={4}>
                  <TkInput {...register("ticket")} id="ticket" type="text" labelName="Ticket" disabled />
                </TkCol>

                <TkCol lg={4}>
                  <TkInput {...register("status")} id="status" type="text" labelName="Status" disabled />
                </TkCol>
                <TkCol lg={4}>
                  <TkInput
                    {...register("allocatedTime")}
                    id="allocatedTime"
                    type="text"
                    labelName="Allocated Time"
                    disabled
                  />
                </TkCol>
                <TkCol lg={12}>
                  <TkInput
                    {...register("description")}
                    id="description"
                    type="textarea"
                    labelName="Description"
                    disabled
                  />
                </TkCol>
              </TkRow>
            </TkModalBody>
          </TkForm>
        </TkModal>
        <TkContainer>
          <TkCol lg={12}>
            <TkRow className="align-items-center mt-3">
              <TkCol lg={7}>
                <h4 className="mb-0">Total Hrs: {totalHrs} </h4>
              </TkCol>
            </TkRow>
          </TkCol>
        </TkContainer>
      </TkRow>
    </>
  );
};

export default ReportTodaysTask;
