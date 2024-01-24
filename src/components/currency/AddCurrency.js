import React, { useState, useEffect, useMemo, useCallback } from "react";

import { allRoles } from "../../test-data/roles";

// Formik
import * as Yup from "yup";
// import { useFormik } from "formik";
import "react-toastify/dist/ReactToastify.css";

import TkInput from "../forms/TkInput";
import TkRow, { TkCol } from "../TkRow";
import TkButton from "../TkButton";
import TkCard, { TkCardBody, TkCardTitle, TkCardHeader } from "../TkCard";
import TkForm from "../forms/TkForm";
import { TkToastSuccess } from "../TkToastContainer";

const AddCurrency = () => {
  //   TODO: rename the variables
  const [taskList, setTaskList] = useState(allRoles);

  useEffect(() => {
    if (Array.isArray(taskList) && taskList.length) {
      setTaskList(taskList);
    }
  }, [taskList]);

  // const defaultdate = () => {
  //   let d = new Date(),
  //     months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  //   return (d.getDate() + " " + months[d.getMonth()] + ", " + d.getFullYear()).toString();
  // };

  // const [date, setDate] = useState(defaultdate());


  const onSubmit = (e) => {
    e.preventDefault();
    TkToastSuccess("Currency Created", { hideProgressBar: true });
  };

  return (
    <>
      <div className="row justify-content-center">
        <TkForm onSubmit={onSubmit}>
          <TkCol>
            <TkCard id="tasksList">
              <TkCardHeader>
                <h5>Add Currency</h5>
              </TkCardHeader>
              <TkCardBody className="first-child-max-width-100 pt-0 mt-3">
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
                        />
                      </div>
                    </TkCol>
                    <TkCol lg={6}>
                      <div>
                        <TkInput
                          id="symbol"
                          name="symbol"
                          className="form-control"
                          type="text"
                          labelName="Symbol"
                          placeholder="Symbol"
                        />
                      </div>
                    </TkCol>
                  </TkRow>
                </div>

                <div className="mt-3 d-flex space-childern">
                  <TkButton className="ms-auto" color="secondary">
                    Cancel
                  </TkButton>
                  <TkButton color="primary" type="submit">
                    Save
                  </TkButton>
                </div>
              </TkCardBody>
            </TkCard>
          </TkCol>
        </TkForm>
      </div>
    </>
  );
};

export default AddCurrency;
