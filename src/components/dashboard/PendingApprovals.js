import React, { useState } from "react";
import { projectTasks } from "../../test-data/dashboard";

import TkRow, { TkCol } from "../TkRow";
import TkCard, { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkButton from "../TkButton";
import TkInput from "../forms/TkInput";
import TkForm from "../forms/TkForm";
import TkIcon from "../TkIcon";
import TkModal, { TkModalHeader, TkModalBody } from "../TkModal";

const PendingApprovals = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggle = () => {
    if (isModalOpen) {
      setIsModalOpen(false);
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <TkCard>
        <TkCardHeader className="card-header align-items-center d-flex">
          <TkCardTitle tag="h4" className="mb-0 flex-grow-1 py-1">Pending Approvals</TkCardTitle>
          <div className="flex-shrink-0">
            <TkButton color="primary">Approve</TkButton>
          </div>
        </TkCardHeader>
        <TkCardBody>
          <div className="table-responsive table-card">
            <table className="table table-borderless table-nowrap table-centered align-middle mb-0">
              <thead className="table-light text-muted">
                <tr>
                  <th>
                    <input className="form-check-input fs-15" type="checkbox" value="" />
                  </th>
                  <th scope="col">View</th>
                  <th scope="col">Task Name</th>
                  <th scope="col">Time</th>
                  <th scope="col">Date</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(projectTasks || []).map((item, key) => (
                  <tr key={key}>
                    <td>
                      <input
                        className="form-check-input fs-15"
                        type="checkbox"
                        value=""
                        id={item.forId}
                      />
                    </td>
                    <td>
                      <div className="d-flex justify-content-start align-items-center">
                        <TkButton
                          color="none"
                          onClick={() => {
                            setIsModalOpen(true);
                          }}
                        >
                          <TkIcon className="ri-eye-fill align-bottom me-2 text-muted"></TkIcon>
                        </TkButton>
                      </div>
                    </td>
                    <td>
                      <div className="form-check">
                        <label className="form-check-label ms-1" htmlFor={item.forId}>
                          {item.label}
                        </label>
                      </div>
                    </td>
                    <td className="text-muted">{item.time}</td>
                    <td className="text-muted">{item.dedline}</td>
                    <td>
                      <div className="d-flex justify-content-start align-items-center space-childern">
                        <TkButton className="bg-transparent border-0 ps-0 ms-0">
                          <span className="d-flex justify-content-center align-items-center badge p-1 rounded-circle badge-soft-success fs-6">
                            <TkIcon className="ri-check-line"></TkIcon>
                          </span>
                        </TkButton>
                        <TkButton className="bg-transparent border-0 ps-0 ms-0">
                          <span className="d-flex justify-content-center align-items-center badge p-1 rounded-circle badge-soft-danger fs-6">
                            <TkIcon className="ri-close-line"></TkIcon>
                          </span>
                        </TkButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TkCardBody>
      </TkCard>

      <TkModal
        isOpen={isModalOpen}
        toggle={toggle}
        centered
        size="lg"
        className="border-0 timesheet-task-modal"
        modalClassName="modal fade zoomIn"
      >
        <TkModalHeader className="p-3 bg-soft-info" toggle={toggle}>
          {"TimeSheet Entry"}
        </TkModalHeader>
        <TkForm
          onSubmit={(e) => {
            e.preventDefault();
            // console.log('toggle called in form submit')
            // validation.handleSubmit();
            // TODO: submit form and do validations
            toggle();
            return false;
          }}
        >
          {/* TODO: there is huge rerenders while filling new task form , rectify it */}
          <TkModalBody className="modal-body">
            <TkRow className="g-3">
              <TkCol lg={6}>
                <TkInput
                  labelName="Task Name"
                  type="text"
                  name="taskName"
                  id="taskName"
                  placeholder="Enter Task Name"
                  validate={{
                    required: { value: true },
                  }}
                  disabled
                  defaultValue={"User research"}
                />
              </TkCol>
              <TkCol lg={6}>
                <div>
                  <TkInput
                    labelName="Project Name"
                    type="text"
                    name="projectName"
                    id="projectName"
                    placeholder="Enter Project Name"
                    validate={{
                      required: { value: false },
                    }}
                    disabled
                    defaultValue={"Kyriba Seo"}
                  />
                </div>
              </TkCol>

              <TkCol lg={6}>
                <TkInput
                  labelName="Date"
                  type="text"
                  name="date"
                  id="date"
                  placeholder="Select a Date"
                  options={{
                    altInput: true,
                    altFormat: "d M, Y",
                    dateFormat: "d M, Y",
                  }}
                  disabled
                  defaultValue={new Date().toDateString()}
                />
                {/* {validation.touched.dueDate && validation.errors.dueDate ? (
                  <FormFeedback type="invalid">{validation.errors.dueDate}</FormFeedback>
                ) : null} */}
              </TkCol>
              <TkCol lg={6}>
                <div>
                  <TkInput
                    labelName="Duration"
                    type="text"
                    name="duration"
                    id="duration"
                    placeholder="Enter Duration"
                    validate={{
                      required: { value: false },
                    }}
                    disabled
                    defaultValue={"3:00"}
                  />
                </div>
              </TkCol>

              <TkCol lg={12}>
                <div>
                  <TkInput
                    labelName="Description"
                    type="textarea"
                    name="description"
                    id="description"
                    placeholder="Enter Description"
                    validate={{
                      required: { value: false },
                    }}
                    disabled
                    defaultValue={
                      "Did Research on Kyriba about it's bransd and it's competitors and user base."
                    }
                  />
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
                  setIsModalOpen(false);
                }}
              // className="btn-light"
              >
                Reject
              </TkButton>
              <TkButton
                type="button"
                color="primary"
                onClick={() => {
                  setIsModalOpen(false);
                }}
              // className="btn-light"
              >
                Approve
              </TkButton>
              {/* <button type="submit" className="btn btn-success" id="add-btn">
                Approve
              </button> */}
            </div>
          </div>
        </TkForm>
      </TkModal>
    </>
  );
};

export default PendingApprovals;
