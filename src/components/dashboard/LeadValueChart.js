import React, { useState, useEffect } from "react";
import { Card, CardHeader, Col, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { LeadValueCharts, SalesForecastCharts } from "./DashboardCrmCharts";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, RQ } from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import TkLoader from "../TkLoader";
// import { useSelector, useDispatch } from "react-redux";
// import { getSalesForecastChartsData } from "../../store/dashboardCRM/action";

const LeadValueChart = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.projectStatus],
    queryFn: tkFetch.get(`${API_BASE_URL}/dashboard/channelValueChart`),
  });

  const idToNameMap = {
    1: "Direct Call",
    2: "Email",
    3: "Social Media",
    4: "Portal",
    5: "Direct Marketing",
  };

  const series = [
    {
      name: "sales",
      data: data?.map((item) => ({
        x: idToNameMap[item.custentity_lms_channel_lead_id],
        y: item.custrecord_lms_lead_value,
      })),
    },
  ];

  return (
    <React.Fragment>
      <Col xxl={6} md={6}>
        <Card>
          <CardHeader className="align-items-center d-flex">
            <h4 className="card-title mb-0 flex-grow-1">Lead Channel Value</h4>
          </CardHeader>
          {isLoading ? (
            <TkLoader />
          ) : (
            <div className="card-body pb-0">
              <div id="sales-forecast-chart" className="apex-charts" dir="ltr">
                <LeadValueCharts series={series} dataColors='["--vz-primary", "--vz-success", "--vz-warning"]' />
              </div>
            </div>
          )}
        </Card>
      </Col>
    </React.Fragment>
  );
};

export default LeadValueChart;
