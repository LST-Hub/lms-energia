import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
import Link from "next/link";
import Image from "next/future/image";
import {
  Card,
  CardBody,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
import DeleteModal from "../../utils/DeleteModal";
import { projectList } from "../../test-data/project-list";
// import { ToastContainer } from "react-toastify";

//Import Icons
import FeatherIcon from "feather-icons-react";

const List = () => {
  // this is used to store project id that is clicked on delete button, view or edit
  //   const [project, setProject] = useState(null);
  const projectLists = projectList;
  const [deleteModal, setDeleteModal] = useState(false);

  // delete
  const onClickData = (project) => {
    // setProject(project);
    setDeleteModal(true);
  };

  const handleDeleteProjectList = () => {
    // if (project) {
    //   dispatch(onDeleteProjectList(project));
    // }
    setDeleteModal(false);
  };

  const activebtn = (ele) => {
    if (ele.closest("button").classList.contains("active")) {
      ele.closest("button").classList.remove("active");
    } else {
      ele.closest("button").classList.add("active");
    }
  };

  return (
    <React.Fragment>
      {/* <ToastContainer closeButton={false} /> */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={() => handleDeleteProjectList()}
        onCloseClick={() => setDeleteModal(false)}
      />
      <Row className="g-4 mb-3">
        <div className="col-sm-auto">
          <div>
            <Link href="/projects/add">
              <a className="btn btn-success">
                <i className="ri-add-line align-bottom me-1"></i> Add New
              </a>
            </Link>
          </div>
        </div>
        <div className="col-sm-3 ms-auto">
          <div className="d-flex justify-content-sm-end gap-2">
            <div className="search-box ms-2 col-sm-7">
              <Input type="text" className="form-control" placeholder="Search..." />
              <i className="ri-search-line search-icon"></i>
            </div>

            <select className="form-control w-md" data-choices data-choices-search-false>
              <option value="All">All</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last Year">Last Year</option>
              <option value="This Month">This Month</option>
              <option value="Today">Today</option>
              <option value="Yesterday" defaultValue>
                Yesterday
              </option>
            </select>
          </div>
        </div>
      </Row>

      <div className="row">
        {(projectLists || []).map((item, index) => (
          <React.Fragment key={index}>
            {item.isDesign1 ? (
              <Col xxl={3} sm={6} className="project-card">
                <Card className="card-height-100">
                  <CardBody>
                    <div className="d-flex flex-column h-100">
                      <div className="d-flex">
                        <div className="flex-grow-1">
                          <p className="text-muted mb-4">{item.time}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="d-flex gap-1 align-items-center">
                            <button
                              type="button"
                              className={`btn avatar-xs mt-n1 p-0 favourite-btn ${item.ratingClass}`}
                              onClick={(e) => activebtn(e.target)}
                            >
                              <span className="avatar-title bg-transparent fs-15">
                                <i className="ri-star-fill"></i>
                              </span>
                            </button>
                            <UncontrolledDropdown direction="start">
                              <DropdownToggle
                                tag="button"
                                className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15"
                              >
                                <FeatherIcon icon="more-horizontal" className="icon-sm" />
                              </DropdownToggle>

                              <DropdownMenu className="dropdown-menu-end">
                                <DropdownItem>
                                  <Link href="/projects/test-project">
                                    <a>
                                      <i className="ri-eye-fill align-bottom me-2 text-muted"></i>{" "}
                                      View
                                    </a>
                                  </Link>
                                </DropdownItem>
                                {/* <DropdownItem href="/projects/add">
                                  <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                                  Edit
                                </DropdownItem> */}
                                <div className="dropdown-divider"></div>
                                <DropdownItem
                                  onClick={() => onClickData(item)}
                                  data-bs-toggle="modal"
                                  data-bs-target="#removeProjectModal"
                                >
                                  <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                                  Remove
                                </DropdownItem>
                              </DropdownMenu>
                            </UncontrolledDropdown>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex mb-2">
                        <div className="flex-shrink-0 me-3">
                          <div className="avatar-sm">
                            <span className={"avatar-title rounded p-2 bg-soft-" + item.imgbgColor}>
                              {/* <img src={item.img} alt="" className="img-fluid p-1" /> */}
                              <Image src={item.img} alt="project img" className="img-fluid p-1" />
                            </span>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h5 className="mb-1 fs-15">
                            <Link href="/projects/test-project">
                              <a className="text-dark">{item.label}</a>
                            </Link>
                          </h5>
                          <p className="text-muted text-truncate-two-lines mb-3">{item.caption}</p>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <div className="d-flex mb-2">
                          <div className="flex-grow-1">
                            <div>Tasks</div>
                          </div>
                          <div className="flex-shrink-0">
                            <div>
                              <i className="ri-list-check align-bottom me-1 text-muted"></i>{" "}
                              {item.number}
                            </div>
                          </div>
                        </div>
                        <div className="progress progress-sm animated-progess">
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            aria-valuenow="34"
                            aria-valuemin="0"
                            aria-valuemax="100"
                            style={{ width: item.progressBar }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                  <div className="card-footer bg-transparent border-top-dashed py-2">
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <div className="avatar-group">
                          {item.subItem.map((item, key) => (
                            <React.Fragment key={key}>
                              {item.imgFooter ? (
                                <Link href="#">
                                  <a
                                    className="avatar-group-item"
                                    data-bs-toggle="tooltip"
                                    data-bs-trigger="hover"
                                    data-bs-placement="top"
                                    title="Darline Williams"
                                  >
                                    <div className="avatar-xxs">
                                      {/* <img
                                      src={item.imgFooter}
                                      alt=""
                                      className="rounded-circle img-fluid"
                                    /> */}
                                      <Image
                                        src={item.imgFooter}
                                        alt="image"
                                        className="rounded-circle img-fluid"
                                      />
                                    </div>
                                  </a>
                                </Link>
                              ) : (
                                <Link href="#">
                                  <a
                                    className="avatar-group-item"
                                    data-bs-toggle="tooltip"
                                    data-bs-trigger="hover"
                                    data-bs-placement="top"
                                    title="Add Users"
                                  >
                                    <div className="avatar-xxs">
                                      <div
                                        className={
                                          item.bgColor
                                            ? "avatar-title rounded-circle bg-" + item.bgColor
                                            : "avatar-title rounded-circle bg-light border-dashed border text-primary fs-16 "
                                        }
                                      >
                                        {item.imgNumber}
                                      </div>
                                    </div>
                                  </a>
                                </Link>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="text-muted">
                          <i className="ri-calendar-event-fill me-1 align-bottom"></i> {item.date}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ) : item.isDesign2 ? (
              <Col xxl={3} sm={6} className="project-card">
                <Card>
                  <CardBody>
                    <div className={`p-3 mt-n3 mx-n3 bg-soft-${item.cardHeaderClass} rounded-top`}>
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1">
                          <h5 className="mb-0 fs-14">
                            <Link href="/projects/test-project">
                              <a className="text-dark">{item.label}</a>
                            </Link>
                          </h5>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="d-flex gap-1 align-items-center my-n2">
                            <button
                              type="button"
                              className={`btn avatar-xs mt-n1 p-0 favourite-btn ${item.ratingClass}`}
                              onClick={(e) => activebtn(e.target)}
                            >
                              <span className="avatar-title bg-transparent fs-15">
                                <i className="ri-star-fill"></i>
                              </span>
                            </button>
                            <UncontrolledDropdown direction="start">
                              <DropdownToggle
                                tag="button"
                                className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15"
                              >
                                <FeatherIcon icon="more-horizontal" className="icon-sm" />
                              </DropdownToggle>

                              <DropdownMenu className="dropdown-menu-end">
                                <DropdownItem>
                                  <Link href="/projects/test-project">
                                    <a>
                                      <i className="ri-eye-fill align-bottom me-2 text-muted"></i>{" "}
                                      View
                                    </a>
                                  </Link>
                                </DropdownItem>
                                {/* <DropdownItem href="/projects/add">
                                  <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                                  Edit
                                </DropdownItem> */}
                                <div className="dropdown-divider"></div>
                                <DropdownItem
                                  onClick={() => onClickData(item)}
                                  data-bs-toggle="modal"
                                  data-bs-target="#removeProjectModal"
                                >
                                  <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                                  Remove
                                </DropdownItem>
                              </DropdownMenu>
                            </UncontrolledDropdown>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="py-3">
                      <Row className="gy-3">
                        <Col xs={6}>
                          <div>
                            <p className="text-muted mb-1">Status</p>
                            <div className={"fs-12 badge badge-soft-" + item.statusClass}>
                              {item.status}
                            </div>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div>
                            <p className="text-muted mb-1">Deadline</p>
                            <h5 className="fs-14">{item.deadline}</h5>
                          </div>
                        </Col>
                      </Row>

                      <div className="d-flex align-items-center mt-3">
                        <p className="text-muted mb-0 me-2">Team :</p>
                        <div className="avatar-group">
                          {item.subItem.map((item, key) => (
                            <React.Fragment key={key}>
                              {item.imgTeam ? (
                                <Link href="#">
                                  <a
                                    className="avatar-group-item"
                                    data-bs-toggle="tooltip"
                                    data-bs-trigger="hover"
                                    data-bs-placement="top"
                                    title="Darline Williams"
                                  >
                                    <div className="avatar-xxs">
                                      {/* <img
                                      src={item.imgTeam}
                                      alt=""
                                      className="rounded-circle img-fluid"
                                    /> */}
                                      <Image
                                        src={item.imgTeam}
                                        alt="image"
                                        className="rounded-circle img-fluid"
                                      />
                                    </div>
                                  </a>
                                </Link>
                              ) : (
                                <Link href="#">
                                  <a
                                    className="avatar-group-item"
                                    data-bs-toggle="tooltip"
                                    data-bs-trigger="hover"
                                    data-bs-placement="top"
                                    title="Donna Kline"
                                  >
                                    <div className="avatar-xxs">
                                      <div
                                        className={
                                          item.bgColor
                                            ? "avatar-title rounded-circle bg-" + item.bgColor
                                            : "avatar-title fs-16 rounded-circle bg-light border-dashed border text-primary"
                                        }
                                      >
                                        {item.imgNumber}
                                      </div>
                                    </div>
                                  </a>
                                </Link>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="d-flex mb-2">
                        <div className="flex-grow-1">
                          <div>Progress</div>
                        </div>
                        <div className="flex-shrink-0">
                          <div>{item.progressBar}</div>
                        </div>
                      </div>
                      <div className="progress progress-sm animated-progess">
                        <div
                          className="progress-bar bg-success"
                          role="progressbar"
                          aria-valuenow="50"
                          aria-valuemin="0"
                          aria-valuemax="100"
                          style={{ width: item.progressBar }}
                        ></div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ) : item.isDesign3 ? (
              <Col xxl={3} sm={6} className="project-card">
                <Card>
                  <CardBody>
                    <div className={`p-3 mt-n3 mx-n3 bg-${item.cardHeaderClass} rounded-top`}>
                      <div className="d-flex gap-1 align-items-center justify-content-end my-n2">
                        <button
                          type="button"
                          className={`btn avatar-xs mt-n1 p-0 favourite-btn ${item.ratingClass}`}
                          onClick={(e) => activebtn(e.target)}
                        >
                          <span className="avatar-title bg-transparent fs-15">
                            <i className="ri-star-fill"></i>
                          </span>
                        </button>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            tag="button"
                            className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15"
                          >
                            <FeatherIcon icon="more-horizontal" className="icon-sm" />
                          </DropdownToggle>

                          <DropdownMenu className="dropdown-menu-end">
                            <DropdownItem>
                              <Link href="/projects/test-project">
                                <a>
                                  <i className="ri-eye-fill align-bottom me-2 text-muted"></i> View
                                </a>
                              </Link>
                            </DropdownItem>
                            {/* <DropdownItem href="/projects/add">
                              <i className="ri-pencil-fill align-bottom me-2 text-muted"></i> Edit
                            </DropdownItem> */}
                            <DropdownItem divider />
                            <DropdownItem
                              onClick={() => onClickData(item)}
                              data-bs-toggle="modal"
                              data-bs-target="#removeProjectModal"
                            >
                              <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                              Remove
                            </DropdownItem>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                      <div className="text-center pb-3">
                        {/* <img src={item.img} alt="" height="32" /> */}
                        <Image src={item.img} alt="image" height={32} />
                      </div>
                    </div>

                    <div className="py-3">
                      <h5 className="fs-14 mb-3">
                        <Link href="/projects/test-project">
                          <a className="text-dark">{item.label}</a>
                        </Link>
                      </h5>
                      <Row className="gy-3">
                        <Col xs={6}>
                          <div>
                            <p className="text-muted mb-1">Status</p>
                            <div className={"fs-12 badge badge-soft-" + item.statusClass}>
                              {item.status}
                            </div>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div>
                            <p className="text-muted mb-1">Deadline</p>
                            <h5 className="fs-14">{item.deadline}</h5>
                          </div>
                        </Col>
                      </Row>

                      <div className="d-flex align-items-center mt-3">
                        <p className="text-muted mb-0 me-2">Team :</p>
                        <div className="avatar-group">
                          {item.subItem.map((item, key) => (
                            <React.Fragment key={key}>
                              {item.imgTeam ? (
                                <Link href="#">
                                  <a
                                    className="avatar-group-item"
                                    data-bs-toggle="tooltip"
                                    data-bs-trigger="hover"
                                    data-bs-placement="top"
                                    title="Darline Williams"
                                  >
                                    <div className="avatar-xxs">
                                      {/* <img
                                      src={item.imgTeam}
                                      alt=""
                                      className="rounded-circle img-fluid"
                                    /> */}
                                      <Image
                                        src={item.imgTeam}
                                        alt="image"
                                        className="rounded-circle img-fluid"
                                      />
                                    </div>
                                  </a>
                                </Link>
                              ) : (
                                <Link href="#">
                                  <a
                                    className="avatar-group-item"
                                    data-bs-toggle="tooltip"
                                    data-bs-trigger="hover"
                                    data-bs-placement="top"
                                    title="Donna Kline"
                                  >
                                    <div className="avatar-xxs">
                                      <div
                                        className={
                                          item.bgColor
                                            ? "avatar-title rounded-circle bg-" + item.bgColor
                                            : "avatar-title fs-16 rounded-circle bg-light border-dashed border text-primary"
                                        }
                                      >
                                        {item.imgNumber}
                                      </div>
                                    </div>
                                  </a>
                                </Link>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="d-flex mb-2">
                        <div className="flex-grow-1">
                          <div>Tasks</div>
                        </div>
                        <div className="flex-shrink-0">
                          <div>
                            <i className="ri-list-check align-bottom me-1 text-muted"></i>{" "}
                            {item.number}
                          </div>
                        </div>
                      </div>
                      <div className="progress progress-sm animated-progess">
                        <div
                          className="progress-bar bg-success"
                          role="progressbar"
                          aria-valuenow="71"
                          aria-valuemin="0"
                          aria-valuemax="100"
                          style={{ width: item.progressBar }}
                        ></div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ) : null}
          </React.Fragment>
        ))}
      </div>
      <Row className="g-0 text-center text-sm-start align-items-center mb-4">
        <Col sm={6}>
          <div>
            <p className="mb-sm-0 text-muted">
              Showing <span className="fw-semibold">1</span> to{" "}
              <span className="fw-semibold">10</span> of{" "}
              <span className="fw-semibold text-decoration-underline">12</span> entries
            </p>
          </div>
        </Col>

        <Col sm={6}>
          <ul className="pagination pagination-separated justify-content-center justify-content-sm-end mb-sm-0">
            <li className="page-item disabled">
              <Link href="#">
                <a className="page-link">Previous</a>
              </Link>
            </li>
            <li className="page-item active">
              <Link href="#">
                <a className="page-link">1</a>
              </Link>
            </li>
            <li className="page-item ">
              <Link href="#">
                <a className="page-link">2</a>
              </Link>
            </li>
            <li className="page-item">
              <Link href="#">
                <a className="page-link">3</a>
              </Link>
            </li>
            <li className="page-item">
              <Link href="#">
                <a className="page-link">4</a>
              </Link>
            </li>
            <li className="page-item">
              <Link href="#">
                <a className="page-link">5</a>
              </Link>
            </li>
            <li className="page-item">
              <Link href="#">
                <a className="page-link">Next</a>
              </Link>
            </li>
          </ul>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default List;
