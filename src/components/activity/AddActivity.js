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
const tabs = {
  phoneCall: "phoneCall",
  task: "task",
  event: "event",
};
const schema = Yup.object({
  title: Yup.string().required("Subject is required").nullable(),
  company: Yup.string().required("Lead name is required").nullable(),
  phone: Yup.string()
    .nullable()
    .matches(/^[0-9+() -]*$/, "Phone number must be number.")
    .max(
      MaxPhoneNumberLength,
      `Phone number must be at most ${MaxPhoneNumberLength} numbers.`
    ),
  status: Yup.object().required("Status is required").nullable(),
  assigned: Yup.object().required("Organizer is required").nullable(),
  startDate: Yup.string().required("Date is required").nullable(),
  dueDate: Yup.string().required("Due date is required").nullable(),
  priority: Yup.object().required("Proirity is required").nullable(),
}).required();

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
    resolver: yupResolver(schema),
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
  const onSubmit = (data) => {};
  return (
    <>
      <TkRow className="justify-content-center">
        <TkCol lg={12}>
          <TkCardBody>
            <TkForm onSubmit={handleSubmit(onSubmit)}>
              <div>
                <TkRow>
                  <TkCol>
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
                                    <div>
                                      <TkRow className="g-3">
                                        <TkCol lg={4}>
                                          <TkInput
                                            {...register("title")}
                                            id="title"
                                            name="title"
                                            type="text"
                                            labelName="Subject"
                                            placeholder="Enter Subject"
                                            requiredStarOnLabel={true}
                                          />
                                          {errors.title && (
                                            <FormErrorText>
                                              {errors.title.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>
                                        <TkCol lg={4}>
                                          <TkInput
                                            {...register("company")}
                                            id="company"
                                            name="company"
                                            type="text"
                                            labelName="Lead Name"
                                            placeholder="Enter Lead Name"
                                            requiredStarOnLabel={true}
                                            disabled={true}
                                          />
                                          {errors.company && (
                                            <FormErrorText>
                                              {errors.company.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>

                                        <TkCol lg={4}>
                                          <TkInput
                                            {...register("phone")}
                                            id="phone"
                                            name="phone"
                                            type="text"
                                            labelName="Phone Number"
                                            placeholder="Enter Phone Number"
                                            requiredStarOnLabel="true"
                                          />
                                          {errors.phone && (
                                            <FormErrorText>
                                              {errors.phone.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>

                                        <TkCol lg={4}>
                                          <Controller
                                            name="status"
                                            control={control}
                                            render={({ field }) => (
                                              <TkSelect
                                                {...field}
                                                labelName="Status"
                                                labelId={"_status"}
                                                id="status"
                                                options={[]}
                                                placeholder="Select Type"
                                                requiredStarOnLabel={true}
                                              />
                                            )}
                                          />
                                          {errors.status && (
                                            <FormErrorText>
                                              {errors.status.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>

                                        <TkCol lg={4}>
                                          <Controller
                                            name="assigned"
                                            control={control}
                                            render={({ field }) => (
                                              <TkSelect
                                                {...field}
                                                labelName="Organizer"
                                                labelId={"assigned"}
                                                id="assigned"
                                                options={[]}
                                                placeholder="Select Organizer"
                                                requiredStarOnLabel={true}
                                              />
                                            )}
                                          />
                                          {errors.assigned && (
                                            <FormErrorText>
                                              {errors.assigned.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>

                                        <TkCol lg={4}>
                                          <Controller
                                            name="startDate"
                                            control={control}
                                            rules={{
                                              required: "Date is required",
                                            }}
                                            render={({ field }) => (
                                              <TkDate
                                                {...field}
                                                labelName="Date"
                                                id={"startDate"}
                                                placeholder="Select Date"
                                                options={{
                                                  altInput: true,
                                                  dateFormat: "d M, Y",
                                                }}
                                                requiredStarOnLabel={true}
                                              />
                                            )}
                                          />
                                          {errors.startDate && (
                                            <FormErrorText>
                                              {errors.startDate.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>

                                        <TkCol lg={4}>
                                          <Controller
                                            name="completeddate"
                                            control={control}
                                            rules={{
                                              required:
                                                "Date Completed is required",
                                            }}
                                            render={({ field }) => (
                                              <TkDate
                                                {...field}
                                                labelName="Date Completed"
                                                id={"completeddate"}
                                                placeholder="Select Date Completed"
                                                options={{
                                                  altInput: true,
                                                  dateFormat: "d M, Y",
                                                }}
                                              />
                                            )}
                                          />
                                          {errors.completeddate && (
                                            <FormErrorText>
                                              {errors.completeddate.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>
                                      </TkRow>
                                    </div>
                                  </TabPane>
                                  <TabPane tabId={tabs.task}>
                                    <div>
                                      <TkRow className="g-3">
                                        <TkCol lg={4}>
                                          <TkInput
                                            {...register("title")}
                                            id="title"
                                            name="title"
                                            type="text"
                                            labelName="Title"
                                            placeholder="Enter Title"
                                            requiredStarOnLabel={true}
                                          />
                                          {errors.title && (
                                            <FormErrorText>
                                              {errors.title.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>

                                        <TkCol lg={4}>
                                          <TkInput
                                            {...register("company")}
                                            id="company"
                                            name="company"
                                            type="text"
                                            labelName="Lead Name"
                                            placeholder="Enter Lead Name"
                                            requiredStarOnLabel={true}
                                          />
                                          {errors.company && (
                                            <FormErrorText>
                                              {errors.company.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>

                                        <TkCol lg={4}>
                                          <Controller
                                            name="assigned"
                                            control={control}
                                            render={({ field }) => (
                                              <TkSelect
                                                {...field}
                                                labelName="Assigned To"
                                                labelId={"assigned"}
                                                id="assigned"
                                                options={[]}
                                                placeholder="Select Assigned To"
                                                requiredStarOnLabel={true}
                                              />
                                            )}
                                          />
                                          {errors.assigned && (
                                            <FormErrorText>
                                              {errors.assigned.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>

                                        <TkCol lg={4}>
                                          <Controller
                                            name="priority"
                                            control={control}
                                            render={({ field }) => (
                                              <TkSelect
                                                {...field}
                                                labelName="Proirity"
                                                labelId={"priority"}
                                                id="priority"
                                                options={[]}
                                                placeholder="Select Proirity"
                                                requiredStarOnLabel={true}
                                              />
                                            )}
                                          />
                                          {errors.priority && (
                                            <FormErrorText>
                                              {errors.priority.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>

                                        <TkCol lg={4}>
                                          <Controller
                                            name="status"
                                            control={control}
                                            render={({ field }) => (
                                              <TkSelect
                                                {...field}
                                                labelName="Status"
                                                labelId={"_status"}
                                                id="status"
                                                options={[]}
                                                placeholder="Select Type"
                                                requiredStarOnLabel={true}
                                              />
                                            )}
                                          />
                                          {errors.status && (
                                            <FormErrorText>
                                              {errors.status.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>

                                        <TkCol lg={4}>
                                          <Controller
                                            name="startDate"
                                            control={control}
                                            rules={{
                                              required:
                                                "Start Date is required",
                                            }}
                                            render={({ field }) => (
                                              <TkDate
                                                {...field}
                                                labelName="Start Date"
                                                id={"startDate"}
                                                placeholder="Select Start Date"
                                                options={{
                                                  altInput: true,
                                                  dateFormat: "d M, Y",
                                                }}
                                                requiredStarOnLabel={true}
                                              />
                                            )}
                                          />
                                          {errors.startDate && (
                                            <FormErrorText>
                                              {errors.startDate.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>

                                        <TkCol lg={4}>
                                          <Controller
                                            name="dueDate"
                                            control={control}
                                            rules={{
                                              required: "Due Date is required",
                                            }}
                                            render={({ field }) => (
                                              <TkDate
                                                {...field}
                                                labelName="Due Date"
                                                id={"dueDate"}
                                                placeholder="Select Due Date"
                                                options={{
                                                  altInput: true,
                                                  dateFormat: "d M, Y",
                                                }}
                                                requiredStarOnLabel={true}
                                              />
                                            )}
                                          />
                                          {errors.dueDate && (
                                            <FormErrorText>
                                              {errors.dueDate.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>
                                      </TkRow>
                                    </div>
                                  </TabPane>
                                  <TabPane tabId={tabs.event}>
                                    <div>
                                      <TkRow className="g-3">
                                        <TkCol lg={4}>
                                          <TkInput
                                            {...register("title")}
                                            id="title"
                                            name="title"
                                            type="text"
                                            labelName="Title"
                                            placeholder="Enter Title"
                                            requiredStarOnLabel={true}
                                          />
                                          {errors.title && (
                                            <FormErrorText>
                                              {errors.title.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>

                                        <TkCol lg={4}>
                                          <TkInput
                                            {...register("company")}
                                            id="company"
                                            name="company"
                                            type="text"
                                            labelName="Lead Name"
                                            placeholder="Enter Lead Name"
                                            requiredStarOnLabel={true}
                                          />
                                          {errors.company && (
                                            <FormErrorText>
                                              {errors.company.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>

                                        <TkCol lg={4}>
                                          <TkInput
                                            {...register("location")}
                                            id="location"
                                            name="location"
                                            type="text"
                                            labelName="Location"
                                            placeholder="Enter Location"
                                          />
                                          {errors.location && (
                                            <FormErrorText>
                                              {errors.location.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>

                                        <TkCol lg={4}>
                                          <Controller
                                            name="status"
                                            control={control}
                                            render={({ field }) => (
                                              <TkSelect
                                                {...field}
                                                labelName="Status"
                                                labelId={"_status"}
                                                id="status"
                                                options={[]}
                                                placeholder="Select Type"
                                                requiredStarOnLabel={true}
                                              />
                                            )}
                                          />
                                          {errors.status && (
                                            <FormErrorText>
                                              {errors.status.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>

                                        <TkCol lg={4}>
                                          <Controller
                                            name="accesslevel"
                                            control={control}
                                            render={({ field }) => (
                                              <TkSelect
                                                {...field}
                                                labelName="Event Access"
                                                labelId={"accesslevel"}
                                                id="accesslevel"
                                                options={[]}
                                                placeholder="Select Event Access"
                                                requiredStarOnLabel={true}
                                              />
                                            )}
                                          />
                                          {errors.accesslevel && (
                                            <FormErrorText>
                                              {errors.accesslevel.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>

                                        <TkCol lg={4}>
                                          <Controller
                                            name="assigned"
                                            control={control}
                                            render={({ field }) => (
                                              <TkSelect
                                                {...field}
                                                labelName="Organizer"
                                                labelId={"assigned"}
                                                id="assigned"
                                                options={[]}
                                                placeholder="Select Organizer"
                                                requiredStarOnLabel={true}
                                              />
                                            )}
                                          />
                                          {errors.assigned && (
                                            <FormErrorText>
                                              {errors.assigned.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>

                                        <TkCol lg={4}>
                                          <Controller
                                            name="startDate"
                                            control={control}
                                            rules={{
                                              required: "Date is required",
                                            }}
                                            render={({ field }) => (
                                              <TkDate
                                                {...field}
                                                labelName="Date"
                                                id={"startDate"}
                                                placeholder="Select Date"
                                                options={{
                                                  altInput: true,
                                                  dateFormat: "d M, Y",
                                                }}
                                                requiredStarOnLabel={true}
                                              />
                                            )}
                                          />
                                          {errors.startDate && (
                                            <FormErrorText>
                                              {errors.startDate.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>

                                        <TkCol lg={4}>
                                          <TkInput
                                            {...register(`starttime`, {
                                              required:
                                                "Start Time is required",
                                              validate: (value) => {
                                                if (
                                                  value &&
                                                  !/^[0-9]*([.:][0-9]+)?$/.test(
                                                    value
                                                  )
                                                ) {
                                                  return "Invalid Start Time";
                                                }
                                                if (
                                                  convertTimeToSec(value) >
                                                    86400 ||
                                                  value > 24
                                                ) {
                                                  return "Start Time should be less than 24 hours";
                                                }
                                              },
                                            })}
                                            onBlur={(e) => {
                                              setValue(
                                                `starttime`,
                                                convertToTimeFotTimeSheet(
                                                  e.target.value
                                                )
                                              );
                                            }}
                                            labelName="Start Time (HH:MM)"
                                            id={"starttime"}
                                            name="starttime"
                                            type="text"
                                            placeholder="Enter Start Time"
                                            requiredStarOnLabel={true}
                                          />
                                          {errors.starttime && (
                                            <FormErrorText>
                                              {errors.starttime.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>

                                        <TkCol lg={4}>
                                          <TkInput
                                            {...register(`endtime`, {
                                              required: "End Time is required",
                                              validate: (value) => {
                                                if (
                                                  value &&
                                                  !/^[0-9]*([.:][0-9]+)?$/.test(
                                                    value
                                                  )
                                                ) {
                                                  return "Invalid End Time";
                                                }
                                                if (
                                                  convertTimeToSec(value) >
                                                    86400 ||
                                                  value > 24
                                                ) {
                                                  return "End Time should be less than 24 hours";
                                                }
                                              },
                                            })}
                                            onBlur={(e) => {
                                              setValue(
                                                `endtime`,
                                                convertToTimeFotTimeSheet(
                                                  e.target.value
                                                )
                                              );
                                            }}
                                            labelName="End Time (HH:MM)"
                                            id={"endtime"}
                                            name="endtime"
                                            type="text"
                                            placeholder="Enter End Time"
                                            requiredStarOnLabel={true}
                                          />
                                          {errors.endtime && (
                                            <FormErrorText>
                                              {errors.endtime.message}
                                            </FormErrorText>
                                          )}
                                        </TkCol>
                                      </TkRow>
                                    </div>
                                  </TabPane>
                                </TabContent>
                              </TkCol>
                            </TkRow>
                            <div className="d-flex mt-4 space-childern">
                              <div className="ms-auto" id="update-form-btns">
                                <TkButton
                                  color="secondary"
                                  type="button"
                                  onClick={() => {
                                    router.push(`${urls.activity}`);
                                  }}
                                >
                                  Cancel
                                </TkButton>{" "}
                                <TkButton type="submit" color="primary">
                                  Save
                                </TkButton>
                              </div>
                            </div>
                          </div>
                        </TkCol>
                      </TkRow>
                      {/* <TkRow className="g-3">
                        <TkCol lg={4}>
                          <Controller
                            name="activityType"
                            control={control}
                            render={({ field }) => (
                              <TkSelect
                                {...field}
                                labelName="Activity Type"
                                labelId="activityType"
                                id="activityType"
                                options={leadActivityTypes}
                                placeholder="Select Activity Type"
                                requiredStarOnLabel={true}
                              />
                            )}
                          />
                          {errors.activityType && (
                            <FormErrorText>
                              {errors.activityType.message}
                            </FormErrorText>
                          )}
                        </TkCol>
                        <TkCol lg={4}>
                          <TkInput
                            {...register("lead")}
                            id="lead"
                            name="lead"
                            type="text"
                            labelName="Lead Name"
                            placeholder="Enter Lead Name"
                            requiredStarOnLabel={true}
                          />
                          {errors.lead && (
                            <FormErrorText>{errors.lead.message}</FormErrorText>
                          )}
                        </TkCol>

                        <TkCol lg={4}>
                          <TkInput
                            {...register("location")}
                            labelName="Location"
                            labelId={"location"}
                            id="location"
                            type="text"
                            placeholder="Enter Location"
                            requiredStarOnLabel={true}
                          />
                          {errors.location && (
                            <FormErrorText>
                              {errors.location.message}
                            </FormErrorText>
                          )}
                        </TkCol>

                        <TkCol lg={4}>
                          <TkInput
                            {...register("phone")}
                            id="phone"
                            name="phone"
                            type="text"
                            labelName="Phone Number"
                            placeholder="Enter Phone Number"
                            requiredStarOnLabel="true"
                          />
                          {errors.phone && (
                            <FormErrorText>
                              {errors.phone.message}
                            </FormErrorText>
                          )}
                        </TkCol>

                        <TkCol lg={4}>
                          <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                              <TkSelect
                                {...field}
                                labelName="Status"
                                labelId={"_status"}
                                id="status"
                                options={[]}
                                placeholder="Select Type"
                                requiredStarOnLabel={true}
                              />
                            )}
                          />
                          {errors.status && (
                            <FormErrorText>
                              {errors.status.message}
                            </FormErrorText>
                          )}
                        </TkCol>

                        <TkCol lg={4}>
                          <Controller
                            name="date"
                            control={control}
                            rules={{ required: "Date is required" }}
                            render={({ field }) => (
                              <TkDate
                                {...field}
                                labelName="Date"
                                id={"date"}
                                placeholder="Select Date"
                                options={{
                                  altInput: true,
                                  dateFormat: "d M, Y",
                                }}
                                requiredStarOnLabel={true}
                              />
                            )}
                          />
                          {errors.date && (
                            <FormErrorText>{errors.date.message}</FormErrorText>
                          )}
                        </TkCol>

                        <TkCol lg={4}>
                          <TkInput
                            {...register(`time`, {
                              required: "Time is required",
                              validate: (value) => {
                                if (
                                  value &&
                                  !/^[0-9]*([.:][0-9]+)?$/.test(value)
                                ) {
                                  return "Invalid Time";
                                }
                                if (
                                  convertTimeToSec(value) > 86400 ||
                                  value > 24
                                ) {
                                  return "Time should be less than 24 hours";
                                }
                              },
                            })}
                            onBlur={(e) => {
                              setValue(
                                `time`,
                                convertToTimeFotTimeSheet(e.target.value)
                              );
                            }}
                            labelName="Time (HH:MM)"
                            id={"time"}
                            name="time"
                            type="text"
                            placeholder="Enter Time"
                            requiredStarOnLabel={true}
                          />
                          {errors.time && (
                            <FormErrorText>{errors.time.message}</FormErrorText>
                          )}
                        </TkCol>

                        <TkCol lg={8}>
                          <TkInput
                            {...register("comments")}
                            id="comments"
                            name="comments"
                            type="textarea"
                            labelName="Comments"
                            placeholder="Enter Comments"
                          />
                          {errors.comments && (
                            <FormErrorText>
                              {errors.comments.message}
                            </FormErrorText>
                          )}
                        </TkCol>

                        <div className="d-flex mt-4 space-childern">
                          <div className="ms-auto" id="update-form-btns">
                            <TkButton
                              color="secondary"
                              type="button"
                              onClick={() => {
                                router.push(`${urls.activity}`);
                              }}
                            >
                              Cancel
                            </TkButton>{" "}
                            <TkButton type="submit" color="primary">
                              Save
                            </TkButton>
                          </div>
                        </div>
                      </TkRow> */}
                    </div>
                  </TkCol>
                </TkRow>
              </div>
            </TkForm>
          </TkCardBody>
        </TkCol>
      </TkRow>
    </>
  );
};

export default AddActivity;
