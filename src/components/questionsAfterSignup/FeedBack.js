import React, { useState } from "react";
import TkRow, { TkCol } from "../TkRow";
import TkButton from "../TkButton";

function FeedBack() {
  const [feedback, setFeedback] = useState("feedback1");
  return (
    <div>
      <TkRow>
        <TkCol lg={12}>
          <div className="mt-3 mb-3 ms-4">
            <h1>Help Us Understand Your Needs</h1>
          </div>
        </TkCol>
        <TkCol lg={12}>
          <div className="mt-3 mb-3 ms-4">
            <h5>What do you want to accomplish with {process.env.NEXT_PUBLIC_APP_NAME} ?</h5>
          </div>
        </TkCol>
        <TkCol lg={12} className="mt-3 mb-3 ms-4">
          <TkRow>
            <TkCol lg={6} className="ps-0 pe-0">
              <div
                className="radio-btn d-flex"
                onClick={() => {
                  setFeedback("feedback1");
                }}
              >
                <TkRow>
                  <TkCol lg={2} className="mt-4">
                    <input type="radio" name="feedback" checked={feedback == "feedback1"} />
                  </TkCol>
                  <TkCol lg={10} className="text-align-center mt-1">
                    <h5>Track Billable Time</h5>
                    <p>I want to track billable time to properly bill my client</p>
                  </TkCol>
                </TkRow>
              </div>
            </TkCol>
            <TkCol lg={6} className="ps-0 pe-0">
              <div
                className="radio-btn d-flex"
                onClick={() => {
                  setFeedback("feedback2");
                }}
              >
                <TkRow>
                  <TkCol lg={2} className="mt-4">
                    <input type="radio" name="feedback" checked={feedback == "feedback2"} />
                  </TkCol>
                  <TkCol lg={10} className="text-align-center  mt-1">
                    <h5>Track Business</h5>
                    <p>I want to make sure my business is on track</p>
                  </TkCol>
                </TkRow>
              </div>
            </TkCol>
            <TkCol lg={6} className="ps-0 pe-0">
              <div
                className="radio-btn d-flex"
                onClick={() => {
                  setFeedback("feedback3");
                }}
              >
                <TkRow>
                  <TkCol lg={2} className="mt-4">
                    <input type="radio" name="feedback" checked={feedback == "feedback3"} />
                  </TkCol>
                  <TkCol lg={10} className="text-align-center  mt-1">
                    <h5>Estimate Future Project</h5>
                    <p>I want to better estimate my future project</p>
                  </TkCol>
                </TkRow>
              </div>
            </TkCol>
            <TkCol lg={6} className="ps-0 pe-0">
              <div
                className="radio-btn d-flex"
                onClick={() => {
                  setFeedback("feedback4");
                }}
              >
                <TkRow>
                  <TkCol lg={2} className="mt-4">
                    <input type="radio" name="feedback" checked={feedback == "feedback4"} />
                  </TkCol>
                  <TkCol lg={10} className="text-align-center  mt-1">
                    <h5>Proof Of work</h5>
                    <p>I want to provide evidance of what my team did</p>
                  </TkCol>
                </TkRow>
              </div>
            </TkCol>
          </TkRow>
        </TkCol>
        {/* <TkCol xl={3}>
          <div className="mt-3 mb-3 ms-4">
            <TkButton className="btn btn-primary w-100" type="submit" onClick={() => setGoSteps(2)}>
              Next <i className="ri-arrow-right-line align-bottom me-1"></i>
            </TkButton>
          </div>
        </TkCol> */}
      </TkRow>
    </div>
  );
}

export default FeedBack;
