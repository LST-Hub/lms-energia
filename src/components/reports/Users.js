import React, { useState, useEffect, useMemo, useCallback, useReducer } from "react";
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";
import TkTableContainer from "../TkTableContainer";
import TkRow, { TkCol } from "../TkRow";
import { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkIcon from "../TkIcon";
import { API_BASE_URL, RQ, filterFields, searchParamName } from "../../utils/Constants";
import { useQueries, useQuery } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import TkSelect from "../forms/TkSelect";
import { TkToastError } from "../TkToastContainer";
import { convertToURLParamsString, isSearchonUI, searchAndFilterData } from "../../utils/utilsFunctions";
import { FormErrorBox } from "../forms/ErrorText";
import { CSVLink } from "react-csv";
import TkButton from "../TkButton";

const headers = [
  { label: "Employee Name", key: "employeeName" },
  { label: "Email", key: "email" },
  { label: "Phone", key: "phone" },
  { label: "Role", key: "role" },
];

function TableToolBar({ onEmployeeChange, onRoleChange }) {
  const [allEmployees, setAllEmployees] = useState([]);
  const [allRoles, setAllRoles] = useState([]);

  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allUsersList, "employee"],
        queryFn: tkFetch.get(`${API_BASE_URL}/users/list?indexFilter=true`),
      },
      {
        queryKey: [RQ.allUsersList, "role"],
        queryFn: tkFetch.get(`${API_BASE_URL}/roles/list`),
      },
    ],
  });

  const [employeeList, roleList] = results;

  const { data: employees, isLoading: employeeLoading, isError: employeeisError, error: employeeError } = employeeList;
  const { data: roles, isLoading: roleLoading, isError: roleisError, error: roleError } = roleList;

  useEffect(() => {
    if (employeeisError) {
      TkToastError("Error occured while fetching employees");
      console.log("projectError", employeeError);
    }
  }, [employeeisError, employeeError]);

  useEffect(() => {
    if (roleisError) {
      TkToastError("Error occured while fetching roles");
      console.log("pmError", roleError);
    }
  }, [roleisError, roleError]);

  useEffect(() => {
    if (Array.isArray(employees)) {
      const p = employees.map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });
      setAllEmployees(p);
    }
  }, [employees]);

  useEffect(() => {
    if (Array.isArray(roles)) {
      const p = roles.map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });
      setAllRoles(p);
    }
  }, [roles]);

  return (
    <>
      <TkCardBody className="table-toolbar mt-3 mb-3">
        <TkRow className="mb-3">
          <TkCol lg={3}>
            <TkSelect
              placeholder="Select Employee"
              loading={employeeLoading}
              options={allEmployees}
              onChange={onEmployeeChange}
            />
          </TkCol>
          <TkCol lg={3}>
            <TkSelect placeholder="Select Role" loading={roleLoading} options={allRoles} onChange={onRoleChange} />
          </TkCol>
        </TkRow>
      </TkCardBody>
    </>
  );
}

