import React, { useState, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
import { PrjectsStatusCharts } from "./DashboardProjectCharts";
import { projectStatus, projectStatusOptions } from "../../test-data/dashboard";

import TkCard, { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkIcon from "../TkIcon";
import { TkDropdownItem, TkDropdownMenu, TkDropdownToggle, TkUncontrolledDropdown } from "../TkDropdown";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, RQ } from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import TkRow, { TkCol } from "../TkRow";
import TkLoader from "../TkLoader";

const ProjectsStatus = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.projectStatus],
    queryFn: tkFetch.get(`${API_BASE_URL}/dashboard/projectStatus`),
  });
  // store all the count from the data in an array
  const seriesData = [];
  if (data) {
    data.map((item) => {
      seriesData.push(item.count);
    });
  }

  return (
    <>
      {/* <TkCardHeader className="tk-card-header border border-0"> */}
        <div className="d-flex align-items-center">
          {/* <TkCardTitle tag="h5" className=" mb-0 flex-grow-1">Clients</TkCardTitle> */}
          {/* <TkCardTitle className="flex-grow-1"> */}
            <h3>Project Status</h3>
          {/* </TkCardTitle> */}
          {/* <div className="d-flex flex-shrink-0"> */}
          {/* <Link href="#"> */}
          {/* <div onClick={onClickExportClient}>
                      <a className="btn btn-primary add-btn me-1">
                        <TkIcon className="ri-download-2-line align-bottom me-1"></TkIcon> Export
                      </a>
                    </div> */}
          {/* </Link> */}
          {/* </div> */}
        </div>
      {/* </TkCardHeader> */}

      <TkCard>
        {/* <TkCardHeader className="align-items-center d-flex">
          <TkCardTitle tag="h4" className="mb-0 flex-grow-1">
            Projects Status
          </TkCardTitle>
          <div className="flex-shrink-0">
            <TkUncontrolledDropdown className="card-header-dropdown">
              <TkDropdownToggle tag="a" className="dropdown-btn text-muted" role="button">
                {seletedMonth.charAt(0).toUpperCase() + seletedMonth.slice(1)}{" "}
                <TkIcon className="mdi mdi-chevron-down ms-1"></TkIcon>
              </TkDropdownToggle>
              <TkDropdownMenu className="dropdown-menu-end">
                <TkDropdownItem
                  onClick={() => {
                    onChangeChartPeriod("all");
                  }}
                  className={seletedMonth === "all" ? "active" : ""}
                >
                  All Time
                </TkDropdownItem>
                <TkDropdownItem
                  onClick={() => {
                    onChangeChartPeriod("week");
                  }}
                  className={seletedMonth === "week" ? "active" : ""}
                >
                  Last 7 Days
                </TkDropdownItem>
                <TkDropdownItem
                  onClick={() => {
                    onChangeChartPeriod("month");
                  }}
                  className={seletedMonth === "month" ? "active" : ""}
                >
                  Last 30 Days
                </TkDropdownItem>
                <TkDropdownItem
                  onClick={() => {
                    onChangeChartPeriod("quarter");
                  }}
                  className={seletedMonth === "quarter" ? "active" : ""}
                >
                  Last 90 Days
                </TkDropdownItem>
              </TkDropdownMenu>
            </TkUncontrolledDropdown>
          </div>
        </TkCardHeader> */}

        <TkCardBody>
          {isLoading ? (
            <TkLoader />
          ) : (
            <>
              <div>
                <PrjectsStatusCharts series={seriesData} />
              </div>
              <TkRow>
                <TkCol lg={10}>
                  <div className="d-flex justify-content-center align-items-center">
                    <div className="d-flex ff-secondary">
                      <h2>Total Projects : </h2>
                      <h2 className="ff-secondary mb-0">
                        {seriesData[0] +
                          seriesData[1] +
                          seriesData[2] +
                          seriesData[3] +
                          seriesData[4] +
                          seriesData[5] +
                          seriesData[6] || 0}
                      </h2>
                      <div>
                        {/* <p className="text-muted mb-0">Total Projects</p> */}
                        {/* <p className="text-success fw-medium mb-0">
                  <span className="badge badge-soft-success p-1 rounded-circle">
                    <TkIcon className="ri-arrow-right-up-line"></TkIcon>
                  </span>{" "}
                  +3 New
                </p> */}
                      </div>
                    </div>

                    {/* <div className="d-flex justify-content-between border-bottom border-bottom-dashed py-2">
              <p className="fw-medium mb-0">
                <TkIcon className="ri-checkbox-blank-circle-fill text-success align-middle me-2"></TkIcon> Completed
              </p>
              <div>
                <span className="text-muted pe-5">{chartData[0]} Projects</span>
                <span className="text-success fw-medium fs-12">15870hrs</span>
              </div>
            </div>
            <div className="d-flex justify-content-between border-bottom border-bottom-dashed py-2">
              <p className="fw-medium mb-0">
                <TkIcon className="ri-checkbox-blank-circle-fill text-primary align-middle me-2"></TkIcon> In Progress
              </p>
              <div>
                <span className="text-muted pe-5">{chartData[1]} Projects</span>
                <span className="text-success fw-medium fs-12">243hrs</span>
              </div>
            </div>
            <div className="d-flex justify-content-between border-bottom border-bottom-dashed py-2">
              <p className="fw-medium mb-0">
                <TkIcon className="ri-checkbox-blank-circle-fill text-warning align-middle me-2"></TkIcon> Yet to Start
              </p>
              <div>
                <span className="text-muted pe-5">{chartData[2]} Projects</span>
                <span className="text-success fw-medium fs-12">~2050hrs</span>
              </div>
            </div>
            <div className="d-flex justify-content-between py-2">
              <p className="fw-medium mb-0">
                <TkIcon className="ri-checkbox-blank-circle-fill text-danger align-middle me-2"></TkIcon> Cancelled
              </p>
              <div>
                <span className="text-muted pe-5">{chartData[3]} Projects</span>
                <span className="text-success fw-medium fs-12">~900hrs</span>
              </div>
            </div> */}
                  </div>
                </TkCol>
              </TkRow>
            </>
          )}
        </TkCardBody>
      </TkCard>
    </>
  );
};

export default ProjectsStatus;
