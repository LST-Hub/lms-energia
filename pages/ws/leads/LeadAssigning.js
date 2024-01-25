import React from "react";
import TkRow, { TkCol } from "../../../src/components/TkRow";
import TkCard, { TkCardBody, TkCardHeader } from "../../../src/components/TkCard";
import TkInput from "../../../src/components/forms/TkInput";
import TkSelect from "../../../src/components/forms/TkSelect";
import TkButton from "../../../src/components/TkButton";

function LeadAssigning({ toggleTab, tabs }) {
  return (
    <div>
      <TkRow className="mt-3">
        <TkCol>
          <TkCard>
            <TkCardHeader>
              <h4 className="card-title">Lead Assigning</h4>
            </TkCardHeader>
            <TkCardBody>
              <div>
                <TkRow className="g-3">
                  <TkCol lg={6}>
                    <TkSelect
                      id="region"
                      name="region"
                      labelName="Region"
                      options={[
                        { value: "1", label: "Region 1" },
                        { value: "2", label: "Region 2" },
                        { value: "3", label: "Region 3" },
                      ]}
                    />
                  </TkCol>
                  <TkCol lg={6}>
                    <TkSelect
                      id="salesTeam"
                      name="salesTeam"
                      labelName="Sales Team Name"
                      options={[
                        { value: "1", label: "Sales Team 1" },
                        { value: "2", label: "Sales Team 2" },
                        { value: "3", label: "Sales Team 3" },
                      ]}
                    />
                  </TkCol>
                </TkRow>
              </div>
            </TkCardBody>
          </TkCard>
        </TkCol>
      </TkRow>
      <div className="d-flex mt-4 space-childern">
        <div className="ms-auto" id="update-form-btns">
          <TkButton
            type="button"
            color="primary"
            onClick={() => {
              toggleTab(tabs.leadNurutring);
            }}
          >
            Next
          </TkButton>
        </div>
      </div>
    </div>
  );
}

export default LeadAssigning;