const ReportsUsers = () => {
  const [filters, updateFilters] = useReducer((state, newState) => ({ ...state, ...newState }), {
    [filterFields.userReport.user]: null,
    [filterFields.userReport.role]: null,
  });
  const [userData, setUserData] = useState([]);
  const [urlParamsStr, setUrlParamsStr] = React.useState("");
  const [csvData, setCsvData] = useState([]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allUsers],
    queryFn: tkFetch.get(`${API_BASE_URL}/reports/user`),
    // enabled: Number(accessLevel) >= perAccessIds.view,
  });

  const {
    data: backData,
    isLoading: backIsLoading,
    isError: backIsError,
    error: backError,
  } = useQuery({
    queryKey: [RQ.allProjects, urlParamsStr],
    queryFn: tkFetch.get(`${API_BASE_URL}/reports/user${urlParamsStr ? `?${urlParamsStr}` : ""}`),
    enabled: !!urlParamsStr,
  });

  useEffect(() => {
    if (data) {
      setUserData(data);
    }
  }, [data]);

  useEffect(() => {
    let doFilter = true;
    if (Object.values(filters).every((val) => val === null || val === undefined || val === "")) {
      doFilter = false;
    }
    if (!doFilter) {
      // if data is undefined then set it to empty array
      setUserData(data || []);
      setUrlParamsStr("");
      return;
    }
    if (isSearchonUI(data)) {
      const newData = searchAndFilterData(data, null, null, filters);
      setUserData(newData);
    } else {
      const urlParamString = convertToURLParamsString({ [searchParamName]: null, ...filters });
      setUrlParamsStr(urlParamString);
    }
  }, [filters, data]);

  const columns = useMemo(
    () => [
      {
        Header: "User Name",
        accessor: "name",
        filterable: false,
        Cell: (cellProps) => {
          return <div>{cellProps.value}</div>;
        },
      },
      {
        Header: "Email",
        accessor: "email",
        filterable: false,
        Cell: (cellProps) => {
          return cellProps.value === "" ? <div>—</div> : <div>{cellProps.value}</div>;
        },
      },
      {
        Header: "Phone",
        accessor: "phoneNumber",
        filterable: false,
        Cell: (cellProps) => {
          return cellProps.value === ""  ? <div>— </div> : <div>{cellProps.value}</div>;
        },
      },
      {
        Header: "Supervisor",
        accessor: "supervisor.name",
        filterable: false,
        Cell: (cellProps) => {
          return cellProps.value === undefined  ? <div>—</div> : <div>{cellProps.value}</div>;
        },
      },
      {
        Header: "Role",
        accessor: "role.name",
        filterable: false,
        Cell: (cellProps) => {
          return cellProps.value === "" ? <div>—</div> : <div>{cellProps.value}</div>;
        },
      },
    ],
    []
  );

  useEffect(() => {
    if (data?.length > 0) {
      if (userData?.length > 0) {
        const exportData = userData.map((item) => {
          return {
            employeeName: item.name,
            email: item.email,
            phone: item.phoneNumber,
            supervisor: item.supervisor ? item.supervisor.name : "NA",
            role: item.role.name,
          };
        });
        setCsvData(exportData);
      }
      if (backData?.length > 0) {
        const exportData = backData.map((item) => {
          return {
            employeeName: item.name,
            email: item.email,
            phone: item.phoneNumber,
            supervisor: item.supervisor ? item.supervisor.name : "NA",
            role: item.role.name,
          };
        });
        setCsvData(exportData);
      }
    }
  }, [userData, backData, data]);

  return (
    <>
      <TkRow>
        <TkCol lg={12}>
          {/* <TkCard id="tasksList"> */}
          {isError && <FormErrorBox errMessage={error?.message} />}
          <TkCardHeader className="tk-card-header">
            <div className="d-flex align-items-center">
              <TkCardTitle className="mb-0 flex-grow-1">
                <h3>Users</h3>{" "}
              </TkCardTitle>
              <div className="d-flex flex-shrink-0">
                <div>
                  <CSVLink data={csvData} filename={"User.csv"} headers={headers} className={`btn btn-primary add-btn text-white ${userData.length === 0 || isLoading ? 'disabled' : ''}`}>
                    {/* <TkButton disabled={userData.length === 0 || isLoading} className="btn btn-primary add-btn me-1"> */}
                      <TkIcon className="ri-download-2-line align-bottom me-1"></TkIcon> Export
                    {/* </TkButton> */}
                  </CSVLink>
                </div>
              </div>
            </div>
          </TkCardHeader>
          {backIsError && <FormErrorBox errMessage={backError?.message} />}
          <TkCardBody className="pt-0">
            <TkTableContainer
              columns={columns}
              data={backData || userData}
              Toolbar={
                <TableToolBar
                  onEmployeeChange={(item) => {
                    updateFilters({
                      [filterFields.userReport.user]: item ? item.value : null,
                    });
                  }}
                  onRoleChange={(item) => {
                    updateFilters({
                      [filterFields.userReport.role]: item ? item.value : null,
                    });
                  }}
                />
              }
              isSearch={true}
              defaultPageSize={10}
              customPageSize={true}
              showPagination={true}
              isFilters={false}
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

export default ReportsUsers;
