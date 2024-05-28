import React, { useEffect, useState } from "react";
import TkButton from "../TkButton";
import TkInput from "../forms/TkInput";
import TkCard, { TkCardBody } from "../TkCard";
import TkContainer from "../TkContainer";
import TkRow, { TkCol } from "../TkRow";
import TkForm from "../forms/TkForm";

import { TkToastSuccess } from "../TkToastContainer";
import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";
import {
  API_BASE_URL,
  urls,
  MinEmailLength,
  MaxEmailLength,
  MinNameLength,
  MaxNameLength,
  MaxPhoneNumberLength,
  bigInpuMaxLength,
  countries,
  smallInputMaxLength,
  leadActivityTypes,
  RQ,
} from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { useMutation, useQueries } from "@tanstack/react-query";
import { useRouter } from "next/router";
import useUserAccessLevel from "../../utils/hooks/useUserAccessLevel";
import { permissionTypeIds } from "../../../DBConstants";
import TkSelect from "../forms/TkSelect";
import TkDate from "../forms/TkDate";
import { convertTimeToSec, convertToTimeFotTimeSheet } from "../../utils/time";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import AddPhoneCall from "./PhoneCallActivityForm";
import AddTaskActivity from "./TaskActivityForm";
import EventActivity from "./EventActivity";
const tabs = {
  phoneCall: "phoneCall",
  task: "task",
  event: "event",
};
// const schema = Yup.object({
//   title: Yup.string().required("Subject is required").nullable(),
//   company: Yup.string().required("Lead name is required").nullable(),
//   phone: Yup.string()
//     .nullable()
//     .matches(/^[0-9+() -]*$/, "Phone number must be number.")
//     .max(
//       MaxPhoneNumberLength,
//       `Phone number must be at most ${MaxPhoneNumberLength} numbers.`
//     ),
//   status: Yup.object().required("Status is required").nullable(),
//   assigned: Yup.object().required("Organizer is required").nullable(),
//   startDate: Yup.string().required("Date is required").nullable(),
//   dueDate: Yup.string().required("Due date is required").nullable(),
//   priority: Yup.object().required("Proirity is required").nullable(),
// }).required();

const AddActivity = ({
  leadActivityToggle,
  isPopup,
  directCallId,
  setNewAddress,
}) => {
  const accessLevel = useUserAccessLevel(permissionTypeIds.partner);
  const [activeTab, setActiveTab] = useState(tabs.phoneCall);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(),
  });
  const router = useRouter();
  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      router.push(`${urls.activityAdd}?tab=${tab}`, undefined, {
        scroll: false,
      });
    }
  };

  return (
    <>
      <TkRow className="justify-content-center">
        <TkCol lg={12}>
          <TkCardBody>
            <div>
              <TkRow>
                <TkCol>
                  <Nav className="nav-tabs dropdown-tabs nav-tabs-custom mb-3">
                    <NavItem>
                      <NavLink
                        href="#"
                        className={classnames({
                          active: activeTab === tabs.phoneCall,
                        })}
                        onClick={() => toggleTab(tabs.phoneCall)}
                      >
                        Phone Call
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        href="#"
                        className={classnames({
                          active: activeTab === tabs.task,
                        })}
                        onClick={() => toggleTab(tabs.task)}
                      >
                        Task
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        href="#"
                        className={classnames({
                          active: activeTab === tabs.event,
                        })}
                        onClick={() => toggleTab(tabs.event)}
                      >
                        Event
                      </NavLink>
                    </NavItem>
                  </Nav>
                </TkCol>
              </TkRow>
              <TkRow className="mt-3">
                <TkCol>
                  <div>
                    <TkRow className="mt-3">
                      <TkCol>
                        <TabContent activeTab={activeTab}>
                          <TabPane tabId={tabs.phoneCall}>
                            <AddPhoneCall />
                          </TabPane>
                          <TabPane tabId={tabs.task}>
                            <AddTaskActivity />
                          </TabPane>
                          <TabPane tabId={tabs.event}>
                            <EventActivity />
                          </TabPane>
                        </TabContent>
                      </TkCol>
                    </TkRow>
                  </div>
                </TkCol>
              </TkRow>
            </div>
          </TkCardBody>
        </TkCol>
      </TkRow>
    </>
  );
};

export default AddActivity;
