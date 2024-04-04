import React, { useEffect, useState } from "react";
import FormErrorText from "../forms/ErrorText";
import TkButton from "../TkButton";
import TkInput from "../forms/TkInput";
import TkRow, { TkCol } from "../TkRow";
import TkDate from "../forms/TkDate";
import { Controller, useForm } from "react-hook-form";
import TkSelect from "../forms/TkSelect";
import TkContainer from "../TkContainer";
import TkForm from "../forms/TkForm";
import TkCard, { TkCardBody, TkCardHeader } from "../TkCard";
import {
  API_BASE_URL,
  MaxEmailLength,
  MaxPhoneNumberLength,
  MinEmailLength,
  RQ,
  bigInpuMaxLength,
  socialMediaTypes,
  urls,
} from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { convertTimeToSec, convertToTimeFotTimeSheet } from "../../utils/time";
import TkCheckBox from "../forms/TkCheckBox";
import TkLabel from "../forms/TkLabel";
import { formatDateForAPI } from "../../utils/date";
import { useRouter } from "next/router";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import TkIcon from "../TkIcon";

const tabs = {
  directCall: "directCall",
  email: "email",
  socialMedia: "socialMedia",
  portals: "portals",
  directMarketing: "directMarketing",
  leadAssigning: "leadAssigning",
  leadNurutring: "leadNurutring",
};

