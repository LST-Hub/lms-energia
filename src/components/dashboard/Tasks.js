import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { TkCol } from "../TkRow";
import { TkCardHeader, TkCardBody, TkCardTitle } from "../TkCard";
import TkTableContainer from "../TkTableContainer";
import { allTask } from "../../test-data/task-widgets";
import * as Yup from "yup";
import { useFormik } from "formik";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL, RQ, urls } from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { useQuery } from "@tanstack/react-query";
import { convertSecToTime } from "../../utils/time";
import { formatDate } from "../../utils/date";
import { UncontrolledTooltip } from "reactstrap";

const DashboardTasks = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [task, setTask] = useState([]);
  const [taskList, setTaskList] = useState(allTask);
  const [modal, setModal] = useState(false);

  const toggle = useCallback(() => {
    if (modal) {
      // console.log("modal false");
      setModal(false);
      setTask(null);
    } else {
      // console.log("modal true");
      setModal(true);
      setDate(defaultdate());
    }
  }, [modal]);

  // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      taskId: (task && task.taskId) || "",
      project: (task && task.project) || "",
      task: (task && task.task) || "",
      creater: (task && task.creater) || "",
      dueDate: (task && task.dueDate) || "",
      status: (task && task.status) || "New",
      priority: (task && task.priority) || "High",
      subItem: (task && task.subItem) || [],
    },
    validationSchema: Yup.object({
      //TODO : validations are not showing errors in form fields, check that
      taskId: Yup.string().required("Please Enter Task Name"),
      // project: Yup.string().required("Please Enter Project Name"),
      // task: Yup.string().required("Please Enter Your Task"),
      // creater: Yup.string().required("Please Enter Creater Name"),
      // dueDate: Yup.string().required("Please Enter Due Date"),
      // status: Yup.string().required("Please Enter Status"),
      // priority: Yup.string().required("Please Enter Priority"),
      // subItem: Yup.array().required("Please Enter"),
    }),
    onSubmit: (values) => {
      console.log("toggle called in submit");
      if (isEdit) {
        const updatedTask = {
          _id: task ? task._id : 0,
          taskId: values.taskId,
          project: values.project,
          task: values.task,
          creater: values.creater,
          dueDate: date,
          status: values.status,
          priority: values.priority,
          subItem: values.subItem,
        };
        // update customer
        // dispatch(updateTask(updatedTask));
        validation.resetForm();
      } else {
        const newTask = {
          _id: Math.floor(Math.random() * 1000).toString(),
          taskId: values["taskId"],
          project: values["project"],
          task: values["task"],
          creater: values["creater"],
          dueDate: date,
          status: values["status"],
          priority: values["priority"],
          subItem: values["subItem"],
        };
        // save new customer
        // dispatch(addNewTask(newTask));
        validation.resetForm();
      }
      toggle();
    },
  });

  // Add Data
  const handleTaskClicks = () => {
    setTask("");
    setIsEdit(false);
    toggle();
  };

  // useEffect(() => {
  //   if (!isEmpty(taskList)) setTaskList(taskList);
  // }, [taskList]);

  // useEffect(() => {
  //   if (taskList && !taskList.length) {
  //     dispatch(getTaskList());
  //   }
  // }, [dispatch, taskList]);

  // useEffect(() => {
  //   setTaskList(taskList);
  // }, [taskList]);

  useEffect(() => {
    if (Array.isArray(taskList) && taskList.length) {
      setTaskList(taskList);
      setIsEdit(false);
    }
  }, [taskList]);

  // Node API
  // useEffect(() => {
  //   if (isTaskCreated) {
  //     setTask(null);
  //     dispatch(getTaskList());
  //   }
  // }, [
  //   dispatch,
  //   isTaskCreated,
  // ]);

  // Checked All
  //TODO: here check all checkboxes are checked with javascript and not with react , it may produce problem. See if problem occures and fix it
  const checkedAll = () => {
    const checkall = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".taskCheckBox");

    if (checkall.checked) {
      ele.forEach((ele) => {
        ele.checked = true;
      });
    } else {
      ele.forEach((ele) => {
        ele.checked = false;
      });
    }
  };

  // Delete Multiple
  //TODO: same as above

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allTasks],
    queryFn: tkFetch.get(`${API_BASE_URL}/dashboard/task`),
    // enabled: Number(accessLevel) >= perAccessIds.view,
  });

  const deleteMultiple = () => {
    const ele = document.querySelectorAll(".taskCheckBox:checked");
    const checkall = document.getElementById("checkBoxAll");
    //TODO : delete all selected tasks
    // ele.forEach((element) => {
    //   dispatch(deleteTask(element.value));
    // });
    checkall.checked = false;
  };

  const columns = useMemo(
    () => [
      {
        Header: "Task Name",
        accessor: "name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div className="d-flex">
                <Link href={`${urls.taskView}/${cellProps.row.original.id}`}>
                  <a className="flex-grow-1 fw-medium table-link text-primary">
                    <div className="flex-grow-1 tasks_name">
                      {cellProps.value.length > 13 ? (
                        <>
                          <span id={`task${cellProps.row.index}`}>{cellProps.value.substring(0, 13) + "..."}</span>
                          <UncontrolledTooltip
                            target={`task${cellProps.row.index}`}
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
                  </a>
                </Link>
              </div>
            </>
          );
        },
      },
      {
        Header: "Project",
        accessor: "project.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div className="table-text">
              {cellProps.value?.length > 13 ? (
                <>
                  <span id={`project${cellProps.row.index}`}>
                    {cellProps.value.substring(0, 13) + "..."}
                  </span>
                  <UncontrolledTooltip
                    target={`project${cellProps.row.index}`}
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
        Header: "Start Date",
        accessor: "startDate",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div className="table-text">
                {cellProps.value === null ? <span> — </span> : <span>{formatDate(cellProps.value)}</span>}
              </div>
            </>
          );
        },
      },

      {
        Header: "Estimated Time",
        accessor: "estimatedTime",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div className="table-text">
              <span>{convertSecToTime(cellProps.value)}</span>
            </div>
          );
        },
      },
      {
        Header: "Estimated End Date",
        accessor: "estimatedEndDate",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div className="table-text">
                {cellProps.value === null ? <span> — </span> : <span>{formatDate(cellProps.value)}</span>}
              </div>
            </>
          );
        },
      },
    ],
    []
  );

  const defaultdate = () => {
    let d = new Date(),
      months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return (d.getDate() + " " + months[d.getMonth()] + ", " + d.getFullYear()).toString();
  };

  const [date, setDate] = useState(defaultdate());
  return (
    <>
      <div className="row">
        <TkCol lg={12}>
          {/* <TkCard id="tasksList"> */}
          <TkCardHeader className="tk-card-header">
            <div className="d-flex align-items-center">
              {/* <TkCardTitle tag="h5" className="mb-0 flex-grow-1">Tasks</TkCardTitle> */}
              <TkCardTitle className="mb-0 flex-grow-1">
                <h3>Tasks</h3>{" "}
              </TkCardTitle>
              {/* <div className="flex-shrink-0"> */}
              {/* <Link href="#">
                  <div onClick={onClickExportClient}>
                    <a className="btn btn-primary add-btn me-1">
                      <TkIcon className="ri-download-2-line align-bottom me-1"></TkIcon> Export
                    </a>
                    </div>
                  </Link> */}
              {/* <button className="btn btn-soft-danger" onClick={() => setDeleteModalMulti(true)}>
                    <TkIcon className="ri-delete-bin-2-line"></TkIcon>
                  </button> */}
              {/* </div> */}
            </div>
          </TkCardHeader>
          <TkCardBody className="pt-0">
            <TkTableContainer
              columns={columns}
              data={data || []}
              isSearch={true}
              noDataMessage="No data found"
              showPagination={true}
              defaultPageSize={10}
              handleTaskClick={handleTaskClicks}
              isFilters={true}
              loading={isLoading}
              customPageSize={true}
            />

            {/* <ToastContainer closeButton={false} /> */}
          </TkCardBody>
          {/* </TkCard> */}
        </TkCol>
      </div>
    </>
  );
};

export default DashboardTasks;
