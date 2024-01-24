import React, { useState } from "react";
// import { Link } from 'react-router-dom';
import { Col, Row } from "reactstrap";
import Link from "next/link";
import TkIcon from "../TkIcon";
import { urls } from "../../utils/Constants";
// import { Button, ButtonGroup } from "reactstrap";

const TaskRow = ({ taskName, projectName, clientName, time, id, editButton = true }) => {
  // const [isTimerStarted, setIsTimerStarted] = useState(false);
  // TODO: add timer logic to start and stop timer
  return (
    <>
      <div className="d-sm-flex align-items-center justify-content-between px-4 py-3 bg-white rounded-4">
        <div className="">
          <Link href={`${urls.timesheetView}/${id}`}>
            <a>
              <h4 className="mb-sm-0 text-dark">{taskName}</h4>
            </a>
          </Link>
          {/* <div className="d-flex ">
                <p className="ms-2 fs-5 text-muted mb-0">({clientName})</p>
              </div> */}
          <p className="mb-0 text-muted">{projectName}</p>
        </div>
        <div className="d-flex space-childern align-items-center justify-content-center">
          {/* TODO: format time before display */}
          <h4 className="text-dark">{time}</h4>
          {/* <TkIcon className="task-row-icon ri-play-circle-fill"></TkIcon> */}
          {editButton && (
            <Link href={`${urls.timesheetView}/${id}`}>
              <a>
                <TkIcon className="task-row-icon ri-pencil-fill"></TkIcon>
              </a>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default TaskRow;
