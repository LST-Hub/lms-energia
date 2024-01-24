import React from "react";
import CountUp from "react-countup";
import { projectWidgets } from "../../test-data/projects";

import TkCard,{TkCardBody} from "../TkCard";
import TkRow,{TkCol} from "../TkRow";
import TkIcon from "../TkIcon";

const Widgets = ({data}) => {
  // console.log('data', data.length)
  return (
    <>
      <TkRow>
        {projectWidgets.map((item, key) => (
          <TkCol lg={4} sm={6} key={key}>
            <TkCard className="card-animate">
              <TkCardBody>
                <div className="d-flex justify-content-between">
                  <div>
                    <p className="fw-medium text-muted mb-0">{item.label}</p>
                    <h2 className="mt-4 ff-secondary fw-semibold">
                      <span className="counter-value">
                        <CountUp
                          start={0}
                          end={data.length}
                          // decimal={item.decimals}
                          // suffix={item.suffix}
                          duration={1}
                        />
                      </span>
                    </h2>
                    <p className="mb-0 text-muted">
                      <span className={"badge bg-light mb-0 text-" + item.badgeClass}>
                        <TkIcon className={"align-middle " + item.badge}></TkIcon> {item.percentage}
                      </span>{" "}
                      vs. prev month
                    </p>
                  </div>
                  <div>
                    <div className="avatar-sm flex-shrink-0">
                      <span
                        className={
                          "avatar-title rounded-circle fs-4 bg-soft-" +
                          item.iconClass +
                          " text-" +
                          item.iconClass
                        }
                      >
                        <TkIcon className={item.icon}></TkIcon>
                      </span>
                    </div>
                  </div>
                </div>
              </TkCardBody>
            </TkCard>
          </TkCol>
        ))}
      </TkRow>
    </>
  );
};

export default Widgets;
