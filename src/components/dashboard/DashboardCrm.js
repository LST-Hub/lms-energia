import React from "react";
import { Container, Row } from "reactstrap";
// import BreadCrumb from '../../Components/Common/BreadCrumb';
import BalanceOverview from "./BalanceOverview";
// import ClosingDeals from './ClosingDetails';
import DealsStatus from "./DealStatus";
import DealType from "./DealType";
import MyTasks from "./MyTasks";
import SalesForecast from "./SalesForecast";
import UpcomingActivities from "./UpcomingActivities";
import Widget from "./Widget";
// import SalesForecast from './SalesForecast';

const DashboardCrm = () => {
  // document.title="CRM | Velzon - React Admin & Dashboard Template";
  return (
    <React.Fragment>
      {/* <div className="page-content"> */}
      <Container fluid>
        {/* <BreadCrumb title="CRM" pageTitle="Dashboards" /> */}
        <Row>
          <Widget />
        </Row>
        <Row>
          <SalesForecast />
          <DealType />
          <BalanceOverview />
        </Row>
        <Row>
          <UpcomingActivities />
          <DealsStatus />

        </Row>
        <Row>
          <MyTasks />
          {/* <ClosingDeals /> */}
        </Row>
      </Container>
      {/* </div> */}
    </React.Fragment>
  );
};

export default DashboardCrm;
