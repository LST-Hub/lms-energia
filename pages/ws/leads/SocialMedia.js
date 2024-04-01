import React, { useState } from "react";
import { Button, ButtonGroup } from "reactstrap";
import TkInput from "../../../src/components/forms/TkInput";
import TkRow, { TkCol } from "../../../src/components/TkRow";
import TkCard, {
  TkCardBody,
  TkCardHeader,
} from "../../../src/components/TkCard";
import TkButton from "../../../src/components/TkButton";
import TkSelect from "../../../src/components/forms/TkSelect";
import TkDate from "../../../src/components/forms/TkDate";

function SocialMedia({ toggleTab, tabs }) {
  const [rSelected, setRSelected] = useState(1);

  return (
    <div>
      <ButtonGroup>
        <Button
          color="primary"
          outline
          onClick={() => setRSelected(1)}
          active={rSelected === 1}
        >
          New
        </Button>
        <Button
          color="primary"
          outline
          onClick={() => setRSelected(2)}
          active={rSelected === 2}
        >
          Existing
        </Button>
      </ButtonGroup>
      <TkRow className="mt-3">
        <TkCol>
          <TkCard>
            <TkCardBody>
              <div>
                <TkRow className="g-3">
                  <TkCol lg={4}>
                    <TkSelect
                      id="platformType"
                      name="platformType"
                      labelName="Name Of Platform"
                      options={[
                        { value: "1", label: "Linkedin" },
                        { value: "2", label: "Facebook" },
                        { value: "3", label: "Instagram" },
                        { value: "4", label: "Twitter" },
                        { value: "5", label: "Youtube" },
                        { value: "6", label: "Tiktok" },
                        { value: "7", label: "Snapchat" },
                      ]}
                    />
                  </TkCol>
                  <TkCol lg={4}>
                    <TkInput
                      id="campaignName"
                      name="campaignName"
                      type="text"
                      labelName="Campaign Name"
                      placeholder="Enter Campaign Name"
                    />
                  </TkCol>
                </TkRow>
              </div>
            </TkCardBody>
          </TkCard>
        </TkCol>
      </TkRow>

      <TkRow className="mt-3">
        <TkCol>
          <div className="d-flex justify-content-center">
            <TkInput type="text" placeholder="Search" isSearchField="true" />
          </div>
        </TkCol>
      </TkRow>

      <TkRow className="mt-3">
        <TkCol>
          <TkCard>
            <TkCardHeader>
              <h4 className="card-title">Personal Details</h4>
            </TkCardHeader>
            <TkCardBody>
              <div>
                <TkRow className="g-3">
                  <TkCol lg={4}>
                    <TkInput
                      id="name"
                      type="text"
                      labelName="Name"
                      placeholder="Enter Name"
                    />
                  </TkCol>
                  <TkCol lg={4}>
                    <TkInput
                      id="mobileNo"
                      name="mobileNo"
                      type="text"
                      labelName="Mobile No"
                      placeholder="Enter Mobile No"
                    />
                  </TkCol>
                  <TkCol lg={4}>
                    <TkInput
                      id="email"
                      name="email"
                      type="text"
                      labelName="Email"
                      placeholder="Enter Email"
                    />
                  </TkCol>
                </TkRow>
              </div>
            </TkCardBody>
          </TkCard>
        </TkCol>
      </TkRow>

      <TkRow className="mt-3">
        <TkCol>
          <TkCard>
            <TkCardHeader>
              <h4 className="card-title">Company Details</h4>
            </TkCardHeader>
            <TkCardBody>
              <div>
                <TkRow className="g-3">
                  <TkCol lg={4}>
                    <TkInput
                      id="name"
                      type="text"
                      labelName="Company Name"
                      placeholder="Enter Company Name"
                    />
                  </TkCol>
                  <TkCol lg={4}>
                    <TkInput
                      id="contactNo"
                      name="contactNo"
                      type="text"
                      labelName="Contact No"
                      placeholder="Enter Contact No"
                    />
                  </TkCol>
                  <TkCol lg={4}>
                    <TkInput
                      id="email"
                      name="email"
                      type="text"
                      labelName="Email"
                      placeholder="Enter Email"
                    />
                  </TkCol>
                  <TkRow className="mt-3">
                    <TkCol lg={3}>
                      <TkInput
                        id="address"
                        name="address"
                        type="text"
                        labelName="Address"
                        placeholder="Enter Address"
                      />
                    </TkCol>
                    <TkCol lg={3}>
                      <TkInput
                        id="region"
                        name="region"
                        type="text"
                        labelName="Region"
                        placeholder="Enter Region"
                      />
                    </TkCol>
                    <TkCol lg={3}>
                      <TkInput
                        id="crno"
                        name="crno"
                        type="text"
                        labelName="CR No"
                        placeholder="Enter CR No"
                      />
                    </TkCol>
                    <TkCol lg={3}>
                      <TkInput
                        id="vatNo"
                        name="vatNo"
                        type="text"
                        labelName="VAT No"
                        placeholder="Enter VAT No"
                      />
                    </TkCol>
                  </TkRow>
                  <TkRow className="mt-3">
                    <TkCol lg={6}>
                      <TkSelect
                        id="clientType"
                        name="clientType"
                        labelName="Client Type"
                        options={[
                          { value: "1", label: "Gov" },
                          { value: "2", label: "Semi Gov" },
                          { value: "3", label: "Privet" },
                        ]}
                      />
                    </TkCol>
                    <TkCol lg={6}>
                      <TkSelect
                        id="segment"
                        name="segment"
                        labelName="Segment"
                        options={[
                          { value: "1", label: "O&G" },
                          { value: "2", label: "Construction" },
                          { value: "3", label: "Industry" },
                        ]}
                      />
                    </TkCol>
                  </TkRow>
                </TkRow>
              </div>
            </TkCardBody>
          </TkCard>
        </TkCol>
      </TkRow>

      <TkRow className="mt-3">
        <TkCol>
          <TkCard>
            <TkCardHeader>
              <h4 className="card-title">Requirement Details</h4>
            </TkCardHeader>
            <TkCardBody>
              <div>
                <TkRow>
                  <TkCol lg={6}>
                    <TkSelect
                      id="division"
                      name="division"
                      labelName="Division"
                      options={[
                        { value: "1", label: "Energy" },
                        { value: "2", label: "Cooling" },
                        { value: "3", label: "Welding" },
                      ]}
                    />
                  </TkCol>
                  <TkCol lg={6}>
                    <TkSelect
                      id="requirement"
                      name="requirement"
                      labelName="Requirement"
                      placeholder="Enter Requirement"
                      options={[]}
                    />
                  </TkCol>
                </TkRow>
                <TkRow className="mt-3">
                  <TkCol>
                    <TkInput
                      id="projectName"
                      name="projectName"
                      type="text"
                      labelName="Project Name"
                      placeholder="Enter Project Name"
                    />
                  </TkCol>
                  <TkCol>
                    <TkInput
                      id="duration"
                      name="duration"
                      type="text"
                      labelName="Duration"
                      placeholder="Enter Duration"
                    />
                  </TkCol>
                  <TkCol>
                    <TkDate
                      id="delivory"
                      name="delivory"
                      type="text"
                      labelName="Expected Delivery Date"
                      placeholder="Expected Delivery Date"
                    />
                  </TkCol>
                  <TkCol>
                    <TkInput
                      id="location"
                      name="location"
                      type="text"
                      labelName="Location"
                      placeholder="Enter Location"
                    />
                  </TkCol>
                  <TkCol>
                    <TkInput
                      id="location"
                      name="location"
                      type="text"
                      labelName="Location Contact person"
                      placeholder="Enter Location"
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
              toggleTab(tabs.portals);
            }}
          >
            Next
          </TkButton>
        </div>
      </div>
    </div>
  );
}

export default SocialMedia;
