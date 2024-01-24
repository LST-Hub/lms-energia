import React, { useEffect, useState } from "react";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

import WorkingDays from "./WorkingDays";
import NonWorkingDays from "./NonWorkingDays";
import TkForm from "../../forms/TkForm";
import TkRow, { TkCol } from "../../TkRow";
import TkInput from "../../forms/TkInput";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../../forms/ErrorText";
import {
  API_BASE_URL,
  bigInpuMaxLength,
  length10,
  MaxNameLength,
  MaxTitleLength,
  MinNameLength,
  MinTitleLength,
  modes,
  RQ,
  urls,
} from "../../../utils/Constants";
import TkButton from "../../TkButton";
import tkFetch from "../../../utils/fetch";
import { TkToastSuccess } from "../../TkToastContainer";
import { useRouter } from "next/router";
import TkNoData from "../../TkNoData";
import TkLoader from "../../TkLoader";
import { convertSecToTime, convertTimeToSec, convertToDayTime, convertToTimeFotTimeSheet } from "../../../utils/time";
import { formatDate } from "../../../utils/date";
import TkEditCardHeader from "../../TkEditCardHeader";
import TkCard, { TkCardBody } from "../../TkCard";
import useUserRole from "../../../utils/hooks/useUserRole";
import TkAccessDenied from "../../TkAccessDenied";
import TkLabel from "../../forms/TkLabel";
import TkCheckBox from "../../forms/TkCheckBox";
import DeleteModal from "../../../utils/DeleteModal";

