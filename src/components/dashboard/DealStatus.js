import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
// import { dealsStatus } from "../../common/data";
import Image from "next/image";
import Link from "next/link";
const avatar1 = "/images/users/avatar-1.jpg";
const avatar2 = "/images/users/avatar-2.jpg";
const avatar3 = "/images/users/avatar-3.jpg";
const avatar4 = "/images/users/avatar-4.jpg";
const avatar6 = "/images/users/avatar-6.jpg";

const dealsStatus = [
  {
    id: 1,
    name: "Absternet LLC",
    date: "Sep 20, 2023",
    img: avatar1,
    representativeName: "Donald Risher",
    badgeClass: "success",
    status: "Deal Won",
    statusValue: "$100.1K",
  },
  {
    id: 2,
    name: "Raitech Soft",
    date: "Sep 23, 2023",
    img: avatar2,
    representativeName: "Sofia Cunha",
    badgeClass: "warning",
    status: "Intro Call",
    statusValue: "$150K",
  },
  {
    id: 3,
    name: "William PVT",
    date: "Sep 27, 2023",
    img: avatar3,
    representativeName: "Luis Rocha",
    badgeClass: "danger",
    status: "Stuck",
    statusValue: "$78.18K",
  },
  {
    id: 4,
    name: "Loiusee LLP",
    date: "Sep 30, 2023",
    img: avatar4,
    representativeName: "Vitoria Rodrigues",
    badgeClass: "success",
    status: "Deal Won",
    statusValue: "$180K",
  },
  {
    id: 5,
    name: "Apple Inc.",
    date: "Sep 30, 2023",
    img: avatar6,
    representativeName: "Vitoria Rodrigues",
    badgeClass: "info",
    status: "New Lead",
    statusValue: "$78.9K",
  },
];

const res = dealsStatus.map((item) => {
  return {
    img: item.img,
  };
});
console.log(res);

const DealsStatus = () => {
  return (
    <React.Fragment>
      <Col xl={7}>
        <Card>
          <CardHeader className="align-items-center d-flex">
            <h4 className="card-title mb-0 flex-grow-1">Deals Status</h4>
            <div className="flex-shrink-0">
              <UncontrolledDropdown className="card-header-dropdown">
                <DropdownToggle tag="a" className="text-reset dropdown-btn" role="button">
                  <span className="text-muted">
                    02 Nov 2021 to 31 Dec 2021<i className="mdi mdi-chevron-down ms-1"></i>
                  </span>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                  <DropdownItem>Today</DropdownItem>
                  <DropdownItem>Last Week</DropdownItem>
                  <DropdownItem>Last Month</DropdownItem>
                  <DropdownItem>Current Year</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </div>
          </CardHeader>

          <CardBody>
            <div className="table-responsive table-card">
              <table className="table table-borderless table-hover table-nowrap align-middle mb-0">
                <thead className="table-light">
                  <tr className="text-muted">
                    <th scope="col">Name</th>
                    <th scope="col" style={{ width: "20%" }}>
                      Last Contacted
                    </th>
                    <th scope="col">Sales Representative</th>
                    <th scope="col" style={{ width: "16%" }}>
                      Status
                    </th>
                    <th scope="col" style={{ width: "12%" }}>
                      Deal Value
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {(dealsStatus || []).map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.date}</td>
                      {/* <td>
                        <Image
                          src={item.img}
                          alt=""
                          width={20}
                          height={20}
                          className="avatar-xs rounded-circle me-2"
                        />
                        <Link href="#" className="text-body fw-medium">
                          {item.representativeName}
                        </Link>
                      </td> */}
                      <td>
                        <span className={"badge badge-soft-" + item.badgeClass + " p-2"}>{item.status}</span>
                      </td>
                      <td>
                        <div className="text-nowrap">{item.statusValue}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  );
};

export default DealsStatus;
