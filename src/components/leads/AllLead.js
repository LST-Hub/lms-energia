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
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";

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
        </TkRow>
      </TkCardBody>
    </>
  );
}

const AllLead = ({ mounted }) => {
  const searchOnUI = isSearchonUI([]);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);

  // get local sotorage for id 


 
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedRole = window.localStorage.getItem('role');
      setRole(storedRole);
      // console.log('storedRole', storedRole);
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedId = window.localStorage.getItem('internalid');
      setUserId(storedId);
      console.log('storedId', storedId);
    }
  }, []);
 

  
  const {
    data: leadData,
    isLoading: isBackLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [RQ.allLeads],
    // queryFn: tkFetch.get(`${API_BASE_URL}/lead`),
    // queryFn: tkFetch.get(`${API_BASE_URL}/lead?role=${role}`),
    queryFn: tkFetch.get(`${API_BASE_URL}/lead${role ? `?role=${role}` : ''}`),
    enabled: true,
  });
  // const results = useQueries({
  //   queries: [
  //     {
  //       queryKey: [RQ.allPrimarySubsidiary],
  //       queryFn: tkFetch.get(`${API_BASE_URL}/salesmanager-roles`),
  //     },

  //     {
  //       queryKey: [RQ.allEnquiryBy],
  //       queryFn: tkFetch.get(`${API_BASE_URL}/salesrepresentative-salessupportrole`),
  //     },
      
  //   ],
  // });

  const {
    data: salesManagerRolesData,
    isLoading: isSalesManagerRolesLoading,
    isError: issalesManagerRolesError,
    error: salesManagerError,
  } = useQuery({
    queryKey: [RQ.salesManager],
    queryFn: tkFetch.get(`${API_BASE_URL}/salesmanager-roles?id=${userId}`),
    enabled: !!userId
  });
  console.log('salesManagerRolesData', salesManagerRolesData);

  const {
    data: salesSupportRolesData,
    isLoading: isSalesSupportRolesLoading,
    isError: issalesSupportRolesError,
    error: salesSupportError,
  } = useQuery({
    queryKey: [RQ.salesSupport],
    queryFn: tkFetch.get(
      `${API_BASE_URL}/salesrepresentative-salessupportrole?id=${userId}`
    ),
    enabled: !!userId

  });
  

  const updateSearchText = (e) => {
    if (e.target.value.length >= minSearchLength) {
      setSearchText(e.target.value);
    } else {
      setSearchText("");
    }
  };

  const [isLead, setIsLead] = useState(false);

  useEffect(() => {
    setIsLead(true);
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: "View | Edit ",
        accessor: "id",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div className="d-flex align-items-center">
              <ul className="ps-0 mb-0">
                <li className="list-inline-item">
                  <Link href={`${urls.leadView}/${cellProps.value}`}>
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
                  <Link href={`${urls.leadEdit}/${cellProps.value}`}>
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
        Header: "Lead Channel",
        accessor: "custentity_lms_channel_lead_name",
        Cell: (cellProps) => {
          // console.log("cellProps", cellProps);
          return (
            <>
              <div className="table-text">
                <span>
                  {cellProps.value || <span> — </span>}
                </span>
                {/* {cellProps.value || <span> — </span>} */}
              </div>
            </>
          );
        },
      },
      {
        Header: "Name",
        accessor: "companyname",
        Cell: (cellProps) => {
          return (
            <>
              <div className="table-text">
                {cellProps.value}
              </div>
            </>
          );
        },
      },

      {
        Header: "Phone",
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
      {
        Header: "Email",
        accessor: "email",
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
        Header: "Client Type",
        accessor: "custentity_lms_client_type_name",
        Cell: (cellProps) => {
          return (
            <>
              <div className="table-text">
                {cellProps.value }
              </div>
            </>
          );
        },
      },
      {
        Header: "Enquiry By",
        accessor: "custentity_lms_enquiryby_name",
        Cell: (cellProps) => {
          return (
            <>
              <div className="table-text">
                {cellProps.value}
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
      {isLead ? (
        <TkRow>
          <>
            <TkCol lg={12}>
              <TkCardBody className="pt-0">
                <TkTableContainer
                  columns={columns}
                  data={leadData?.items || []}
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

export default AllLead;
