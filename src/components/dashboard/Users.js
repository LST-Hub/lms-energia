import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { teamMembers } from "../../test-data/members";
import "react-toastify/dist/ReactToastify.css";
import TkTableContainer from "../TkTableContainer";
import TkRow, { TkCol } from "../TkRow";
import { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import { API_BASE_URL, RQ, urls } from "../../utils/Constants";
import { useQuery } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import { UncontrolledTooltip } from "reactstrap";

const UserName = (cell) => {
  return (
    <React.Fragment>
      <Link href="/view/users/test-user">
        <a className="fw-medium link-primary">{cell.value}</a>
      </Link>
    </React.Fragment>
  );
};

const DashboardUsers = () => {
  const [task, setTask] = useState([]);
  const [taskList, setTaskList] = useState(teamMembers);
  // TODO: this variable should be set to true when tasks fetched successfully
  const isTaskSuccess = true;
  // TODO: error descriptoin if error occured while fetching
  // const error = "Some error occured occured while fetching users";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allUsers],
    queryFn: tkFetch.get(`${API_BASE_URL}/dashboard/user`),
    // enabled: Number(accessLevel) >= perAccessIds.view,
  });

  // Add Data
  const handleTaskClicks = useCallback(() => {
    setTask("");
  }, []);

  useEffect(() => {
    if (Array.isArray(taskList) && taskList.length) {
      setTaskList(taskList);
    }
  }, [taskList]);

  const columns = useMemo(
    () => [
      {
        Header: "User Name",
        accessor: "name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div className="d-flex align-items-center">
                <Link href={`${urls.userView}/${cellProps.row.original.id}`}>
                  <a className="fw-medium table-link text-primary">
                    <div>
                      {/* {cellProps.value?.length > 17 ? cellProps.value.substring(0, 17) + "..." : cellProps.value} */}
                      {cellProps.value.length > 13 ? (
                        <>
                          <span id={`user${cellProps.row.index}`}>
                            {cellProps.value.substring(0, 13) + "..."}
                          </span>
                          <UncontrolledTooltip
                            target={`user${cellProps.row.index}`}
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
                  <span id={`email${cellProps.row.index}`}>{cellProps.value.substring(0, 13) + "..."}</span>
                  <UncontrolledTooltip
                    target={`email${cellProps.row.index}`}
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
        Header: "Phone",
        accessor: "phoneNumber",
        filterable: false,
        Cell: (cellProps) => {
          return cellProps.value === "" || cellProps.value === null ? (
            <div className="table-text"> — </div>
          ) : (
            <div className="table-text">{cellProps.value}</div>
          );
        },
      },
      {
        Header: "Supervisor",
        accessor: "supervisor.name",
        filterable: false,
        Cell: (cellProps) => {
          return cellProps.value === "" || cellProps.value === null ||  cellProps.value === undefined ? (
            <div className="table-text"> — </div>
          ) : (
            <div className="table-text">{cellProps.value}</div>
          );
        },
      },
      {
        Header: "Role",
        accessor: "role.name",
        filterable: false,
        Cell: (cellProps) => {
          return cellProps.value === "" ? (
            <div className="table-text"> — </div>
          ) : (
            <div className="table-text">{cellProps.value}</div>
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
          {/* <TkCard id="tasksList"> */}
          <TkCardHeader className="tk-card-header">
            <div className="d-flex align-items-center">
              {/* <TkCardTitle tag="h5" className="mb-0 flex-grow-1">Users</TkCardTitle> */}
              <TkCardTitle className="mb-0 flex-grow-1">
                <h3>Users</h3>{" "}
              </TkCardTitle>
              {/* <div className="d-flex flex-shrink-0">
                  <Link href="#">
                  <div onClick={onClickExportClient}>
                    <a className="btn btn-primary add-btn me-1">
                      <TkIcon className="ri-download-2-line align-bottom me-1"></TkIcon> Export
                    </a>
                    </div>
                  </Link>
                </div> */}
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
              handleTaskClick={handleTaskClicks}
              isFilters={false}
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

export default DashboardUsers;
