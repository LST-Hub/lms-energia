import React, { useState } from "react";
import { formatDate } from "../../utils/date";
import TkRow, { TkCol } from "../TkRow";
import {
  API_BASE_URL,
  filterFields,
  minSearchLength,
  RQ,
  searchParamName,
  serachFields,
  urls,
} from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TkLoader from "../TkLoader";
import { FormErrorBox } from "../forms/ErrorText";
import TkNoData from "../TkNoData";
import TkButton, { TkButtonGroup } from "../TkButton";
import { timeEntryStatus } from "../../../lib/constants";
import { TkToastSuccess } from "../TkToastContainer";
import TopBar from "./TopBar";
import TkContainer from "../TkContainer";
import { useReducer } from "react";
import { useEffect } from "react";
import {
  convertToURLParamsString,
  isSearchonUI,
  searchAndFilterData,
} from "../../utils/utilsFunctions";
import TkTableContainer from "../TkTableContainer";
import Link from "next/link";
import { useMemo } from "react";
import { TkCardBody } from "../TkCard";
import TkIcon from "../TkIcon";
import { UncontrolledTooltip } from "reactstrap";

const AllExpenses = () => {
  const [urlParamsStr, setUrlParamsStr] = React.useState("");
  const [expenseData, setExpenseData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filters, updateFilters] = useReducer((state, newState) => ({ ...state, ...newState }), {
    [filterFields.expense.expenseCategory]: null, // keep the initial values to null for filters
    [filterFields.expense.status]: null,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allExpenses],
    queryFn: tkFetch.get(`${API_BASE_URL}/expense`),
  });

  // this query to fetch all projects, while backend serach/filtering
  const {
    data: backData,
    isLoading: backIsLoading,
    isError: backIsError,
    error: backError,
  } = useQuery({
    queryKey: [RQ.allProjects, urlParamsStr],
    queryFn: tkFetch.get(`${API_BASE_URL}/expense${urlParamsStr ? `?${urlParamsStr}` : ""}`),
    enabled: !!urlParamsStr,
  });

  useEffect(() => {
    if (data) {
      setExpenseData(data);
    }
  }, [data]);

  useEffect(() => {
    let doFilter = true;

    if (Object.values(filters).every((val) => val === null || val === undefined || val === "")) {
      doFilter = false;
    }
    if (!doFilter) {
      setExpenseData(data || []);
      setUrlParamsStr("");
      return;
    }
    if (isSearchonUI(data)) {
      const newData = searchAndFilterData(data, searchText, serachFields.expense, filters);
      setExpenseData(newData);
    } else {
      const urlParamString = convertToURLParamsString({ [searchParamName]: searchText, ...filters });
      setUrlParamsStr(urlParamString);
    }
  }, [filters, searchText, data, isLoading, backIsLoading]);

  const backendData = urlParamsStr.length > 0 ? backData : null;
  useEffect(() => {
    if (backendData) {
      setExpenseData(backendData);
    }
  }, [backendData]);
  const updateSearchText = (e) => {
    if (e.target.value.length >= minSearchLength) {
      setSearchText(e.target.value);
    } else {
      setSearchText("");
    }
  };

  // const allId = data?.map((item) => item.id);
  const queryClient = useQueryClient();

  const sendForApproval = useMutation({
    mutationFn: tkFetch.patch(`${API_BASE_URL}/expense`),
  });

  const onClickSubmitForApproval = () => {
    const allId = filteredData?.map((item) => item.id);
    const apiData = {
      expenseIds: allId,
      submittedForApproval: true,
      status: timeEntryStatus.Pending,
    };
    sendForApproval.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Expense Submitted For Approval");
        queryClient.invalidateQueries({ queryKey: [RQ.allExpenses] });
      },
      onError: (error) => {
        console.log("error", error);
      },
    });
  };

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
                  <Link href={`${urls.expenseView}/${cellProps.value}`}>
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
                  <Link href={`${urls.expenseEdit}/${cellProps.value}`}>
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
        accessor: "expenseCategory.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
             <div className="table-text">{cellProps.value}</div>
            </>
          );
        },
      },
      {
        Header: "Date",
        accessor: "date",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{formatDate(cellProps.value)}</div>;
        },
      },
      {
        Header: "Amount",
        accessor: "amount",
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
        Header: "Approved By",
        accessor: "approvedBy.name",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value ? cellProps.value : "—"}</div>;
        },
      },
    ],
    []
  );

  return (
    <>
      <TopBar
        onExpenseCategoryChange={(item) => {
          updateFilters({
            [filterFields.expense.expenseCategory]: item ? item.value : null,
          });
        }}
        onExpenseStatusChange={(item) => {
          updateFilters({
            [filterFields.expense.status]: item ? item.value : null,
          });
        }}
      />
      <TkContainer>
        <TkRow className="vertical-children-space">
          <div>
            {isLoading ? (
              <TkLoader />
            ) : isError ? (
              <FormErrorBox errMessage={error?.message} />
            ) : expenseData?.length > 0 ? (
              // <TkRow className="vertical-children-space">
              //   {expenseData?.map((item) => (
              //     <TkCol key={item.id} xs={6}>
              //       <ExpenseRow expenseName={item.expenseCategory.name} date={formatDate(item.date)} id={item.id} />
              //     </TkCol>
              //   ))}
              // </TkRow>
              <TkCardBody className="table-padding pt-0">
                <TkTableContainer
                  columns={columns}
                  data={expenseData}
                  defaultPageSize={10}
                  customPageSize={true}
                  showPagination={true}
                  loading={urlParamsStr.length > 0 && backIsLoading}
                />
              </TkCardBody>
            ) : (
              <TkCol lg={12}>
                <TkNoData />
              </TkCol>
            )}
          </div>
        </TkRow>
      </TkContainer>
    </>
  );
};

export default AllExpenses;