const schema = Yup.object({
  calendarName: Yup.string()
    .min(MinTitleLength, `Name must be at least ${MinTitleLength} character.`)
    .max(MaxTitleLength, `Name must be at most ${MaxTitleLength} characters.`)
    .required("Name is required"),

  description: Yup.string().max(bigInpuMaxLength, `Description must be at most ${bigInpuMaxLength} characters.`),
  // startTime: Yup.string().max(length10, `Max length is ${length10} characters`),
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
//   inactive: Yup.boolean().nullable(),
// }).required();

const tabs = {
  workingDays: 1,
  nonWorkingDays: 2,
};

function EditWorkCalendar({ id, mode }) {
  const router = useRouter();
  const accessLevel = useUserRole().isAdmin;
  const viewMode = mode === modes.view;
  const editMode = mode === modes.edit;

  const [selectedDayHours, setSelectedDayHours] = useState({});
  const [nonWorkDays, setNonWorkDays] = useState([]);
  const [activeTab, setActiveTab] = useState(tabs.workingDays);

  // make a array to store new dates added
  const [addNWorkDay, setAddNWorkDay] = useState([]);
  // make a array to store dates deleted
  const [delNWorkDay, setDelNWorkDay] = useState([]);

  const [isCalActive, setIsCalActive] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const wid = Number(id);

  const queryClient = useQueryClient();
  const { data, isLoading, isFetched, isError, error } = useQuery({
    queryKey: [RQ.workCal, wid],
    queryFn: tkFetch.get(`${API_BASE_URL}/work-calendar/${wid}`),
    enabled: !!wid,
  });

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

  const updateWorkCal = useMutation({
    mutationFn: tkFetch.putWithIdInUrl(`${API_BASE_URL}/work-calendar`),
  });

  // const activeCal = useMutation({
  //   mutationFn: tkFetch.patchWithIdInUrl(`${API_BASE_URL}/work-calendar`),
  // });

  useEffect(() => {
    if (isFetched && Array.isArray(data) && data.length > 0) {
      setValue("calendarName", data[0].name);
      setValue("description", data[0].description);
      setValue("startTime", convertSecToTime(data[0].startTime));
      setValue("inactive", !data[0].active);

      if (data[0].weeklyWorkingDays?.length > 0) {
        const dayHours = {};
        data[0].weeklyWorkingDays.forEach((day) => {
          dayHours[day.day] = convertSecToTime(day.time);
        });
        setSelectedDayHours(dayHours);
      }

      if (data[0].nonWorkingDays?.length > 0) {
        const nDays = data[0].nonWorkingDays;
        nDays.forEach((day) => {
          day.date = formatDate(day.date);
        });
        setNonWorkDays(nDays);
      }
      setIsCalActive(data[0].active);
    }
  }, [isFetched, data, setValue]);

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

  const onSubmit = () => {
    if (!editMode) return;
    const data = getValues();
    if (!data.calendarName) {
      setError("calendarName", { message: "Name is required" });
      return;
    }
   
    const apiData = {
      id: wid,
      name: data.calendarName,
      description: data.description,
      active: !data.inactive,
      startTime: convertTimeToSec(data.startTime),
    };
    apiData.workingDays = Object.keys(selectedDayHours).map((day) => ({
      day: day,
      time: convertTimeToSec(selectedDayHours[day]),
    }));
    apiData.addNonWorkinDays = addNWorkDay;
    apiData.deleteNonWorkingDaysIds = delNWorkDay;

    updateWorkCal.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Work Calendar Updated Successfully", {
          autoClose: 5000,
        });
        queryClient.invalidateQueries({
          queryKey: [RQ.workCal, wid],
        });
        // TODO: remove this redirect of settings and redirect to some other url
        router.push(`${urls.settings}`);
      },
      onError: (error) => {
        console.log("error", error);
      },
    });
  };

  const deleteWorkCal = useMutation({
    mutationFn: tkFetch.deleteWithIdInUrl(`${API_BASE_URL}/work-calendar`),
  });

  const deleteWorkCalHandler = () => {
    if (!editMode) return;
    const apiData = {
      id: wid,
    };
    deleteWorkCal.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Work Calendar Deleted Successfully");
        queryClient.invalidateQueries({
          queryKey: [RQ.workCal, wid],
        });
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

  const toggleDeleteModel = () => {
    setDeleteModal(true);
  };

  return (
    <>
     <DeleteModal
      show={deleteModal}
      onDeleteClick={() => {
        setDeleteModal(false);
        deleteWorkCalHandler();
      }}
      onCloseClick={() => setDeleteModal(false)}
    />
      {isLoading ? (
        <TkLoader />
      ) : isError ? (
        <FormErrorBox errMessage={error?.message} />
      ) : data.length > 0 ? (
        <TkRow className="justify-content-center">
          <TkCol lg={12}>
            <TkEditCardHeader
              title={viewMode ? "Work Calendar Details" : "Edit Work Calendar"}
              isEditAccess={viewMode}
              onDeleteClick={deleteWorkCalHandler}
              disableDelete={viewMode}
              editLink={`${urls.workCalendarEdit}/${wid}`}
              toggleDeleteModel={toggleDeleteModel}
            />
            {deleteWorkCal.isError ? <FormErrorBox errMessage={deleteWorkCal.error?.message} /> : null}
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
                          // tooltip="Enter Calendar Name"
                          // labelId={"_calendarName"}
                          type="text"
                          placeholder="Enter Calendar Name"
                          onChange={(e) => {
                            clearErrors("calendarName");
                            field.onChange(e);
                          }}
                          requiredStarOnLabel={editMode}
                          disabled={viewMode}
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
                      // tooltip="Enter Start Time"
                      // labelId={"_startTime"}
                      type="text"
                      placeholder="Enter Start Time"
                      requiredStarOnLabel={editMode}
                      // onBlur={formatTime}
                      onBlur={(e) => {
                        setValue("startTime", convertToTimeFotTimeSheet(e.target.value));
                      }}
                      disabled={viewMode}
                    />
                    {errors.startTime && <FormErrorText>{errors.startTime.message}</FormErrorText>}
                  </TkCol>

                  <TkCol lg={6}>
                    <TkInput
                      {...register("description")}
                      labelName="Description"
                      // tooltip="Enter Description"
                      // labelId={"_description"}
                      id="description"
                      type="textarea"
                      placeholder="Enter Description"
                      validate={{
                        required: { value: true },
                      }}
                      disabled={viewMode}
                      invalid={errors.description?.message ? true : false}
                    />
                    {errors.description?.message ? <FormErrorText>{errors.description?.message}</FormErrorText> : null}
                  </TkCol>

                  <TkCol lg={4}>
                    <div className="mt-4">
                      <TkCheckBox {...register("inactive")} disabled={viewMode} id="inactive" />
                      <TkLabel disabled={viewMode} className="ms-3">
                        Inactive
                      </TkLabel>
                    </div>
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
                  <WorkingDays
                    selectedDayHours={selectedDayHours}
                    setSelectedDayHours={setSelectedDayHours}
                    mode={mode}
                  />
                </TabPane>
                <TabPane tabId={tabs.nonWorkingDays} className="py-2 ps-2">
                  <NonWorkingDays
                    nonWorkDays={nonWorkDays}
                    setNonWorkDays={setNonWorkDays}
                    setAddNWorkDay={setAddNWorkDay}
                    addNWorkDay={addNWorkDay}
                    delNWorkDay={delNWorkDay}
                    setDelNWorkDay={setDelNWorkDay}
                    mode={mode}
                  />
                </TabPane>
              </TabContent>
              {/* the below buttons are not form buttons they are buttons at work clendar level */}
              {updateWorkCal.isError ? <FormErrorBox errMessage={updateWorkCal.error.message} /> : null}
              <div className="d-flex space-childern">
                {editMode ? (
                  <div className="ms-auto">
                    <TkButton
                      disabled={updateWorkCal.isLoading}
                      color="secondary"
                      onClick={() => router.push(`${urls.settings}`)}
                      className="ms-auto"
                    >
                      Cancel
                    </TkButton>
                    {"  "}
                    <TkButton
                      loading={updateWorkCal.isLoading}
                      onClick={handleSubmit(onSubmit)}
                      color="primary"
                    >
                      Update
                    </TkButton>
                  </div>
                ) : null}
                {/* {viewMode ? (
                  <div className="ms-auto">
                    <TkButton
                      onClick={() => router.push(`${urls.workCalendarEdit}/${wid}`)}
                      type="button"
                      color="primary"
                    >
                      Edit
                    </TkButton>
                  </div>
                ) : null} */}
              </div>
            </TkCardBody>
          </TkCol>
        </TkRow>
      ) : (
        <TkNoData />
      )}
    </>
  );
}

export default EditWorkCalendar;
