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

const taskData = [
  {
    id: 1,
    dueDate: "2021-06-01",
    taskTitle: "Test Subject",
    status: "Open",
    date: "2021-06-01",
  },
  {
    id: 2,
    dueDate: "2021-14-01",
    taskTitle: "Demo",
    status: "Close",
    date: "2021-06-01",
  },
  {
    id: 3,
    dueDate: "2021-06-01",
    taskTitle: "Test Subject",
    status: "Open",
    date: "2021-06-01",
  },
  {
    id: 4,
    dueDate: "2021-06-01",
    taskTitle: "Test Subject",
    status: "Open",
    date: "2021-06-01",
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

const AllTask = () => {
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
            <div className="d-flex align-items-center">
              <ul className="ps-0 mb-0">
                <li className="list-inline-item">
                  <Link href={`${urls.taskkEdit}/${cellProps.value}`}>
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
        Header: "Due Date",
        accessor: "dueDate",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Task Title",
        accessor: "taskTitle",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      // {
      //   Header: "Priority",
      //   accessor: "priority",
      //   filterable: false,
      //   Cell: (cellProps) => {
      //     return <div className="table-text">{cellProps.value}</div>;
      //   },
      // },
      {
        Header: "Status",
        accessor: "status",
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
                  data={taskData || []}
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

export default AllTask;
