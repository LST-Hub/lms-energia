import React from "react";
import BrushChart from "./BrushCharts";
import BrushChartFilter from "./BrushChartFilter";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, RQ } from "../../utils/Constants";
import tkFetch from "../../utils/fetch";

function LeadCountChart() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.leadCountperDay],
    queryFn: tkFetch.get(`${API_BASE_URL}/dashboard/lead-count-perday`),
  });

  console.log("data", data);

  return (
    <>
      <div>
        <BrushChart />
      </div>
      <div>
        <BrushChartFilter />
      </div>
    </>
  );
}

export default LeadCountChart;
