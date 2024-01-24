import React, { useState } from "react";
// import { Link } from 'react-router-dom';
import Link from "next/link";
import { Col, Row } from "reactstrap";
import Flatpickr from "react-flatpickr";
import { Button, ButtonGroup } from "reactstrap";

const TopBar = ({ tabSelected, setTabSelected, toggleModal }) => {
    //   const [tabSelected, setTabSelected] = useState(1);

    return (
        <>
            <Row>
                <Col xs={12}>
                    <div className="page-title-box d-sm-flex align-items-center space-childern fs-small">
                        {/* <h4 className="mb-sm-0">{title}</h4> */}
                        {/* //TODO: add left and right arrow to chnage dates */}
                        {/* <div className="timesheet-topbar-date-picker">
                            <Flatpickr
                                defaultValue={new Date().toDateString()}
                                placeholder="Select date range"
                                className="form-control"
                                options={{
                                    mode: "range",
                                    dateFormat: "d M, Y",
                                }}
                            />
                        </div> */}
                        <div className="btn-group">
                            {/* <h5>Radio Buttons</h5> */}
                            {/* <ButtonGroup>
                                <Button
                                    color="primary"
                                    outline
                                    onClick={() => setTabSelected(1)}
                                    active={tabSelected === 1}
                                >
                                    Today
                                </Button>
                                <Button
                                    color="primary"
                                    outline
                                    onClick={() => setTabSelected(2)}
                                    active={tabSelected === 2}
                                >
                                    Week
                                </Button> */}
                            {/* <Button
                    color="primary"
                    outline
                    onClick={() => setRSelected(3)}
                    active={rSelected === 3}
                  >
                    Radio 3
                  </Button> */}
                            {/* </ButtonGroup> */}
                            {/* <p>Selected:    {rSelected}</p> */}
                        </div>

                        <style jsx>
                            {`
                .timesheet-topbar-date-picker {
                  width: 10rem !important;
                }
              `}
                        </style>
                        <div className="ms-auto space-childern-sm">
                            <Link href="/expense-categories/add">
                                <Button className="btn btn-primary">
                                    <i className="ri-add-line align-bottom me-1"></i> Add Category
                                </Button>
                            </Link>
                            {/* <Button className="btn btn-primary" >
                                <i className="ri-arrow-go-forward-line align-bottom me-1"></i> Prev. Entries
                            </Button> */}
                            {/* <Link href="/timesheet/add">
                <a className="btn btn-primary">Add Task</a>
              </Link> */}
                        </div>
                        {/* <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link href="#">
                    <a>{pageTitle}</a>
                  </Link>
                </li>
                <li className="breadcrumb-item active">{title}</li>
              </ol>
            </div> */}
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default TopBar;
