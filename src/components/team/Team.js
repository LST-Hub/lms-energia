import React, { useState } from "react";
import { ToastContainer } from "react-toastify";

import Link from "next/link";
import { useRouter } from "next/router";

import TkCard, { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkContainer from "../TkContainer";
import TkButton from "../TkButton";
import TkInput from "../forms/TkInput";
import TkRow, { TkCol } from "../TkRow";
import TkIcon from "../TkIcon";
import { TkDropdownItem, TkDropdownMenu, TkDropdownToggle, TkUncontrolledDropdown} from "../TkDropdown";

import { teamData } from "../../test-data/team-data";
// import Layout from "../../src/components/layout";

const Team = () => {
  const router = useRouter();
  const [teamList, setTeamlist] = useState(teamData);

  return (
    <>

      {/* <ToastContainer closeButton={false} /> */}
      {/* <div className="page-content"> */}
      <TkContainer>
        <TkCard>
          <TkCardBody>
            <TkRow className="g-2">
              <TkCol sm={4}>
                <div className="search-box">
                  <TkInput
                    type="text"
                    className="form-control"
                    placeholder="Search for name or designation..."
                  />
                  <TkIcon className="ri-search-line search-icon"></TkIcon>
                </div>
              </TkCol>
              <TkCol className="col-sm-auto ms-auto">
                <div className="list-nav hstack gap-1">
                  <TkButton color="primary" onClick={() => router.push("teams/add")}>
                    <TkIcon className="ri-add-fill me-1 align-bottom"></TkIcon> Add Team
                  </TkButton>
                </div>
              </TkCol>
            </TkRow>
          </TkCardBody>
        </TkCard>

        <TkRow>
          <TkCol lg={12}>
            <TkRow>
              {(teamList || []).map((item, key) => (
                <TkCol key={item.id} lg={6} className="list-view-filter">
                  <TkCard className="team-box">
                   
                    <TkCardBody className="p-4">
                      <TkRow className="align-items-center team-row">
                        <TkCol lg={4} className="col">
                          <div className="team-profile-img">
                           
                            <div className="team-content">
                              <Link href="/teams/test-team">
                                <a>
                                  <h5 className="fs-16 mb-1">{item.name}</h5>
                                </a>
                              </Link>
                              <p className="text-muted mb-0">{item.designation}</p>
                            </div>
                          </div>
                        </TkCol>
                        <TkCol lg={4} className="col">
                          <TkRow className="text-muted text-center">
                            <TkCol xs={12}>
                              <h5 className="mb-1">{item.projectCount}</h5>
                              <p className="text-muted mb-0">Members</p>
                            </TkCol>
                           
                          </TkRow>
                        </TkCol>
                        <TkCol lg={2} className="col">
                          <div className="text-end">
                            <Link href="/teams/test-team">
                              <a className="btn btn-light view-btn">View</a>
                            </Link>
                          </div>
                        </TkCol>
                        <TkCol className="team-settings">
                          <TkRow>
                            <TkUncontrolledDropdown direction="start" className="col text-end">
                              <TkDropdownToggle tag="a" id="dropdownMenuLink2" role="button">
                                <TkIcon className="ri-more-fill fs-17"></TkIcon>
                              </TkDropdownToggle>
                              <TkDropdownMenu>
                                <TkDropdownItem
                                  className="dropdown-item edit-list"
                                >
                                  {/* FIXME: remove the below link and manage the below with onClick handler, beacuse Link is not taking all width,
                                                                 so if you click on the right end of the option, it does not work because link tag is not streched till that
                                                                 for test , got to teams page and click edit for a team  in dropdown, click at end. */}
                                  <Link href="/teams/test-team">
                                    <a>
                                      <TkIcon className="ri-pencil-line me-2 align-bottom text-muted"></TkIcon>
                                      Edit
                                    </a>
                                  </Link>
                                </TkDropdownItem>
                                <TkDropdownItem
                                  className="dropdown-item remove-list"
                                >
                                  {/* TODO: add the remove logic */}
                                  <TkIcon className="ri-delete-bin-5-line me-2 align-bottom text-muted"></TkIcon>
                                  Remove
                                </TkDropdownItem>
                              </TkDropdownMenu>
                            </TkUncontrolledDropdown>
                          </TkRow>
                        </TkCol>
                      </TkRow>
                    </TkCardBody>
                  </TkCard>
                </TkCol>
              ))}
            </TkRow>
          </TkCol>
        </TkRow>
      </TkContainer>
    </>
  );
};

export default Team;
