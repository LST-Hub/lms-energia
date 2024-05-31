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
  const [isSalesManager, setIsSalesManager] = useState(false);
  const [leadData, setLeadData] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const storedRole = window.localStorage.getItem("role");
      setRole(storedRole);
      if (storedRole === "2") {
        setIsSalesManager(true);
      } else {
        setIsSalesManager(false);
      }
    }
    if (typeof window !== "undefined" && window.localStorage) {
      const storedId = window.localStorage.getItem("internalid");
      setUserId(storedId);
      console.log("storedId", storedId);
    }
  }, []);

  const {
    data: allLeadData,
    isLoading: isAllLeadLoading,
    isError: isAllLeadError,
    error: allLeadError,
  } = useQuery({
    queryKey: [RQ.allLeads],
    queryFn: tkFetch.get(`${API_BASE_URL}/lead`),
    enabled: mounted,
  });

  const {
    data: salesManagerRolesData,
    isLoading: isSalesManagerRolesLoading,
    isError: issalesManagerRolesError,
    error: salesManagerError,
  } = useQuery({
    queryKey: [RQ.salesManager],
    queryFn: tkFetch.get(
      `${API_BASE_URL}/salesmanager-roles?userId=${userId}&roleId=${role}`
    ),
    enabled: !!userId && !!role && isSalesManager,
  });

  const {
    data: salesSupportRolesData,
    isLoading: isSalesSupportRolesLoading,
    isError: issalesSupportRolesError,
    error: salesSupportError,
  } = useQuery({
    queryKey: [RQ.salesSupport],
    queryFn: tkFetch.get(
      `${API_BASE_URL}/salesrepresentative-salessupportrole?userId=${userId}`
    ),
    enabled: !!role && !isSalesManager,
  });

  // const {
  //   data: salesSuppRolesData,
  //   isLoading: isSalesSuppRolesLoading,
  //   isError: issalesSuppRolesError,
  //   error: salesSuppError,
  // } = useQuery({
  //   queryKey: [RQ.salesSupport],
  //   queryFn: tkFetch.get(
  //     `${API_BASE_URL}/salesrepresentative-sales-support?userId=${userId}`
  //   ),
  //   enabled: !!role && !isSalesManager,
  // });

  const updateSearchText = (e) => {
    if (e.target.value.length >= minSearchLength) {
      setSearchText(e.target.value);
    } else {
      setSearchText("");
    }
  };
  useEffect(() => {
    if (isSalesManager) {
      setLeadData(salesManagerRolesData);
    } else {
      setLeadData(salesSupportRolesData);
    }
  }, [salesManagerRolesData, salesSupportRolesData, isSalesManager]);

  // useEffect(() => {
  //   if (isSalesManager && salesManagerRolesData) {
  //     setLeadData(salesManagerRolesData);
  //   } else if (!isSalesManager && salesSuppRolesData) {
  //     setLeadData(salesSuppRolesData);
  //   } else if (!isSalesManager && salesSupportRolesData) {
  //     setLeadData(salesSupportRolesData);
  //   } else {
  //     setLeadData([]);
  //   }
  // }, [
  //   salesSuppRolesData,
  //   isSalesManager,
  //   salesSupportRolesData,
  //   salesManagerRolesData,
  // ]);

  // useEffect(() => {
  //   if (isSalesManager) {
  //     setLeadData(salesManagerRolesData);
  //   } else if (!isSalesManager) {
  //     setLeadData(salesSuppRolesData);
  //   } else if (!isSalesManager) {
  //     setLeadData(salesSupportRolesData);
  //   }
  // }, [
  //   salesSuppRolesData,
  //   isSalesManager,
  //   salesSupportRolesData,
  //   salesManagerRolesData,
  // ]);

  // useEffect(() => {
  //   if (isAllLeadLoading) {
  //     setIsDataLoading(true);
  //   } else {
  //     setIsDataLoading(false);
  //   }
  // }, [isAllLeadLoading]);

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
        accessor: "custentity_lms_channel_lead",
        Cell: (cellProps) => {
          // console.log("cellProps", cellProps.list[0].values.custentity_lms_channel_lead_name[0].text);
          return (
            <>
              <div className="table-text">
                <span>{cellProps.value}</span>
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
              <div className="table-text">{cellProps.value}</div>
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
        accessor: "custentity_lms_client_type",
        Cell: (cellProps) => {
          return (
            <>
              <div className="table-text">{cellProps.value}</div>
            </>
          );
        },
      },
      {
        Header: "Enquiry By",
        accessor: "custentity_lms_enquiryby",
        Cell: (cellProps) => {
          return (
            <>
              <div className="table-text">{cellProps.value}</div>
            </>
          );
        },
      },
      {
        Header: "Created By",
        accessor: "custentity_lms_createdby",
        Cell: (cellProps) => {
          return (
            <>
              <div className="table-text">{cellProps.value}</div>
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
                  data={leadData || []}
                  // loading={isAllLeadLoading}
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
