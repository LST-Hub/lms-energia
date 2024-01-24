import React, { useState, useEffect } from "react";
import CountUp from "react-countup";
// import { useSelector, useDispatch } from "react-redux";
import { ProjectsOverviewCharts } from "./DashboardProjectCharts";
import { DashboardProjectData } from "../../test-data/dashboard";

import TkCard,{TkCardBody, TkCardHeader, TkCardTitle} from "../TkCard";
import TkRow,{TkCol} from "../TkRow";
import TkButton from "../TkButton";

const ProjectsOverview = () => {
  // TODO: get data from API
  const [chartData, setchartData] = useState(DashboardProjectData["all"]);

  const onChangeChartPeriod = (pType) => {
    if (Array.isArray(DashboardProjectData[pType])) {
      setchartData(DashboardProjectData[pType]);
    }
  };

  return (
    <>
      <TkRow>
        <TkCol xl={12}>
          <TkCard>
            <TkCardHeader className="border-0 align-items-center d-flex">
              <TkCardTitle tag='h4' className="mb-0 flex-grow-1">Projects Overview</TkCardTitle>
              <div className="d-flex gap-1">
                <TkButton
                  type="button"
                  className="btn btn-soft-secondary btn-sm"
                  onClick={() => {
                    onChangeChartPeriod("all");
                  }}
                >
                  ALL
                </TkButton>
                <TkButton
                  type="button"
                  className="btn btn-soft-secondary btn-sm"
                  onClick={() => {
                    onChangeChartPeriod("month");
                  }}
                >
                  1M
                </TkButton>
                <TkButton
                  type="button"
                  className="btn btn-soft-secondary btn-sm"
                  onClick={() => {
                    onChangeChartPeriod("halfyear");
                  }}
                >
                  6M
                </TkButton>
                <TkButton
                  type="button"
                  className="btn btn-soft-primary btn-sm"
                  onClick={() => {
                    onChangeChartPeriod("year");
                  }}
                >
                  1Y
                </TkButton>
              </div>
            </TkCardHeader>

            <TkCardHeader className="p-0 border-0 bg-soft-light">
              <TkRow className="g-0 text-center">
                <TkCol xs={6} sm={3}>
                  <div className="p-3 border border-dashed border-start-0">
                    <h5 className="mb-1">
                      <span className="counter-value" data-target="9851">
                        <CountUp start={0} end={9851} separator={","} duration={3} />
                      </span>
                    </h5>
                    <p className="text-muted mb-0">Number of Projects</p>
                  </div>
                </TkCol>
                <TkCol xs={6} sm={3}>
                  <div className="p-3 border border-dashed border-start-0">
                    <h5 className="mb-1">
                      <span className="counter-value">
                        <CountUp start={0} end={1026} separator={","} duration={3} />
                      </span>
                    </h5>
                    <p className="text-muted mb-0">Active Projects</p>
                  </div>
                </TkCol>
                <TkCol xs={6} sm={3}>
                  <div className="p-3 border border-dashed border-start-0">
                    <h5 className="mb-1">
                      <span className="counter-value" >
                        <CountUp start={0} end={20.2} decimals={1} duration={3} />
                      </span>
                      k
                    </h5>
                    <p className="text-muted mb-0">Number of Tasks</p>
                  </div>
                </TkCol>
                <TkCol xs={6} sm={3}>
                  <div className="p-3 border border-dashed border-start-0 border-end-0">
                    <h5 className="mb-1 text-success">
                      <span className="counter-value" data-target="10589">
                        <CountUp start={0} end={10589} separator={","} duration={3} />
                      </span>
                      h
                    </h5>
                    <p className="text-muted mb-0">Working Hours</p>
                  </div>
                </TkCol>
              </TkRow>
            </TkCardHeader>
            <TkCardBody className="p-0 pb-2">
                <div dir="ltr" className="apex-charts">
                  <ProjectsOverviewCharts
                    series={chartData}
                    dataColors='["--vz-primary", "--vz-warning", "--vz-success"]'
                  />
              </div>
            </TkCardBody>
          </TkCard>
        </TkCol>
      </TkRow>
    </>
  );
};

export default ProjectsOverview;
