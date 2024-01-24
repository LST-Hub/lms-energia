import React, { useEffect, useState } from "react";
import TkRow, { TkCol } from "../TkRow";
import TkSelect from "../forms/TkSelect";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, RQ, perDefinedEmployeeRoleID, statusFilterDropdownOptions, urls } from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { TkToastError } from "../TkToastContainer";
import TkDate from "../forms/TkDate";
import TkContainer from "../TkContainer";
import TkButton from "../TkButton";
import useUserRole from "../../utils/hooks/useUserRole";
import { useRouter } from "next/router";

const TopBar = ({ onProjectChange, onTaskChange, onTodaysTaskStatusChange, onDateChange,totalHrs }) => {
  const accessLevel = useUserRole().id;
  const router = useRouter();
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [allTasks, setAllTasks] = useState([]);

  const {
    data: projectData,
    isLoading: isProjectLoading,
    isError: isProjectError,
    error: projectError,
  } = useQuery({
    queryKey: [RQ.allProjectList],
    queryFn: tkFetch.get(`${API_BASE_URL}/project/list?myProjects=true&indexFilter=true`),
  });

  const {
    data: taskData,
    isLoading: isTaskLoading,
    isError: isTaskError,
    error: taskError,
  } = useQuery({
    queryKey: [RQ.allTaskList, selectedProjectId],
    queryFn: tkFetch.get(
      `${API_BASE_URL}/task/list${selectedProjectId ? `?projectId=${selectedProjectId}&myTasks=true&indexFilter=true` : "indexFilter=true"}`
    ),
    enabled: !!selectedProjectId,
  });

  useEffect(() => {
    if (!selectedProjectId) {
      setAllTasks([]);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (isProjectError) {
      console.log("error", projectError);
      TkToastError("Error ocured while fetching Projects");
    }
    if (isTaskError) {
      console.log("error", taskError);
      TkToastError("Error ocured while fetching Tasks");
    }
  });

  useEffect(() => {
    if (Array.isArray(projectData)) {
      const allProjects = projectData.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      setAllProjects(allProjects);
    }
  }, [projectData]);

  useEffect(() => {
    if (Array.isArray(taskData)) {
      const allTasks = taskData.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      setAllTasks(allTasks);
    }
  }, [taskData]);

  return (
    <>
      <TkRow className="mb-4">
        <TkCol xs={12}>
          {/* <div className="page-title-box"> */}
            <TkContainer className="d-sm-flex space-childern fs-small align-items-center p-0">
            <TkCol  className="mt-1">
                <h4>Total Hrs: {totalHrs}</h4>
              </TkCol>
              <TkCol>
                <TkSelect
                  placeholder="Select Project"
                  loading={isProjectLoading}
                  options={allProjects}
                  onChange={(e) => {
                    setSelectedProjectId(e ? e.value : null);
                    onProjectChange(e);
                  }}
                />
              </TkCol>
              <TkCol>
                <TkSelect
                  placeholder="Select Task"
                  loading={selectedProjectId && isTaskLoading}
                  options={allTasks}
                  onChange={onTaskChange}
                />
              </TkCol>
              <TkCol>
                <TkSelect
                  placeholder="Select Status"
                  options={statusFilterDropdownOptions}
                  onChange={onTodaysTaskStatusChange}
                />
              </TkCol>
              <TkCol>
                <TkDate
                  className="form-control"
                  placeholder="Select Date Range"
                  options={{
                    mode: "range",
                    dateFormat: "d M, Y",
                  }}
                  // defaultValue={new Date().toDateString()}
                  // value={new Date().toDateString()}
                  onChange={onDateChange}
                />
              </TkCol>

              {/* <TkCol lg={3}>
              <TkSelect placeholder="Select Priority" />
            </TkCol>
            <TkCol lg={3}>
              <TkSelect placeholder="Select Status" />
            </TkCol> */}
              <div>
                {accessLevel !== perDefinedEmployeeRoleID && (
                  <TkButton color="primary" onClick={() => router.push(`${urls.allTodayTask}`)}>
                    All Today&apos;s Tasks
                  </TkButton>
                )}
              </div>
            </TkContainer>
          {/* </div> */}
        </TkCol>
      </TkRow>
    </>
  );
};

export default TopBar;
