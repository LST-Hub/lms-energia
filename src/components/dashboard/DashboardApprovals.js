import React, { useEffect, useContext } from "react";
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";
import TkRow, { TkCol } from "../TkRow";
import { TkCardHeader, TkCardBody, TkCardTitle } from "../TkCard";
import TkMatrixTableContainer from "../TkMatrixTableContainer";
import { useQueries } from "@tanstack/react-query";
import { API_BASE_URL, RQ, approvalsTab, perDefinedEmployeeRoleID, urls } from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { TkToastError } from "../TkToastContainer";
import { AuthContext } from "../../utils/Contexts";

const MatrixTable = () => {
  // const sessionData = useSessionData();
  const sessionData = useContext(AuthContext);
  const role = sessionData.user.roleId;

  const result = useQueries({
    queries: [
      {
        queryKey: [RQ.timsheetCount],
        queryFn: tkFetch.get(`${API_BASE_URL}/dashboard/timesheetCount`),
      },
      {
        queryKey: [RQ.todaysTaskCount],
        queryFn: tkFetch.get(`${API_BASE_URL}/dashboard/todaysTaskCount`),
      },
      {
        queryKey: [RQ.expenseCount],
        queryFn: tkFetch.get(`${API_BASE_URL}/dashboard/expenseCount`),
      },
    ],
  });

  const [timesheet, todaysTask, expense] = result;
  const {
    data: timesheetData,
    isLoading: IsTimesheetLoading,
    isError: IsTimesheetError,
    error: timesheetError,
  } = timesheet;
  const {
    data: todaysTaskData,
    isLoading: IsTodaysTaskLoading,
    isError: IsTodaysTaskError,
    error: todaysTaskError,
  } = todaysTask;
  const { data: expenseData, isLoading: IsExpenseLoading, isError: IsExpenseError, error: expenseError } = expense;

  useEffect(() => {
    if (IsTimesheetError) {
      console.log("timesheetError", timesheetError);
      TkToastError("Error while getting timesheet count");
    }
    if (IsTodaysTaskError) {
      console.log("todaysTaskError", todaysTaskError);
      TkToastError("Error while getting todays task count");
    }
    if (IsExpenseError) {
      console.log("expenseError", expenseError);
      TkToastError("Error while getting expense count");
    }
  }, [IsTimesheetError, IsTodaysTaskError, IsExpenseError, timesheetError, todaysTaskError, expenseError]);

  const columns = ["Pending", "Rejected"];
  const rows = [
    {
      rowHeader: <div className="table-text">{"Timesheet"}</div>,

      Pending: (
        <>
          {role === perDefinedEmployeeRoleID ? (
            <div className="avatar-xs table-text d-flex justify-content-center align-items-center cursor-pointer text-primary">
              {timesheetData ? timesheetData[1].pending : 0}
            </div>
          ) : (
            <Link href={`${urls.approvals}?tab=${approvalsTab.timesheet}`}>
              <div className="avatar-xs table-text d-flex justify-content-center align-items-center cursor-pointer text-primary">
                {timesheetData ? timesheetData[1].pending : 0}
              </div>
            </Link>
          )}
        </>
      ),
      Rejected: (
        <div className="avatar-xs table-text d-flex justify-content-center align-items-center cursor-pointer">
          {timesheetData ? timesheetData[2].rejected : 0}
        </div>
      ),
    },

    {
      rowHeader: <div className="table-text">{"Expense"}</div>,

      Pending: (
        <>
          {role === perDefinedEmployeeRoleID ? (
            <div className="avatar-xs table-text d-flex justify-content-center align-items-center cursor-pointer text-primary">
              {expenseData ? expenseData[1].pending : 0}
            </div>
          ) : (
            <Link href={`${urls.approvals}?tab=${approvalsTab.expense}`}>
              <div className="avatar-xs table-text d-flex justify-content-center align-items-center cursor-pointer text-primary">
                {expenseData ? expenseData[1].pending : 0}
              </div>
            </Link>
          )}
        </>
      ),
      Rejected: (
        <div className="avatar-xs table-text d-flex justify-content-center align-items-center cursor-pointer">
          {expenseData ? expenseData[2].rejected : 0}
        </div>
      ),
    },
  ];

  sessionData?.todaysTaskEnabled &&
    // push the todays task data to the 1st index of the rows array
    rows.splice(1, 0, {
      rowHeader: <div className="table-text">{"Today's Task"}</div>,
      Pending: (
        <>
          {role === perDefinedEmployeeRoleID ? (
            <div className="avatar-xs table-text d-flex justify-content-center align-items-center cursor-pointer text-primary">
              {todaysTaskData ? todaysTaskData[1].pending : 0}
            </div>
          ) : (
            <Link href={`${urls.approvals}?tab=${approvalsTab.todayTask}`}>
              <div className="avatar-xs table-text d-flex justify-content-center align-items-center cursor-pointer text-primary">
                {todaysTaskData ? todaysTaskData[1].pending : 0}
              </div>
            </Link>
          )}
        </>
      ),
      Rejected: (
        <div className="avatar-xs table-text d-flex justify-content-center align-items-center cursor-pointer">
          {todaysTaskData ? todaysTaskData[2].rejected : 0}
        </div>
      ),
    });

  return (
    <>
      <TkRow>
        <TkCol lg={12}>
          {/* <TkCard id="tasksList"> */}
          <TkCardHeader className="tk-card-header">
            <div className="d-flex align-items-center">
              {/* <TkCardTitle tag="h5" className=" mb-0 flex-grow-1">Clients</TkCardTitle> */}
              <TkCardTitle className="mb-0 flex-grow-1">
                <h3>Approvals</h3>{" "}
              </TkCardTitle>
              {/* <div className="d-flex flex-shrink-0"> */}
              {/* <Link href="#"> */}
              {/* <div onClick={onClickExportClient}>
                      <a className="btn btn-primary add-btn me-1">
                        <TkIcon className="ri-download-2-line align-bottom me-1"></TkIcon> Export
                      </a>
                    </div> */}
              {/* </Link> */}
              {/* </div> */}
            </div>
          </TkCardHeader>
          <TkCardBody className="pt-0">
            <TkMatrixTableContainer columns={columns} rows={rows} />

            {/* <ToastContainer closeButton={false} /> */}
          </TkCardBody>
          {/* </TkCard> */}
        </TkCol>
      </TkRow>
    </>
  );
};

export default MatrixTable;
