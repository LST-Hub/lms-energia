import React, { useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";
import TkRow, { TkCol } from "../TkRow";
import TkCard, { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkTableContainer from "../TkTableContainer";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, RQ, perDefinedEmployeeRoleID, urls } from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { convertSecToTime } from "../../utils/time";
import { formatDate } from "../../utils/date";
import Link from "next/link";
import useSessionData from "../../utils/hooks/useSessionData";

const TodayAllocatedTask = () => {
  const sessionData = useSessionData();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.todaysAllocatedTask],
    queryFn: tkFetch.get(`${API_BASE_URL}/dashboard/todaysAllocatedTask`),
  });

  const columns = useMemo(
    () => [
      {
        Header: "Project Name",
        accessor: "project.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div className="d-flex">
              {sessionData.user.roleId === perDefinedEmployeeRoleID ? (
                <Link href={`${urls.resourceAllocation}`}>
                  <a className="flex-grow-1 fw-medium table-link text-primary">
                    <div className="flex-grow-1 tasks_name">{cellProps.value}</div>
                  </a>
                </Link>
              ) : (
                <Link href={`${urls.selfAllocatedTasks}`}>
                <a className="flex-grow-1 fw-medium table-link text-primary">
                  <div className="flex-grow-1 tasks_name">{cellProps.value}</div>
                </a>
              </Link>
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
          return <div className="table-text">{cellProps.value}</div>;
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
    [sessionData.user.roleId]
  );

  return (
    <>
      <TkRow className="mt-2">
        <TkCol lg={12}>
          <TkCardHeader className="tk-card-header">
            <div className="d-flex align-items-center">
              <TkCardTitle className="mb-0 flex-grow-1">
                <h3>Today&apos;s Allocated Task</h3>
              </TkCardTitle>
            </div>
          </TkCardHeader>
          <TkCardBody className="pt-0">
            <TkTableContainer
              columns={columns}
              data={data || []}
              showPagination={true}
              isSearch={true}
              defaultPageSize={10}
              noDataMessage="No data found"
              isFilters={true}
              loading={isLoading}
              customPageSize={true}
            />

            {/* <ToastContainer closeButton={false} /> */}
          </TkCardBody>
          {/* </TkCard> */}
        </TkCol>
      </TkRow>
    </>
  );
};

export default TodayAllocatedTask;
