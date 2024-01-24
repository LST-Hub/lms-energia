import React, { useMemo } from "react";
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";
import TkRow, { TkCol } from "../TkRow";
import { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkTableContainer from "../TkTableContainer";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, RQ, urls } from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { convertSecToTime } from "../../utils/time";
import { formatDate } from "../../utils/date";
import { UncontrolledTooltip } from "reactstrap";

const DashboardProjects = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allProjects],
    queryFn: tkFetch.get(`${API_BASE_URL}/dashboard/project`),
  });

  const columns = useMemo(
    () => [
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
        Header: "Client",
        accessor: "client.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div className="table-text">
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
        },
      },
      {
        Header: "Estimated Time",
        accessor: "estimatedTime",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div className="table-text">
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
              <div className="table-text">
                {cellProps.value === null ? <span> — </span> : <span>{formatDate(cellProps.value)}</span>}
              </div>
            </>
          );
        },
      },
    ],
    []
  );

  return (
    <>
      <TkRow>
        <TkCol lg={12}>
          <TkCardHeader className="tk-card-header">
            <div className="d-flex align-items-center">
              <TkCardTitle className="mb-0 flex-grow-1">
                <h3>Projects</h3>
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

export default DashboardProjects;
