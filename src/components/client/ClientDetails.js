import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import TkInput from "../forms/TkInput";
import TkDate from "../forms/TkDate";
import TkRow, { TkCol } from "../TkRow";
import TkForm from "../forms/TkForm";
import TkButton from "../TkButton";
import TkIcon from "../TkIcon";
import TkCard, { TkCardBody, TkCardTitle } from "../TkCard";
import TkEditCardHeader from "../TkEditCardHeader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../../src/utils/fetch";
import { TkToastSuccess } from "../TkToastContainer";
import classnames from "classnames";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, {
  FormErrorBox,
} from "../../../src/components/forms/ErrorText";
import {
  MaxEmailLength,
  MinNameLength,
  MaxNameLength,
  MaxPhoneNumberLength,
  bigInpuMaxLength,
  API_BASE_URL,
  RQ,
  modes,
  smallInputMinLength,
  smallInputMaxLength,
  projectHighlightColumn,
  timesheetHighlightColumn,
  urls,
} from "../../../src/utils/Constants";
import TkLoader from "../TkLoader";
import TkNoData from "../TkNoData";
import { formatDate } from "../../utils/date";
import useUserAccessLevel from "../../utils/hooks/useUserAccessLevel";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import hasPageModeAccess from "../../utils/hasPageAccess";
import TkAccessDenied from "../TkAccessDenied";
import { convertSecToTime } from "../../utils/time";
import TkLabel from "../forms/TkLabel";
import TkCheckBox from "../forms/TkCheckBox";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import { useLayoutEffect } from "react";
import { useMemo } from "react";
import TkTableContainer from "../TkTableContainer";
import TkPageHead from "../TkPageHead";
import DeleteModal from "../../utils/DeleteModal";
import { set } from "date-fns";

const tabs = {
  projects: "projects",
  timesheets: "timesheets",
};

const tabValues = Object.values(tabs);

const schema = Yup.object({
  clientEmail: Yup.string()
    .email("Email must be valid.")
    .max(MaxEmailLength, `Email must be at most ${MaxEmailLength} characters.`),

  clientName: Yup.string()
    .min(
      smallInputMinLength,
      `Client name must be at least ${smallInputMinLength} character.`
    )
    .max(
      smallInputMaxLength,
      `Client name must be at most ${smallInputMaxLength} characters.`
    )
    .required("Client name is required"),

    phoneNumber: Yup.string()
    .matches(/^[0-9+() -]*$/, "Phone number must be number.")
    .max(MaxPhoneNumberLength, `Phone number must be at most   ${MaxPhoneNumberLength} numbers.`)
    .nullable(),
  // phoneNumber: Yup.string()
  //   .test("test-name", "phone number does not accept characters", function (value) {
  //     if (value === "" || value === null || value === undefined) {
  //       return true;
  //     } else {
  //       return value.trim().match(/\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g, "Phone number must be at least 5 numbers.");
  //     }
  //   })
  //   .max(MaxPhoneNumberLength, `Phone number must be at most   ${MaxPhoneNumberLength} numbers.`)
  //   .nullable(),

  totalWork: Yup.string(),

  notes: Yup.string().max(
    bigInpuMaxLength,
    `Notes must be at most ${bigInpuMaxLength} characters.`
  ),

  inactive: Yup.boolean().nullable(),
}).required();