function AddLead() {
  const [activeTab, setActiveTab] = useState(tabs.directCall);
  const router = useRouter();
  const [directCallCheckbox, setDirectCallCheckbox] = useState(false);
  const [emailCheckbox, setEmailCheckbox] = useState(false);
  const [socialMediaCheckbox, setSocialMediaCheckbox] = useState(false);
  const [portsCheckbox, setPortsCheckbox] = useState(false);
  const [directMarketingCheckbox, setDirectMarketingCheckbox] = useState(false);

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      router.push(`${urls.lead}/add?tab=${tab}`, undefined, {
        scroll: false,
      });
    }
  };

  return (
    <>
      <div>
        <div>
          <TkContainer>
            <TkForm onSubmit={handleSubmit(onSubmit)}>
              <TkRow className="mt-3">
                <TkCol>
                  {/* <TkCard> */}
                  <TkCardBody>
                    <div>
                      <TkRow className="mt-5">
                        <TkCol>
                          <div>
                            <TkRow className="g-3">
                              <TkCol lg={4}>
                                <TkSelect
                                  id="leadSource"
                                  name="leadSource"
                                  labelName="Lead Source"
                                  placeholder="Select Lead Source"
                                  options={[
                                    { value: "1", label: "Direct" },
                                    { value: "2", label: "Refferal" },
                                    { value: "3", label: "New" },
                                  ]}
                                />
                              </TkCol>
                            </TkRow>
                          </div>
                        </TkCol>
                      </TkRow>

                      <TkRow className="mt-5">
                        <TkCol>
                          <TkCardHeader tag="h5" className="mb-4">
                            <h4 className="card-title">Personal Details</h4>
                          </TkCardHeader>
                          <div>
                            <TkRow className="g-3">
                              <TkCol lg={4}>
                                <TkInput
                                  id="name"
                                  type="text"
                                  labelName="Name"
                                  placeholder="Enter Name"
                                  requiredStarOnLabel="true"
                                />
                              </TkCol>
                              <TkCol lg={4}>
                                <TkInput
                                  id="mobileNo"
                                  name="mobileNo"
                                  type="text"
                                  labelName="Phone No"
                                  placeholder="Enter Phone No"
                                  requiredStarOnLabel="true"
                                />
                              </TkCol>
                              <TkCol lg={4}>
                                <TkInput
                                  id="email"
                                  name="email"
                                  type="text"
                                  labelName="Email"
                                  placeholder="Enter Email"
                                  requiredStarOnLabel="true"
                                />
                              </TkCol>
                            </TkRow>
                          </div>
                          {/* </TkCardBody>
              </TkCard> */}
                        </TkCol>
                      </TkRow>
                      <TkRow className="mt-5">
                        <TkCol>
                          <TkCardHeader tag="h5" className="mb-4">
                            <h4 className="card-title">Company Details</h4>
                          </TkCardHeader>
                          <div>
                            <TkRow className="mt-3">
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
                            </TkRow>
                            <TkRow className="mt-3">
                              <TkCol lg={4}>
                                <TkInput
                                  id="address"
                                  name="address"
                                  type="text"
                                  labelName="Address"
                                  placeholder="Enter Address"
                                />
                              </TkCol>
                              <TkCol lg={4}>
                                <TkInput
                                  id="region"
                                  name="region"
                                  type="text"
                                  labelName="Region"
                                  placeholder="Enter Region"
                                />
                              </TkCol>
                              <TkCol lg={4}>
                                <TkInput
                                  id="crno"
                                  name="crno"
                                  type="text"
                                  labelName="CR No"
                                  placeholder="Enter CR No"
                                />
                              </TkCol>
                            </TkRow>
                            <TkRow className="mt-3">
                              <TkCol lg={4}>
                                <TkInput
                                  id="vatNo"
                                  name="vatNo"
                                  type="text"
                                  labelName="VAT No"
                                  placeholder="Enter VAT No"
                                />
                              </TkCol>
                              <TkCol lg={4}>
                                <TkSelect
                                  id="clientType"
                                  name="clientType"
                                  labelName="Client Type"
                                  placeholder="Select Client Type"
                                  options={[
                                    { value: "1", label: "Gov" },
                                    { value: "2", label: "Semi Gov" },
                                    { value: "3", label: "Privet" },
                                  ]}
                                />
                              </TkCol>
                              <TkCol lg={4}>
                                <TkSelect
                                  id="segment"
                                  name="segment"
                                  labelName="Segment"
                                  placeholder="Select Segment"
                                  options={[
                                    { value: "1", label: "O&G" },
                                    { value: "2", label: "Construction" },
                                    { value: "3", label: "Industry" },
                                  ]}
                                />
                              </TkCol>
                            </TkRow>
                          </div>
                        </TkCol>
                      </TkRow>

                      <TkRow className="mt-5">
                        <TkCol>
                          <TkCardHeader tag="h5" className="mb-2">
                            <h4 className="card-title">Requirement Details</h4>
                          </TkCardHeader>
                        </TkCol>
                      </TkRow>
                      {requirementDetailsSections.map((section) => (
                        <div key={section.id}>
                          {section.isVisible && (
                            <TkRow className=" mb-4">
                              <TkCol>
                                <div>
                                  <>
                                    <TkRow className="mt-3">
                                      <TkCol lg={4}>
                                        <TkSelect
                                          id="division"
                                          name="division"
                                          labelName="Division"
                                          placeholder="Select Division"
                                          options={[
                                            { value: "1", label: "Energy" },
                                            { value: "2", label: "Cooling" },
                                            { value: "3", label: "Welding" },
                                          ]}
                                        />
                                      </TkCol>
                                      <TkCol lg={4}>
                                        <TkSelect
                                          id="requirement"
                                          name="requirement"
                                          labelName="Requirement"
                                          placeholder="Select Requirement"
                                          options={[]}
                                        />
                                      </TkCol>
                                      <TkCol lg={4}>
                                        <TkInput
                                          id="projectName"
                                          name="projectName"
                                          type="text"
                                          labelName="Project Name"
                                          placeholder="Enter Project Name"
                                        />
                                      </TkCol>
                                    </TkRow>
                                    <TkRow className="mt-3">
                                      <TkCol lg={4}>
                                        <TkInput
                                          id="duration"
                                          name="duration"
                                          type="text"
                                          labelName="Duration"
                                          placeholder="Enter Duration"
                                        />
                                      </TkCol>
                                      <TkCol lg={4}>
                                        <TkDate
                                          id="delivery"
                                          name="delivery"
                                          type="text"
                                          labelName="Expected Delivery Date"
                                          placeholder="Enter Expected Delivery Date"
                                        />
                                      </TkCol>
                                      <TkCol lg={4}>
                                        <TkInput
                                          id="location"
                                          name="location"
                                          type="text"
                                          labelName="Location"
                                          placeholder="Enter Location"
                                        />
                                      </TkCol>
                                    </TkRow>
                                    <TkRow className="mt-3">
                                      <TkCol lg={4}>
                                        <TkInput
                                          id="locationContactPerson"
                                          name="locationContactPerson"
                                          type="text"
                                          labelName="Location Contact Person"
                                          placeholder="Enter Location Contact Person"
                                        />
                                      </TkCol>
                                    </TkRow>
                                  </>
                                </div>

                                <TkRow className="mt-3">
                                  <TkCol>
                                    <TkButton
                                      type="button"
                                      onClick={() =>
                                        handleToggleVisibility(section.id)
                                      }
                                      className="bg-transparent border-0 ps-0 ms-0 text-center"
                                    >
                                      {section.isVisible ? (
                                        <span className="ms-auto badge p-1 rounded-circle badge-soft-danger fs-4 me-3">
                                          <TkIcon className="ri-delete-bin-6-line"></TkIcon>
                                        </span>
                                      ) : (
                                        <TkIcon className="ri-add-line"></TkIcon>
                                      )}
                                    </TkButton>
                                  </TkCol>
                                </TkRow>
                              </TkCol>
                            </TkRow>
                          )}
                        </div>
                      ))}

                      <TkCol md={1} lg={5} className="text-center text-md-end">
                        <TkButton
                          type="button"
                          className="bg-transparent border-0 ps-0 ms-0 text-center"
                          onClick={handleAddSection}
                        >
                          <span className="add-timsheet-btn badge p-1 rounded-circle badge-soft-dark fs-4">
                            <TkIcon className="ri-add-line"></TkIcon>
                          </span>
                        </TkButton>
                      </TkCol>

                      <TkRow className="g-3">
                        <TkCardHeader>
                          <h5>Leads Related Forms</h5>
                        </TkCardHeader>

                        <TkCol lg={12}>
                          <TkRow className="justify-content-start mt-4">
                            <TkCol xs={"auto"}>
                              <TkCheckBox
                                {...register("directCallCheckbox")}
                                id="directCallCheckbox"
                                type="checkbox"
                                onChange={(e) =>
                                  setDirectCallCheckbox(e.target.checked)
                                }
                              />
                              <TkLabel className="ms-3 me-lg-5" id="supervisor">
                                Direct Call
                              </TkLabel>
                            </TkCol>

                            <TkCol xs={"auto"}>
                              <TkCheckBox
                                {...register("emailCheckbox")}
                                id="emailCheckbox"
                                type="checkbox"
                                onChange={(e) =>
                                  setEmailCheckbox(e.target.checked)
                                }
                              />
                              <TkLabel
                                className="ms-3 me-lg-5"
                                id="privatePhoenCall"
                              >
                                Email
                              </TkLabel>
                            </TkCol>

                            <TkCol xs={"auto"}>
                              <TkCheckBox
                                {...register("socialMediaCheckbox")}
                                id="socialMediaCheckbox"
                                type="checkbox"
                                onChange={(e) =>
                                  setSocialMediaCheckbox(e.target.checked)
                                }
                              />
                              <TkLabel
                                className="ms-3 me-lg-5"
                                id="privatePhoenCall"
                              >
                                Social Media
                              </TkLabel>
                            </TkCol>

                            <TkCol xs={"auto"}>
                              <TkCheckBox
                                {...register("portsCheckbox")}
                                id="portsCheckbox"
                                type="checkbox"
                                onChange={(e) =>
                                  setPortsCheckbox(e.target.checked)
                                }
                              />
                              <TkLabel
                                className="ms-3 me-lg-5"
                                id="privatePhoenCall"
                              >
                                Ports
                              </TkLabel>
                            </TkCol>

                            <TkCol xs={"auto"}>
                              <TkCheckBox
                                {...register("directMarketingCheckbox")}
                                id="directMarketingCheckbox"
                                type="checkbox"
                                onChange={(e) =>
                                  setDirectMarketingCheckbox(e.target.checked)
                                }
                              />
                              <TkLabel
                                className="ms-3 me-lg-5"
                                id="privatePhoenCall"
                              >
                                Direct Marketing
                              </TkLabel>
                            </TkCol>
                          </TkRow>
                        </TkCol>

                        <div>
                          {directCallCheckbox && (
                            <>
                              <TkRow className="justify-content-center mb-4">
                                <TkCardHeader>
                                  <h4>Direct Call</h4>
                                </TkCardHeader>
                                <TkRow className="g-3 gx-4 ">
                                  <TkCol lg={4}>
                                    <TkSelect
                                      id="leadSource"
                                      name="leadSource"
                                      labelName="Lead Source"
                                      placeholder="Select Lead Source"
                                      options={[
                                        { value: "1", label: "Direct" },
                                        { value: "2", label: "Refferal" },
                                        { value: "3", label: "New" },
                                      ]}
                                    />
                                  </TkCol>
                                </TkRow>

                                <TkRow className="mt-5">
                                  <TkCol>
                                    <TkCardHeader tag="h5" className="mb-4">
                                      <h4 className="card-title">
                                        Lead Assigning
                                      </h4>
                                    </TkCardHeader>
                                    <div>
                                      <TkRow className="g-3">
                                        <TkCol lg={4}>
                                          <TkSelect
                                            id="region"
                                            name="region"
                                            labelName="Region"
                                            placeholder="Select Region"
                                            options={[
                                              { value: "1", label: "Region 1" },
                                              { value: "2", label: "Region 2" },
                                              { value: "3", label: "Region 3" },
                                            ]}
                                          />
                                        </TkCol>
                                        <TkCol lg={4}>
                                          <TkSelect
                                            id="salesTeam"
                                            name="salesTeam"
                                            labelName="Sales Team Name"
                                            placeholder="Select Sales Team"
                                            options={[
                                              {
                                                value: "1",
                                                label: "Sales Team 1",
                                              },
                                              {
                                                value: "2",
                                                label: "Sales Team 2",
                                              },
                                              {
                                                value: "3",
                                                label: "Sales Team 3",
                                              },
                                            ]}
                                          />
                                        </TkCol>
                                      </TkRow>
                                    </div>
                                  </TkCol>
                                </TkRow>

                                <TkRow className="mt-5">
                                  <TkCol>
                                    <TkCardHeader tag="h5" className="mb-4">
                                      <h4 className="card-title">
                                        Lead Nurturing
                                      </h4>
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
                                              {
                                                value: "3",
                                                label:
                                                  "Meeting appointment fixed",
                                              },
                                              {
                                                value: "3",
                                                label: "Meeting done",
                                              },
                                              {
                                                value: "3",
                                                label: "Waiting for the reply",
                                              },
                                              {
                                                value: "3",
                                                label: "Meeting postponed",
                                              },
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
                                              {
                                                value: "1",
                                                label: "Qualified",
                                              },
                                              {
                                                value: "2",
                                                label: "Unqualified",
                                              },
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
                                              {
                                                value: "1",
                                                label: "Quotation Issued",
                                              },
                                              {
                                                value: "2",
                                                label:
                                                  "Waiting fro the approval",
                                              },
                                              {
                                                value: "3",
                                                label: "Waiting for document",
                                              },
                                              {
                                                value: "3",
                                                label: "Waiting for the PO",
                                              },
                                            ]}
                                          />
                                        </TkCol>
                                      </TkRow>
                                    </div>
                                  </TkCol>
                                </TkRow>
                              </TkRow>
                            </>
                          )}

                          {meetingCheckbox && (
                            <>
                              <TkRow className="justify-content-center mt-4">
                                <TkCardHeader>
                                  <h4>Meeting</h4>
                                </TkCardHeader>
                                <TkRow className="g-3 gx-4 ">
                                  <TkCol lg={6}>
                                    <TkInput
                                      {...register("location")}
                                      id="location"
                                      name="location"
                                      type="text"
                                      labelName="Location"
                                      placeholder="Enter Location"
                                    />
                                  </TkCol>

                                  <TkCol lg={6}>
                                    <TkInput
                                      {...register("meetSubject")}
                                      name="meetSubject"
                                      labelName="Agenda/Subject"
                                      id="meetSubject"
                                      placeholder="Enter Agenda/Subject"
                                      type="textarea"
                                    />
                                  </TkCol>

                                  <TkCol lg={12}>
                                    <TkInput
                                      {...register("meetSummary", {})}
                                      labelName="Meeting Summary"
                                      id="meetSummary"
                                      name="meetSummary"
                                      placeholder="Enter Meeting Summary"
                                      type="textarea"
                                    />
                                  </TkCol>
                                </TkRow>
                              </TkRow>
                            </>
                          )}

                          {emailCheckbox && (
                            <>
                              <TkRow className="justify-content-center mt-4">
                                <TkCardHeader>
                                  <h4>Email</h4>
                                </TkCardHeader>
                                <TkRow className="g-3 gx-4 ">
                                  <TkCol lg={6}>
                                    <TkInput
                                      {...register("emailSubject")}
                                      name="emailSubject"
                                      labelName="Agenda/Subject"
                                      id="emailSubject"
                                      placeholder="Enter Agenda/Subject"
                                      type="textarea"
                                    />
                                  </TkCol>

                                  <TkCol lg={6}>
                                    <TkInput
                                      {...register("emailComments", {})}
                                      labelName="Comments"
                                      id="emailComments"
                                      name="emailComments"
                                      placeholder="Enter Comments"
                                      type="textarea"
                                    />
                                  </TkCol>
                                </TkRow>
                              </TkRow>
                            </>
                          )}
                        </div>
                      </TkRow>
                    </div>
                  </TkCardBody>
                  {/* </TkCard> */}
                </TkCol>
              </TkRow>
            </TkForm>
          </TkContainer>
        </div>
      </div>
    </>
  );
}

export default AddLead;
