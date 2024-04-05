import React, { useEffect, useState } from "react";
import { Button, ButtonGroup, Nav, NavItem, NavLink } from "reactstrap";
import TkInput from "../../../src/components/forms/TkInput";
import TkRow, { TkCol } from "../../../src/components/TkRow";
import TkCard, {
  TkCardBody,
  TkCardHeader,
} from "../../../src/components/TkCard";
import TkButton from "../../../src/components/TkButton";
import TkSelect from "../../../src/components/forms/TkSelect";
import TkDate from "../../../src/components/forms/TkDate";
import TkIcon from "../../../src/components/TkIcon";
import classnames from "classnames";
import { Controller, useForm } from "react-hook-form";
import { MaxNameLength, MinNameLength, createdByNameTypes } from "../../utils/Constants";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
const tabs = {
  phoneCall: "phoneCall",
  meeting: "meeting",
  task: "task",
};
const schema = Yup.object({
  name: Yup.string()
    .min(
      MinNameLength,
      `First name should have at least ${MinNameLength} character.`
    )
    .max(
      MaxNameLength,
      `First name should have at most ${MaxNameLength} characters.`
    )
    .required("First name is required"),
}).required();
function DirectCall({ toggleTab, tabs }) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    formState: { errors, isDirty, dirtyFields },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [rSelected, setRSelected] = useState(1);
  const [isDirectCall, setIsDirectCall] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs.phoneCall);
  const [activeMeetingTab, setActiveMeetingTab] = useState(tabs.meeting);
  const [activeTaskTab, setActiveTaskTab] = useState(tabs.task);
  // const toggleTab = (tab) => {
  //   if (activeTab !== tab) {
  //     setActiveTab(tab);
  //     viewMode
  //       ? router.push(`${urls.leadView}/${lid}?tab=${tab}`, undefined, {
  //           scroll: false,
  //         })
  //       : router.push(`${urls.leadEdit}/${lid}?tab=${tab}`, undefined, {
  //           scroll: false,
  //         });
  //   }
  // };

  useEffect(() => {
    setIsDirectCall(true);
  }, []);
  const [requirementDetailsSections, setRequirementDetailsSections] = useState([
    { id: 1, isVisible: true },
  ]);

  const handleAddSection = () => {
    const newId = requirementDetailsSections.length + 1;
    setRequirementDetailsSections([
      ...requirementDetailsSections,
      { id: newId, isVisible: true },
    ]);
  };

  const handleToggleVisibility = (id) => {
    setRequirementDetailsSections((prevSections) =>
      prevSections.map((section) =>
        section.id === id
          ? { ...section, isVisible: !section.isVisible }
          : section
      )
    );
  };

  return (
    <>
      {isDirectCall && (
        <div>
          <TkRow className="mt-3">
            <TkCol>
              <TkCardHeader tag="h5" className="mb-4">
                <h4>Personal Details</h4>
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

                  <TkCol lg={4}>
                    <TkSelect
                      id="createdBy"
                      name="createdBy"
                      labelName="Created By"
                      placeholder="Select Created By"
                      requiredStarOnLabel="true"
                      options={createdByNameTypes}
                    />
                  </TkCol>
                  <TkCol lg={4}>
                    <Controller
                      name="createdDate"
                      control={control}
                      render={({ field }) => (
                        <TkDate
                          {...field}
                          labelName="Created Date"
                          id={"createdDate"}
                          placeholder="Enter Created Date"
                          options={{
                            altInput: true,
                            dateFormat: "d M, Y",
                          }}
                          onChange={(e) => {
                            field.onChange(e);
                            setSelectedDate(e);
                            setAllDurations({});
                          }}
                          requiredStarOnLabel={true}
                        />
                      )}
                    />
                  </TkCol>
                </TkRow>
              </div>
            </TkCol>
          </TkRow>
          <TkRow className="mt-5">
            <TkCol>
              <TkCardHeader tag="h5" className="mb-4">
                <h4>Company Details</h4>
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
              <TkCardHeader tag="h5" className="mb-3">
                <h4>Requirement Details</h4>
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

                          <TkCol lg={8}>
                            <TkInput
                              {...register("note")}
                              id="note"
                              name="note"
                              type="textarea"
                              labelName="Note"
                              placeholder="Enter Note"
                            />
                          </TkCol>
                        </TkRow>
                      </>
                    </div>

                    <TkRow className="mt-3">
                      <TkCol>
                        <TkButton
                          type="button"
                          onClick={() => handleToggleVisibility(section.id)}
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

          <div className="d-flex mt-4 space-childern">
            <div className="ms-auto" id="update-form-btns">
              <TkButton
                color="secondary"
                type="button"
                onClick={() => router.push(`${urls.lead}`)}
              >
                Cancel
              </TkButton>{" "}
              <TkButton type="submit" color="primary">
                Save
              </TkButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DirectCall;
