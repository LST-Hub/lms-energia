import React from "react";
import Link from "next/link";
import { urls } from "../../utils/Constants";

const ExpenseRow = ({ expenseName, date, id, clientName, time }) => {
  return (
    <>
      <div className="d-sm-flex align-items-center justify-content-between px-4 py-3 bg-white rounded-4">
        <div className="">
          <Link href={`${urls.expenseView}/${id}`}>
            <a>
              <h4 className="mb-sm-0 text-dark">{expenseName}</h4>
            </a>
          </Link>
          {/* <div className="d-flex ">
                <p className="ms-2 fs-5 text-muted mb-0">({clientName})</p>
              </div> */}
          <p className="mb-0 text-muted">{date}</p>
        </div>
        <div className="d-flex space-childern align-items-center justify-content-center">
          {/* TODO: format time before display */}
          {/* <h4 className="text-dark">{time}:00</h4> */}
          {/* <i className="task-row-icon ri-play-circle-fill"></i> */}
          <Link href={`${urls.expenseView}/${id}`}>
            <a>
              <i className="task-row-icon ri-pencil-fill"></i>
            </a>
          </Link>
        </div>
        <style jsx>{`
          .task-row-icon {
            font-size: 22px;
            color: #405189;
          }
        `}</style>
      </div>
    </>
  );
};

export default ExpenseRow;
