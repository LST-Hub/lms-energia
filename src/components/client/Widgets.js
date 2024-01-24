import React from "react";
import CountUp from "react-countup";

import TkCard, { TkCardBody } from "../TkCard";
import TkRow, { TkCol } from "../TkRow";

const Widgets = ({ data }) => {
  //count the number of active client 
  const activeClient = data.filter((item) => item.active === true).length;
  return (
    <TkRow>
      {/* {clientWidgets.map((item, key) => ( */}
      <TkCol xl={4} sm={6}>
        <TkCard className="card-animate">
          <TkCardBody>
            <div className="d-flex justify-content-between">
              <div>
                <p className="fw-medium text-muted mb-0">{"Total Client"}</p>
                <h2 className="mt-4 ff-secondary fw-semibold">
                  <span className="counter-value">
                    <CountUp start={0} end={data.length} decimal={1} duration={1} />
                  </span>
                </h2>
              </div>
              <div>
                <div className="avatar-sm flex-shrink-0">
                  <span className={"avatar-title rounded-circle fs-4 bg-soft-info text-info"}>
                    <i className="ri-ticket-2-line"></i>
                  </span>
                </div>
              </div>
            </div>
          </TkCardBody>
        </TkCard>
      </TkCol>

      <TkCol xl={4} sm={6}>
        <TkCard className="card-animate">
          <TkCardBody>
            <div className="d-flex justify-content-between">
              <div>
                <p className="fw-medium text-muted mb-0">{"Active Client"}</p>
                <h2 className="mt-4 ff-secondary fw-semibold">
                  <span className="counter-value">
                    <CountUp start={0} end={activeClient} decimal={1} duration={1} />
                  </span>
                </h2>
              </div>
              <div>
                <div className="avatar-sm flex-shrink-0">
                  <span className={"avatar-title rounded-circle fs-4 bg-soft-success text-success"}>
                    <i className="mdi mdi-timer-sand"></i>
                  </span>
                </div>
              </div>
            </div>
          </TkCardBody>
        </TkCard>
      </TkCol>
      {/* ))} */}
    </TkRow>
  );
};

export default Widgets;
