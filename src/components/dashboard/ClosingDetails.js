import React from "react";
// import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader, Col } from "reactstrap";
// import { closingDeals } from "../../common/data";
import Image from "next/image";
import Link from "next/link";
const avatar1 = "/images/users/avatar-1.jpg";
const avatar2 = "/images/users/avatar-2.jpg";
const avatar3 = "/images/users/avatar-3.jpg";
const avatar4 = "/images/users/avatar-4.jpg";
const avatar6 = "/images/users/avatar-6.jpg";
const avatar7 = "/images/users/avatar-7.jpg";

const closingDeals = [
  {
    id: 1,
    dealName: "Acme Inc Install",
    img: avatar1,
    salesRep: "Donald Risher",
    amount: "96",
    closeDate: "Today",
  },
  {
    id: 2,
    dealName: "Save lots Stores",
    img: avatar2,
    salesRep: "Jansh Brown",
    amount: "55.7",
    closeDate: "30 Dec 2023",
  },
  {
    id: 3,
    dealName: "William PVT",
    img: avatar7,
    salesRep: "Ayaan Hudda",
    amount: "102",
    closeDate: "25 Nov 2023",
  },
  {
    id: 4,
    dealName: "Raitech Soft",
    img: avatar4,
    salesRep: "Julia William",
    amount: "89.5",
    closeDate: "20 Sep 2023",
  },
  {
    id: 5,
    dealName: "Absternet LLC",
    img: avatar4,
    salesRep: "Vitoria Rodrigues",
    amount: "89.5",
    closeDate: "20 Sep 2023",
  },
];
const ClosingDeals = () => {
  return (
    <React.Fragment>
      <Col xxl={7}>
        <Card className="card-height-100">
          <CardHeader className="align-items-center d-flex">
            <h4 className="card-title mb-0 flex-grow-1">Closing Deals</h4>
            <div className="flex-shrink-0">
              <select className="form-select form-select-sm">
                <option defaultValue="">Closed Deals</option>
                <option value="1">Active Deals</option>
                <option value="2">Paused Deals</option>
                <option value="3">Canceled Deals</option>
              </select>
            </div>
          </CardHeader>
          <CardBody>
            <div className="table-responsive">
              <table className="table table-bordered table-nowrap align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: "30%" }}>
                      Deal Name
                    </th>
                    <th scope="col" style={{ width: "30%" }}>
                      Sales Rep
                    </th>
                    <th scope="col" style={{ width: "20%" }}>
                      Amount
                    </th>
                    <th scope="col" style={{ width: "20%" }}>
                      Close Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {(closingDeals || []).map((item, key) => (
                    <tr key={key}>
                      <td>{item.dealName}</td>
                      <td>
                        <Image src={item.img} alt="" width={25} height={25} className="avatar-xs rounded-circle me-2 overflow-unset" />
                        <Link href="#" className="text-body fw-medium">
                          {item.salesRep}
                        </Link>
                      </td>
                      <td>${item.amount}k</td>
                      <td>{item.closeDate}</td>
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

export default ClosingDeals;
