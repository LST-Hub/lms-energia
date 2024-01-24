import React, { useState, useEffect, useCallback } from "react";
import TkButton from "../TkButton";
import { TkCol } from "../TkRow";
import { convertSecToTime } from "../../utils/time";
import { TkToastSuccess } from "../TkToastContainer";
import { FormErrorBox } from "../forms/ErrorText";
import {
  RQ,
  API_BASE_URL,
  filterFields,
  searchParamName,
  urls,
  statusFilterDropdownOptions,
} from "../../utils/Constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import TkLoader from "../TkLoader";
import TkNoData from "../TkNoData";
import { timeEntryStatus } from "../../../lib/constants";
import TopBar from "./TopBar";
import { useReducer } from "react";
import { convertToURLParamsString, isSearchonUI, searchFilterDateRangeData } from "../../utils/utilsFunctions";
import TkContainer from "../TkContainer";
import { TkCardBody } from "../TkCard";
import TkTableContainer from "../TkTableContainer";
import { useMemo } from "react";
import Link from "next/link";
import { formatDate } from "../../utils/date";
import TkIcon from "../TkIcon";
import { UncontrolledTooltip } from "reactstrap";

const apiTabFilters = {
  saved: "saved",
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
};

const AllTimeSheet = () => {
  const queryClient = useQueryClient();
  const [showCheckbox, setShowCheckbox] = useState(false); // to show checkbox in table
  const [checkboxSelected, setCheckboxSelected] = useState([]);
  const [urlParamsStr, setUrlParamsStr] = React.useState("");
  const [totalHrs, setTotalHrs] = useState(0);

  // const [filter, setFilter] = useState(apiTabFilters.saved);
  const [timesheetData, setTimesheetData] = useState([]);
  const [filters, updateFilters] = useReducer((state, newState) => ({ ...state, ...newState }), {
    [filterFields.timesheet.project]: null, // keep the initial values to null for filters
    [filterFields.timesheet.task]: null,
    [filterFields.timesheet.status]: null,
    [filterFields.timesheet.startDate]: null,
    [filterFields.timesheet.endDate]: null,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allTimesheets],
    queryFn: tkFetch.get(`${API_BASE_URL}/timesheet`),
  });
  // this query to fetch all projects, while backend serach/filtering
  const {
    data: backData,
    isLoading: backIsLoading,
    isError: backIsError,
    error: backError,
  } = useQuery({
    queryKey: [RQ.allProjects, urlParamsStr],
    queryFn: tkFetch.get(`${API_BASE_URL}/timesheet${urlParamsStr ? `?${urlParamsStr}` : ""}`),
    enabled: !!urlParamsStr,
  });

  useEffect(() => {
    if (data) {
      setTimesheetData(data);
    }
  }, [data]);

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
      const urlParamString = convertToURLParamsString({ [searchParamName]: null, ...filters });
      setUrlParamsStr(urlParamString);
    }
  }, [filters, data, backData]);

  const backendData = urlParamsStr.length > 0 ? backData : null;

  useEffect(() => {
    if (backendData) {
      setTimesheetData(backendData);
    }
  }, [backendData]);

  const sendForApproval = useMutation({
    mutationFn: tkFetch.patch(`${API_BASE_URL}/timesheet`),
  });

  const onClickSubmitAllForApproval = () => {
    // only send for approval if filter is saved
    // if (filter === apiTabFilters.saved) {
    //get all id from filterData and store in an array
    const apiData = {
      timesheetIds: checkboxSelected,
      submittedForApproval: true,
      status: timeEntryStatus.Pending,
    };
    sendForApproval.mutate(apiData, {
      onSuccess: () => {
        TkToastSuccess("Timesheet Submitted For Approval");
        queryClient.invalidateQueries({ queryKey: [RQ.allTimesheets] });
        setCheckboxSelected([]);
      },
      onError: (error) => {
        console.log("error", error);
      },
    });
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
                  <Link href={`${urls.timesheetView}/${cellProps.value}`}>
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
                  <Link href={`${urls.timesheetEdit}/${cellProps.value}`}>
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
        accessor: "project.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              {/* <div className="d-flex"> */}
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
              {/* </div> */}
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
            <div className="table-text">
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
          const randomId = new Date().getTime();
          return (
            <div className="table-text">
              {cellProps.value?.length > 13 ? (
                <>
                  <span id={`ticket${cellProps.row.index}`}>{cellProps.value.substring(0, 13) + "..."}</span>
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
        Header: "Date",
        accessor: "date",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{formatDate(cellProps.value)}</div>;
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
      {
        Header: "Status",
        accessor: "status",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Approved By",
        accessor: "approvedBy.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div className="table-text">
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
            </div>
          );
        },
      },
      {
        Header: "Description",
        accessor: "description",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div className="table-text">
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
    []
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
  const selectedRowsId = useCallback((rows) => {
    const ids = rows.map((row) => row.original.id);
    setCheckboxSelected(ids);
  }, []);
  return (
    <>
      <TopBar
        onProjectChange={(item) => {
          updateFilters({
            [filterFields.timesheet.project]: item ? item.value : null,
          });
        }}
        onTaskChange={(item) => {
          updateFilters({
            [filterFields.timesheet.task]: item ? item.value : null,
          });
        }}
        onTimesheetStatusChange={(item) => {
          updateFilters({
            [filterFields.timesheet.status]: item ? item.value : null,
          });
          item?.value === statusFilterDropdownOptions[0].value ? setShowCheckbox(true) : setShowCheckbox(false);
        }}
        onDateChange={(dates) => {
          updateFilters({
            [filterFields.timesheet.startDate]: dates ? dates[0] : null,
          });
          updateFilters({
            [filterFields.timesheet.endDate]: dates ? dates[1] : null,
          });
        }}
        totalHrs={totalHrs}
      />

      <TkContainer>
        <>
        {checkboxSelected.length > 0 && filters.status === "Draft" ? (
            <TkButton color="primary" className="mb-3" onClick={onClickSubmitAllForApproval}>
              <TkIcon className="ri-check-double-line align-bottom me-1"></TkIcon> Submit All for Approval
            </TkButton>
          ) : null}
          {isLoading ? (
            <TkLoader />
          ) : isError ? (
            <FormErrorBox errMessage={error.message} />
          ) : timesheetData?.length > 0 ? (
            // <TkRow className="vertical-children-space">
            //   {timesheetData.map((item) => (
            //     <TkCol key={item.id} xs={6}>
            //       <TaskRow
            //         taskName={item.task.name}
            //         projectName={item.project.name}
            //         id={item.id}
            //         time={convertSecToTime(item.duration)}
            //       />
            //     </TkCol>
            //   ))}
            // </TkRow>
            <TkCardBody className="table-padding pt-0">
              <TkTableContainer
                columns={columns}
                data={timesheetData}
                defaultPageSize={10}
                customPageSize={true}
                showPagination={true}
                rowSelection={showCheckbox} // pass it true to enable row selection
                onRowSelection={selectedRowsId}
                loading={urlParamsStr.length > 0 && backIsLoading}
              />
            </TkCardBody>
          ) : (
            <TkCol lg={12}>
              <TkNoData />
            </TkCol>
          )}
        </>
      </TkContainer>
    </>
  );
};

export default AllTimeSheet;
