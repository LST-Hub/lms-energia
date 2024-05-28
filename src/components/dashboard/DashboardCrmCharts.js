import React, { useEffect, useState } from "react";
// import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../utils/ChartsDynamicColor";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  // loading: () => <div>Loading...</div>,
  // suspense: true,
});

// const getChartColorsArray = dynamic(
//   () => import("../../utils/ChartsDynamicColor"),
//   { ssr: false }
// );

const SalesForecastCharts = ({ dataColors, series }) => {
  const [linechartcustomerColors, setLinechartcustomerColors] = useState([]);

  //   useEffect(() => {
  //     const charColorsArray = async () => {
  //       const getChartColorsArray = (
  //         await import("../../utils/ChartsDynamicColor")
  //       ).default;
  //       setLinechartcustomerColors(getChartColorsArray(dataColors));
  //     };
  //     charColorsArray();
  //   }, [dataColors]);

  var options = {
    chart: {
      type: "bar",
      height: 341,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "65%",
      },
    },
    stroke: {
      show: true,
      width: 5,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [""],
      axisTicks: {
        show: false,
        borderType: "solid",
        color: "#78909C",
        height: 6,
        offsetX: 0,
        offsetY: 0,
      },
      title: {
        text: "Total Forecasted Value",
        offsetX: 0,
        offsetY: -30,
        style: {
          color: "#78909C",
          fontSize: "12px",
          fontWeight: 400,
        },
      },
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return "$" + value + "k";
        },
      },
      tickAmount: 4,
      min: 0,
    },
    fill: {
      opacity: 1,
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontWeight: 500,
      offsetX: 0,
      offsetY: -14,
      itemMargin: {
        horizontal: 8,
        vertical: 0,
      },
      markers: {
        width: 10,
        height: 10,
      },
    },
    // colors: linechartcustomerColors,
  };
  return (
    <React.Fragment>
      <ReactApexChart options={options} series={series} type="bar" height="341" className="apex-charts" />
    </React.Fragment>
  );
};

const LeadValueCharts = ({ series }) => {
  // const series = [
  //   {
  //     name: "sales",
  //     data: [
  //       {
  //         x: "Direct Call",
  //         y: 400,
  //       },
  //       {
  //         x: "Email",
  //         y: 430,
  //       },
  //       {
  //         x: "Social Media",
  //         y: 448,
  //       },
  //       {
  //         x: "Portal",
  //         y: 470,
  //       },
  //       {
  //         x: "Direct Marketing",
  //         y: 540,
  //       },
  //     ],
  //   },
  // ];

  var options = {
    chart: {
      type: "bar",
      height: 380,
    },
    xaxis: {
      type: "category",
      labels: {
        formatter: function (val) {
          return val;
        },
      },
    },
    // title: {
    //   text: "Grouped Labels on the X-axis",
    // },
    yaxis: {
      logarithmic: true, // this line enables the logarithmic scale
    },
    tooltip: {
      x: {
        formatter: function (val) {
          return val;
        },
      },
    },
    dataLabels: {
      enabled: false,
      formatter: function (val, opts) {
        return val;
      },
    },
  };

  return (
    <div>
      <div id="chart">
        <ReactApexChart options={options} series={series} type="bar" height={380} />
      </div>
      <div id="html-dist"></div>
    </div>
  );
};

const DealTypeCharts = ({ dataColors, series }) => {
  var dealTypeChartsColors = getChartColorsArray(dataColors);

  var options = {
    chart: {
      height: 341,
      type: "radar",
      dropShadow: {
        enabled: true,
        blur: 1,
        left: 1,
        top: 1,
      },
      toolbar: {
        show: false,
      },
    },
    stroke: {
      width: 2,
    },
    fill: {
      opacity: 0.2,
    },
    legend: {
      show: true,
      fontWeight: 500,
      offsetX: 0,
      offsetY: -8,
      markers: {
        width: 8,
        height: 8,
        radius: 6,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 0,
      },
    },
    markers: {
      size: 0,
    },
    colors: dealTypeChartsColors,
    xaxis: {
      categories: ["2016", "2017", "2018", "2019", "2020", "2021"],
    },
  };
  return (
    <React.Fragment>
      <ReactApexChart options={options} series={series} type="radar" height="341" className="apex-charts" />
    </React.Fragment>
  );
};

const BalanceOverviewCharts = ({ dataColors, series }) => {
  var revenueExpensesChartsColors = getChartColorsArray(dataColors);

  var options = {
    chart: {
      height: 290,
      type: "area",
      toolbar: "false",
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return "$" + value + "k";
        },
      },
      tickAmount: 5,
      min: 0,
      max: 260,
    },
    colors: revenueExpensesChartsColors,
    fill: {
      opacity: 0.06,
      colors: revenueExpensesChartsColors,
      type: "solid",
    },
  };
  return (
    <React.Fragment>
      <ReactApexChart options={options} series={series} type="area" height="290" className="apex-charts" />
    </React.Fragment>
  );
};

export { SalesForecastCharts, LeadValueCharts, DealTypeCharts, BalanceOverviewCharts };
