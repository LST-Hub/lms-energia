import React, { useState } from "react";
import TkRow, { TkCol } from "../TkRow";
import TkInput from "../forms/TkInput";
import { useMutation, useQuery } from "@tanstack/react-query";
import tkFetch from "../../../src/utils/fetch";
import FormErrorText from "../forms/ErrorText";

function CompanyInfo({ errorsFields, onUpdate }) {
  const [companySize, setCompanySize] = useState("");
  return (
    <>
      <TkRow>
        <TkCol xl={12}>
          <div className="mt-3 mb-3 ms-4">
            <h1>Help Us Understand Your Needs</h1>
          </div>
        </TkCol>
        <TkCol xl={12}>
          <div className="mt-3 mb-3 ms-4">
            <h5>Create a Workspace <span className="text-danger">*</span></h5>
          </div>
        </TkCol>
        <TkCol xl={12}>
          <div className="mt-3 mb-3 ms-4">
            <TkInput
              type="text"
              id="companyName"
              name="companyName"
              placeholder="Workspace Name"
              requiredStarOnLabel={true}
              onChange={(e) => {
                onUpdate({
                  companyName: e.target.value,
                });
              }}
            />
            {errorsFields && errorsFields.companyNameExist && <FormErrorText>Workspace Name is Required</FormErrorText>}
            {errorsFields && errorsFields.companyNameGreater && <FormErrorText>Workspace Name must be less than 50 characters</FormErrorText>}
          </div>
        </TkCol>
      </TkRow>
      <TkRow>
        <TkCol xl={12}>
          <TkRow>
            <TkCol lg={12}>
              <div className="mt-3 mb-3 ms-4">
                <h5>How many people are in your company? <span className="text-danger">*</span></h5>
              </div>
            </TkCol>
          </TkRow>
        </TkCol>
        <TkCol xs={12} xl={12} className="mb-3">
          <TkRow className="mt-2 ms-3">
            <TkCol lg={4} className="ps-0 pe-0">  
              <div
                className="radio-btn d-flex"
                onClick={() => {
                  setCompanySize("2-20");
                  onUpdate({
                    companySize: "2-20",
                  });
                }}
              >
                {/* below line gives warning that pass occhnage or readonly to radio buittons but you can ignore it */}
                <TkInput type="radio" checked={companySize === "2-20"} name="companySize" />
                <h5 className="mt-1 mb-1 mb-0 ms-3">2-20</h5>
              </div>
            </TkCol>
            <TkCol lg={4} className="ps-0 pe-0">
              <div
                className="radio-btn d-flex"
                onClick={() => {
                  setCompanySize("20-50");
                  onUpdate({
                    companySize: "20-50",
                  });
                }}
              >
                <TkInput type="radio" checked={companySize === "20-50"} name="companySize" />
                <h5 className="mt-1 mb-1 ms-3">20-50</h5>
              </div>
            </TkCol>
            <TkCol lg={4} className="ps-0 pe-0">
              <div
                className="radio-btn d-flex"
                onClick={() => {
                  setCompanySize("50-100");
                  onUpdate({
                    companySize: "50-100",
                  });
                }}
              >
                <TkInput type="radio" checked={companySize === "50-100"} name="companySize" />
                <h5 className="mt-1 mb-1 mb-0 ms-3">50-100</h5>
              </div>
            </TkCol>
            <TkCol lg={4} className="ps-0 pe-0">
              <div
                className="radio-btn d-flex"
                onClick={() => {
                  setCompanySize("100-200");
                  onUpdate({
                    companySize: "100-200",
                  });
                }}
              >
                <TkInput type="radio" checked={companySize === "100-200"} name="companySize" />
                <h5 className="mt-1 mb-1 mb-0 ms-3">100-200</h5>
              </div>
            </TkCol>
            <TkCol lg={4} className="ps-0 pe-0">
              <div
                className="radio-btn d-flex"
                onClick={() => {
                  setCompanySize("200-500");
                  onUpdate({
                    companySize: "200-500",
                  });
                }}
              >
                <TkInput type="radio" checked={companySize === "200-500"} name="companySize" />
                <h5 className="mt-1 mb-1 mb-0 ms-3">200-500</h5>
              </div>
            </TkCol>
            <TkCol lg={4} className="ps-0 pe-0">
              <div
                className="radio-btn d-flex"
                onClick={() => {
                  setCompanySize("500+");
                  onUpdate({
                    companySize: "500+",
                  });
                }}
              >
                <TkInput type="radio" checked={companySize === "500+"} name="companySize" />
                <h5 className="mt-1 mb-1 mb-0 ms-3">500+</h5>
              </div>
            </TkCol>
          </TkRow>
          {errorsFields && errorsFields.companySize && <FormErrorText>Please Select Company Size</FormErrorText>}
        </TkCol>
      </TkRow>
      {/* <TkRow>
        <TkCol xl={3}>
          <div className="mt-3 mb-3 ms-4">
            <TkButton className="btn btn-primary w-100" type="submit" onClick={() => setGoSteps(1)}>
              Next <i className="ri-arrow-right-line align-bottom me-1"></i>
            </TkButton>
          </div>
        </TkCol>
      </TkRow> */}
    </>
  );
}

export default CompanyInfo;
