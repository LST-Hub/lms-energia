import React from "react";
import Link from "next/link";
import Image from "next/future/image";
import TkIcon from "../TkIcon";
import { formatDate } from "../../utils/date";
import { urls } from "../../utils/Constants";

const OrdersId = (cell) => {
  return (
    <React.Fragment>
      <Link href={`${urls.clientView}/${cell.row.original.id}`}>
        <a className="fw-medium link-primary">{cell.value}</a>
      </Link>
    </React.Fragment>
  );
};

const ClientName = (cell) => {
  return (
    <React.Fragment>
      {/* TODO: add real projects links */}

      <Link href="/projects/test-project">
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
              <Link href="/clients/test-client">
                <a>
                  <TkIcon className="ri-eye-fill align-bottom me-2 text-muted"></TkIcon>
                </a>
              </Link>
            </li>
            <li className="list-inline-item">
              <Link href="#">
                <a onClick={onEditIconClick}>
                  <TkIcon className="ri-pencil-fill align-bottom me-2 text-muted"></TkIcon>
                </a>
              </Link>
            </li>
            <li className="list-inline-item">
              <Link href="#">
                <a className="remove-item-btn" onClick={onDeleteIconClick}>
                  <TkIcon className="ri-delete-bin-fill align-bottom me-2 text-muted"></TkIcon>
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
  return <React.Fragment>{cell.data[0].createdBy?.name}</React.Fragment>;
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
  return <React.Fragment>{formatDate(cell.value)}</React.Fragment>;
};

const Status = (cell) => {
  return (
    <React.Fragment>
      {cell.value === "Inprogress" ? (
        <span className="badge badge-soft-secondary text-uppercase">{cell.value}</span>
      ) : cell.value === "New" ? (
        <span className="badge badge-soft-info text-uppercase">{cell.value}</span>
      ) : cell.value === "Completed" ? (
        <span className="badge badge-soft-success text-uppercase">{cell.value}</span>
      ) : cell.value === "Pending" ? (
        <span className="badge badge-soft-warning text-uppercase">{cell.value}</span>
      ) : null}
    </React.Fragment>
  );
};

const Priority = (cell) => {
  return (
    <React.Fragment>
      {cell.value === "Medium" ? (
        <span className="badge bg-warning text-uppercase">{cell.value}</span>
      ) : cell.value === "High" ? (
        <span className="badge bg-danger text-uppercase">{cell.value}</span>
      ) : cell.value === "Low" ? (
        <span className="badge bg-success text-uppercase">{cell.value}</span>
      ) : null}
    </React.Fragment>
  );
};

export { OrdersId, ClientName, Tasks, CreateBy, AssignedTo, DueDate, Status, Priority };
