import React, { useEffect, useState } from "react";
import Image from "next/future/image";
import Link from "next/link";
import TkInput from "../forms/TkInput";
import { TkCardBody } from "../TkCard";
import TkRow, { TkCol } from "../TkRow";
import { filterFields, minSearchLength, urls } from "../../utils/Constants";
import { isSearchonUI, searchDebounce } from "../../utils/utilsFunctions";
import TkSelect from "../forms/TkSelect";
import TkTableContainer from "../TkTableContainer";
import { useMemo } from "react";

const usersData = [
  {
    id: 1,
    image: "/images/users/avatar-3.jpg",
    name: "John Doe",
    firstName: "John",
    lastName: "Doe",
    email: "admin@test.com",
    supervisor: null,
    role: {
      id: 1,
      name: "Admin",
    },
  },
  {
    id: 2,
    name: "Steave Smith",
    firstName: "Jane",
    lastName: "Doe",
    email: "Steave@test.com",
    supervisor: null,
    role: {
      id: 2,
      name: "Project Admin",
    },
  },
  {
    id: 3,
    image: "/images/users/avatar-8.jpg",
    name: "Adam Miller",
    firstName: "John",
    lastName: "Smith",
    email: "Adam@gmail.com",
    supervisor: null,
    role: {
      id: 3,
      name: "Project Manager",
    },
  },
  {
    id: 4,
    name: "Tom Riddle",
    firstName: "Jane",
    lastName: "Smith",
    email: "Tom@gmail.com",
    supervisor: null,
    role: {
      id: 4,
      name: "Employee",
    },
  },
];


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
        Header: "Name",
        accessor: "name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div className="d-flex align-items-center">
                <Link href={`${urls.userView}/${cellProps.row.original.id}`}>
                  {cellProps.row.original.image ? (
                    <Image
                      src={cellProps.row.original.image}
                      width={50}
                      height={50}
                      alt="project img"
                      className="avatar-xxs rounded-circle me-3"
                    />
                  ) : (
                    <div className="avatar-xxs rounded-circle bg-light me-3 border text-uppercase d-flex justify-content-center align-items-center">
                      {String(cellProps.row.original.name).charAt(0) +
                        String(cellProps.row.original.lastName).charAt(0)}
                    </div>
                  )}
                </Link>
                <Link href={`${urls.userView}/${cellProps.row.original.id}`}>
                  <a className="fw-medium table-link text-primary">
                    <div>
                      {cellProps.value.length > 17
                        ? cellProps.value.substring(0, 17) + "..."
                        : cellProps.value}
                    </div>
                  </a>
                </Link>
              </div>
            </>
          );
        },
      },
      {
        Header: "Supervisor",
        accessor: "supervisor.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div>
              {cellProps.value ? (
                <Link
                  href={`${urls.userEdit}/${cellProps.row.original.supervisorId}`}
                >
                  <a className="fw-medium table-link">{cellProps.value}</a>
                </Link>
              ) : (
                " — "
              )}
            </div>
          );
        },
      },
      {
        Header: "Role",
        accessor: "role.name",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Email",
        accessor: "email",
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
          <>
            <TkCol lg={12}>
              <TkCardBody className="pt-0">
                <TkTableContainer
                  columns={columns}
                  data={usersData || []}
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
