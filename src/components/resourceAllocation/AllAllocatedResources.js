import React, { useCallback, useMemo, useReducer, useRef, useState } from "react";
import TkTableContainer from "../TkTableContainer";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import {
  API_BASE_URL,
  filterFields,
  modes,
  perDefinedEmployeeRoleID,
  perDefinedProjectManagerRoleID,
  RQ,
  searchParamName,
} from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { formatDate } from "../../utils/date";
import { convertSecToTime } from "../../utils/time";
import TkLoader from "../TkLoader";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";
import TkNoData from "../TkNoData";
import TkRow, { TkCol } from "../TkRow";
import { TkCardBody } from "../TkCard";
import { useEffect } from "react";
import TkSelect from "../forms/TkSelect";
import { convertToURLParamsString, isSearchonUI, searchFilterDateRangeData } from "../../utils/utilsFunctions";
import TkDate from "../forms/TkDate";
import useUserAccessLevel from "../../utils/hooks/useUserAccessLevel";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import useSessionData from "../../utils/hooks/useSessionData";
import TkAccessDenied from "../TkAccessDenied";
import TkButton from "../TkButton";
import TkModal, { TkModalBody, TkModalHeader } from "../TkModal";
import TkForm from "../forms/TkForm";
import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import hasPageModeAccess from "../../utils/hasPageAccess";
import { CSVLink } from "react-csv";
import TkIcon from "../TkIcon";

const headers = [
  { label: "Resource Name", key: "resourceName" },
  { label: "Allocated Hours", key: "allocatedHours" },
  { label: "Idle Hours", key: "idleHours" },
  { label: "Date", key: "date" },
];

function TableToolBar({ onProjectChange, onEmployeeChange, onDateChange, allocatedHrs, idleHrs }) {
  const sessionData = useSessionData();
  const [allProjects, setAllProjects] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allProjectList],
        queryFn: tkFetch.get(
          `${API_BASE_URL}/project/list${
            sessionData.user.roleId === perDefinedProjectManagerRoleID
              ? `?PMprojects=true&indexFilter=true`
              : sessionData.user.roleId === perDefinedEmployeeRoleID
              ? `?myProjects=true&indexFilter=true`
              : `?indexFilter=true`
          }`
        ),
      },
      {
        queryKey: [RQ.allUsersList],
        queryFn: tkFetch.get(`${API_BASE_URL}/users/list?indexFilter=true`),
      },
    ],
  });

  const [projects, users] = results;

  const { data: projectData, isLoading: projectIsLoading, isError: projectIsError, error: projectError } = projects;
  const { data: userData, isLoading: userIsLoading, isError: userIsError, error: userError } = users;

  useEffect(() => {
    if (Array.isArray(projectData)) {
      const allProjects = projectData.map((project) => {
        return {
          label: project.name,
          value: project.id,
        };
      });
      setAllProjects(allProjects);
    }
  }, [projectData]);

  useEffect(() => {
    if (Array.isArray(userData)) {
      const allEmployees = userData.map((user) => {
        return {
          label: user.name,
          value: user.id,
        };
      });
      setAllEmployees(allEmployees);
    }
  }, [userData]);

  return (
    <>
      <TkCardBody className="table-toolbar mt-3">
        <TkRow className="mb-3">
          {sessionData.user.roleId !== perDefinedEmployeeRoleID ? (
            <TkCol>
              <TkSelect
                placeholder="Select Employee"
                loading={userIsLoading}
                options={allEmployees}
                onChange={(item) => {
                  setSelectedEmployee(item);
                  onEmployeeChange(item);
                }}
              />
            </TkCol>
          ) : null}
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
              onChange={(dates) => {
                setSelectedDate(dates);
                onDateChange(dates);
              }}
            />
          </TkCol>
          <TkCol>
            <TkSelect
              placeholder="Select Project"
              loading={projectIsLoading}
              options={allProjects}
              onChange={onProjectChange}
            />
          </TkCol>

          <TkCol>
            {selectedEmployee && selectedDate && selectedDate.length > 0 && selectedDate[0] && selectedDate[1] ? (
              <h4>Allocated Hrs: {allocatedHrs} </h4>
            ) : null}
          </TkCol>
          <TkCol>
            {selectedEmployee && selectedDate && selectedDate.length > 0 && selectedDate[0] && selectedDate[1] ? (
              <h4>Idle Hrs: {idleHrs} </h4>
            ) : null}
          </TkCol>
        </TkRow>
      </TkCardBody>
    </>
  );
}

