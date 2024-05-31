import { useQueries, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import React, { useEffect, useState } from "react";
// import { crmWidgets } from "../../common/data";
import CountUp from "react-countup";
import tkFetch from "../../utils/fetch";
import { API_BASE_URL, RQ } from "../../utils/Constants";

const Suspense = () => {
  return (
    <>
      <div class="card-body">
        <h5 class="card-title placeholder-glow">
          <span class="placeholder col-4"></span>
        </h5>
        <p class="card-text placeholder-glow">
          <span class="placeholder col-5"></span>
          <span class="placeholder col-8"></span>
        </p>
      </div>
    </>
  );
};

const Widget = () => {
  const [leadCount, setLeadCount] = useState(0);

  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.leadCount],
        queryFn: tkFetch.get(`${API_BASE_URL}/dashboard/lead-count`),
      },
      {
        queryKey: [RQ.callCount],
        queryFn: tkFetch.get(`${API_BASE_URL}/dashboard/call-count`),
      },
      {
        queryKey: [RQ.taskCount],
        queryFn: tkFetch.get(`${API_BASE_URL}/dashboard/task-count`),
      },
      {
        queryKey: [RQ.eventCount],
        queryFn: tkFetch.get(`${API_BASE_URL}/dashboard/event-count`),
      },
    ],
  });

  const [leadCountData, callCount, taskCount, eventCount] = results;

  const {
    data: leadCountDataData,
    isLoading: leadCountDataIsLoading,
    isError: leadCountDataIsError,
    error: leadCountDataError,
  } = leadCountData;

  const {
    data: callCountData,
    isLoading: callCountDataIsLoading,
    isError: callCountDataIsError,
    error: callCountDataError,
  } = callCount;

  const {
    data: taskCountData,
    isLoading: taskCountDataIsLoading,
    isError: taskCountDataIsError,
    error: taskCountDataError,
  } = taskCount;

  const {
    data: eventCountData,
    isLoading: eventCountDataIsLoading,
    isError: eventCountDataIsError,
    error: eventCountDataError,
  } = eventCount;

  useEffect(() => {
    if (leadCountDataData) {
      setLeadCount(leadCountDataData?.items[0]?.expr1);
    }
  }, [leadCountDataData]);

  const crmWidgets = [
    {
      id: 1,
      label: "Total Leads",
      //   badge: "ri-arrow-up-circle-line text-success",
      icon: "ri-space-ship-line",
      counter: `${leadCount}`,
      decimals: 0,
      suffix: "",
      prefix: "",
    },
    {
      id: 2,
      label: "Total Calls",
      badge: "ri-arrow-up-circle-line text-success",
      icon: "ri-phone-line",
      counter: `${callCountData?.[0]}`,
      decimals: 0,
      suffix: "",
      prefix: "",
    },
    {
      id: 3,
      label: "Total Tasks",
      badge: "ri-arrow-down-circle-line text-danger",
      icon: "ri-task-line",
      counter: `${taskCountData?.[0]}`,
      decimals: 0,
      suffix: "",
      prefix: "",
    },
    {
      id: 4,
      label: "Total Events",
      badge: "ri-arrow-up-circle-line text-success",
      icon: "ri-calendar-event-line",
      counter: `${eventCountData?.[0]}`,
      decimals: 0,
      prefix: "",
      separator: "",
      suffix: "",
    },
    // {
    //   id: 5,
    //   label: "Annual Deals",
    //   badge: "ri-arrow-down-circle-line text-danger",
    //   icon: "ri-service-line",
    //   counter: "2659",
    //   decimals: 0,
    //   separator: ",",
    //   suffix: "",
    //   prefix: "",
    // },
  ];

  return (
    <React.Fragment>
      <div className="col-xl-12">
        <div className="card crm-widget">
          <div className="card-body p-0">
            <div className="row row-cols-xxl-4 row-cols-md-3 row-cols-1 g-0">
              <div className="col">
                {leadCountDataIsLoading ? (
                  <Suspense />
                ) : (
                  <div className="py-4 px-3">
                    <h5 className="text-muted text-uppercase fs-13">
                      Total Leads
                      {/* <i className={widget.badge + " fs-18 float-end align-middle"}></i> */}
                    </h5>
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <i className={"ri-space-ship-line" + " display-6 text-muted"}></i>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h2 className="mb-0">
                          <span className="counter-value" data-target="197">
                            <CountUp start={0} end={leadCount} duration={1} />
                          </span>
                        </h2>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="col">
                {callCountDataIsLoading ? (
                  <Suspense />
                ) : (
                  <div className="py-4 px-3">
                    <h5 className="text-muted text-uppercase fs-13">
                      Total Calls
                      {/* <i className={widget.badge + " fs-18 float-end align-middle"}></i> */}
                    </h5>
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <i className={"ri-phone-line" + " display-6 text-muted"}></i>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h2 className="mb-0">
                          <span className="counter-value" data-target="197">
                            <CountUp start={0} end={callCountData?.[0]} duration={1} />
                          </span>
                        </h2>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="col">
                {taskCountDataIsLoading ? (
                  <Suspense />
                ) : (
                  <div className="py-4 px-3">
                    <h5 className="text-muted text-uppercase fs-13">
                      Total Tasks
                      {/* <i className={widget.badge + " fs-18 float-end align-middle"}></i> */}
                    </h5>
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <i className={"ri-task-line" + " display-6 text-muted"}></i>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h2 className="mb-0">
                          <span className="counter-value" data-target="197">
                            <CountUp start={0} end={taskCountData?.[0]} duration={1} />
                          </span>
                        </h2>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="col">
                {eventCountDataIsLoading ? (
                  <Suspense />
                ) : (
                  <div className="py-4 px-3">
                    <h5 className="text-muted text-uppercase fs-13">
                      Total Events
                      {/* <i className={widget.badge + " fs-18 float-end align-middle"}></i> */}
                    </h5>
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <i className={"ri-calendar-event-line" + " display-6 text-muted"}></i>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h2 className="mb-0">
                          <span className="counter-value" data-target="197">
                            <CountUp start={0} end={eventCountData?.[0]} duration={1} />
                          </span>
                        </h2>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Widget;
