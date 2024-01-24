import React, { useState, useEffect, useMemo, useCallback } from "react";
import TkInput from "../forms/TkInput";
import TkRow, { TkCol } from "../TkRow";
import TkModal, { TkModalBody, TkModalHeader } from "../TkModal";
import TkForm from "../forms/TkForm";
import TkButton from "../TkButton";
import { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkTableContainer from "../TkTableContainer";
import TkLoader from "../TkLoader";
import { TkToastSuccess } from "../TkToastContainer";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";
import {
  API_BASE_URL,
  bigInpuMaxLength,
  bigInpuMinLength,
  filterFields,
  RQ,
  searchParamName,
} from "../../utils/Constants";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import TkNoData from "../TkNoData";
import TkIcon from "../TkIcon";
import { formatDate } from "../../utils/date";
import TkSelect from "../forms/TkSelect";
import { useReducer } from "react";
import { convertToURLParamsString, isSearchonUI, searchFilterDateRangeData } from "../../utils/utilsFunctions";
import TkDate from "../forms/TkDate";
import { UncontrolledTooltip } from "reactstrap";

const schema = Yup.object({
  rejectionNote: Yup.string()
    .min(bigInpuMinLength, `Notes should have at least ${bigInpuMinLength} character.`)
    .max(bigInpuMaxLength, `Notes should have at most ${bigInpuMaxLength} characters.`)
    .required("Rejection note is required."),
}).required();

function TableToolBar({ onUserChange, onStatusChange, onDateChange }) {
  const [allUsers, setAllUsers] = useState([]);

  const resuls = useQueries({
    queries: [
      {
        queryKey: [RQ.allUsersList],
        queryFn: tkFetch.get(`${API_BASE_URL}/users/list?indexFilter=true`),
      },
    ],
  });

  const [users] = resuls;
  const { isLoading: isUserLoading, isError: isUserError, error: userError, data: userData } = users;

  useEffect(() => {
    if (isUserError) {
      console.log("userError", userError);
      TkToastError(userError?.message);
    }
  }, [isUserError, userError]);

  useEffect(() => {
    if (Array.isArray(userData)) {
      const u = userData.map((user) => ({
        value: user.id,
        label: user.name,
      }));
      setAllUsers(u);
    }
  }, [userData]);

  return (
    <>
      <TkCardBody className="approval-table-toolbar mt-3">
        <TkRow>
          <TkCol lg={3}>
            <TkSelect
              placeholder="Select Employee Name"
              loading={isUserLoading}
              options={allUsers}
              onChange={onUserChange}
            />
          </TkCol>
          {/* <TkCol lg={3}>
            <TkSelect placeholder="Select Approval Status" options={allApprovalStatus} onChange={onStatusChange} />
          </TkCol> */}
          <TkCol lg={3}>
            <TkDate
              className="form-control"
              placeholder="Select Date Range"
              options={{
                mode: "range",
                dateFormat: "d M, Y",
              }}
              // defaultValue={new Date().toDateString()}
              // value={new Date().toDateString()}
              onChange={onDateChange}
            />
          </TkCol>
        </TkRow>
      </TkCardBody>
    </>
  );
}

const AllExpenseApprovals = ({ mounted }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [isRejectPopupOpen, setIsRejectPopupOpen] = useState(false);
  const [expenseId, setExpenseId] = useState(null);
  const [checkboxSelected, setCheckboxSelected] = useState([]);
  const [singleApproveid, setSingleApproveid] = useState(null);
  const [allApprove, setAllApprove] = useState(false);
  const [approveExpenseData, setApproveExpenseData] = useState([]);
  const [urlParamsStr, setUrlParamsStr] = React.useState("");
  const [filters, updateFilters] = useReducer((state, newState) => ({ ...state, ...newState }), {
    [filterFields.approveExpense.user]: null,
    [filterFields.approveExpense.startDate]: null,
    [filterFields.approveExpense.endDate]: null,
  });

  const toggleRejectionPopup = useCallback(
    (id) => {
      setExpenseId(id);
      if (isRejectPopupOpen) {
        setIsRejectPopupOpen(false);
      } else {
        setIsRejectPopupOpen(true);
        setValue("rejectionNote", "");
      }
    },
    [isRejectPopupOpen, setValue]
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allPendingExpenses],
    queryFn: tkFetch.get(`${API_BASE_URL}/approvals/expense`),
    enabled: mounted,
  });

  const {
    data: backData,
    isLoading: isBackLoading,
    isError: isBackError,
    error: backError,
  } = useQuery({
    queryKey: [RQ.allPendingExpenses, urlParamsStr],
    queryFn: tkFetch.get(`${API_BASE_URL}/approvals/expense?${urlParamsStr}`),
    enabled: !!urlParamsStr,
  });

  useEffect(() => {
    if (data) {
      setApproveExpenseData(data);
    }
  }, [data]);

  useEffect(() => {
    let doFilter = true;

    if (Object.values(filters).every((val) => val === null || val === undefined || val === "")) {
      doFilter = false;
    }
    if (!doFilter) {
      setApproveExpenseData(data || []);
      setUrlParamsStr("");
      return;
    }
    if (isSearchonUI(data)) {
      const newData = searchFilterDateRangeData(data, null, null, filters);
      setApproveExpenseData(newData);
    } else {
      const urlParamString = convertToURLParamsString({ [searchParamName]: null, ...filters });
      setUrlParamsStr(urlParamString);
    }
  }, [filters, data]);

  const backendData = urlParamsStr.length > 0 ? backData : null;

  const updateApprovalStatus = useMutation({
    mutationFn: tkFetch.patch(`${API_BASE_URL}/approvals/expense`),
  });

  const queryClient = useQueryClient();

  const onClickApprove = useCallback(
    (id) => {
      setAllApprove(true);
      const apiData = {
        id: checkboxSelected.length ? checkboxSelected : [id],
        approved: true,
        rejected: false,
      };
      updateApprovalStatus.mutate(apiData, {
        onSuccess: (data) => {
          TkToastSuccess("Expense Approved");
          queryClient.invalidateQueries({
            queryKey: [RQ.allPendingExpenses],
          });
          setCheckboxSelected([]);
          setAllApprove(false);
        },
        onError: (error) => {
          console.log("error", error);
          setAllApprove(false);
        },
      });
    },
    [updateApprovalStatus, queryClient, checkboxSelected]
  );

  const onClickReject = (formData) => {
    const apiData = {
      // set id as expenseId if checkboxSelected is empty else set id as checkboxSelected
      id: checkboxSelected.length ? checkboxSelected : [expenseId],
      rejected: true,
      approved: false,
      rejectionNote: formData.rejectionNote,
    };
    updateApprovalStatus.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Expense Rejected");
        queryClient.invalidateQueries({
          queryKey: [RQ.allPendingExpenses],
        });
        setIsRejectPopupOpen(false);
        setCheckboxSelected([]);
      },
      onError: (error) => {
        console.log("error", error);
      },
    });
  };

  const columns = useMemo(
    () => [
      // {
      //   Header: "View",
      //   accessor: "view",
      //   filterable: false,
      //   Cell: (cellProps) => {
      //     return (
      //       //   <div className="flex-grow-1 tasks_name">{cellProps.value}</div>
      //       <div className="d-flex align-items-center">
      //         <ul className="ps-0 mb-0">
      //           <li className="list-inline-item">
      //             <Link href={`${urls.approvalExpense}/${cellProps.row.original.id}`}>
      //               <a>
      //                 <TkButton color="none">
      //                   <TkIcon className="ri-eye-fill align-bottom me-2 text-muted"></TkIcon>
      //                 </TkButton>
      //               </a>
      //             </Link>
      //           </li>
      //         </ul>
      //       </div>
      //     );
      //   },
      // },
      {
        Header: "Approve | Reject",
        accessor: "id",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <TkButton
                className="badge badge-soft-success rounded-pill text-uppercase"
                loading={singleApproveid === cellProps.value && updateApprovalStatus.isLoading}
                style={{ width: "60px", height: "30px" }}
                onClick={() => {
                  setSingleApproveid(cellProps.value);
                  onClickApprove(cellProps.value);
                }}
              >
                Approve
              </TkButton>
              <span style={{ marginLeft: "5px" }}></span>
              <TkButton
                className="badge badge-soft-danger rounded-pill text-uppercase "
                style={{ width: "60px", height: "30px" }}
                onClick={() => toggleRejectionPopup(cellProps.row.original.id)}
              >
                Reject
              </TkButton>
            </>
          );
        },
      },

      {
        Header: "Expense Category",
        accessor: "expenseCategory.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div>
              {cellProps.value?.length > 13 ? (
                <>
                  <span id={`expenseCategory${cellProps.row.index}`}>{cellProps.value.substring(0, 13) + "..."}</span>
                  <UncontrolledTooltip
                    target={`expenseCategory${cellProps.row.index}`}
                    className="custom-tooltip-style"
                    style={{ backgroundColor: "#dfe6eb", color: "#212529" }}
                  >
                    {cellProps.value}
                  </UncontrolledTooltip>
                </>
              ) : (
                cellProps.value
              )}
            </div>
          );
        },
      },

      {
        Header: "Submitted By",
        accessor: "createdBy.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div>
              {cellProps.value?.length > 13 ? (
                <>
                  <span id={`submittedBy${cellProps.row.index}`}>{cellProps.value.substring(0, 13) + "..."}</span>
                  <UncontrolledTooltip
                    target={`submittedBy${cellProps.row.index}`}
                    className="custom-tooltip-style"
                    style={{ backgroundColor: "#dfe6eb", color: "#212529" }}
                  >
                    {cellProps.value}
                  </UncontrolledTooltip>
                </>
              ) : (
                cellProps.value
              )}
            </div>
          );
        },
      },
      {
        Header: "Amount",
        accessor: "amount",
        filterable: false,
        Cell: (cellProps) => {
          return <div>{cellProps?.value} </div>;
        },
      },
      {
        Header: "Date",
        accessor: "date",
        filterable: false,
        Cell: (cellProps) => {
          return <div>{formatDate(cellProps.value)}</div>;
        },
      },

      {
        Header: "Description",
        accessor: "memo",
        filterable: false,
        Cell: (cellProps) => {
          return (
            // <div>
            //   {cellProps.value ? (
            //     <>
            //       {cellProps.value?.length > 20 ? (
            //         <>
            //           <span
            //             id={`toolTip${cellProps.row.original.id}`}
            //             onMouseEnter={handleMouseEnter}
            //             onMouseLeave={handleMouseLeave}
            //           >
            //             {cellProps.value.substring(0, 20) + "..."}
            //           </span>
            //           <UncontrolledTooltip
            //             target={`toolTip${cellProps.row.original.id}`}
            //             delay={{ show: 250, hide: 400 }}
            //             trigger="hover "
            //             disable={!isHovering}
            //             className={`custom-tooltip-style${isHovering ? ' active' : ''}`}
            //             style={{ backgroundColor: "#dfe6eb", color: "#212529", maxHeight: "200px", overflowY: "auto" }}
            //           >
            //             {cellProps.value}
            //           </UncontrolledTooltip>
            //         </>
            //       ) : (
            //         cellProps.value
            //       )}
            //     </>
            //   ) : (
            //     "—"

            //   )}
            // </div>

            <div>
              {cellProps.value ? (
                <>
                  {cellProps.value?.length > 20 ? (
                    <>
                      <span id={`description${cellProps.row.index}`}>{cellProps.value.substring(0, 20) + "..."}</span>
                      <UncontrolledTooltip
                        target={`description${cellProps.row.index}`}
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
          );
        },
      },
    ],
    [toggleRejectionPopup, singleApproveid, updateApprovalStatus.isLoading, onClickApprove]
  );

  const selectedRowsId = useCallback((rows) => {
    const ids = rows.map((row) => row.original.id);
    setCheckboxSelected(ids);
  }, []);

  return (
    <>
      {isLoading ? (
        <TkLoader />
      ) : isError ? (
        <FormErrorBox errMessage={error.message} />
      ) : data.length > 0 ? (
        <div className="row">
          <TkCol lg={12}>
            {/* <TkCard id="tasksList"> */}
            <TkCardHeader className="tk-card-header mt-3">
              <div className="d-flex align-items-center">
                <TkCardTitle className="mb-0 flex-grow-1">
                  <h3>Pending Expenses</h3>
                </TkCardTitle>
                <div className="flex-shrink-0">
                  {checkboxSelected.length > 0 ? (
                    <>
                      <TkButton className="me-2" color="secondary" onClick={toggleRejectionPopup}>
                        <TkIcon className="ri-close-circle-line align-bottom me-1"></TkIcon> Reject All
                      </TkButton>
                      <TkButton color="primary" loading={allApprove} onClick={onClickApprove}>
                        <TkIcon className="ri-check-double-line align-bottom me-1"></TkIcon> Approve All
                      </TkButton>
                    </>
                  ) : null}
                </div>
              </div>
            </TkCardHeader>
            {updateApprovalStatus.isError ? <FormErrorBox errMessage={updateApprovalStatus.error.message} /> : null}
            <TkCardBody className="pt-0">
              {isBackError ? (
                <FormErrorBox errMessage={backError.message} />
              ) : (
                <TkTableContainer
                  columns={columns}
                  data={backendData || approveExpenseData}
                  Toolbar={
                    <TableToolBar
                      onUserChange={(item) => {
                        updateFilters({
                          [filterFields.approveTimeSheet.user]: item ? item.value : null,
                        });
                      }}
                      // onStatusChange={(item) => {
                      //   updateFilters({
                      //     [filterFields.approveTimeSheet.status]: item ? item.value : null,
                      //   });
                      // }}
                      onDateChange={(dates) => {
                        updateFilters({
                          [filterFields.approveTimeSheet.startDate]: dates ? dates[0] : null,
                        });
                        updateFilters({
                          [filterFields.approveTimeSheet.endDate]: dates ? dates[1] : null,
                        });
                      }}
                    />
                  }
                  loading={urlParamsStr.length > 0 && isBackLoading}
                  defaultPageSize={10}
                  customPageSize={true}
                  showPagination={true}
                  rowSelection={true} // pass it true to enable row selection
                  onRowSelection={selectedRowsId}
                  showSelectedRowCount={true} // pass it true to show the selected row count
                />
              )}
            </TkCardBody>
            {/* </TkCard> */}
          </TkCol>
        </div>
      ) : (
        <TkCol lg={12} className="mt-3">
          <TkNoData />
        </TkCol>
      )}

      {/*Popup for reject and reject all button*/}
      <TkModal
        isOpen={isRejectPopupOpen}
        toggle={toggleRejectionPopup}
        centered
        size="lg"
        className="border-0 timesheet-task-modal"
        modalClassName="modal fade zoomIn"
      >
        <TkModalHeader className="p-3 bg-soft-info" toggle={toggleRejectionPopup}>
          {"Enter Rejection Note"}
        </TkModalHeader>
        <TkForm onSubmit={handleSubmit(onClickReject)}>
          <TkModalBody className="modal-body">
            <TkRow className="g-3">
              <TkCol lg={12}>
                <div>
                  <TkInput
                    {...register("rejectionNote")}
                    id="rejectionNote"
                    name="rejectionNote"
                    type="textarea"
                    labelName="Rejection Note"
                    placeholder="Enter Rejection Note"
                    requiredStarOnLabel={true}
                  />
                  {errors.rejectionNote && <FormErrorText>{errors.rejectionNote.message}</FormErrorText>}
                </div>
              </TkCol>
            </TkRow>
          </TkModalBody>
          <div className="modal-footer">
            <div className="hstack gap-2 justify-content-end">
              <TkButton
                type="button"
                color="secondary"
                onClick={() => {
                  setIsRejectPopupOpen(false);
                }}
                className="btn-light"
                disabled={updateApprovalStatus.isLoading}
              >
                Cancel
              </TkButton>
              <TkButton type="submit" color="primary" loading={updateApprovalStatus.isLoading}>
                Reject
              </TkButton>
            </div>
          </div>
        </TkForm>
      </TkModal>
    </>
  );
};

export default AllExpenseApprovals;
