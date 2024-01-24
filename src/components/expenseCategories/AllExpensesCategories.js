import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, RQ, urls } from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { FormErrorBox } from "../forms/ErrorText";
import TkLoader from "../TkLoader";
import TkNoData from "../TkNoData";
import TkRow, { TkCol } from "../TkRow";
import useUserRole from "../../utils/hooks/useUserRole";
import TkAccessDenied from "../TkAccessDenied";
import Link from "next/link";
import TkTableContainer from "../TkTableContainer";
import TkCard, { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkButton from "../TkButton";
import TkIcon from "../TkIcon";
import { useRouter } from "next/router";
import { UncontrolledTooltip } from "reactstrap";

const AllExpensesCategories = ({mounted}) => {
  const isAdmin = useUserRole().isAdmin;
  const router = useRouter();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allExpenseCategories],
    queryFn: tkFetch.get(`${API_BASE_URL}/expense-category`),
    enabled: mounted,
  });

  const columns = useMemo(
    () => [
      {
        Header: "View | Edit",
        accessor: "view",
        filterable: false,
        Cell: (cellProps) => {
          return (
            //   <div className="flex-grow-1 tasks_name">{cellProps.value}</div>
            <div className="d-flex align-items-center">
              <ul className="ps-0 mb-0">
                <li className="list-inline-item">
                <Link href={`${urls.expenseCategoryView}/${cellProps.row.original.id}`}>
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
                  <Link href={`${urls.expenseCategoryEdit}/${cellProps.row.original.id}`}>
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
        Header: "Expense Category",
        accessor: "name",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Description",
        accessor: "description",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div className="table-text">
              {cellProps.value ? (
              <>
                {cellProps.value?.length > 20 ? (
                  <>
                    <span id={`toolTip${cellProps.row.original.id}`}>{cellProps.value.substring(0, 60) + "..."}</span>
                    <UncontrolledTooltip
                      target={`toolTip${cellProps.row.original.id}`}
                      autohide={false}
                      className={`custom-tooltip-style`}
                      style={{
                        backgroundColor: "#dfe6eb",
                        color: "#212529",
                        maxHeight: "200px", // Set the maximum height of the tooltip
                        overflowY: "auto", // Enable vertical scrolling if the content exceeds maxHeight
                      }}
                    >
                      {cellProps.value}
                    </UncontrolledTooltip>
                  </>
                ) : (
                  cellProps.value
                )}
              </>
            ) : (
              "—"
            )}
            </div>
          )
        },
      },
      {
        Header: "Status",
        accessor: "active",
        filterable: false,
        Cell: (cellProps) => {
          return (
          <div>
              {cellProps.value === true ? (
                <span className="badge badge-soft-success rounded-pill text-uppercase">{`Active`}</span>
              ) : (
                <span className="badge badge-soft-danger rounded-pill text-uppercase">{`Inactive`}</span>
              )}
            </div>
            );
        }
      }
    ],
    []
  );

  if (!isAdmin) {
    return <TkAccessDenied />;
  }

  return (
    <>
      <TkRow className="vertical-children-space">
        {isLoading ? (
          <TkLoader />
        ) : isError ? (
          <FormErrorBox errMessage={error.message} />
        ) : (
          <TkRow>
            <TkCol lg={12}>
            <TkCardHeader className="tk-card-header border-bottom mb-4">
              <div className="d-flex align-items-center">
                <TkCardTitle className="mb-0 flex-grow-1">
                  <h3>Expense Categories</h3>
                </TkCardTitle>
                <TkButton
                  color="primary"
                  className="btn add-btn me-1"
                  onClick={() => {
                    router.push(`${urls.expenseCategoryAdd}`);
                  }}
                >
                  <TkIcon className="ri-add-line align-bottom me-1"></TkIcon>
                  Add
                </TkButton>
              </div>
            </TkCardHeader>
            <TkCardBody className="table-padding pt-0">
              {data?.length > 0 ? (
                <TkTableContainer
                  columns={columns}
                  data={data || []}
                  isSearch={false}
                  defaultPageSize={10}
                  isFilters={true}
                  showPagination={true}
                />
              ) : (
                <TkNoData />
              )}
            </TkCardBody>
            </TkCol>
          </TkRow>
        )}
      </TkRow>
    </>
  );
};

export default AllExpensesCategories;
