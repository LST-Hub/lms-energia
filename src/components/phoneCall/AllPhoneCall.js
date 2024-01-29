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
import TkButton from "../TkButton";
import TkIcon from "../TkIcon";

const usersData = [
  {
    id: 1,
    subject: "Test Subject",
    phoneCallDate: "2021-06-01",
    phoneNumber: "1234567890",
    priority: "High",
    status: "Open",
    contact: "7262054789",
  },
  {
    id: 2,
    subject: "Demo",
    phoneCallDate: "2021-14-01",
    phoneNumber: "7451681245",
    priority: "Low",
    status: "Close",
    contact: "8845127896",
  },
  {
    id: 3,
    subject: "Test Subject",
    phoneCallDate: "2021-06-01",
    phoneNumber: "1234567890",
    priority: "High",
    status: "Open",
    contact: "7262054789",
  },
  {
    id: 4,
    subject: "Test Subject",
    phoneCallDate: "2021-06-01",
    phoneNumber: "1234567890",
    priority: "High",
    status: "Open",
    contact: "7262054789",
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
              placeholder="Search"
              isSearchField={true}
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

const AllPhoneCall = () => {
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
        Header: " Edit",
        accessor: "id",
        filterable: false,
        Cell: (cellProps) => {
          return (
            //   <div className="flex-grow-1 tasks_name">{cellProps.value}</div>
            <div className="d-flex align-items-center">
              {/* <ul className="ps-0 mb-0">
                <li className="list-inline-item">
                  <Link href={`${urls.phoneCallView}/${cellProps.value}`}>
                    <a>
                      <TkButton color="none">
                        <TkIcon className="ri-eye-fill align-bottom me-2 text-muted"></TkIcon>
                      </TkButton>
                    </a>
                  </Link>
                </li>
              </ul> */}

              <ul className="ps-0 mb-0">
                <li className="list-inline-item">
                  <Link href={`${urls.phoneCallAdd}`}>
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
        Header: "Subject",
        accessor: "subject",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div className="d-flex align-items-center">
                <Link href={`${urls.phoneCallAdd}`}>
                  <a className="fw-medium table-link text-primary">
                    <div>
                      {cellProps.value.length > 17 ? cellProps.value.substring(0, 17) + "..." : cellProps.value}
                    </div>
                  </a>
                </Link>
              </div>
            </>
          );
        },
      },

      {
        Header: "Phone Call Date",
        accessor: "phoneCallDate",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Phone Number",
        accessor: "phoneNumber",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Priority",
        accessor: "priority",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
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
        Header: "Contact",
        accessor: "contact",
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
                      onSearchChange={searchDebounce(updateSearchText, searchOnUI)}
                      // accessLevel={accessLevel}
                      onSupervisorChange={(item) => {
                        updateFilters({
                          [filterFields.users.supervisor]: item ? item.value : null,
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

export default AllPhoneCall;
