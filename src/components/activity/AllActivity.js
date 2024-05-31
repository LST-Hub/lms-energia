import React, { useEffect, useState } from "react";
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
import TkTableContainer from "../TkTableContainer";
import { useMemo } from "react";
import TkButton from "../TkButton";
import TkIcon from "../TkIcon";
import { useMutation, useQuery } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import TkDate from "../forms/TkDate";
import TkSelect from "../forms/TkSelect";

function TableToolBar() {
  return (
    <>
      <TkCardBody className="table-toolbar mt-3">
        <TkRow className="mb-3">
          <TkCol lg={3}>
            <TkInput
              // onChange={onSearchChange}
              placeholder="Search by Lead Name"
              isSearchField={true}
            />
          </TkCol>

          <TkCol lg={3}>
            <TkDate
              className="form-control"
              placeholder="Select Date Range"
              options={{
                mode: "range",
                dateFormat: "d M, Y",
              }}
            />
          </TkCol>
          <TkCol lg={2}>
            <TkSelect
              placeholder="Select Status"
            />
          </TkCol>
        </TkRow>
      </TkCardBody>
    </>
  );
}
const AllActivity = ({ mounted }) => {
  const searchOnUI = isSearchonUI([]);
  const {
    data: activityData,
    isLoading: isBackLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [RQ.allActivity],
    queryFn: tkFetch.get(`${API_BASE_URL}/activty`),
    enabled: true,
  });


  console.log("activityData", activityData);
  const updateSearchText = (e) => {
    if (e.target.value.length >= minSearchLength) {
      setSearchText(e.target.value);
    } else {
      setSearchText("");
    }
  };

  const [isActivity, setIsActivity] = useState(false);

  useEffect(() => {
    setIsActivity(true);
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
                  <Link href={`${urls.activityView}/${cellProps.value}`}>
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
                  <Link href={`${urls.activityEdit}/${cellProps.value}`}>
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
        Header: "Lead Name",
        accessor: "company",
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
        accessor: "status",
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
        Header: "Organizer",
        accessor: "assigned",
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
        Header: "Date",
        accessor: "date",
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
        Header: "Phone Number",
        accessor: "phone",
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

  // const projectData = useMutation({
  //   mutationFn: tkFetch.post(
  //     `https://tstdrv1423092.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql`
  //   ),
  // });

  return (
    <>
      {isActivity ? (
        <TkRow>
          <>
            <TkCol lg={12}>
              <TkCardBody className="pt-0">
                <TkTableContainer
                  columns={columns}
                  data={activityData?.list || []}
                  loading={isBackLoading}
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

export default AllActivity;
