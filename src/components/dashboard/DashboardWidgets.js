import React from "react";
import CountUp from "react-countup";
import TkIcon from "../TkIcon";
import TkCard, { TkCardBody } from "../TkCard";
import TkRow, { TkCol } from "../TkRow";
import FeatherIcon from "feather-icons-react";
import { API_BASE_URL, RQ, perDefinedProjectManagerRoleID, urls } from "../../utils/Constants";
import { useQuery } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import Link from "next/link";

const ProjectsWidgets = ({ role }) => {
  const {
    data: projectData,
    isLoading: projectIsLoading,
    isError: projectIsError,
    error: projectError,
  } = useQuery({
    queryKey: [RQ.allProjectCount],
    queryFn: tkFetch.get(`${API_BASE_URL}/dashboard/projectCount`),
  });

  const {
    data: taskData,
    isLoading: taskIsLoading,
    isError: taskIsError,
    error: taskError,
  } = useQuery({
    queryKey: [RQ.allTaskCount],
    queryFn: tkFetch.get(`${API_BASE_URL}/dashboard/taskCount`),
  });

  const {
    data: userData,
    isLoading: userIsLoading,
    isError: userIsError,
    error: userError,
  } = useQuery({
    queryKey: [RQ.allUserCount],
    queryFn: tkFetch.get(`${API_BASE_URL}/dashboard/userCount`),
  });

  const widgets = [
    {
      id: 1,
      feaIcon: "briefcase",
      feaIconClass: "primary",
      label: "Active Projects",
      subCounter: [{ id: 1, counter: projectData ? projectData[0]?.count : 0, suffix: "" }],
      link: `${urls.projects}`,
    },
    {
      id: 2,
      feaIcon: "award",
      feaIconClass: "warning",
      label: "Active Tasks",
      subCounter: [{ id: 1, counter: taskData ? taskData[0]?.count : 0, suffix: "", separator: "," }],
      link: `${urls.tasks}`,
    },
  ];

  if (role !== perDefinedProjectManagerRoleID) {
    widgets.push({
      id: 3,
      feaIcon: "users",
      feaIconClass: "success",
      label: "Active Users",
      subCounter: [{ id: 1, counter: userData ? userData[0]?.count : 0, suffix: "", separator: "," }],
      link: `${urls.users}`,
    });
  }

  return (
    <>
      <TkRow>
        {(widgets || []).map((item, key) => (
          <TkCol md={6} xl={4} key={key}>
            <TkCard className="card-animate">
              <TkCardBody>
                <Link href={item.link}>
                  <div className="d-flex align-items-center cursor-pointer">
                    <div className="avatar-sm flex-shrink-0">
                      <span
                        className={`avatar-title bg-soft-${item.feaIconClass} text-${item.feaIconClass} rounded-2 fs-2`}
                      >
                        <FeatherIcon icon={item.feaIcon} className={`text-${item.feaIconClass}`} />
                      </span>
                    </div>
                    <div className="flex-grow-1 overflow-hidden ms-3">
                      <p className="text-uppercase fw-medium text-muted text-truncate mb-3">{item.label}</p>
                      <div className="d-flex align-items-center mb-3">
                        <h4 className="fs-4 flex-grow-1 mb-0">
                          {item.subCounter.map((item, key) => (
                            <span className="counter-value me-1" data-target="825" key={key}>
                              <CountUp
                                start={0}
                                suffix={item.suffix}
                                separator={item.separator}
                                end={item.counter}
                                duration={1}
                              />
                            </span>
                          ))}
                        </h4>
                        <span className={"fs-12 badge badge-soft-" + item.badgeClass}>
                          <TkIcon className={"fs-13 align-middle me-1 " + item.icon}></TkIcon>
                          {item.percentage}
                        </span>
                      </div>
                      <p className="text-muted text-truncate mb-0">{item.caption}</p>
                    </div>
                  </div>
                </Link>
              </TkCardBody>
            </TkCard>
          </TkCol>
        ))}
      </TkRow>
    </>
  );
};
export default ProjectsWidgets;