const schema = Yup.object({
  resourcesName: Yup.array().required("Resource name is Required"),
  date: Yup.array().required("Date is Required").nullable(),
});

function AllAllocatedResources({ modal, setModal, toggle }) {
  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.resourceAllocation],
    queryFn: tkFetch.get(`${API_BASE_URL}/resource-allocation`),
    // enabled: Number(accessLevel) >= perAccessIds.view,
  });

  const {
    data: userData,
    isLoading: isUserDataLodaing,
    isError: isUserDataError,
    error: userDataError,
  } = useQuery({
    queryKey: [RQ.allUsersList],
    queryFn: tkFetch.get(`${API_BASE_URL}/users/list`),
    enabled: hasPageModeAccess(modes.create, accessLevel),
  });

  const accessLevel = useUserAccessLevel(permissionTypeIds.resourceAllocation);

  const [resourceAllocationData, setResourceAllocationData] = useState([]);
  const [urlParamsStr, setUrlParamsStr] = useState("");
  const [filters, updateFilters] = useReducer((state, newState) => ({ ...state, ...newState }), {
    [filterFields.resourceAllocation.project]: null,
    [filterFields.resourceAllocation.allocatedUser]: null,
    [filterFields.resourceAllocation.repetation]: null,
    [filterFields.resourceAllocation.startDate]: null,
    [filterFields.resourceAllocation.endDate]: null,
  });
  const [allocatedHrs, setAllocatedHrs] = useState(0);
  const [idleHrs, setIdleHrs] = useState(0);
  const [allUsersData, setAllUsersData] = useState([]);
  const [idleHoursData, setIdleHoursData] = useState([]);
  // const [csvData, setCsvData] = useState([]);

  const {
    data: backData,
    isLoading: backIsLoading,
    isError: backIsError,
    error: backError,
  } = useQuery({
    queryKey: [RQ.resourceAllocation, urlParamsStr],
    queryFn: tkFetch.get(`${API_BASE_URL}/resource-allocation${urlParamsStr ? `?${urlParamsStr}` : ""}`),
    enabled: !!urlParamsStr,
  });

  const {
    data: workCalendarData,
    isLoading: workCalendarIsLoading,
    isError: workCalendarIsError,
  } = useQuery({
    queryKey: [RQ.workCalendar, filters.allocatedUserId],
    queryFn: tkFetch.get(`${API_BASE_URL}/resource-allocation/user-work-calendar?userId=${filters.allocatedUserId}`),
    enabled: !!filters.allocatedUserId,
  });

  useEffect(() => {
    if (data) {
      setResourceAllocationData(data);
    }

    if (userData) {
      const allUsers = userData.map((user) => {
        return {
          label: user.name,
          value: user.id,
        };
      });
      setAllUsersData(allUsers);
    }
  }, [data, userData]);

  useEffect(() => {
    let doFilter = true;
    if (Object.values(filters).every((val) => val === null || val === undefined || val === "")) {
      doFilter = false;
    }
    if (!doFilter) {
      // if data is undefined then set it to empty array
      setResourceAllocationData(data || []);
      setUrlParamsStr("");
      return;
    }
    if (false) {
      const newData = searchFilterDateRangeData(data, null, null, filters);
      setResourceAllocationData(newData);
    } else {
      const urlParamString = convertToURLParamsString({ [searchParamName]: null, ...filters });
      setUrlParamsStr(urlParamString);
    }
  }, [filters, data]);

  const backendData = urlParamsStr.length > 0 ? backData : null;

  useEffect(() => {
    if (backendData) {
      setResourceAllocationData(backendData);
    }
  }, [backendData]);

  const extractDayTimes = (data) => {
    const result = {};
    data.forEach((workingDay) => {
      const { day, time } = workingDay;
      result[day] = time;
    });
    return [result];
  };

  const countDayOccurrences = useCallback(function (dateObj) {
    // Create an object to store the day names and their counts
    const dayCounts = {};

    // Iterate through the uniqueDateObj
    for (const key in dateObj) {
      if (dateObj.hasOwnProperty(key)) {
        // Get the date from the object
        const dateString = dateObj[key];

        // Convert the date string to a Date object
        const date = new Date(dateString);

        // Get the day name (e.g., 'Monday', 'Tuesday', etc.)
        const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);

        // Update the dayCounts object
        if (dayCounts.hasOwnProperty(dayName)) {
          dayCounts[dayName]++;
        } else {
          dayCounts[dayName] = 1;
        }
      }
    }

    return dayCounts;
  }, []);

  function calculateTotalAllDays(daysTime, filteredDate) {
    let total = 0;

    Object.keys(filteredDate).forEach((day) => {
      const hours = (daysTime[0][day] || 0) * filteredDate[day];
      total += hours;
    });

    return total;
  }

  const setToObject = (inputSet) => {
    const arr = Array.from(inputSet);
    const obj = arr.reduce((acc, currentValue, index) => {
      acc[index] = currentValue;
      return acc;
    }, {});
    return obj;
  };

  useEffect(() => {
    const workingHoursPerDay = 8 * 3600; // 8 hours in seconds

    if (backendData?.length === 0) {
      setAllocatedHrs(0);
      setIdleHrs(0);
      return;
    }

    if (backendData?.length > 0) {
      // get unique dates from the data that is filtered
      const uniqueDates = new Set();

      // get date form the data that is filtered
      resourceAllocationData.forEach((item) => {
        const { date } = item;
        const day = date.split("T")[0]; // Extract the date part from the datetime string
        uniqueDates.add(day);
      });

      // convert set to object
      const uniqueDatesObj = setToObject(uniqueDates);
      // count the day occurrences in the object of unique dates
      const dayCounts = countDayOccurrences(uniqueDatesObj);

      let dayTimes = {};

      if (workCalendarData) {
        // extract the day times from the work calendar data according to employee selected
        [dayTimes] = extractDayTimes(workCalendarData[0]?.weeklyWorkingDays);
      }

      const totalAllDayHrs = calculateTotalAllDays([dayTimes], dayCounts);

      const allocatedHrs = backendData.reduce((acc, item) => {
        return acc + item.duration;
      }, 0);
      setAllocatedHrs(convertSecToTime(allocatedHrs));

      const totalWorkingHours = totalAllDayHrs;
      const idleHrs = totalWorkingHours - allocatedHrs;
      setIdleHrs(convertSecToTime(idleHrs));
    } else if (resourceAllocationData?.length > 0) {
      const uniqueDates = new Set();

      resourceAllocationData.forEach((item) => {
        const { date } = item;
        const day = date.split("T")[0]; // Extract the date part from the datetime string
        uniqueDates.add(day);
      });

      const uniqueDatesObj = setToObject(uniqueDates);
      const dayCounts = countDayOccurrences(uniqueDatesObj);

      let dayTimes = {};

      if (workCalendarData) {
        [dayTimes] = extractDayTimes(workCalendarData[0]?.weeklyWorkingDays);
      }

      const totalAllDayHrs = calculateTotalAllDays([dayTimes], dayCounts);

      const allocatedHrs = resourceAllocationData.reduce((acc, item) => {
        return acc + item.duration;
      }, 0);
      setAllocatedHrs(convertSecToTime(allocatedHrs));
      const totalWorkingHours = totalAllDayHrs;
      const idleHrs = totalWorkingHours - allocatedHrs;
      setIdleHrs(convertSecToTime(idleHrs));
    } else {
      setAllocatedHrs(0);
      setIdleHrs(0);
    }
  }, [resourceAllocationData, countDayOccurrences, backendData, workCalendarData]);

  const columns = useMemo(
    () => [
      {
        Header: "Project Name",
        accessor: "project.name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div className="d-flex">
                <div className="table-text">{cellProps.value}</div>
              </div>
            </>
          );
        },
      },
      {
        Header: "Task Name",
        accessor: "task.name",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Resource Allocated",
        accessor: "allocatedUser.name",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Date",
        accessor: "date",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div className="table-text">
              {cellProps.value
                ? formatDate(cellProps.value)
                : `${formatDate(cellProps.row.original.startDate)} To ${formatDate(cellProps.row.original.endDate)}`}
            </div>
          );
        },
      },
      {
        Header: "Duration",
        accessor: "duration",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{convertSecToTime(cellProps.value)}</div>;
        },
      },
    ],
    []
  );

  const idleHrsData = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/resource-allocation/idle-hrs`),
  });

  const idleHrsColumns = useMemo(
    () => [
      {
        Header: "Resource Name",
        accessor: "resourceName",
        filterFields: false,
        Cell: (cellProps) => {
          return (
            <>
              <div className="d-flex">
                <div className="table-text">{cellProps.value}</div>
              </div>
            </>
          );
        },
      },
      {
        Header: "Allocated Hours",
        accessor: "allocatedHours",
        filterFields: false,
        Cell: (cellProps) => {
          return <div className="table-text">{convertSecToTime(cellProps.value)}</div>;
        },
      },
      {
        Header: "Idle Hours",
        accessor: "idleHours",
        filterFields: false,
        Cell: (cellProps) => {
          return <div className="table-text">{convertSecToTime(cellProps.value)}</div>;
        },
      },
    ],
    []
  );

  // useEffect(() => {
  //   if (idleHrsData.isSuccess && !csvData.length) {
  //     const data = idleHrsData.data;
  //     const csvData = data.map((item) => ({
  //       resourceName: item.resourceName,
  //       allocatedHours: convertSecToTime(item.allocatedHours),
  //       idleHours: convertSecToTime(item.idleHours),
  //       date: item.date,
  //     }));
  //     setCsvData(csvData);
  //   }
  // }, [idleHrsData, csvData]);

  // IF IN FUTURE THE ABOVE USEEFFECT DOES NOT WORK THEN USE THIS
  const csvData = useMemo(() => {
    if (idleHrsData.isSuccess) {
      const data = idleHrsData.data;
      return data.map((item) => ({
        resourceName: item.resourceName,
        allocatedHours: convertSecToTime(item.allocatedHours),
        idleHours: convertSecToTime(item.idleHours),
        date: item.date,
      }));
    }
    return [];
  }, [idleHrsData.isSuccess, idleHrsData.data]);

  const onSubmit = (formData) => {
    const apiData = {
      resourcesName: formData.resourcesName.map((item) => item.value),
      date: formData.date.map((item) => item.toDateString()),
    };
    idleHrsData.mutate(apiData, {
      onSuccess: (data) => {
        setIdleHoursData(data);
      },
      onError: (error) => {
        console.log("error", error);
      },
    });
  };

  if (accessLevel < perAccessIds.create) {
    return <TkAccessDenied />;
  }

  return (
    <div>
      {isLoading ? (
        <TkLoader />
      ) : isError ? (
        <FormErrorBox errMessage={error.message} />
      ) : data.length > 0 ? (
        <>
          <TkRow>
            <TkCol lg={12}>
              <TkCardBody>
                {backIsError ? (
                  <FormErrorBox errMessage={backError.message} />
                ) : (
                  <TkTableContainer
                    columns={columns}
                    data={backendData || resourceAllocationData}
                    customPageSize={true}
                    showPagination={true}
                    loading={urlParamsStr.length > 0 && backIsLoading}
                    Toolbar={
                      <TableToolBar
                        onProjectChange={(item) => {
                          updateFilters({
                            [filterFields.resourceAllocation.project]: item ? item.value : null,
                          });
                        }}
                        onEmployeeChange={(item) => {
                          updateFilters({
                            [filterFields.resourceAllocation.allocatedUser]: item ? item.value : null,
                          });
                        }}
                        onDateChange={(dates) => {
                          updateFilters({
                            [filterFields.resourceAllocation.startDate]: dates ? dates[0] : null,
                          });
                          updateFilters({
                            [filterFields.resourceAllocation.endDate]: dates ? dates[1] : null,
                          });
                        }}
                        allocatedHrs={allocatedHrs}
                        idleHrs={idleHrs}
                      />
                    }
                    defaultPageSize={10}
                    // isFilters={false} // make it true to see filetrs
                    // rowSelection={true} // pass it true to enable row selection
                    onRowSelection={(rows) => {
                      // pass a use callback for this function as it will rerender the tabel in not usecallabck
                      //you will get all rows selected data here
                    }}
                    showSelectedRowCount={true} // pass it true to show the selected row count
                  />
                )}
              </TkCardBody>
            </TkCol>
          </TkRow>
        </>
      ) : (
        <TkNoData />
      )}

      <TkModal
        isOpen={modal}
        toggle={toggle}
        centered
        size="lg"
        className="border-0"
        modalClassName="modal fade zoomIn"
      >
        <TkModalHeader className="p-3 bg-soft-info" toggle={toggle}>
          {"Idle hours"}
        </TkModalHeader>

        <TkModalBody className="modal-body">
          <TkForm onSubmit={handleSubmit(onSubmit)}>
            <TkRow className="mb-3">
              <TkCol lg={5}>
                <Controller
                  name="resourcesName"
                  control={control}
                  render={({ field }) => (
                    <TkSelect
                      {...field}
                      labelName="Resource Name"
                      id="resourcesName"
                      placeholder="Resource Name"
                      options={allUsersData}
                      isMulti={true}
                      loading={isUserDataLodaing}
                      requiredStarOnLabel={true}
                    />
                  )}
                />
                {errors.resourcesName?.message ? <FormErrorText>{errors.resourcesName?.message}</FormErrorText> : null}
              </TkCol>

              <TkCol lg={4}>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <TkDate
                      {...field}
                      labelName="Date"
                      id="date"
                      placeholder="Select Date Range"
                      options={{
                        mode: "range",
                        altInput: true,
                        dateFormat: "d M, Y",
                      }}
                      requiredStarOnLabel={true}
                    />
                  )}
                />
                {errors.date?.message ? <FormErrorText>{errors.date?.message}</FormErrorText> : null}
              </TkCol>

              <TkCol className="mt-4" lg={1}>
                <TkButton type="submit" color="primary">
                  Go
                </TkButton>
              </TkCol>
              <TkCol className="mt-4" lg={2}>
                <div className="d-flex flex-shrink-0">
                  <CSVLink
                    data={csvData}
                    filename={"Idle Hours.csv"}
                    headers={headers}
                    className={`btn btn-primary add-btn text-white ${
                      idleHoursData.length === 0 || isLoading ? "disabled" : ""
                    }`}
                  >
                    <TkIcon className="ri-download-2-line align-bottom me-1"></TkIcon> Export
                  </CSVLink>
                </div>
              </TkCol>
            </TkRow>
            <TkRow>
              <TkCol>
                <TkTableContainer
                  columns={idleHrsColumns}
                  data={idleHoursData}
                  isLoading={idleHrsData.isLoading}
                  defaultPageSize={100}
                />
              </TkCol>
            </TkRow>
          </TkForm>
        </TkModalBody>
      </TkModal>
    </div>
  );
}

export default AllAllocatedResources;
