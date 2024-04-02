import React from "react";
import TkRow, { TkCol } from "../../../src/components/TkRow";
import TkCard, {
  TkCardBody,
  TkCardHeader,
} from "../../../src/components/TkCard";
import TkSelect from "../../../src/components/forms/TkSelect";
import TkInput from "../../../src/components/forms/TkInput";
import TkButton from "../../../src/components/TkButton";

function LeadNurturing() {
  return (
    <div>
      <TkRow className="mt-5">
        <TkCol>
          <TkCardHeader tag="h5" className="mb-4">
            <h4 className="card-title">Lead Nurturing</h4>
          </TkCardHeader>
          <div>
            <TkRow className="g-3">
              <TkCol lg={4}>
                <TkSelect
                  id="primaryAction"
                  name="primaryAction"
                  labelName="Primary Action"
                  placeholder="Select Primary Action"
                  options={[
                    { value: "1", label: "Replied" },
                    { value: "2", label: "Call" },
                    { value: "3", label: "Meeting appointment fixed" },
                    { value: "3", label: "Meeting done" },
                    { value: "3", label: "Waiting for the reply" },
                    { value: "3", label: "Meeting postponed" },
                  ]}
                />
              </TkCol>
              <TkCol lg={4}>
                <TkInput
                  id="leadValue"
                  name="leadValue"
                  labelName="Lead Value"
                  type="text"
                  placeholder="Enter Lead Value"
                />
              </TkCol>
              <TkCol lg={4}>
                <TkSelect
                  id="leadUpdate"
                  name="leadUpdate"
                  labelName="Lead Update"
                  placeholder="Select Lead Update"
                  options={[
                    { value: "1", label: "Qualified" },
                    { value: "2", label: "Unqualified" },
                  ]}
                />
              </TkCol>
              </TkRow>
              <TkRow className="mt-4">
              <TkCol lg={4}>
                <TkInput
                  id="reason"
                  name="reason"
                  labelName="Reason if unqualified lead"
                  type="text"
                  placeholder="Enter Reason"
                />
              </TkCol>
              <TkCol lg={4}>
                <TkSelect
                  id="prospectNurturing"
                  name="prospectNurturing"
                  labelName="Prospect Nurturing"
                  placeholder="Select Prospect Nurturing"
                  options={[
                    { value: "1", label: "Quotation Issued" },
                    { value: "2", label: "Waiting fro the approval" },
                    { value: "3", label: "Waiting for document" },
                    { value: "3", label: "Waiting for the PO" },
                  ]}
                />
              </TkCol>
            </TkRow>
          </div>
        </TkCol>
      </TkRow>
      <div className="d-flex mt-4 space-childern">
        <div className="ms-auto" id="update-form-btns">
          <TkButton type="button" color="primary">
            Submit
          </TkButton>
        </div>
      </div>
    </div>
  );
}

export default LeadNurturing;
