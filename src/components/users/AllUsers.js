import React, { useEffect, useState } from "react";
import Image from "next/future/image";
import Link from "next/link";
import TkInput from "../forms/TkInput";
import { TkCardBody } from "../TkCard";
import TkRow, { TkCol } from "../TkRow";
import {
  API_BASE_URL,
  RQ,
  filterFields,
  minSearchLength,
  urls,
} from "../../utils/Constants";
import { isSearchonUI, searchDebounce } from "../../utils/utilsFunctions";
import TkSelect from "../forms/TkSelect";
import TkTableContainer from "../TkTableContainer";
import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import TkButton from "../TkButton";

function TableToolBar() {
  return (
    <>
      <TkCardBody className="table-toolbar mt-3">
        <TkRow className="mb-3">
          <TkCol lg={2}>
            <TkInput
              // onChange={onSearchChange}
              placeholder="Search Users"
              isSearchField={true}
            />
          </TkCol>

          <TkCol lg={2}>
            <TkSelect
              placeholder="Select Role"
              // loading={isRoleLoading}
              options={[]}
              // onChange={onRoleChange}
            />
          </TkCol>
          <TkCol lg={2}>
            <TkSelect
              placeholder="Active/Inactive"
              options={[]}
              // onChange={onActiveChange}
            />
          </TkCol>
        </TkRow>
      </TkCardBody>
    </>
  );
}

const AllUsers = () => {
  const {
    data: usersData,
    isLoading: isBackLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [RQ.allProjects],
    queryFn: tkFetch.get(`${API_BASE_URL}/employee`),
    enabled: true,
  });

  const empPost = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/employee`),
  });

  const onSubmit = (data) => {
    empPost.mutate({
      onSuccess: () => {
        console.log("success");
      },
    });
  };

  const searchOnUI = isSearchonUI([]);

  const updateSearchText = (e) => {
    if (e.target.value.length >= minSearchLength) {
      setSearchText(e.target.value);
    } else {
      setSearchText("");
    }
  };

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: "Internal ID",
        accessor: "id",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },

      {
        Header: "Name",
        accessor: "firstname",
        filterable: false,

        Cell: (cellProps) => {
          return (
            <div className="table-text">
              {" "}
              {(
                <Link href={`${urls.userView}/${cellProps.row.original.id}`}>
                  {String(cellProps.value) +
                    " " +
                    String(cellProps.row.original.lastname)}
                </Link>
              ) || <span> — </span>}
            </div>
          );
        },
      },

      {
        Header: "Mobile Phone",
        accessor: "mobilephone",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div className="table-text">
                {cellProps.value || <span> — </span>}
              </div>
            </>
          );
        },
      },

      {
        Header: "Job Title",
        accessor: "title",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div className="table-text">
                {cellProps.value || <span> — </span>}
              </div>
            </>
          );
        },
      },
      {
        Header: "Roles",
        accessor: "custentity_lms_roles",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div className="table-text">
                {cellProps.value || <span> — </span>}
              </div>
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
              <div className="table-text">
                {cellProps.value || <span> — </span>}
              </div>
            </>
          );
        },
      },

      {
        Header: "Date Created",
        accessor: "hiredate",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },

      {
        Header: "Last Modified Date",
        accessor: "lastmodifieddate",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
    ],
    []
  );

  return (
    <>
      {isClient ? (
        <TkRow>
          {/* <TkButton onClick={onSubmit}>Create Employee</TkButton> */}
          <>
            <TkCol lg={12}>
              <TkCardBody className="pt-0">
                <TkTableContainer
                  columns={columns}
                  data={usersData?.items || []}
                  Toolbar={
                    <TableToolBar
                      onSearchChange={searchDebounce(
                        updateSearchText,
                        searchOnUI
                      )}
                      // accessLevel={accessLevel}
                      onSupervisorChange={(item) => {
                        updateFilters({
                          [filterFields.users.supervisor]: item
                            ? item.value
                            : null,
                        });
                      }}
                      onRoleChange={(item) => {
                        updateFilters({
                          [filterFields.users.role]: item ? item.value : null,
                        });
                      }}
                      onActiveChange={(item) => {
                        updateFilters({
                          [filterFields.users.active]: item ? item.value : null,
                        });
                      }}
                    />
                  }
                  defaultPageSize={10}
                  customPageSize={true}
                  showPagination={true}
                  loading={isBackLoading}
                  // rowSelection={true}
                  showSelectedRowCount={true} // pass it true to show the selected row count
                />
              </TkCardBody>
            </TkCol>
          </>
        </TkRow>
      ) : null}
    </>
  );
};

export default AllUsers;