const ClientDetails = ({ id, mode }) => {
  const router = useRouter();
  const accessLevel = useUserAccessLevel(permissionTypeIds.clients);
  const viewMode = mode === modes.view;
  const editMode = mode === modes.edit;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [deleteModal, setDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs.projects);
  const [createDate, setCreateDate] = useState("");
  const [isClientActive, setIsClientActive] = useState(true);
  const [projectList, setProjectList] = useState([]);
  const cid = Number(id);
  const queryClient = useQueryClient();

  const { data, isLoading, isFetched, isError, error } = useQuery({
    queryKey: [RQ.client, cid],
    queryFn: tkFetch.get(`${API_BASE_URL}/client/${cid}`),
    enabled: !!cid && hasPageModeAccess(mode, accessLevel),
  });

  // TODO: report this to error reporting service, loading and error here is not important
  const {
    data: actualTimeData,
    isLoading: isActualTimeLoading,
    isError: isActualTimeError,
    error: actualTimeError,
  } = useQuery({
    queryKey: [RQ.client, cid, RQ.actualTime],
    queryFn: tkFetch.get(`${API_BASE_URL}/client/${cid}/actual-time`),
    enabled: !!cid && hasPageModeAccess(mode, accessLevel),
  });

  const {
    data: projecthighlightsData,
    isLoading: isProjectHighlightsLoading,
    isError: isProjectHighlightsError,
    error: projectHighlightsError,
  } = useQuery({
    queryKey: [RQ.projecthighlights],
    queryFn: tkFetch.get(`${API_BASE_URL}/highlights/projects?clientId=${cid}`),
    enabled:
      !!cid &&
      hasPageModeAccess(mode, accessLevel) &&
      activeTab === tabs.projects,
  });

  const {
    data: timesheetHighlightsData,
    isLoading: isTimesheetHighlightsLoading,
    isError: isTimesheetHighlightsError,
    error: timesheetHighlightsError,
  } = useQuery({
    queryKey: [RQ.timesheetHighlights],
    queryFn: tkFetch.get(
      `${API_BASE_URL}/highlights/timesheets?clientId=${cid}`
    ),
    enabled:
      !!cid &&
      hasPageModeAccess(mode, accessLevel) &&
      activeTab === tabs.timesheets,
  });

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      viewMode
        ? router.push(`${urls.clientView}/${cid}?tab=${tab}`, undefined, {
            scroll: false,
          })
        : router.push(`${urls.clientEdit}/${cid}?tab=${tab}`, undefined, {
            scroll: false,
          });
    }
  };

  //IMP: if readign fr reference, then try not to use useLayoutEffect, try always using useEffect instead
  // used layout effect because we need to get the tab from url, and settab before rendering the component
  useLayoutEffect(() => {
    // did not use router.query.tab because it was not updating the state, before component is rendered
    // const tab = router.query.tab;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tabValues.includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab(tabs.projects);
    }
  }, []);

  const updateClient = useMutation({
    mutationFn: tkFetch.putWithIdInUrl(`${API_BASE_URL}/client`),
  });

  // const activeClient = useMutation({
  //   mutationFn: tkFetch.patchWithIdInUrl(`${API_BASE_URL}/client`),
  // });

  useEffect(() => {
    if (!isDirty && isFetched && Array.isArray(data) && data.length > 0) {
      setValue("clientName", data[0].name);
      setValue("clientEmail", data[0].email);
      setValue("phoneNumber", data[0].phone);
      setValue("notes", data[0].notes);
      setValue("createdBy", data[0].createdBy.name);
      setValue("inactive", !data[0].active);
      setCreateDate(formatDate(data[0].createdAt));
      setIsClientActive(data[0].active);
      setProjectList(data[0].projects);
    }
  }, [isFetched, data, setValue, isDirty]);

  useEffect(() => {
    if (Array.isArray(actualTimeData) && actualTimeData.length > 0) {
      setValue("totalWork", convertSecToTime(actualTimeData[0].actualTime));
    }
  }, [actualTimeData, setValue]);

  // const activeClientChange = () => {
  //   if (!editMode) return;
  //   const apiData = {
  //     id: cid,
  //     active: !isClientActive,
  //   };
  //   activeClient.mutate(apiData, {
  //     onSuccess: (data) => {
  //       setIsClientActive(!isClientActive);
  //       {
  //         isClientActive
  //           ? TkToastSuccess("Client Inactivated Successfully")
  //           : TkToastSuccess("Client Activated Successfully");
  //       }
  //       queryClient.invalidateQueries({
  //         queryKey: [RQ.client, cid],
  //       });
  //     },
  //     onError: (error) => {
  //       console.log("error while updating status in client", error);
  //     },
  //   });
  // };

  const onSubmit = (formData) => {
    if (!editMode) return;
    const apiData = {
      id: cid,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      phoneNumber: formData.phoneNumber,
      active: !formData.inactive,
      notes: formData.notes,
    };
    updateClient.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Client Updated Successfully");
        router.push(`${urls.clients}`);
      },
      onError: (error) => {
        // TkToastInfo("Something went wrong while updating client");
        console.log("error", error);
      },
    });
  };

  const deleteClient = useMutation({
    mutationFn: tkFetch.deleteWithIdInUrl(`${API_BASE_URL}/client`),
  });

  const deleteClientHandler = () => {
    if (!editMode) return;
    const apiData = {
      id: cid,
    };
    deleteClient.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Client Deleted Successfully");
        queryClient.invalidateQueries({
          queryKey: [RQ.client, cid],
        });
        router.push(`${urls.clients}`);
      },
      onError: (error) => {
        console.log("error while deleting client", error);
      },
    });
  };

  if (!hasPageModeAccess(mode, accessLevel)) {
    return <TkAccessDenied />;
  }
  const toggleDeleteModel = () => {
    setDeleteModal(true);
  };
  return (
    <div>
      <DeleteModal
      show={deleteModal}
      onDeleteClick={() => {
        setDeleteModal(false);
        deleteClientHandler();
      }}
      onCloseClick={() => setDeleteModal(false)}
      loading={deleteClient.isLoading}
    />
      {isLoading ? (
        <TkLoader />
      ) : isError ? (
        <FormErrorBox errMessage={error?.message} />
      ) : data?.length > 0 ? (
        <>
          <TkPageHead>
            <title>{`Client: ${data[0].name}`}</title>
          </TkPageHead>
          <TkRow className="justify-content-center">
            <TkCol>
              {/* <TkCard> */}
              <TkEditCardHeader
                title={viewMode ? "Client Details" : "Edit Client"}
                // active={isClientActive}
                // onActiveClick={activeClientChange}
                onDeleteClick={deleteClientHandler}
                isEditAccess={viewMode && accessLevel >= perAccessIds.edit}
                disableDelete={viewMode}
                editLink={`${urls.clientEdit}/${cid}`}
                toggleDeleteModel={toggleDeleteModel}
              />
              {deleteClient.isError ? (
                <FormErrorBox errMessage={deleteClient.error?.message} />
              ) : null}
              <TkCardBody className="mt-4">
                <TkForm onSubmit={handleSubmit(onSubmit)}>
                  <TkRow className="g-3 gx-4 gy-4">
                    <TkCol lg={4}>
                      <TkInput
                        {...register("clientName")}
                        id="clientName"
                        type="text"
                        labelName="Client Name"
                        // tooltip="Enter Client Name"
                        // labelId={"_clientName"}
                        placeholder="Enter Client Name"
                        requiredStarOnLabel={editMode}
                        disabled={viewMode}
                      />
                      {errors.clientName?.message ? (
                        <FormErrorText>
                          {errors.clientName?.message}
                        </FormErrorText>
                      ) : null}
                    </TkCol>

                    <TkCol lg={4}>
                      <TkInput
                        {...register("clientEmail")}
                        id="email"
                        type="text"
                        labelName="Email"
                        // tooltip="Enter Email"
                        // labelId={"_email"}
                        placeholder="Enter Email"
                        disabled={viewMode}
                      />
                      {errors.clientEmail?.message ? (
                        <FormErrorText>
                          {errors.clientEmail?.message}
                        </FormErrorText>
                      ) : null}
                    </TkCol>

                    <TkCol lg={4}>
                      <TkInput
                        {...register("phoneNumber")}
                        id="clientPhoneNumber"
                        type="text"
                        labelName="Phone"
                        // tooltip="Enter Phone"
                        // labelId={"_clientPhoneNumber"}
                        placeholder="Enter Phone"
                        disabled={viewMode}
                      />
                      {errors.phoneNumber?.message ? (
                        <FormErrorText>
                          {errors.phoneNumber?.message}
                        </FormErrorText>
                      ) : null}
                    </TkCol>

                    <TkCol lg={4}>
                      <TkDate
                        labelName="Created Date"
                        // tooltip="Select Created Date"
                        // labelId={"_createDate"}
                        id="createDate"
                        name="createDate"
                        placeholder="Select a date"
                        value={
                          createDate ? new Date(createDate).toISOString() : null
                        }
                        disabled={true}
                        options={{
                          altInput: true,
                          altFormat: "d M, Y",
                          dateFormat: "d M, Y",
                        }}
                      />
                    </TkCol>

                    <TkCol lg={4}>
                      <TkInput
                        {...register("createdBy")}
                        id="createdBy"
                        type="text"
                        labelName="Created By"
                        // tooltip="Enter Created By"
                        // labelId={"_createdBy"}
                        disabled={true || viewMode}
                      />
                    </TkCol>

                    <TkCol lg={4}>
                      <TkInput
                        {...register("totalWork")}
                        id="totalWork"
                        type="text"
                        labelName="Total Work (HH:MM)"
                        // tooltip="Enter Total Work"
                        // labelId={"_totalWork"}
                        disabled={true || viewMode}
                      />
                    </TkCol>

                    <TkCol lg={4}>
                      <div className="">
                        <TkCheckBox
                          {...register("inactive")}
                          id="inactive"
                          labelName="Inactive"
                          disabled={viewMode}
                        />
                        <TkLabel className="ms-3">Inactive</TkLabel>
                      </div>
                    </TkCol>

                    <TkCol lg={12}>
                      <TkInput
                        {...register("notes")}
                        id="notes"
                        type="textarea"
                        labelName="Notes"
                        // tooltip="Enter Notes"
                        // labelId={"_notes"}
                        placeholder="Enter Notes"
                        disabled={viewMode}
                      />
                      {errors.notes?.message ? (
                        <FormErrorText>{errors.notes?.message}</FormErrorText>
                      ) : null}
                    </TkCol>
                  </TkRow>
                  {updateClient.isError ? (
                    <FormErrorBox errMessage={updateClient.error?.message} />
                  ) : null}
                  <div className="d-flex mt-4 space-childern">
                    {editMode ? (
                      <div className="ms-auto">
                        <TkButton
                          color="secondary"
                          disabled={updateClient.isLoading}
                          onClick={() => router.push(`${urls.clients}`)}
                          type="button"
                        >
                          Cancel
                        </TkButton>{" "}
                        <TkButton
                          loading={updateClient.isLoading}
                          type="submit"
                          color="primary"
                        >
                          Update
                        </TkButton>
                      </div>
                    ) : null}
                    {/* {viewMode && accessLevel >= perAccessIds.edit ? (
                      <div className="ms-auto">
                        <TkButton
                          onClick={() => router.push(`${urls.clientEdit}/${cid}`)}
                          type="button"
                          color="primary"
                        >
                          Edit
                        </TkButton>
                      </div>
                    ) : null} */}
                  </div>
                </TkForm>
              </TkCardBody>
              {/* </TkCard> */}
              <Nav className="nav-tabs dropdown-tabs nav-tabs-custom mb-3">
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({
                      active: activeTab === tabs.projects,
                    })}
                    onClick={() => {
                      toggleTab(tabs.projects);
                    }}
                  >
                    Projects
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({
                      active: activeTab === tabs.timesheets,
                    })}
                    onClick={() => {
                      toggleTab(tabs.timesheets);
                    }}
                  >
                    Timesheets
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent activeTab={activeTab}>
                <TabPane tabId={tabs.projects}>
                  {/* <TkCard> */}
                  <TkCardBody>
                    {projecthighlightsData?.length > 0 ? (
                      <TkTableContainer
                        columns={projectHighlightColumn}
                        data={projecthighlightsData || []}
                        loading={isProjectHighlightsLoading}
                        defaultPageSize={10}
                        customPageSize={true}
                        showPagination={true}
                      />
                    ) : (
                      <TkNoData />
                    )}
                  </TkCardBody>
                  {/* </TkCard> */}
                </TabPane>
                <TabPane tabId={tabs.timesheets}>
                  {/* <TkCard> */}
                  <TkCardBody>
                    {timesheetHighlightsData?.length > 0 ? (
                      <TkTableContainer
                        columns={timesheetHighlightColumn}
                        data={timesheetHighlightsData || []}
                        loading={isTimesheetHighlightsLoading}
                        defaultPageSize={10}
                        customPageSize={true}
                        showPagination={true}
                      />
                    ) : (
                      <TkNoData />
                    )}
                  </TkCardBody>
                  {/* </TkCard> */}
                </TabPane>
              </TabContent>
            </TkCol>
          </TkRow>
        </>
      ) : (
        <TkNoData />
      )}
    </div>
  );
};

export default ClientDetails;
