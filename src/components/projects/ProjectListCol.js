import React from "react";
// import { Link } from "react-router-dom";
import Link from "next/link";
import Image from "next/future/image";
import { formatDate } from "../../utils/date";
import { isValid } from "date-fns";
import { urls } from "../../utils/Constants";

const handleValidDate = (date) => {
  const d = new Date(date);
  const date1 = isValid(d) ? formatDate(d, "dd MMM YYYYY") : "Invalid Date";
  return date1;
};

const OrdersId = (cell) => {
  return (
    <React.Fragment>
      <Link href={`${urls.projects}/${cell.row.original.id}`}>
        <a className="fw-medium link-primary">{cell.value}</a>
      </Link>
    </React.Fragment>
  );
};

const Project = (cell) => {
  return (
    <React.Fragment>
      {/* TODO: add real projects links */}
      <Link href={`${urls.projects}/test-project`}>
        <a className="fw-medium link-primary">{cell.value}</a>
      </Link>
    </React.Fragment>
  );
};

const Tasks = (cell, onEditIconClick, onDeleteIconClick) => {
  return (
    <React.Fragment>
      <div className="d-flex">
        <div className="flex-grow-1 tasks_name">{cell.value}</div>
        <div className="flex-shrink-0 ms-4">
          <ul className="list-inline tasks-list-menu mb-0">
            <li className="list-inline-item">
              {/* TODO: add real tasks links */}
              <Link href="/tasks/test-task">
                <a>
                  <i className="ri-eye-fill align-bottom me-2 text-muted"></i>
                </a>
              </Link>
            </li>
            <li className="list-inline-item">
              <Link href="#">
                <a onClick={onEditIconClick}>
                  <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>
                </a>
              </Link>
            </li>
            <li className="list-inline-item">
              <Link href="#">
                <a className="remove-item-btn" onClick={onDeleteIconClick}>
                  <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>
                </a>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </React.Fragment>
  );
};

const CreateBy = (cell) => {
  return <React.Fragment>{cell.value}</React.Fragment>;
};

const AssignedTo = (cell) => {
  return (
    <React.Fragment>
      <div className="avatar-group">
        {(cell.value || []).map((item, index) => (
          <Link key={index} href="#">
            <a className="avatar-group-item">
              {/* TODO: the below images should come in a line but they are going to next line, see them */}
              <Image src={item.img} alt="image" className="rounded-circle avatar-xxs" />
              {/* <img src={item.img} alt="" className="rounded-circle avatar-xxs" /> */}
            </a>
          </Link>
        ))}
      </div>
    </React.Fragment>
  );
};

const DueDate = (cell) => {
  return <React.Fragment>{handleValidDate(cell.value)}</React.Fragment>;
};

const Status = (cell) => {
  return (
    <React.Fragment>
      {/* {cell.value.color === "danger" ? (
        <span className="badge badge-soft-danger text-uppercase">{cell.value.name}</span>
      ) : cell.value.color === "warning" ? (
        <span className="badge badge-soft-warning text-uppercase">{cell.value.name}</span>
      ) : cell.value.color === "success" ? (
        <span className="badge badge-soft-success text-uppercase">{cell.value.name}</span>
      ) : null} */}
      <span className={`badge badge-soft-${cell.value.color} text-uppercase`}>{cell.value.name}</span>
    </React.Fragment>
  );
};

const Priority = (cell) => {
  return (
    <React.Fragment>
      {/* {cell.value.color === "danger" ? (
        <span className="badge badge-soft-danger text-uppercase">{cell.value.name}</span>
      ) : cell.value.color === "warning" ? (
        <span className="badge badge-soft-warning text-uppercase">{cell.value.name}</span>
      ) : cell.value.color === "success" ? (
        <span className="badge badge-soft-success text-uppercase">{cell.value.name}</span>
      ) : null} */}
      <span className={`badge badge-soft-${cell.value.color} text-uppercase`}>{cell.value.name}</span>
    </React.Fragment>
  );
};

export { OrdersId, Project, Tasks, CreateBy, AssignedTo, DueDate, Status, Priority };
