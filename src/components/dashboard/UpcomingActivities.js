import React from "react";
// import { Link } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
// import { activities } from "../../common/data";
import Image from "next/image";
import Link from "next/link";

const avatar1 = "/images/users/avatar-1.jpg";
const avatar2 = "/images/users/avatar-2.jpg";
const avatar3 = "/images/users/avatar-3.jpg";
const avatar4 = "/images/users/avatar-4.jpg";
const avatar5 = "/images/users/avatar-5.jpg";
const avatar6 = "/images/users/avatar-6.jpg";
const avatar7 = "/images/users/avatar-7.jpg";
const avatar8 = "/images/users/avatar-8.jpg";

const activities = [
  {
    id: 1,
    date: "25",
    weekDay: "Tue",
    time: "12:00am - 03:30pm",
    caption: "Meeting for campaign with sales team",
    subItem: [
      { id: 1, img: avatar1 },
      { id: 2, img: avatar2 },
      { id: 3, img: avatar3 },
    ],
    imgNumber: "5",
    bgcolor: "bg-info",
  },
  {
    id: 2,
    date: "20",
    weekDay: "Wed",
    time: "02:00pm - 03:45pm",
    caption: "Adding a new event with attachments",
    subItem: [
      { id: 1, img: avatar4 },
      { id: 2, img: avatar5 },
      { id: 3, img: avatar6 },
      { id: 4, img: avatar7 },
    ],
    imgNumber: "3",
    bgcolor: "bg-success",
  },
  {
    id: 3,
    date: "17",
    weekDay: "Wed",
    time: "04:30pm - 07:15pm",
    caption: "Create new project Bundling Product",
    subItem: [
      { id: 1, img: avatar8 },
      { id: 2, img: avatar1 },
      { id: 3, img: avatar2 },
    ],
    imgNumber: "4",
    bgcolor: "bg-primary",
  },
  {
    id: 4,
    date: "12",
    weekDay: "Tue",
    time: "10:30am - 01:15pm",
    caption: "Weekly closed sales won checking with sales team",
    subItem: [
      { id: 1, img: avatar1 },
      { id: 2, img: avatar5 },
      { id: 3, img: avatar2 },
    ],
    imgNumber: "9",
    bgcolor: "bg-warning",
  },
];

const UpcomingActivities = () => {
  return (
    <React.Fragment>
      <Col xxl={5}>
        <Card>
          <CardHeader className="align-items-center d-flex">
            <h4 className="card-title mb-0 flex-grow-1">Upcoming Activities</h4>
            <div className="flex-shrink-0">
              <UncontrolledDropdown className="card-header-dropdown" direction="start">
                <DropdownToggle className="text-reset dropdown-btn" tag="a" role="button">
                  <span className="text-muted fs-18">
                    <i className="mdi mdi-dots-vertical"></i>
                  </span>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu dropdown-menu-end">
                  <DropdownItem>Edit</DropdownItem>
                  <DropdownItem>Remove</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </div>
          </CardHeader>
          <CardBody className="card-body pt-0">
            <ul className="list-group list-group-flush border-dashed">
              {(activities || []).map((item, key) => (
                <li className="list-group-item ps-0" key={key}>
                  <Row className="align-items-center g-3">
                    <div className="col-auto">
                      <div className="avatar-sm p-1 py-2 h-auto bg-light rounded-3">
                        <div className="text-center">
                          <h5 className="mb-0">{item.date}</h5>
                          <div className="text-muted">{item.weekDay}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <h5 className="text-muted mt-0 mb-1 fs-13">{item.time}</h5>
                      <Link href="#" className="text-reset fs-14 mb-0">
                        {item.caption}
                      </Link>
                    </div>
                    <div className="col-sm-auto">
                      <div className="avatar-group">
                        {(item.subItem || []).map((subItem, key) => (
                          <React.Fragment key={key}>
                            <div className="avatar-group-item">
                              <Link
                                href="#"
                                className="d-inline-block"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title=""
                                data-bs-original-title="Stine Nielsen"
                              >
                                <Image
                                  src={subItem.img}
                                  alt=""
                                  width={25}
                                  height={25}
                                  className="rounded-circle avatar-xxs"
                                />
                              </Link>
                            </div>
                          </React.Fragment>
                        ))}
                        <div className="avatar-group-item">
                          <Link href="#">
                            <div className="avatar-xxs">
                              <span className={"avatar-title rounded-circle " + item.bgcolor + " text-white"}>
                                {item.imgNumber}
                              </span>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Row>
                </li>
              ))}
            </ul>
            <div className="align-items-center mt-2 row g-3 text-center text-sm-start">
              <div className="col-sm">
                <div className="text-muted">
                  Showing <span className="fw-semibold"> 4</span> of <span className="fw-semibold">125</span> Results
                </div>
              </div>
              <div className="col-sm-auto">
                <ul className="pagination pagination-separated pagination-sm justify-content-center justify-content-sm-start mb-0">
                  <li className="page-item disabled">
                    <Link href="#" className="page-link">
                      ←
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link href="#" className="page-link">
                      1
                    </Link>
                  </li>
                  <li className="page-item active">
                    <Link href="#" className="page-link">
                      2
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link href="#" className="page-link">
                      3
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link href="#" className="page-link">
                      →
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  );
};

export default UpcomingActivities;
