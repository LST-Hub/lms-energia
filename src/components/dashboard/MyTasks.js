import React from "react";
// import { Link } from 'react-router-dom';
import Link from "next/link";
import Image from 'next/future/image';
import { projectTasks } from "../../test-data/dashboard";

import TkCard, { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import { TkDropdownMenu, TkDropdownToggle, TkUncontrolledDropdown, TkDropdownItem }  from "../TkDropdown";

const MyTasks = () => {
  return (
    <React.Fragment>

      <TkCard>
        <TkCardHeader className="card-header align-items-center d-flex">
          <TkCardTitle tag="h4" className="mb-0 flex-grow-1 py-1">My Tasks</TkCardTitle>
          <div className="flex-shrink-0">
            <TkUncontrolledDropdown className="card-header-dropdown">
              <TkDropdownToggle className="text-reset dropdown-btn" tag="a" role="button">
                <span className="text-muted">
                  All Tasks <i className="mdi mdi-chevron-down ms-1"></i>
                </span>
              </TkDropdownToggle>
              <TkDropdownMenu className="dropdown-menu-end">
                <TkDropdownItem>All Tasks</TkDropdownItem>
                <TkDropdownItem>Completed </TkDropdownItem>
                <TkDropdownItem>Inprogress</TkDropdownItem>
                <TkDropdownItem>Pending</TkDropdownItem>
              </TkDropdownMenu>
            </TkUncontrolledDropdown>
          </div>
        </TkCardHeader>
        <TkCardBody>
          <div className="table-responsive table-card">
            <table className="table table-borderless table-nowrap table-centered align-middle mb-0">
              <thead className="table-light text-muted">
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">DeadLine</th>
                  <th scope="col">Status</th>
                  {/* <th scope="col">Assignee</th> */}
                </tr>
              </thead>
              <tbody>
                {(projectTasks || []).map((item, key) => (
                  <tr key={key}>
                    <td>
                      <div className="form-check">
                        {/* <input
                            className="form-check-input fs-15"
                            type="checkbox"
                            value=""
                            id={item.forId}
                          /> */}
                        <label className="form-check-label ms-1" htmlFor={item.forId}>
                          {item.label}
                        </label>
                      </div>
                    </td>
                    <td className="text-muted">{item.dedline}</td>
                    <td>
                      <span className={"badge badge-soft-" + item.statusClass}>
                        {item.status}
                      </span>
                    </td>
                    {/* <td>
                        <Link href="#">
                          <a
                            className="d-inline-block"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title=""
                            data-bs-original-title="Mary Stoner"
                          >
                          <Image 
                            src={item.img}
                            alt="illustarator"
                            className="rounded-circle avatar-xs"
                          />
                          </a>
                        </Link>
                      </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-center">
            <Link href="#">
              <a className="text-muted text-decoration-underline">Load More</a>
            </Link>
          </div>
        </TkCardBody>
      </TkCard>
    </React.Fragment>
  );
};

export default MyTasks;
