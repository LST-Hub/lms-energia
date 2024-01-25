import React, { useState, useMemo, useEffect, useLayoutEffect } from "react";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import TkButton from "../TkButton";
import TkInput from "../forms/TkInput";
import TkSelect from "../forms/TkSelect";
import TkCard, { TkCardBody } from "../TkCard";
import TkRow, { TkCol } from "../TkRow";
import TkForm from "../forms/TkForm";
import TkEditCardHeader from "../TkEditCardHeader";
import TkLabel from "../forms/TkLabel";
import TkCheckBox from "../forms/TkCheckBox";
import { TkToastSuccess, TkToastError } from "../TkToastContainer";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";
import TkLoader from "../TkLoader";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/router";
import {
  API_BASE_URL,
  bigInpuMaxLength,
  countries,
  employeeTypes,
  expensesHighlightColumn,
  genderTypes,
  MaxEmailLength,
  MaxNameLength,
  MaxPhoneNumberLength,
  MinEmailLength,
  MinNameLength,
  modes,
  projectHighlightColumn,
  projecthighlightColumn,
  PUBLIC_BUCKET_BASE_URL,
  RQ,
  smallInputMaxLength,
  taskHighlightColumn,
  timesheetHighlightColumn,
  todaysTaskHighlightColumn,
  urls,
} from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import useUserAccessLevel from "../../utils/hooks/useUserAccessLevel";
import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import hasPageModeAccess from "../../utils/hasPageAccess";
import axios from "axios";
import TkAccessDenied from "../TkAccessDenied";
import TkTableContainer from "../TkTableContainer";
import { convertSecToTime } from "../../utils/time";
import { formatDate } from "../../utils/date";
import TkNoData from "../TkNoData";
import TkPageHead from "../TkPageHead";
import DeleteModal from "../../utils/DeleteModal";

const data = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@test.com",
    designation: "Software Engineer",
    phoneNumber: "1234567890",
    gender: "male",
    zipCode: "123456",
    country: "India",
    notes: "This is test note",
    address: "Test address",
    type: "Full Time",
    inactive: false,
    canBeSupervisor: true,
    image: null,
    role: {
      id: 1,
      name: "Admin",
      isAdmin: true,
      active: true,
    },
  },
];

const tabs = {
  projects: "projects",
  tasks: "tasks",
  timesheets: "timesheets",
  todaysTasks: "todaysTasks",
  expenses: "expenses",
};

const tabValues = Object.values(tabs);

const schema = Yup.object({
  firstName: Yup.string()
    .min(
      MinNameLength,
      `First name should have at least ${MinNameLength} character.`
    )
    .max(
      MaxNameLength,
      `First name should have at most ${MaxNameLength} characters.`
    )
    .required("First name is required"),

  lastName: Yup.string()
    .min(
      MinNameLength,
      `Last name should have at least ${MinNameLength} character.`
    )
    .max(
      MaxNameLength,
      `Last name should have at most ${MaxNameLength} characters.`
    )
    .required("Last name is required"),

  email: Yup.string()
    .email("Email must be valid.")
    .min(
      MinEmailLength,
      `Email should have at least ${MinEmailLength} characters.`
    )
    .max(
      MaxEmailLength,
      `Email should have at most ${MaxEmailLength} characters.`
    )
    .required("Email is required"),

  designation: Yup.string()
    .max(
      smallInputMaxLength,
      `Designation should have at most ${smallInputMaxLength} characters.`
    )
    .nullable(),

  phoneNumber: Yup.string()
    .matches(/^[0-9+() -]*$/, "Phone number must be number.")
    .max(
      MaxPhoneNumberLength,
      `Phone number must be at most   ${MaxPhoneNumberLength} numbers.`
    )
    .nullable(),

  // we romoved supervisor field mandatory from here as for admin role supervisor field id not mandatory, we checked it manually
  supervisor: Yup.object().nullable(),
  department: Yup.object().nullable(),
  type: Yup.object().nullable(),
  role: Yup.object().nullable().required("Role is required"),
  // zip code an dphoen number has same max lenght so we are usign it here
  zipCode: Yup.string()
    .test("test-name", "Zip code does not accept characters", function (value) {
      if (value === "" || value === null || value === undefined) {
        return true;
      } else {
        return value.trim().match(/^[0-9]*$/, "Zip code must be numeric.");
      }
    })
    .max(
      MaxPhoneNumberLength,
      `Zip code must be at most   ${MaxPhoneNumberLength} numbers.`
    )
    .nullable(),

  country: Yup.object().nullable(),
  gender: Yup.object().nullable(),
  notes: Yup.string()
    .max(
      bigInpuMaxLength,
      `Notes should have at most ${bigInpuMaxLength} characters.`
    )
    .nullable(),
  workCalendar: Yup.object().nullable().required("Work calendar is required"),
  // canBePM: Yup.boolean().nullable(),
  canBeSupervisor: Yup.boolean().nullable(),
  inactive: Yup.boolean().nullable(),
  address: Yup.string()
    .max(
      bigInpuMaxLength,
      `Address should have at most ${bigInpuMaxLength} characters.`
    )
    .nullable(),
}).required();

