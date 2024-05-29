import React from "react";
import { PrjectsStatusCharts } from "./DashboardProjectCharts";
import TkCard, { TkCardBody } from "../TkCard";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, RQ } from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import TkLoader from "../TkLoader";
import { CardHeader, Col } from "reactstrap";

const ProjectsStatus = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.leadChannel],
    queryFn: tkFetch.get(`${API_BASE_URL}/dashboard/pieChart`),
  });

  const seriesData = [];
  if (data) {
    data.items?.map((item) => {
      seriesData.push(Number(item.count));
    });
  }

  return (
    <Col xxl={6}>
      <TkCard>
        <CardHeader className="align-items-center d-flex">
          <h4 className="card-title mb-0 flex-grow-1">Lead Channel</h4>
        </CardHeader>
        <TkCardBody>
          {isLoading ? (
            <TkLoader />
          ) : (
            <>
              <div>
                <PrjectsStatusCharts series={seriesData} />
              </div>
              {/* <TkRow>
                <TkCol lg={9}>
                  <div className="d-flex justify-content-center align-items-center">
                    <div className="d-flex ff-secondary">
                      <h4>Total Leads : </h4>
                      <h4 className="ff-secondary mb-0">
                        {seriesData[0] + seriesData[1] + seriesData[2] + seriesData[3] + seriesData[4] || 0}
                      </h4>
                      <div></div>
                    </div>
                  </div>
                </TkCol>
              </TkRow> */}
            </>
          )}
        </TkCardBody>
      </TkCard>
    </Col>
  );
};

export default ProjectsStatus;
