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

const meetingData = [
    {
        id: 1,
        lead: "John Doe",
        location: "India",
        eventAccess: "Public",
        title: "Meeting",
        status: "Qualified",
        organizer: "John Doe",
        date: "2021-09-01",
    },
    {
        id: 2,
        lead: "Steave Smith",
        location: "India",
        eventAccess: "Public",
        title: "Meeting",
        status: "Unqualified",
        organizer: "John Doe",
        date: "2021-09-01",
    },
    {
        id: 3,
        lead: "Will Smith",
        location: "India",
        eventAccess: "Public",
        title: "Meeting",
        status: "Qualified",
        organizer: "John Doe",
        date: "2021-09-01",
    },
    {
        id: 4,
        lead: "Adam Miller",
        location: "India",
        eventAccess: "Public",
        title: "Meeting",
        status: "Unqualified",
        organizer: "John Doe",
        date: "2021-09-01",
    },
    {
        id: 5,
        lead: "Tom Riddle",
        location: "India",
        eventAccess: "Public",
        title: "Meeting",
        status: "Qualified",
        organizer: "John Doe",
        date: "2021-09-01",
    },
];

function TableToolBar() {
  return (
    <>
      <TkCardBody className="table-toolbar mt-3">
        <TkRow className="mb-3">
        <TkCol lg={4}>
            <TkInput
              // onChange={onSearchChange}
              placeholder="Search by name/Mobile No/ Company Name"
              isSearchField={true}
            />
          </TkCol>

          {/* <TkCol lg={2}>
            <TkSelect
              placeholder="Active/Inactive"
              options={[]}
              // onChange={onActiveChange}
            />
          </TkCol> */}
        </TkRow>
      </TkCardBody>
    </>
  );
}

const AllMeeting = () => {
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
        Header: "View | Edit",
        accessor: "id",
        filterable: false,
        Cell: (cellProps) => {
          return (
            //   <div className="flex-grow-1 tasks_name">{cellProps.value}</div>
            <div className="d-flex align-items-center">
              <ul className="ps-0 mb-0">
                <li className="list-inline-item">
                  <Link href={`${urls.meetingView}/${cellProps.value}`}>
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
                  <Link href={`${urls.meetingEdit}/${cellProps.value}`}>
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
        Header: "Lead",
        accessor: "lead",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Location",
        accessor: "location",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Event Access",
        accessor: "eventAccess",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Title",
        accessor: "title",
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
        Header: "Organizer",
        accessor: "organizer",
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

  // const columns = useMemo(
  //   () => [
  //     {
  //       Header: " Edit",
  //       accessor: "id",
  //       filterable: false,
  //       Cell: (cellProps) => {
  //         return (
  //           <div className="d-flex align-items-center">
  //             <ul className="ps-0 mb-0">
  //               <li className="list-inline-item">
  //                 <Link href={`${urls.meetingEdit}/${cellProps.value}`}>
  //                   <a>
  //                     <TkButton color="none">
  //                       <TkIcon className="ri-edit-line fs-4 -fill align-bottom me-2 text-muted"></TkIcon>
  //                     </TkButton>
  //                   </a>
  //                 </Link>
  //               </li>
  //             </ul>
  //           </div>
  //         );
  //       },
  //     },
  //     {
  //       Header: "Event",
  //       accessor: "event",
  //       filterable: false,
  //       Cell: (cellProps) => {
  //         return <div className="table-text">{cellProps.value}</div>;
  //       },
  //     },

  //     {
  //       Header: "Location",
  //       accessor: "location",
  //       filterable: false,
  //       Cell: (cellProps) => {
  //         return <div className="table-text">{cellProps.value}</div>;
  //       },
  //     },
  //     {
  //       Header: "Event Access",
  //       accessor: "eventAccess",
  //       filterable: false,
  //       Cell: (cellProps) => {
  //         return <div className="table-text">{cellProps.value}</div>;
  //       },
  //     },
  //     {
  //       Header: "Organizer",
  //       accessor: "organizer",
  //       filterable: false,
  //       Cell: (cellProps) => {
  //         return <div className="table-text">{cellProps.value}</div>;
  //       },
  //     },
  //     {
  //       Header: "Status",
  //       accessor: "status",
  //       filterable: false,
  //       Cell: (cellProps) => {
  //         return <div className="table-text">{cellProps.value}</div>;
  //       },
  //     },
  //     {
  //       Header: "Date",
  //       accessor: "date",
  //       filterable: false,
  //       Cell: (cellProps) => {
  //         return <div className="table-text">{cellProps.value}</div>;
  //       },
  //     },
  //   ],
  //   []
  // );

  return (
    <>
      {isClient ? (
        <TkRow>
          <>
            <TkCol lg={12}>
              <TkCardBody className="pt-0">
                <TkTableContainer
                  columns={columns}
                  data={meetingData || []}
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

export default AllMeeting;
