import React, { useMemo, useState } from "react";
import classnames from "classnames";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import {
  MaxEmailLength,
  MaxPhoneNumberLength,
  MinEmailLength,
  RQ,
  bigInpuMaxLength,
  modes,
  statusTypes,
} from "../../utils/Constants";
import { useRouter } from "next/router";
import {
  API_BASE_URL,
  MaxNameLength,
  MinNameLength,
  smallInputMaxLength,
  urls,
} from "../../../src/utils/Constants";
import { useQueries } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import TkTableContainer from "../TkTableContainer";
import TkButton from "../TkButton";
import TkIcon from "../TkIcon";
import { TkCardBody } from "../TkCard";
import TkNoData from "../TkNoData";
import Link from "next/link";

const tabs = {
  phoneCall: "phoneCall",
  task: "task",
  event: "event",
};

const ActivityTabs = ({ mode, id }) => {
  const [activeTab, setActiveTab] = useState(tabs.phoneCall);
  const lid = Number(id);

  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.leadPhoneCallHighlights],
        queryFn: tkFetch.get(
          `${API_BASE_URL}/lead/lead-highlights/lead-phonecall?leadId=${lid}`
        ),
        enabled: !!lid && activeTab === tabs.phoneCall,
      },

      {
        queryKey: [RQ.leadTaskHighlights],
        queryFn: tkFetch.get(
          `${API_BASE_URL}/lead/lead-highlights/lead-task?leadId=${lid}`
        ),
        enabled: !!lid && activeTab === tabs.task,
      },

      {
        queryKey: [RQ.leadEventHighlights],
        queryFn: tkFetch.get(
          `${API_BASE_URL}/lead/lead-highlights/lead-events?leadId=${lid}`
        ),
        enabled: !!lid && activeTab === tabs.event,
      },
    ],
  });

  const phoneCallColumns = useMemo(
    () => [
      // {
      //   Header: "View",
      //   accessor: "view",
      //   filterable: false,
      //   Cell: (cellProps) => {
      //     return (
      //       <div className="d-flex align-items-center">
      //         <ul className="ps-0 mb-0">
      //           <li className="list-inline-item">
      //             <Link href={`${urls.phoneCallView}/${cellProps.row.original.id}`}>
      //               <a>
      //                 <TkButton color="none">
      //                   <TkIcon className="ri-eye-fill align-bottom text-muted"></TkIcon>
      //                 </TkButton>
      //               </a>
      //             </Link>
      //           </li>
      //         </ul>
      //       </div>
      //     );
      //   },
      // },
      {
        Header: "Title",
        accessor: "title",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Status",
        accessor: "status[0].text",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Phone Number",
        accessor: "phone",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Date",
        accessor: "startdate",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
    ],
    []
  );

  const taskColumns = useMemo(
    () => [
      // {
      //   Header: "View",
      //   accessor: "view",
      //   filterable: false,
      //   Cell: (cellProps) => {
      //     return (
      //       <div className="d-flex align-items-center">
      //         <ul className="ps-0 mb-0">
      //           <li className="list-inline-item">
      //             <Link href={`${urls.taskkView}/${cellProps.row.original.id}`}>
      //               <a>
      //                 <TkButton color="none">
      //                   <TkIcon className="ri-eye-fill align-bottom text-muted"></TkIcon>
      //                 </TkButton>
      //               </a>
      //             </Link>
      //           </li>
      //         </ul>
      //       </div>
      //     );
      //   },
      // },
      {
        Header: "Title",
        accessor: "title",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Status",
        accessor: "status[0].text",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "priority",
        accessor: "priority[0].text",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Date",
        accessor: "startdate",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
    ],
    []
  );

  const eventColumns = useMemo(
    () => [
      // {
      //   Header: "View",
      //   accessor: "view",
      //   filterable: false,
      //   Cell: (cellProps) => {
      //     return (
      //       <div className="d-flex align-items-center">
      //         <ul className="ps-0 mb-0">
      //           <li className="list-inline-item">
      //             <Link href={`${urls.taskkView}/${cellProps.row.original.id}`}>
      //               <a>
      //                 <TkButton color="none">
      //                   <TkIcon className="ri-eye-fill align-bottom text-muted"></TkIcon>
      //                 </TkButton>
      //               </a>
      //             </Link>
      //           </li>
      //         </ul>
      //       </div>
      //     );
      //   },
      // },
      {
        Header: "Title",
        accessor: "title",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Status",
        accessor: "status[0].text",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Phone Number",
        accessor: "phone",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
      {
        Header: "Date",
        accessor: "startdate",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{cellProps.value}</div>;
        },
      },
    ],
    []
  );

  const [phoneCallActivity, taskActivity, eventActivity] = results;

  const { data: phoneCallActivityData, isLoading: isPhoneCallActivityLoading } =
    phoneCallActivity;

  const { data: taskActivityData, isLoading: isTaskActivityLoading } =
    taskActivity;

  const { data: eventActivityData, isLoading: isEventActivityLoading } =
    eventActivity;



  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  return (
    <>
      <Nav className="nav-tabs dropdown-tabs nav-tabs-custom mb-3">
        <NavItem>
          <NavLink
            href="#"
            className={classnames({ active: activeTab === tabs.phoneCall })}
            onClick={() => {
              toggleTab(tabs.phoneCall);
            }}
          >
            Phone Call
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            href="#"
            className={classnames({ active: activeTab === tabs.task })}
            onClick={() => {
              toggleTab(tabs.task);
            }}
          >
            Task
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            href="#"
            className={classnames({ active: activeTab === tabs.event })}
            onClick={() => {
              toggleTab(tabs.event);
            }}
          >
            Event
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId={tabs.phoneCall}>
          <TkCardBody className="table-padding pt-0">
            {phoneCallActivityData?.length > 0 ? (
              <TkTableContainer
                columns={phoneCallColumns}
                data={phoneCallActivityData || []}
                loading={isPhoneCallActivityLoading}
                defaultPageSize={10}
                customPageSize={true}
                showPagination={true}
              />
            ) : (
              <TkNoData />
            )}
          </TkCardBody>
        </TabPane>
        <TabPane tabId={tabs.task}>
          <TkCardBody className="table-padding pt-0">
            {taskActivityData?.length > 0 ? (
              <TkTableContainer
                columns={taskColumns}
                data={taskActivityData || []}
                loading={isTaskActivityLoading}
                defaultPageSize={10}
                customPageSize={true}
                showPagination={true}
              />
            ) : (
              <TkNoData />
            )}
          </TkCardBody>
        </TabPane>
        <TabPane tabId={tabs.event}>
          <TkCardBody className="table-padding pt-0">
            {eventActivityData?.length > 0 ? (
              <TkTableContainer
                columns={eventColumns}
                data={eventActivityData || []}
                loading={isEventActivityLoading}
                defaultPageSize={10}
                customPageSize={true}
                showPagination={true}
              />
            ) : (
              <TkNoData />
            )}
          </TkCardBody>
        </TabPane>
      </TabContent>
    </>
  );
};

export default ActivityTabs;
