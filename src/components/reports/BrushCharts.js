import React from "react";
// import ReactApexChart from "react-apexcharts";
import dynamic from "next/dynamic";
import getChartColorsArray from "../../utils/ChartsDynamicColor";
import { Col } from "reactstrap";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  // loading: () => <div>Loading...</div>,
  // suspense: true,
});

const BrushChart = ({ dataColors }) => {
  var BrushChartColors = getChartColorsArray('["--vz-info"]');

  const data = [
    { date: "30/05/2022", count: 1 },
    { date: "22/03/2021", count: 3 },
    { date: "28/03/2021", count: 5 },
    { date: "17/05/2021", count: 1 },
    { date: "07/06/2021", count: 5 },
    { date: "16/06/2021", count: 5 },
    { date: "20/06/2021", count: 1 },
    { date: "27/06/2021", count: 1 },
    { date: "29/06/2021", count: 1 },
    { date: "01/07/2021", count: 2 },
    { date: "11/07/2021", count: 10 },
  ];

  const transformData = (data) => {
    return data.map((item) => {
      // Ensure consistent date format (YYYY-MM-DD)
      const dateParts = item.date.split("/");
      const formattedDate = new Date(`${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`).getTime(); // convert date string to timestamp
      const y = item.count;
      return [formattedDate, y];
    });
  };

  var transformedData = transformData(data);

  // const generateDayWiseTimeSeries = (baseval, count, yrange) => {
  //   var i = 0;
  //   var series = [];
  //   while (i < count) {
  //     var x = baseval;
  //     var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

  //     series.push([x, y]);
  //     baseval += 86400000;
  //     i++;
  //   }
  //   return series;
  // };

  // var data = generateDayWiseTimeSeries(new Date("11 Feb 2017").getTime(), 185, {
  //   min: 30,
  //   max: 90,
  // });

  const series = [
    {
      name: "count",
      data: transformedData,
    },
  ];

  var options = {
    chart: {
      id: "chart2",
      type: "line",
      height: 220,
      toolbar: {
        autoSelected: "pan",
        show: false,
      },
    },
    colors: BrushChartColors,
    stroke: {
      width: 3,
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 1,
    },
    markers: {
      size: 0,
    },
    xaxis: {
      type: "datetime",
      labels: {
        formatter: function (value, timestamp) {
          return new Date(timestamp).toLocaleDateString();
        },
      },
    },
  };

  return (
    <div>
      <Col>
        <ReactApexChart options={options} series={series} type="line" height={330} className="apex-charts" />
      </Col>
    </div>
  );
};

export default BrushChart;
