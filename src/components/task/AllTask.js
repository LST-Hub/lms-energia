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
import TkButton from "../TkButton";
import TkIcon from "../TkIcon";
import { useQuery } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";

// function TableToolBar() {
//   return (
//     <>
//       <TkCardBody className="table-toolbar mt-3">
//         <TkRow className="mb-3">
//           <TkCol lg={4}>
//             <TkInput
//               // onChange={onSearchChange}
//               placeholder="Search by name/Mobile No/ Company Name"
//               isSearchField={true}
//             />
//           </TkCol>

//           {/* <TkCol lg={2}>
//             <TkSelect
//               placeholder="Active/Inactive"
//               options={[]}
//               // onChange={onActiveChange}
//             />
//           </TkCol> */}
//         </TkRow>
//       </TkCardBody>
//     </>
//   );
// }

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

  const {
    data: taskActivityData,
    isLoading: isBackLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [RQ.allTask],
    queryFn: tkFetch.get(`${API_BASE_URL}/taskActivity`),
    enabled: true,
  });
  const columns = useMemo(
    () => [
      {
        Header: "View | Edit",
        accessor: "id",
        filterable: false,
        Cell: (cellProps) => {
          return (
            //   <div className="flex-grow-1 tasks_name">{cellProps.value}</div>
            <div className="d-flex align-items-center">
              <ul className="ps-0 mb-0">
                <li className="list-inline-item">
                  <Link href={`${urls.taskkView}/${cellProps.value}`}>
                    <a>
                      <TkButton color="none">
                        <TkIcon className="ri-eye-fill align-bottom me-2 text-muted"></TkIcon>
                      </TkButton>
                    </a>
                  </Link>
                </li>
              </ul>
              |
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
        Header: "Title",
        accessor: "values.title",
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
        Header: "Status",
        accessor: "status.text",
        Cell: (cellProps) => {
          return (
            <>
              <div className="table-text">
                {cellProps?.row.original.values.status[0].text}
              </div>
            </>
          );
        },
      },
      {
        Header: "Priority",
        accessor: "priority.text",
        Cell: (cellProps) => {
          return (
            <>
              <div className="table-text">
                {cellProps?.row.original.values.priority[0].text}
              </div>
            </>
          );
        },
      },
      {
        Header: "Date",
        accessor: "values.startdate",
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
                  data={taskActivityData?.list || []}
                  // Toolbar={
                  //   <TableToolBar
                  //     onSearchChange={searchDebounce(
                  //       updateSearchText,
                  //       searchOnUI
                  //     )}
                  //     // accessLevel={accessLevel}
                  //     onSupervisorChange={(item) => {
                  //       updateFilters({
                  //         [filterFields.users.supervisor]: item
                  //           ? item.value
                  //           : null,
                  //       });
                  //     }}
                  //     onRoleChange={(item) => {
                  //       updateFilters({
                  //         [filterFields.users.role]: item ? item.value : null,
                  //       });
                  //     }}
                  //     onActiveChange={(item) => {
                  //       updateFilters({
                  //         [filterFields.users.active]: item ? item.value : null,
                  //       });
                  //     }}
                  //   />
                  // }
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
