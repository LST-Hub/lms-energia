import React, { useMemo, useReducer, useState } from "react";
import { useCallback } from "react";
import TkTableContainer from "../TkTableContainer";
import { useQueries, useQuery } from "@tanstack/react-query";
import { API_BASE_URL, filterFields, repeatOptions, RQ, searchParamName } from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { formatDate } from "../../utils/date";
import { convertSecToTime } from "../../utils/time";
import TkLoader from "../TkLoader";
import { FormErrorBox } from "../forms/ErrorText";
import TkNoData from "../TkNoData";
import TkRow, { TkCol } from "../TkRow";
import { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkModal, { TkModalBody, TkModalHeader } from "../TkModal";
import PopupForm from "./PopupForm";
import { useEffect } from "react";
import TkSelect from "../forms/TkSelect";
import { convertToURLParamsString, isSearchonUI, searchFilterDateRangeData } from "../../utils/utilsFunctions";
import TkDate from "../forms/TkDate";
import useUserAccessLevel from "../../utils/hooks/useUserAccessLevel";
import { permissionTypeIds } from "../../../DBConstants";
import TkButton from "../TkButton";
import useSessionData from "../../utils/hooks/useSessionData";
import TkIcon from "../TkIcon";
import { UncontrolledTooltip } from "reactstrap";

function TableToolBar({ onProjectChange, onEmployeeChange, onRepetaionChange, onDateChange }) {
  const [allProjects, setAllProjects] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);

  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allProjectList],
        queryFn: tkFetch.get(`${API_BASE_URL}/project/list?myProjects=true&indexFilter=true`),
      },
      {
        queryKey: [RQ.allUsersList],
        queryFn: tkFetch.get(`${API_BASE_URL}/users/list?`),
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

function SelfAllocatedTable() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.resourceAllocation],
    queryFn: tkFetch.get(`${API_BASE_URL}/resource-allocation/self-allocated`),
    // enabled: Number(accessLevel) >= perAccessIds.view,
  });
  const sessionData = useSessionData();
  const accessLevel = useUserAccessLevel(permissionTypeIds.resourceAllocation);

  const [modal, setModal] = useState(false);
  const [editResourceAllocationData, setEditResourceAllocationData] = useState(null);
  const [resourceAllocationData, setResourceAllocationData] = useState([]);
  const [urlParamsStr, setUrlParamsStr] = useState("");
  const [filters, updateFilters] = useReducer((state, newState) => ({ ...state, ...newState }), {
    [filterFields.resourceAllocation.project]: null,
    [filterFields.resourceAllocation.allocatedUser]: null,
    [filterFields.resourceAllocation.repetation]: null,
    [filterFields.resourceAllocation.startDate]: null,
    [filterFields.resourceAllocation.endDate]: null,
  });

  const {
    data: backData,
    isLoading: backIsLoading,
    isError: backIsError,
    error: backError,
  } = useQuery({
    queryKey: [RQ.resourceAllocation, urlParamsStr],
    queryFn: tkFetch.get(`${API_BASE_URL}/resource-allocation/self-allocated${urlParamsStr ? `?${urlParamsStr}` : ""}`),
    enabled: !!urlParamsStr,
  });

  useEffect(() => {
    if (data) {
      setResourceAllocationData(data);
    }
  }, [data]);

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
      const urlParamString = convertToURLParamsString({
        [searchParamName]: null,
        ...filters,
      });
      setUrlParamsStr(urlParamString);
    }
  }, [filters, data]);

  const backendData = urlParamsStr.length > 0 ? backData : null;

  useEffect(() => {
    if (backendData) {
      setResourceAllocationData(backendData);
    }
  }, [backendData]);

  const toggle = useCallback(
    (editResourceAllocationData) => {
      setEditResourceAllocationData(editResourceAllocationData);
      // setModal(!modal);
      if (modal) {
        setModal(false);
      } else {
        setModal(true);
      }
    },
    [modal]
  );

  const columns = useMemo(
    () => [
      {
        Header: "View",
        accessor: "id",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div
              onClick={() =>
                toggle([
                  {
                    id: cellProps.row.original.id,
                    repeatId: cellProps.row.original.repeatId,
                    project: { ...cellProps.row.original.project },
                    task: { ...cellProps.row.original.task },
                    allocatedUser: { ...cellProps.row.original.allocatedUser },
                    date: cellProps.row.original.date,
                    duration: cellProps.row.original.duration,
                    repetationType: cellProps.row.original.repetationType,
                  },
                ])
              }
            >
              {/* <Link href={`${urls.resourceAllocationView}/${cellProps.value}`}> */}
              {/* <span className="table-text flex-grow-1 fw-medium link-primary cursor-pointer"></span> */}
              <TkButton color="none">
                <TkIcon className="ri-eye-fill align-bottom me-2 text-muted"></TkIcon>
              </TkButton>

              {/* </Link> */}
            </div>
          );
        },
      },
      {
        Header: "Project Name",
        accessor: "project.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div className="d-flex">
                <div className="table-text">
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
          return <div className="table-text">
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
          </div>;
        },
      },
      {
        Header: "Resource Allocated",
        accessor: "allocatedUser.name",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Date",
        accessor: "date",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div className="table-text">
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
          return <div className="table-text">{convertSecToTime(cellProps.value)}</div>;
        },
      },
    ],
    [toggle]
  );

  return (
    <div>
      {isLoading ? (
        <TkLoader />
      ) : isError ? (
        <FormErrorBox errMessage={error.message} />
      ) : data.length > 0 ? (
        <>
          <TkRow>
            <TkCol lg={12}>
              {/* <TkCardHeader className="tk-card-header">
                <div className="d-flex align-items-center">
                  <TkCardTitle className="mb-0 flex-grow-1">
                    <h3>My Task</h3>
                  </TkCardTitle>
                  {accessLevel >= perAccessIds.edit && <TkButton color="primary">Self Allocated</TkButton>}
                </div>
              </TkCardHeader> */}
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
        </>
      ) : (
        <TkNoData />
      )}
      <TkModal
        isOpen={modal}
        toggle={toggle}
        centered
        size="lg"
        contentClassName="border-0"
        dialogClassName="modal-dialog-centered"
      >
        <TkModalHeader toggle={toggle} className="border-0">
          <h4 className="modal-title">Resource Allocation</h4>
        </TkModalHeader>
        <TkModalBody>
          <PopupForm
            editResourceAllocationData={editResourceAllocationData}
            toggle={toggle}
            accessLevel={accessLevel}
            viewOnly={true}
          />
        </TkModalBody>
      </TkModal>
    </div>
  );
}

export default SelfAllocatedTable;
