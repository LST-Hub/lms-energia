import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { OrdersId, Project, CreateBy, DueDate, Status, Priority } from "../projects/ProjectListCol";
import { allClient } from "../../test-data/client-widgets";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../utils/Loader";
import TkIcon from "../TkIcon";
import TkRow, { TkCol } from "../TkRow";
import TkCard, { TkCardHeader, TkCardBody, TkCardTitle } from "../TkCard";
import TkTableContainer from "../TkTableContainer";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, RQ, urls } from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { UncontrolledTooltip } from "reactstrap";

const DashboardClients = () => {

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allClients],
    queryFn: tkFetch.get(`${API_BASE_URL}/dashboard/client`),
    // enabled: Number(accessLevel) >= perAccessIds.view,
  });

  const columns = useMemo(
    () => [
      {
        Header: "Client Name",
        accessor: "name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div className="d-flex">
                <div className="flex-grow-1">
                  <Link href={`${urls.clientView}/${cellProps.row.original.id}`}>
                    <a className="fw-medium table-link text-primary">
                      <div className="flex-grow-1 tasks_name">
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
                    </a>
                  </Link>
                </div>
              </div>
            </>
          );
          // return <div className="table-text">{cellProps.value}</div>;
        },
      },

      {
        Header: "Email",
        accessor: "email",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div className="table-text">
              {cellProps.value?.length > 13 ? (
                <>
                  <span id={`email${cellProps.row.index}`}>
                    {cellProps.value.substring(0, 13) + "..."}
                  </span>
                  <UncontrolledTooltip
                    target={`email${cellProps.row.index}`}
                    className="custom-tooltip-style"
                    style={{ backgroundColor: "#dfe6eb", color: "#212529" }}
                  >
                    {cellProps.value}
                  </UncontrolledTooltip>
                </>
              )  : cellProps.value ? (
                cellProps.value
              ) : (
                "—"
              )}
            </div>
          );
        },
      },

      {
        Header: "Phone",
        accessor: "phone",
        filterable: false,
      //   Cell: (cellProps) => {
      //     return cellProps.value === "" ? (
      //       <div className="table-text"> — </div>
      //     ) : (
      //       <div className="table-text">{cellProps.value}</div>
      //     );
      //   },
      // },

          Cell: (cellProps) => {
            if (cellProps.value === "" || cellProps.value === null) {
              return <span className="table-text">—</span>;
            } else {
              return <span className="table-text">{cellProps.value}</span>;
            }
          },
        },

      

      {
        Header: "Active",
        accessor: "active",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value.toString()}</div>;
        },
      },
    ],
    []
  );

  return (
    <>
      <TkRow>
        <TkCol lg={12}>
          {/* <TkCard id="tasksList"> */}
          <TkCardHeader className="tk-card-header">
            <div className="d-flex align-items-center">
              {/* <TkCardTitle tag="h5" className=" mb-0 flex-grow-1">Clients</TkCardTitle> */}
              <TkCardTitle className="mb-0 flex-grow-1">
                <h3>Clients</h3>{" "}
              </TkCardTitle>
              {/* <div className="d-flex flex-shrink-0"> */}
              {/* <Link href="#"> */}
              {/* <div onClick={onClickExportClient}>
                      <a className="btn btn-primary add-btn me-1">
                        <TkIcon className="ri-download-2-line align-bottom me-1"></TkIcon> Export
                      </a>
                    </div> */}
              {/* </Link> */}
              {/* </div> */}
            </div>
          </TkCardHeader>
          <TkCardBody className="pt-0">
            <TkTableContainer
              columns={columns}
              data={data || []}
              isSearch={true}
              noDataMessage="No data found"
              showPagination={true}
              defaultPageSize={10}
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

export default DashboardClients;