const UserDetails = ({ mode }) => {
  const router = useRouter();
  const accessLevel = useUserAccessLevel(permissionTypeIds.users);
  const queryClient = useQueryClient();
  const viewMode = mode === modes.view;
  const editMode = mode === modes.edit;

  // const { isLoading, isFetched, isError, data, error } = useQuery({
  //   queryKey: [RQ.user, router.query.uid],
  //   queryFn: tkFetch.get(`${API_BASE_URL}/users/${router.query.uid}`),
  //   enabled: !!router.query.uid && hasPageModeAccess(mode, accessLevel),
  // });

  const results = useQueries({
    queries: [
      {
        queryKey: [RQ.allUsersList, "supervisor"],
        queryFn: tkFetch.get(`${API_BASE_URL}/users/list?filter=supervisor`),
        enabled: hasPageModeAccess(mode, accessLevel),
      },
      {
        queryKey: [RQ.allDepts],
        queryFn: tkFetch.get(`${API_BASE_URL}/department/list`),
        enabled: hasPageModeAccess(mode, accessLevel),
      },
      {
        queryKey: [RQ.allRolesList],
        queryFn: tkFetch.get(`${API_BASE_URL}/roles/list`),
        enabled: hasPageModeAccess(mode, accessLevel),
      },
      {
        queryKey: [RQ.allWorkCals],
        queryFn: tkFetch.get(`${API_BASE_URL}/work-calendar/list`),
        enabled: hasPageModeAccess(mode, accessLevel),
      },
    ],
  });
  const [supervisors, depts, roles, workCals] = results;
  const {
    isLoading: isSupervisorLoading,
    isError: isSupervisorError,
    error: supervisorError,
    data: supervisorsData,
  } = supervisors;
  const {
    isLoading: isDeptLoading,
    isError: isDeptError,
    error: deptError,
    data: deptData,
  } = depts;
  const {
    isLoading: isRoleLoading,
    isError: isRoleError,
    error: roleError,
    data: roleData,
  } = roles;
  const {
    isLoading: isWcalLoading,
    isError: isWcalError,
    error: WcalError,
    data: wCalData,
  } = workCals;

  const updateUser = useMutation({
    mutationFn: tkFetch.putWithIdInUrl(`${API_BASE_URL}/users`),
  });
  const deleteUser = useMutation({
    mutationFn: tkFetch.deleteWithIdInUrl(`${API_BASE_URL}/users`),
  });

  const removeProfileImage = useMutation({
    mutationFn: tkFetch.patch(`${API_BASE_URL}/users/${router.query?.uid}`),
  });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    formState: { errors, isDirty, dirtyFields },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [activeTab, setActiveTab] = useState(tabs.projects);
  const [user, setUser] = useState({});
  const [isUserActive, setIsUserActive] = useState(true);
  // const [allSuperVisors, setAllSuperVisors] = React.useState([]);
  // const [allDept, setAllDept] = React.useState([]);
  // const [allRoles, setAllRoles] = React.useState([]);
  // const [allWorkCals, setAllWorkCals] = React.useState([]);
  const [isAdminRole, setIsAdminRole] = React.useState(false);
  const [profileImage, setProfileImage] = React.useState(null);
  const [profileImageFile, setProfileImageFile] = React.useState(null);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const {
    data: projecthighlightsData,
    isLoading: isProjectHighlightsLoading,
    isError: isProjectHighlightsError,
    error: projectHighlightsError,
  } = useQuery({
    queryKey: [RQ.projecthighlights],
    queryFn: tkFetch.get(
      `${API_BASE_URL}/highlights/projects?userId=${router.query?.uid}`
    ),
    enabled:
      !!router.query?.uid &&
      hasPageModeAccess(mode, accessLevel) &&
      activeTab === tabs.projects,
  });

  const {
    data: taskHighlightsData,
    isLoading: isTaskHighlightsLoading,
    isError: isTaskHighlightsError,
    error: taskHighlightsError,
  } = useQuery({
    queryKey: [RQ.taskHighlights],
    queryFn: tkFetch.get(
      `${API_BASE_URL}/highlights/tasks?userId=${router.query?.uid}`
    ),
    enabled:
      !!router.query?.uid &&
      hasPageModeAccess(mode, accessLevel) &&
      activeTab === tabs.tasks,
  });

  const {
    data: timesheetHighlightsData,
    isLoading: isTimesheetHighlightsLoading,
    isError: isTimesheetHighlightsError,
    error: timesheetHighlightsError,
  } = useQuery({
    queryKey: [RQ.timesheetHighlights],
    queryFn: tkFetch.get(
      `${API_BASE_URL}/highlights/timesheets?userId=${router.query?.uid}`
    ),
    enabled:
      !!router.query?.uid &&
      hasPageModeAccess(mode, accessLevel) &&
      activeTab === tabs.timesheets,
  });

  const {
    data: todaysTaskHighlightsData,
    isLoading: isTodaysTaskHighlightsLoading,
    isError: isTodaysTaskHighlightsError,
    error: todaysTaskHighlightsError,
  } = useQuery({
    queryKey: [RQ.todaysTaskHighlights],
    queryFn: tkFetch.get(
      `${API_BASE_URL}/highlights/todays-tasks?userId=${router.query?.uid}`
    ),
    enabled:
      !!router.query?.uid &&
      hasPageModeAccess(mode, accessLevel) &&
      activeTab === tabs.todaysTasks,
  });

  const {
    data: expensesHighlightData,
    isLoading: isExpensesHighlightLoading,
    isError: isExpensesHighlightError,
    error: expensesHighlightError,
  } = useQuery({
    queryKey: [RQ.expensesHighlights],
    queryFn: tkFetch.get(
      `${API_BASE_URL}/highlights/expenses?userId=${router.query?.uid}`
    ),
    enabled:
      !!router.query?.uid &&
      hasPageModeAccess(mode, accessLevel) &&
      activeTab === tabs.expenses,
  });

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      viewMode
        ? router.push(
            `${urls.userView}/${router.query?.uid}?tab=${tab}`,
            undefined,
            { scroll: false }
          )
        : router.push(
            `${urls.userEdit}/${router.query?.uid}?tab=${tab}`,
            undefined,
            { scroll: false }
          );
    }
  };

  //IMP: if readign fr reference, then try not to use useLayoutEffect, try always using useEffect instead
  // used layout effect because we need to get the tab from url, and settab before rendering the component
  // useLayoutEffect(() => {
  //   // did not use router.query.tab because it was not updating the state, before component is rendered
  //   // const tab = router.query.tab;
  //   const params = new URLSearchParams(window.location.search);
  //   const tab = params.get("tab");
  //   if (tabValues.includes(tab)) {
  //     setActiveTab(tab);
  //   } else {
  //     setActiveTab(tabs.projects);
  //   }
  // }, []);

  const handelProfileImg = async (imageFile) => {
    if (imageFile.size >= 10606316) {
      TkToastError("Image size should be less than 10MB.");
      return;
    }
    const options = {
      maxSizeMB: 10,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(imageFile, options);
      setProfileImageFile(compressedFile);
      setProfileImage(URL.createObjectURL(compressedFile));
    } catch (error) {
      TkToastError("Error while getting image file.");
      setProfileImageFile(null);
      setProfileImage(null);
      console.log(error);
    }
  };

  const onclickRemoveProfileImage = () => {
    const apiData = {
      image: null,
      id: Number(router.query?.uid),
    };
    removeProfileImage.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Profile Image Removed Successfully");
        queryClient.invalidateQueries({
          queryKey: [RQ.user, router.query?.uid],
        });
        setProfileImage(null);
        setProfileImageFile(null);
        setValue("profile-img-file-input", null);
      },
      onError: (error) => {
        console.log("error", error);
      },
    });
  };

  useEffect(() => {
    if (isAdminRole) {
      // setValue("canBePM", true);
      setValue("canBeSupervisor", true);
    }
  }, [isAdminRole, setValue]);

  useEffect(() => {
    if (isSupervisorError) {
      console.log("error", supervisorError);
      TkToastError(supervisorError?.message);
    }
    if (isDeptError) {
      console.log("error", deptError);
      TkToastError(deptError?.message);
    }
    if (isRoleError) {
      console.log("error", roleError);
      TkToastError(roleError?.message);
    }
    if (isWcalError) {
      console.log("error", WcalError);
      TkToastError(WcalError?.message);
    }
  }, [
    supervisorError,
    isSupervisorError,
    isDeptError,
    deptError,
    isRoleError,
    roleError,
    isWcalError,
    WcalError,
  ]);

  // useEffect(() => {
  // if (Array.isArray(supervisorsData)) {
  //   const s = supervisorsData.map((supervisor) => ({
  //     value: supervisor.id,
  //     label: supervisor.firstName + " " + supervisor.lastName,
  //   }));
  //   setAllSuperVisors(s);
  // }

  // if (Array.isArray(deptData)) {
  //   const d = deptData.map((dept) => ({
  //     value: dept.id,
  //     label: dept.name,
  //     active: dept.active,
  //   }));
  //   setAllDept(d);
  // }

  // if (Array.isArray(roleData)) {
  //   const r = roleData.map((role) => ({
  //     value: role.id,
  //     label: role.name,
  //     isAdmin: role.isAdmin,
  //     active: role.active,
  //   }));
  //   setAllRoles(r);
  // }

  // if (Array.isArray(wCalData)) {
  //   const w = wCalData.map((wCal) => ({
  //     value: wCal.id,
  //     label: wCal.name,
  //   }));
  //   setAllWorkCals(w);
  // }
  // }, [supervisorsData, deptData, roleData, wCalData]);

  useEffect(() => {
    if (data) {
      setUser(data[0]);
      setIsUserActive(data[0]?.active);
      setValue("firstName", data[0]?.firstName);
      setValue("lastName", data[0]?.lastName);
      setValue("email", data[0]?.email);
      setValue("designation", data[0]?.designation);
      setValue("phoneNumber", data[0]?.phoneNumber);
      setValue(
        "gender",
        data[0]?.gender
          ? { value: data[0]?.gender, label: data[0]?.gender }
          : null
      );
      setValue("zipCode", data[0]?.zipCode);
      setValue(
        "country",
        data[0]?.country
          ? { value: data[0].country, label: data[0].country }
          : null
      );
      setValue("notes", data[0]?.notes);
      setValue("address", data[0]?.address);
      setValue(
        "type",
        data[0]?.type ? { value: data[0]?.type, label: data[0]?.type } : null
      );
      setValue("inactive", !data[0]?.active);
      // setValue("canBePM", data[0]?.canBePM);
      setValue("canBeSupervisor", data[0]?.canBeSupervisor);
      setValue("role", {
        value: data[0].role.id,
        label: data[0].role.name,
        isAdmin: data[0].role.isAdmin,
        active: data[0].role.active,
      });
    }
  }, [setValue]);

  // useEffect(() => {
  //   if (
  //     !dirtyFields.supervisor &&
  //     user.supervisorId &&
  //     Array.isArray(supervisorsData)
  //   ) {
  //     const supervisor = supervisorsData.find(
  //       (s) => s.id === user.supervisorId
  //     );
  //     // console.log(supervisor, "supervisor", supervisorsData, user.supervisorId);
  //     if (supervisor) {
  //       setValue("supervisor", {
  //         value: supervisor?.id,
  //         label: supervisor?.firstName + " " + supervisor?.lastName,
  //       });
  //     }
  //   }
  // }, [user, supervisorsData, setValue, dirtyFields.supervisor]);

  // useEffect(() => {
  //   if (
  //     !dirtyFields.department &&
  //     user.departmentId &&
  //     Array.isArray(deptData)
  //   ) {
  //     const dept = deptData.find((s) => s.id === user.departmentId);
  //     setValue("department", {
  //       value: dept?.id,
  //       label: dept?.name,
  //       active: dept?.active,
  //     });
  //   }
  // }, [user, deptData, setValue, dirtyFields.department]);

  // useEffect(() => {
  //   if (!dirtyFields.role && user.roleId && Array.isArray(roleData)) {
  //     const role = roleData.find((s) => s.id === user.roleId);
  //     if (role) {
  //       setValue("role", {
  //         value: role.id,
  //         label: role.name,
  //         isAdmin: role.isAdmin,
  //         active: role.active,
  //       });
  //       setIsAdminRole(role.isAdmin);
  //     }
  //   }
  // }, [user, roleData, setValue, dirtyFields.role]);

  // useEffect(() => {
  //   if (
  //     !dirtyFields.workCalendar &&
  //     user.workCalendarId &&
  //     Array.isArray(wCalData)
  //   ) {
  //     const workCal = wCalData.find((w) => w.id === user.workCalendarId);
  //     setValue("workCalendar", { value: workCal?.id, label: workCal?.name });
  //   }
  // }, [user, setValue, dirtyFields.workCalendar, wCalData]);

  const presignedUrls = useMutation({
    mutationFn: tkFetch.post(
      `${API_BASE_URL}/attachments/public-presigned-urls`
    ),
  });

  const handelUpdateUser = (data, imageKey) => {
    if (data.department?.active === false) {
      setError("department", {
        type: "manual",
        message: "Department is not active",
      });
      return;
    } else if (data.role?.active === false) {
      setError("role", { type: "manual", message: "Role is not active" });
      return;
    }
    const apiData = {
      id: router.query?.uid,
      firstName: data.firstName,
      lastName: data.lastName,
      designation: data.designation,
      phoneNumber: data.phoneNumber,
      zipCode: data.zipCode,
      country: data.country?.label ?? null,
      address: data.address,
      active: !data.inactive,
      notes: data.notes,
      // canBePM: data.canBePM,
      canBeSupervisor: data.canBeSupervisor,
      workCalendarId: data.workCalendar?.value,
      departmentId: data.department?.value ?? null,
      supervisorId: data.supervisor?.value,
      roleId: data.role?.value,
      type: data.type?.value ?? null,
      gender: data.gender?.value ?? null,
      image: imageKey ? `${PUBLIC_BUCKET_BASE_URL}/${imageKey}` : undefined,
    };

    updateUser.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("User Updated Successfully");
        queryClient.invalidateQueries({
          queryKey: [RQ.user, router.query?.uid],
        });
        router.push(`${urls.users}`);
      },
      onError: (error) => {
        console.log("error", error);
        //TODO: report error to error reporting service
      },
    });
  };

  const onSubmit = (data) => {
    // TkToastInfo("User Updated", { hideProgressBar: true });
    if (!editMode) return;
    // if (!isAdminRole) {
    //   const supervisor = getValues("supervisor");
    //   if (!supervisor?.value) {
    //     setError("supervisor", {
    //       type: "manual",
    //       message: "Select supervisor",
    //     });
    //     return;
    //   }
    // }
    if (profileImage && profileImageFile) {
      setUploadingImage(true);
      const files = [
        {
          name: profileImageFile.name,
          type: profileImageFile.type,
        },
      ];
      presignedUrls.mutate(
        { files },
        {
          onSuccess: async (urls) => {
            if (Array.isArray(urls)) {
              const config = {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              };
              const urlInfo = urls[0];
              let imageuploaded = false;
              await axios
                .put(urlInfo.url, profileImageFile, config)
                .then(() => {
                  imageuploaded = true;
                })
                .catch((err) => {
                  console.log(err);
                  TkToastError(
                    "Error while uploading profile image. Saving the user without it."
                  );
                });
              setUploadingImage(false);
              handelUpdateUser(data, imageuploaded ? urlInfo.key : undefined);
            }
          },
          onError: (error) => {
            console.log("error while uploading files", error);
            setUploadingImage(false);
          },
        }
      );
    } else {
      handelUpdateUser(data);
    }
  };

  const handelDeleteUser = () => {
    if (!editMode) return;
    const apiData = {
      id: user.id,
    };

    deleteUser.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("User Deleted Successfully");
        queryClient.invalidateQueries({
          queryKey: [RQ.user, router.query?.uid],
        });
        router.push(`${urls.users}`);
      },
      onError: (error) => {
        console.log("error", error);
      },
    });
  };

  // if (!hasPageModeAccess(mode, accessLevel)) {
  //   return <TkAccessDenied />;
  // }

  const onChangeImg = (e) => {
    const file = e.target.files[0];
    if (file) {
      handelProfileImg(file);
    }
  };

  const toggleDeleteModel = () => {
    setDeleteModal(true);
  };

  return (
    <>
      <DeleteModal
        show={deleteModal}
        onDeleteClick={() => {
          setDeleteModal(false);
          handelDeleteUser();
        }}
        onCloseClick={() => setDeleteModal(false)}
      />
      <>
        <TkPageHead>
          <title>{`User: John Doe`}</title>
        </TkPageHead>
        <TkRow>
          <TkCol>
            {/* <TkCard> */}
            <TkEditCardHeader
              title={viewMode ? "User Details" : "Edit User"}
              // active={isUserActive}
              // onActiveClick={activeUserChange}
              // disableActive={viewMode}
              onDeleteClick={handelDeleteUser}
              isEditAccess={viewMode && accessLevel >= perAccessIds.edit}
              disableDelete={viewMode}
              editLink={`${urls.userEdit}/${router.query.uid}`}
              toggleDeleteModel={toggleDeleteModel}
            />
            {deleteUser.isError ? (
              <FormErrorBox errMessage={deleteUser.error?.message} />
            ) : null}
            <TkCardBody className="mt-4">
              <TkForm onSubmit={handleSubmit(onSubmit)}>
                <TkRow className="g-3 gx-4 gy-4">
                  <div id="teamlist">
                    <TkRow className="team-list list-view-filter">
                      <TkCol lg={5} className="list-view-filter">
                        <TkCard className="team-box border">
                          <TkCardBody className="">
                            <TkRow className="align-items-center justify-space-between team-row">
                              <TkCol>
                                <div className="team-profile-img d-flex justify-content-center">
                                  <TkCol>
                                    <div className="profile-user avatar-lg img-thumbnail rounded-circle border border-primary d-inline-block">
                                      {profileImage || data[0].image ? (
                                        <Image
                                          src={
                                            profileImage ||
                                            String(data[0].image)
                                          }
                                          height={100}
                                          width={100}
                                          alt="use image"
                                          className="img-fluid d-block rounded-circle"
                                        />
                                      ) : (
                                        <div className="avatar-title text-uppercase border rounded-circle bg-light text-primary">
                                          {String(data[0].firstName).charAt(0) +
                                            String(data[0].lastName).charAt(0)}
                                        </div>
                                      )}
                                      {editMode && (
                                        <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                                          <TkInput
                                            {...register(
                                              "profile-img-file-input"
                                            )}
                                            id="profile-img-file-input"
                                            type="file"
                                            className="profile-img-file-input"
                                            accept="image/*"
                                            onChange={(e) => {
                                              onChangeImg(e);
                                            }}
                                          />
                                          <TkLabel
                                            htmlFor="profile-img-file-input"
                                            className="profile-photo-edit upload-img-btn avatar-xs"
                                          >
                                            <span className="avatar-title rounded-circle border border-primary bg-light text-body">
                                              <i className="ri-camera-fill"></i>
                                            </span>
                                          </TkLabel>
                                        </div>
                                      )}
                                    </div>
                                  </TkCol>
                                  <TkCol>
                                    <div className="team-content">
                                      <h5 className="fs-16 mb-1">
                                        {data[0].firstName?.length > 17 ? (
                                          <>
                                            {data[0].firstName?.substring(
                                              0,
                                              10
                                            ) + "..."}
                                          </>
                                        ) : (
                                          <>{data[0].firstName} </>
                                        )}
                                        {data[0].lastName?.length > 17 ? (
                                          <>
                                            {data[0].lastName?.substring(
                                              0,
                                              10
                                            ) + "..."}
                                          </>
                                        ) : (
                                          <>{data[0].lastName}</>
                                        )}
                                      </h5>

                                      {data[0].designation?.length > 17 ? (
                                        <p className="text-muted mb-0">
                                          {data[0].designation?.substring(
                                            0,
                                            17
                                          ) + "..."}
                                        </p>
                                      ) : (
                                        <p className="text-muted mb-0">
                                          {data[0].designation}
                                        </p>
                                      )}
                                    </div>
                                  </TkCol>
                                </div>
                              </TkCol>
                              {editMode && (
                                <>
                                  <TkCol lg={3}>
                                    <TkButton
                                      type="button"
                                      onClick={onclickRemoveProfileImage}
                                      disabled={!profileImage && !data[0].image}
                                    >
                                      Remove
                                    </TkButton>
                                  </TkCol>
                                </>
                              )}
                            </TkRow>
                          </TkCardBody>
                        </TkCard>
                      </TkCol>
                    </TkRow>
                  </div>

                  <TkCol lg={4}>
                    <TkInput
                      {...register("firstName")}
                      labelName="First Name"
                      // tooltip="First Name"
                      // labelId={"_firstName"}
                      type="text"
                      id="firstName"
                      placeholder="Enter First Name"
                      disabled={viewMode}
                      requiredStarOnLabel={editMode}
                    />
                    {errors.firstName && (
                      <FormErrorText>{errors.firstName.message}</FormErrorText>
                    )}
                  </TkCol>

                  <TkCol lg={4}>
                    <TkInput
                      {...register("lastName")}
                      labelName="Last Name"
                      // tooltip="Last Name"
                      // labelId={"_lastName"}
                      type="text"
                      id="lastName"
                      placeholder="Enter Last Name"
                      disabled={viewMode}
                      requiredStarOnLabel={editMode}
                    />
                    {errors.lastName && (
                      <FormErrorText>{errors.lastName.message}</FormErrorText>
                    )}
                  </TkCol>

                  <TkCol lg={4}>
                    <TkInput
                      {...register("email")}
                      labelName="Email"
                      // tooltip="Email"
                      // labelId={"_email"}
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter Email"
                      disabled
                      requiredStarOnLabel={editMode}
                    />
                    {errors.email && (
                      <FormErrorText>{errors.email.message}</FormErrorText>
                    )}
                  </TkCol>

                  <TkCol lg={4}>
                    <TkInput
                      {...register("designation")}
                      labelName="Designation"
                      // tooltip="Designation"
                      // labelId={"_designation"}
                      type="text"
                      id="designation"
                      placeholder="Enter Designation"
                      disabled={viewMode}
                    />
                    {errors.designation && (
                      <FormErrorText>
                        {errors.designation.message}
                      </FormErrorText>
                    )}
                  </TkCol>

                  <TkCol lg={4}>
                    <TkInput
                      {...register("phoneNumber")}
                      labelName="Phone Number"
                      // tooltip="Phone Number"
                      // labelId={"_phoneNumber"}
                      type="text"
                      id="phoneNumber"
                      placeholder="Enter Phone Number"
                      disabled={viewMode}
                    />
                    {errors.phoneNumber && (
                      <FormErrorText>
                        {errors.phoneNumber.message}
                      </FormErrorText>
                    )}
                  </TkCol>

                  <TkCol lg={4}>
                    <Controller
                      name="supervisor"
                      control={control}
                      render={({ field }) => (
                        <TkSelect
                          {...field}
                          labelName="Supervisor"
                          // tooltip="Supervisor"
                          // labelId={"_supervisor"}
                          id="supervisor"
                          options={[]}
                          // loading={isSupervisorLoading}
                          placeholder="Select Supervisor"
                          // if role is Admin then we supervisor is not mandatory
                          // requiredStarOnLabel={!isAdminRole}
                          disabled={viewMode}
                        />
                      )}
                    />
                    {errors.supervisor && (
                      <FormErrorText>{errors.supervisor.message}</FormErrorText>
                    )}
                  </TkCol>

                  <TkCol lg={4}>
                    <Controller
                      name="department"
                      control={control}
                      render={({ field }) => (
                        <TkSelect
                          {...field}
                          labelName="Department"
                          // tooltip="Department"
                          // labelId={"_department"}
                          id="department"
                          options={[]}
                          // loading={isDeptLoading}
                          placeholder="Select Department"
                          disabled={viewMode}
                        />
                      )}
                    />
                    {errors.department && (
                      <FormErrorText>{errors.department.message}</FormErrorText>
                    )}
                  </TkCol>

                  <TkCol lg={4}>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <TkSelect
                          {...field}
                          labelName="Type"
                          // tooltip="Type"
                          // labelId={"_type"}
                          id="type"
                          options={employeeTypes}
                          placeholder="Select Type"
                          disabled={viewMode}
                        />
                      )}
                    />
                    {errors.type && (
                      <FormErrorText>{errors.type.message}</FormErrorText>
                    )}
                  </TkCol>

                  <TkCol lg={4}>
                    <Controller
                      name="role"
                      control={control}
                      render={({ field }) => (
                        <TkSelect
                          {...field}
                          labelName="Role"
                          // tooltip="Role"
                          // labelId={"_role"}
                          id="role"
                          options={[]}
                          onChange={(value) => {
                            field.onChange(value);
                            // if clearled by clicking X then null will be passed
                            setIsAdminRole(value ? value.isAdmin : false);
                          }}
                          // loading={isRoleLoading}
                          placeholder="Select Role"
                          requiredStarOnLabel={editMode}
                          disabled={viewMode}
                        />
                      )}
                    />
                    {errors.role && (
                      <FormErrorText>{errors.role.message}</FormErrorText>
                    )}
                  </TkCol>

                  <TkCol lg={4}>
                    <TkInput
                      {...register("zipCode")}
                      labelName="Zip Code"
                      // tooltip="Zip Code"
                      // labelId={"_zipCode"}
                      id="zipCode"
                      type="text"
                      placeholder="Enter Zip Code"
                      disabled={viewMode}
                    />
                    {errors.zipCode && (
                      <FormErrorText>{errors.zipCode.message}</FormErrorText>
                    )}
                  </TkCol>

                  <TkCol lg={4}>
                    <Controller
                      name="country"
                      control={control}
                      render={({ field }) => (
                        <TkSelect
                          {...field}
                          labelName="Country"
                          // tooltip="Country"
                          // labelId={"_country"}
                          id="country"
                          options={countries}
                          placeholder="Select Country"
                          disabled={viewMode}
                        />
                      )}
                    />
                    {errors.country && (
                      <FormErrorText>{errors.country.message}</FormErrorText>
                    )}
                  </TkCol>

                  <TkCol lg={4}>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <TkSelect
                          {...field}
                          labelName="Gender"
                          // tooltip="select Gender"
                          // labelId={"_gender"}
                          id="gender"
                          options={genderTypes}
                          placeholder="Select Gender"
                          disabled={viewMode}
                        />
                      )}
                    />
                    {errors.gender && (
                      <FormErrorText>{errors.gender.message}</FormErrorText>
                    )}
                  </TkCol>

                  <TkCol lg={4}>
                    <Controller
                      name="workCalendar"
                      control={control}
                      render={({ field }) => (
                        <TkSelect
                          {...field}
                          labelName="Work Calendar"
                          // tooltip="Work Calendar"
                          // labelId={"_workCalendar"}
                          id="workCalendar"
                          requiredStarOnLabel={editMode}
                          // isLoading={isWcalLoading}
                          options={[]}
                          placeholder="Select Work Calendar"
                          disabled={viewMode}
                        />
                      )}
                    />
                    {errors.workCalendar && (
                      <FormErrorText>
                        {errors.workCalendar.message}
                      </FormErrorText>
                    )}
                  </TkCol>

                  {/* <TkCol lg={8}> */}
                  <TkRow>
                    <TkCol>
                      <div className="mt-4">
                        <TkCheckBox
                          {...register("inactive")}
                          id="inactive"
                          disabled={viewMode}
                        />
                        <TkLabel className="ms-3 me-lg-5">Inactive</TkLabel>
                      </div>
                      <div className="mt-4">
                        <TkCheckBox
                          {...register("canBeSupervisor")}
                          id="canBeSupervisor"
                          type="checkbox"
                          disabled={isAdminRole || viewMode} // admins will be always pm and supervisor
                        />
                        <TkLabel className="ms-3" id="supervisor">
                          Can be Supervisor
                        </TkLabel>
                      </div>
                    </TkCol>
                    {/* <TkCol>
                        <div className="mt-4">
                          <TkCheckBox
                            {...register("canBePM")}
                            id="canBePM"
                            type="checkbox"
                            disabled={isAdminRole || viewMode} // admins will be always pm and supervisor
                          />
                          <TkLabel className="ms-3" id="projectManager">
                            Can be Project Manager
                          </TkLabel>
                        </div>
                      </TkCol> */}
                    {/* <TkCol>
                        <div className="mt-4">
                          <TkCheckBox
                            {...register("canBeSupervisor")}
                            id="canBeSupervisor"
                            type="checkbox"
                            disabled={isAdminRole || viewMode} // admins will be always pm and supervisor
                          />
                          <TkLabel className="ms-3" id="supervisor">
                            Can be Supervisor
                          </TkLabel>
                        </div>
                      </TkCol> */}
                  </TkRow>
                  {/* </TkCol> */}

                  {/* <TkCol lg={12}>
                      <TkRow className="mt-4 justify-content-start">
                        <TkCol xs={"auto"}>
                          <TkLabel className="me-3" id="projectManager">
                            Can be Project Manager
                          </TkLabel>
                          <TkCheckBox
                            {...register("canBePM")}
                            id="canBePM"
                            type="checkbox"
                            disabled={isAdminRole || viewMode} // admins will be always pm and supervisor
                          />
                        </TkCol>
                        <TkCol xs={"auto"}>
                          <TkLabel className="me-3 ms-lg-5" id="supervisor">
                            Can be Supervisor
                          </TkLabel>
                          <TkCheckBox
                            {...register("canBeSupervisor")}
                            id="canBeSupervisor"
                            type="checkbox"
                            disabled={isAdminRole || viewMode} // admins will be always pm and supervisor
                          />
                        </TkCol>
                      </TkRow>
                    </TkCol> */}

                  <TkCol lg={12}>
                    <TkInput
                      {...register("address")}
                      labelName="Address"
                      // tooltip="Address"
                      // labelId={"_address"}
                      name="address"
                      id="address"
                      type="textarea"
                      placeholder="Enter Address"
                      disabled={viewMode}
                    />
                    {errors.address && (
                      <FormErrorText>{errors.address.message}</FormErrorText>
                    )}
                  </TkCol>
                  <TkCol lg={12}>
                    <TkInput
                      {...register("notes")}
                      labelName="Notes"
                      // tooltip="Notes"
                      // labelId={"_notes"}
                      id="notes"
                      type="textarea"
                      placeholder="Enter Notes"
                      disabled={viewMode}
                    />
                    {errors.notes && (
                      <FormErrorText>{errors.notes.message}</FormErrorText>
                    )}
                  </TkCol>
                </TkRow>
                {updateUser.isError ? (
                  <FormErrorBox errMessage={updateUser.error?.message} />
                ) : null}
                <div className="d-flex mt-4 space-childern">
                  {editMode ? (
                    <div className="ms-auto">
                      <TkButton
                        onClick={() => router.push(`${urls.users}`)}
                        disabled={updateUser.isLoading || uploadingImage}
                        type="button"
                        color="secondary"
                      >
                        Cancel
                      </TkButton>{" "}
                      <TkButton
                        loading={updateUser.isLoading || uploadingImage}
                        type="submit"
                        color="primary"
                      >
                        Update
                      </TkButton>
                    </div>
                  ) : null}
                </div>
              </TkForm>
            </TkCardBody>
            {/* </TkCard> */}
          </TkCol>
        </TkRow>
      </>
    </>
  );
};

export default UserDetails;
