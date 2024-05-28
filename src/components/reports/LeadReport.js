import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL, RQ } from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import TkTableContainer from "../TkTableContainer";
import { TkCardHeader, TkCardTitle } from "../TkCard";
import TkIcon from "../TkIcon";
import { CSVLink } from "react-csv";
import TkLoader from "../TkLoader";

const headers = [
  { label: "First Name", key: "firstname" },
  { label: "Last Name", key: "lastname" },
  { label: "Company Name", key: "companyname" },
  { label: "Email", key: "email" },
  { label: "Phone Number", key: "phone" },
  { label: "Lead Channel", key: "custentity_lms_channel_lead" },
  { label: "Created By", key: "custentity_lms_createdby" },
  { label: "Primary Action", key: "custrecord_lms_primary_action" },
];

function LeadReport() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.leadReport],
    queryFn: tkFetch.get(`${API_BASE_URL}/reports/leads-report`),
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
      // {
      //   Header: "First Name",
      //   accessor: "firstname",
      //   filterable: false,
      //   Cell: (cellProps) => {
      //     return (
      //       <>
      //         <div>{cellProps.value === "" ? <span>-</span> : <span>{cellProps.value}</span>}</div>
      //       </>
      //     );
      //   },
      // },
      // {
      //   Header: "Last Name",
      //   accessor: "lastname",
      //   filterable: false,
      //   Cell: (cellProps) => {
      //     return (
      //       <>
      //         <div>{cellProps.value === "" ? <span>-</span> : <span>{cellProps.value}</span>}</div>
      //       </>
      //     );
      //   },
      // },
      {
        Header: "Company Name",
        accessor: "companyname",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div>{cellProps.value === null ? <span>NA</span> : <span>{cellProps.value}</span>}</div>
            </>
          );
        },
      },
      {
        Header: "Email",
        accessor: "email",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div>{cellProps.value === null ? <span>NA</span> : <span>{cellProps.value}</span>}</div>
            </>
          );
        },
      },
      {
        Header: "Phone Number",
        accessor: "phone",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div>{cellProps.value === null ? <span>NA</span> : <span>{cellProps.value}</span>}</div>
            </>
          );
        },
      },
      {
        Header: "Lead Channel",
        accessor: "custentity_lms_channel_lead",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div>{cellProps.value === null ? <span>NA</span> : <span>{cellProps.value}</span>}</div>
            </>
          );
        },
      },
      {
        Header: "Created By",
        accessor: "custentity_lms_createdby",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div>{cellProps.value === null ? <span>NA</span> : <span>{cellProps.value}</span>}</div>
            </>
          );
        },
      },
      {
        Header: "Primary Action",
        accessor: "custrecord_lms_primary_action",
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
            <h3>Leads</h3>
          </TkCardTitle>
          <div className="d-flex flex-shrink-0">
            <div>
              {/* <TkButton disabled={projectData.length === 0 || isLoading} className="btn btn-primary add-btn me-1" > */}
              <CSVLink
                data={csvData}
                filename={"Leads.csv"}
                headers={headers}
                className={`btn btn-primary add-btn text-white ${data?.length === 0 || isLoading ? "disabled" : ""}`}
              >
                <TkIcon className="ri-download-2-line align-bottom me-1"></TkIcon> Export
              </CSVLink>
              {/* </TkButton> */}
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

export default LeadReport;
