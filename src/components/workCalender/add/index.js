import React, { useState } from "react";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import { useMutation } from "@tanstack/react-query";
import WorkingDays from "./WorkingDays";
import NonWorkingDays from "./NonWorkingDays";
import TkForm from "../../forms/TkForm";
import TkRow, { TkCol } from "../../TkRow";
import TkInput from "../../forms/TkInput";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../../forms/ErrorText";
import { API_BASE_URL, bigInpuMaxLength, MaxTitleLength, MinTitleLength, urls } from "../../../utils/Constants";
import TkButton from "../../TkButton";
import tkFetch from "../../../utils/fetch";
import { TkToastSuccess } from "../../TkToastContainer";
import { useRouter } from "next/router";
import { convertTimeToSec, convertToDayTime, convertToTimeFotTimeSheet } from "../../../utils/time";
import TkCard, { TkCardBody, TkCardHeader } from "../../TkCard";
import useUserRole from "../../../utils/hooks/useUserRole";
import TkAccessDenied from "../../TkAccessDenied";

const schema = Yup.object({
  calendarName: Yup.string()
    .min(MinTitleLength, `Name must be at least ${MinTitleLength} character.`)
    .max(MaxTitleLength, `Name must be at most ${MaxTitleLength} characters.`)
    .required("Name is required"),

  description: Yup.string().max(bigInpuMaxLength, `Description should have at most ${bigInpuMaxLength} characters.`),

  startTime: Yup.string()
    .matches(/^[0-9]*([.:][0-9]+)?$/, "Start time cannot contain characters")
    .required("Start Time is required")
    .test("startTime", "Start time cannot be greater than 24 hrs", function (value) {
      if (value) {
        const time = convertTimeToSec(value);
        if (time > 86400) {
          return false;
        }
      }
      return true;
    }),
}).required();

const tabs = {
  workingDays: 1,
  nonWorkingDays: 2,
};

function AddWorkCalendar() {
  const router = useRouter();
  const accessLevel = useUserRole().isAdmin;

  const [selectedDayHours, setSelectedDayHours] = useState({});
  const [nonWorkDays, setNonWorkDays] = useState([]);
  const [activeTab, setActiveTab] = useState(tabs.workingDays);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const formatTime = (e) => {
    const time = convertToDayTime(e.target.value);
    if (time) {
      setValue("startTime", time);
    } else {
      setValue("startTime", "");
    }
  };

  const addWorkCal = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/work-calendar`),
  });

  const onSubmit = () => {
    const data = getValues();
    if (!data.calendarName) {
      setError("calendarName", { message: "Name is required" });
      return;
    }
    const apiData = {
      name: data.calendarName,
      description: data.description,
      startTime: convertTimeToSec(data.startTime),
    };
    apiData.workingDays = Object.keys(selectedDayHours).map((day) => ({
      day: day,
      time: convertTimeToSec(selectedDayHours[day]),
    }));
    apiData.nonWorkingDays = nonWorkDays;
    addWorkCal.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Work Calendar Created Successfully", {
          autoClose: 5000,
        });
        // TODO: remove this redirect of settings and redirect to some other url
        router.push(`${urls.settings}`);
      },
      onError: (error) => {
        console.log("error", error);
      },
    });
  };

  if (!accessLevel) {
    return <TkAccessDenied />;
  }

  return (
    <>
      {/* <TkCard> */}
      <TkRow className="justify-content-center">
        <TkCol lg={12}>
          {/* <TkCardHeader className="tk-card-header">
            <h3>Add Work Calendar</h3>
          </TkCardHeader> */}
          <TkCardBody className="mt-4">
            <TkForm onSubmit={handleSubmit(onSubmit)}>
              <TkRow className="g-3 gx-4 gy-4">
                <TkCol lg={6}>
                  <Controller
                    name="calendarName"
                    control={control}
                    render={({ field }) => (
                      <TkInput
                        {...field}
                        id="calendarName"
                        labelName="Name"
                        type="text"
                        placeholder="Enter Calendar Name"
                        onChange={(e) => {
                          clearErrors("calendarName");
                          field.onChange(e);
                        }}
                        requiredStarOnLabel={true}
                      />
                    )}
                  />

                  {errors.calendarName && <FormErrorText>{errors.calendarName.message}</FormErrorText>}
                </TkCol>

                <TkCol lg={6}>
                  <TkInput
                    {...register("startTime")}
                    id="startTime"
                    labelName="Work Start Time (HH:MM)"
                    type="text"
                    placeholder="Enter Start Time"
                    requiredStarOnLabel={true}
                    onBlur={(e) => {
                      setValue("startTime", convertToTimeFotTimeSheet(e.target.value));
                    }}
                  />
                  {errors.startTime && <FormErrorText>{errors.startTime.message}</FormErrorText>}
                </TkCol>

                <TkCol lg={6}>
                  <TkInput
                    {...register("description")}
                    labelName="Description"
                    id="description"
                    type="textarea"
                    placeholder="Enter Description"
                    validate={{
                      required: { value: true },
                    }}
                    invalid={errors.description?.message ? true : false}
                  />
                  {errors.description?.message ? <FormErrorText>{errors.description?.message}</FormErrorText> : null}
                </TkCol>
              </TkRow>
            </TkForm>

            <Nav className="nav-tabs dropdown-tabs nav-tabs-custom mt-4 mb-4">
              <NavItem>
                <NavLink
                  href="#"
                  className={classnames({
                    active: activeTab === tabs.workingDays,
                  })}
                  onClick={() => {
                    toggleTab(tabs.workingDays);
                  }}
                >
                  Working Days
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  href="#"
                  className={classnames({
                    active: activeTab === tabs.nonWorkingDays,
                  })}
                  onClick={() => {
                    toggleTab(tabs.nonWorkingDays);
                  }}
                >
                  Non Working Days
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId={tabs.workingDays} className="py-2 ps-2">
                <WorkingDays selectedDayHours={selectedDayHours} setSelectedDayHours={setSelectedDayHours} />
              </TabPane>
              <TabPane tabId={tabs.nonWorkingDays} className="py-2 ps-2">
                <NonWorkingDays nonWorkDays={nonWorkDays} setNonWorkDays={setNonWorkDays} />
              </TabPane>
            </TabContent>
            {/* the below buttons are not form buttons they are buttons at work clendar level */}
            {addWorkCal.isError ? <FormErrorBox errMessage={addWorkCal.error.message} /> : null}
            <div className="d-flex space-childern">
              <TkButton
                disabled={addWorkCal.isLoading}
                color="secondary"
                onClick={() => router.push(`${urls.settings}`)}
                className="ms-auto"
              >
                Cancel
              </TkButton>
              <TkButton loading={addWorkCal.isLoading} onClick={handleSubmit(onSubmit)} color="primary">
                Save
              </TkButton>
            </div>
          </TkCardBody>
        </TkCol>
      </TkRow>
      {/* </TkCard> */}
    </>
  );
}

export default AddWorkCalendar;
