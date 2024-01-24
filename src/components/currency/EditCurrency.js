import React, { useState, useEffect, useMemo, useCallback } from "react";

import { allRoles } from "../../test-data/roles";

// Formik
import * as Yup from "yup";
// import { useFormik } from "formik";

import "react-toastify/dist/ReactToastify.css";

import TkRow, { TkCol } from "../TkRow";
import TkInput from "../forms/TkInput";
import TkButton from "../TkButton";
import TkCard, { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkEditCardHeader from "../TkEditCardHeader";
import TkForm from "../forms/TkForm";

import { TkToastInfo } from "../TkToastContainer";

const EditCurrency = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [task, setTask] = useState([]);
  //   TODO: rename the variables
  const [taskList, setTaskList] = useState(allRoles);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggle = useCallback(() => {
    if (isModalOpen) {
      // console.log("modal false");
      setIsModalOpen(false);
      //   setTask(null);
    } else {
      // console.log("modal true");
      setIsModalOpen(true);
      //   setDate(defaultdate());
    }
  }, [isModalOpen]);

  // validation
  // const validation = useFormik({
  //   // enableReinitialize : use this flag when initial values needs to be changed
  //   enableReinitialize: true,

  //   initialValues: {
  //     taskId: (task && task.taskId) || "",
  //     project: (task && task.project) || "",
  //     task: (task && task.task) || "",
  //     creater: (task && task.creater) || "",
  //     dueDate: (task && task.dueDate) || "",
  //     status: (task && task.status) || "New",
  //     priority: (task && task.priority) || "High",
  //     subItem: (task && task.subItem) || [],
  //   },
  //   validationSchema: Yup.object({
  //     //TODO : validations are not showing errors in form fields, check that
  //     taskId: Yup.string().required("Please Enter Task Name"),
  //   }),
  //   onSubmit: (values) => {
  //     if (isEdit) {
  //       const updatedTask = {
  //         _id: task ? task._id : 0,
  //         taskId: values.taskId,
  //         project: values.project,
  //         task: values.task,
  //         creater: values.creater,
  //         dueDate: date,
  //         status: values.status,
  //         priority: values.priority,
  //         subItem: values.subItem,
  //       };
  //       // update customer
  //       // dispatch(updateTask(updatedTask));
  //       validation.resetForm();
  //     } else {
  //       const newTask = {
  //         _id: Math.floor(Math.random() * 1000).toString(),
  //         taskId: values["taskId"],
  //         project: values["project"],
  //         task: values["task"],
  //         creater: values["creater"],
  //         dueDate: date,
  //         status: values["status"],
  //         priority: values["priority"],
  //         subItem: values["subItem"],
  //       };
  //       // save new customer
  //       // dispatch(addNewTask(newTask));
  //       validation.resetForm();
  //     }
  //     toggle();
  //   },
  // });

  useEffect(() => {
    if (Array.isArray(taskList) && taskList.length) {
      setTaskList(taskList);
      setIsEdit(false);
    }
  }, [taskList]);

  const defaultdate = () => {
    let d = new Date(),
      months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return (d.getDate() + " " + months[d.getMonth()] + ", " + d.getFullYear()).toString();
  };

  const [date, setDate] = useState(defaultdate());

  const Msg = () => (
    <div>
      <h5>Currency Updated</h5>
    </div>
  );

  const onSubmit = (e) => {
    TkToastInfo(<Msg />, { hideProgressBar: true });
    e.preventDefault();
    // console.log('toggle called in form submit')
    // validation.handleSubmit();
    // return false;
  };

  return (
    <>
      <div className="row justify-content-center">
        <TkForm onSubmit={onSubmit}>
          <TkCol>
            <TkCard id="tasksList">
              <TkEditCardHeader title="Edit Currency" />
              <TkCardBody className="border-0">
                <div className=" align-items-center">
                  <TkRow>
                    <TkCol lg={6}>
                      <div>
                        <TkInput
                          id="currencyName"
                          name="currencyName"
                          className="form-control"
                          type="text"
                          labelName="Currency Name"
                          placeholder="Currency Name"
                          defaultValue="US Dollar"
                        />
                      </div>
                    </TkCol>
                    <TkCol lg={6}>
                      <div>
                        <TkInput
                          id="currencyName"
                          name="currencyName"
                          className="form-control"
                          type="text"
                          labelName="Symbol"
                          placeholder="Symbol"
                          defaultValue="$"
                        />
                      </div>
                    </TkCol>
                  </TkRow>
                </div>
              </TkCardBody>
              <TkCardBody className="first-child-max-width-100 pt-0 mt-3">
                <div className="d-flex space-childern">
                  <TkButton className="ms-auto" color="secondary">
                    Cancel
                  </TkButton>
                  <TkButton color="primary"> Save </TkButton>
                </div>
              </TkCardBody>
            </TkCard>
          </TkCol>
        </TkForm>
      </div>
    </>
  );
};

export default EditCurrency;
