import React, { useEffect, useMemo, useState } from "react";
import { TkCardHeader, TkCardTitle } from "../TkCard";
import { CSVLink } from "react-csv";
import TkIcon from "../TkIcon";
import TkLoader from "../TkLoader";
import TkTableContainer from "../TkTableContainer";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, RQ } from "../../utils/Constants";
import tkFetch from "../../utils/fetch";

const headers = [
  { label: "Title", key: "title" },
  { label: "Status", key: "status" },
  { label: "Start Date", key: "startdate" },
  { label: "Start Time", key: "starttime" },
  { label: "End Time", key: "endtime" },
  { label: "Owner", key: "owner" },
  { label: "Markdone", key: "markdone" },
];

function Eventreport() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.phoneCallReport],
    queryFn: tkFetch.get(`${API_BASE_URL}/reports/event-report`),
    // enabled: Number(accessLevel) >= perAccessIds.view,
  });

  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    if (data) {
      setCsvData(data);
    }
  }, [data]);

  const column = useMemo(
    () => [
      {
        Header: "Title",
        accessor: "title",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div>{<span>{cellProps.value}</span>}</div>
            </>
          );
        },
      },
      {
        Header: "Status",
        accessor: "status",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div>{<span>{cellProps.value}</span>}</div>
            </>
          );
        },
      },
      {
        Header: "Start Date",
        accessor: "startdate",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div>{<span>{cellProps.value}</span>}</div>
            </>
          );
        },
      },
      {
        Header: "Start Time",
        accessor: "starttime",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div>{<span>{cellProps.value}</span>}</div>
            </>
          );
        },
      },
      {
        Header: "End Time",
        accessor: "endtime",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div>{cellProps.value === "" ? <span>-</span> : <span>{cellProps.value}</span>}</div>
            </>
          );
        },
      },
      {
        Header: "Owner",
        accessor: "owner",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div>{cellProps.value === "" ? <span>-</span> : <span>{cellProps.value}</span>}</div>
            </>
          );
        },
      },
      {
        Header: "Markdone",
        accessor: "markdone",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div>{cellProps.value === "" ? <span>-</span> : <span>{cellProps.value}</span>}</div>
            </>
          );
        },
      },
    ],
    []
  );

  return (
    <div>
      <TkCardHeader className="tk-card-header">
        <div className="d-flex align-items-center">
          <TkCardTitle className="mb-0 flex-grow-1">
            <h3>Event</h3>
          </TkCardTitle>
          <div className="d-flex flex-shrink-0">
            <div>
              <CSVLink
                data={csvData}
                filename={"Event.csv"}
                headers={headers}
                className={`btn btn-primary add-btn text-white ${data?.length === 0 || isLoading ? "disabled" : ""}`}
              >
                <TkIcon className="ri-download-2-line align-bottom me-1"></TkIcon> Export
              </CSVLink>
            </div>
          </div>
        </div>
      </TkCardHeader>
      {isLoading ? (
        <TkLoader />
      ) : (
        <TkTableContainer
          columns={column}
          data={data || []}
          loading={isLoading}
          customPageSize={true}
          showPagination={true}
        />
      )}
    </div>
  );
}

export default Eventreport;
