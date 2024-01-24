import React from "react";
import { Alert, Card, CardBody, Col, Row } from "reactstrap";

//Import Icons
import FeatherIcon from "feather-icons-react";

//import images
import illustarator from "/public/images/user-illustarator-2.png";
// import { Link } from 'react-router-dom';
import Link from "next/link";
import Image from "next/future/image";

const UpgradeAccountNotice = () => {
  return (
    <>
      <Card>
        <CardBody className="p-0">
          <Alert
            className="alert alert-warning border-0 rounded-0 m-0 d-flex align-items-center"
            role="alert"
          >
            <FeatherIcon icon="alert-triangle" className="text-warning me-2 icon-sm" />
            <div className="flex-grow-1 text-truncate">
              Your free trial expired in <b>17</b> days.
            </div>
            <div className="flex-shrink-0">
              <Link href="/pages-pricing">
                <a className="text-reset text-decoration-underline">
                  <b>Upgrade</b>
                </a>
              </Link>
            </div>
          </Alert>

          <Row className="align-items-end">
            <Col sm={8}>
              <div className="p-3">
                <p className="fs-16 lh-base">
                  Upgrade your plan from a <span className="fw-semibold">Free trial</span>, to
                  ‘Premium Plan’ <i className="mdi mdi-arrow-right"></i>
                </p>
                <div className="mt-3">
                  <Link href="/pages-pricing">
                    <a className="btn btn-success">Upgrade Account!</a>
                  </Link>
                </div>
              </div>
            </Col>
            <Col sm={4}>
              <div className="px-3">
                <Image
                  src={illustarator}
                  alt="illustarator"
                  className="img-fluid"
                  placeholder="blur"
                  // layout="responsive"
                />
                {/* <img src={illustarator} className="img-fluid" alt="" /> */}
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </>
  );
};

export default UpgradeAccountNotice;
