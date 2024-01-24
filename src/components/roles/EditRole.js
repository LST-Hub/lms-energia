import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { permissionTypeIds, perAccessIds, appPermissions, roleRestrictionIds } from "../../../DBConstants";
import {
  RQ,
  API_BASE_URL,
  roleRestrictionLabels,
  permissionAccessLabels,
  modes,
  userHighlightColumn,
  urls,
} from "../../utils/Constants";
import TkInput from "../forms/TkInput";
import TkButton from "../TkButton";
import TkCheckbox from "../forms/TkCheckBox";
import TkCard, { TkCardBody, TkCardHeader } from "../TkCard";
import TkRow, { TkCol } from "../TkRow";
import TkForm from "../forms/TkForm";
import TkEditCardHeader from "../TkEditCardHeader";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../../../src/components/forms/ErrorText";
import { MinNameLength, MaxNameLength, bigInpuMaxLength } from "../../../src/utils/Constants";
import TkLoader from "../TkLoader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../../src/utils/fetch";
import TkNoData from "../TkNoData";
import TkSelect from "../forms/TkSelect";
import useUserAccessLevel from "../../utils/hooks/useUserAccessLevel";
import hasPageModeAccess from "../../utils/hasPageAccess";
import TkAccessDenied from "../TkAccessDenied";
import TkLabel from "../forms/TkLabel";
import TkCheckBox from "../forms/TkCheckBox";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import { useLayoutEffect } from "react";
import { useMemo } from "react";
import TkTableContainer from "../TkTableContainer";
import TkPageHead from "../TkPageHead";

const tabs = {
  users: "users",
};

const tabValues = Object.values(tabs);

const schema = Yup.object({
  roleName: Yup.string()
    .min(MinNameLength, `Role name should have at least ${MinNameLength} character.`)
    .max(MaxNameLength, `Role name should have at most ${MaxNameLength} characters.`)
    .required("Role name is required"),

  roleDescription: Yup.string().max(
    bigInpuMaxLength,
    `Role description should have at most ${bigInpuMaxLength} characters.`
  ),
  roleRestriction: Yup.object().nullable().required("Role restriction is required"),

  inactive: Yup.boolean().nullable(),
}).required();

const restrictionOptions = [
  { value: roleRestrictionIds.own, label: roleRestrictionLabels.own },
  { value: roleRestrictionIds.subordinates, label: roleRestrictionLabels.subordinates },
  { value: roleRestrictionIds.none, label: roleRestrictionLabels.none },
];

const permissionAccessoptions = [
  { value: perAccessIds.view, label: permissionAccessLabels.view },
  { value: perAccessIds.create, label: permissionAccessLabels.create },
  { value: perAccessIds.edit, label: permissionAccessLabels.edit },
  { value: perAccessIds.all, label: permissionAccessLabels.all },
];

const allPerExceptReport = appPermissions.filter((p) => p.id !== permissionTypeIds.reports);
const reportPermission = appPermissions.filter((p) => p.id === permissionTypeIds.reports);

const EditRole = ({ id, mode }) => {
  const router = useRouter();
  const accessLevel = useUserAccessLevel(permissionTypeIds.roles);
  const viewMode = mode === modes.view;
  const editMode = mode === modes.edit;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });
  //   TODO: rename the variables
  const [selectedCheckbox, setSelectedCheckbox] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [rolePermissions, setRolePermissions] = useState([]);
  const [isRoleActive, setIsRoleActive] = useState(true);
  const [reportSelected, setReportSelected] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs.projects);

  const rid = Number(id);
  const queryClient = useQueryClient();

  const { data, isLoading, isFetched, isError, error } = useQuery({
    queryKey: [RQ.role, rid],
    queryFn: tkFetch.get(`${API_BASE_URL}/roles/${rid}`),
    enabled: !!rid && hasPageModeAccess(mode, accessLevel),
  });

  const updateRole = useMutation({
    mutationFn: tkFetch.putWithIdInUrl(`${API_BASE_URL}/roles`),
  });

  const {
    data: usersHighlightsData,
    isLoading: usersHighlightsLoading,
    isFetched: usersHighlightsFetched,
    isError: usersHighlightsError,
    error: usersHighlightsErrorData,
  } = useQuery({
    queryKey: [RQ.usersHighlights],
    queryFn: tkFetch.get(`${API_BASE_URL}/highlights/users?roleId=${rid}`),
    enabled: !!rid && hasPageModeAccess(mode, accessLevel),
  });

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      viewMode
        ? router.push(`${urls.roleView}/${rid}?tab=${tab}`, undefined, { scroll: false })
        : router.push(`${urls.roleEdit}/${rid}?tab=${tab}`, undefined, { scroll: false });
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
      setActiveTab(tabs.users);
    }
  }, []);

  // const activeRole = useMutation({
  //   mutationFn: tkFetch.patchWithIdInUrl(`${API_BASE_URL}/roles`),
  // });

  useEffect(() => {
    if (isFetched && Array.isArray(data) && data?.length > 0) {
      setRolePermissions(data[0].permissions);
      setIsRoleActive(data[0].active);
      setValue("roleName", data[0].name);
      setValue("roleDescription", data[0].description);
      const restriction = restrictionOptions.find((item) => item.value === data[0]?.restrictionId);
      setValue("roleRestriction", restriction || null);
      setValue("inactive", !data[0].active);

      if (Array.isArray(data[0].permissions) && data[0].permissions?.length > 0) {
        const checkboxes = {};
        const permissions = {};
        data[0].permissions.forEach((permission) => {
          const p = permissionAccessoptions.find((p) => p.value === permission.accessLevel);
          checkboxes[permission.permissionId] = p ? true : false;
          permissions[permission.permissionId] = p || null;
        });
        if (checkboxes[permissionTypeIds.reports]) {
          // check if report permissions is selected, if yes then set the reportSelected to true  and delete the report permission from the selectedCheckbox
          setReportSelected(true);
          checkboxes[permissionTypeIds.reports] = false;
          permissions[permissionTypeIds.reports] = null;
        }
        setSelectedCheckbox(checkboxes);
        setSelectedPermissions(permissions);
      }
    }
  }, [isFetched, data, setValue, rolePermissions]);

  const handleOnChange = (e, id) => {
    if (e.target.checked) {
      setSelectedCheckbox((prev) => ({ ...prev, [id]: true }));
      setSelectedPermissions((prev) => ({ ...prev, [id]: permissionAccessoptions[0] })); // view access
    } else {
      setSelectedCheckbox((prev) => ({ ...prev, [id]: false }));
      setSelectedPermissions((prev) => ({ ...prev, [id]: null }));
    }
  };

  const onSubmit = (formData) => {
    if (!editMode) return;
    let apiPermissionsData = [];
    for (let id in selectedCheckbox) {
      if (selectedCheckbox[id]) {
        if (!selectedPermissions[id]) {
          // if permission is selected but access is not selected then return (this should not happen)
          TkToastError("Please select access for all selected permissions.");
          return;
        }
        apiPermissionsData.push({
          permissionId: Number(id), // becuase storing it as a key converts it into string
          accessId: selectedPermissions[id].value,
        });
      }
    }

    if (reportSelected) {
      apiPermissionsData.push({
        permissionId: Number(permissionTypeIds.reports),
        accessId: perAccessIds.all, // set reports permission to all, as in future we may add more access options for reports
      });
    }
    const apiData = {
      id: rid,
      roleName: formData.roleName.trim(),
      roleDescription: formData.roleDescription.trim(),
      restrictionId: formData.roleRestriction.value,
      active: !formData.inactive,
      permissions: apiPermissionsData,
    };
    updateRole.mutate(apiData, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [RQ.role, rid],
        });
        router.push(`${urls.roles}`);
        TkToastSuccess("Role Updated Successfully");
      },
      onError: (error) => {
        console.log("error", error);
      },
    });
  };

  // const activeRoleChange = () => {
  //   if (!editMode) return;
  //   const apiData = {
  //     id: rid,
  //     active: !isRoleActive,
  //   };
  //   activeRole.mutate(apiData, {
  //     onSuccess: (data) => {
  //       setIsRoleActive(!isRoleActive);
  //       {
  //         isRoleActive
  //           ? TkToastSuccess("Role Inactivated Successfully")
  //           : TkToastSuccess("Role Activated Successfully");
  //       }
  //       queryClient.invalidateQueries({
  //         queryKey: [RQ.role, rid],
  //       });
  //     },
  //     onError: (error) => {
  //       console.log("error", error);
  //     },
  //   });
  // };

  const deleteClient = useMutation({
    mutationFn: tkFetch.deleteWithIdInUrl(`${API_BASE_URL}/roles`),
  });

  const deleteRoleHandler = () => {
    if (!editMode) return;
    const apiData = {
      id: rid,
    };
    deleteClient.mutate(apiData, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [RQ.role, rid],
        });
        router.push(`${urls.roles}`);
        TkToastSuccess("Role Deleted Successfully");
      },
      onError: (error) => {
        console.log("error", error);
      },
    });
  };

  if (!hasPageModeAccess(mode, accessLevel)) {
    return <TkAccessDenied />;
  }

  return (
    <>
      <div className="row justify-content-center">
        <TkCol lg={12}>
          {isLoading ? (
            <TkLoader />
          ) : isError ? (
            <FormErrorBox errMessage={error?.message} />
          ) : data?.length > 0 ? (
            <>
              <TkPageHead>
                <title>{`Role: ${data[0].name}`}</title>
              </TkPageHead>
              <>
                <TkForm onSubmit={handleSubmit(onSubmit)}>
                  <TkCardHeader>
                    <h4>Role Details</h4>
                  </TkCardHeader>
                  {deleteClient.isError ? <FormErrorBox errMessage={deleteClient.error?.message} /> : null}
                  <TkCardBody className="first-child-max-width-100 pt-0 mt-3">
                    <>
                      <TkInput
                        {...register("roleName")}
                        id="roleName"
                        type="text"
                        labelName="Role Name"
                        // placeholder="Role Name"
                        disabled={true}
                        requiredStarOnLabel={false}
                        autoFocus
                      />
                      {errors.roleName?.message ? <FormErrorText>{errors.roleName?.message}</FormErrorText> : null}
                      <div className="mt-3 mb-3">
                        <TkInput
                          {...register("roleDescription")}
                          id="roleDescription"
                          type="textarea"
                          labelName="Role Description"
                          disabled={true}
                          style={{ height: "5rem" }}
                          // placeholder="Role Description"
                        />
                        {errors.roleDescription?.message ? (
                          <FormErrorText>{errors.roleDescription?.message}</FormErrorText>
                        ) : null}
                      </div>
                      {/* <TkCol md={4} lg={3} className="mb-3">
                        <Controller
                          name="roleRestriction"
                          control={control}
                          render={({ field }) => (
                            <TkSelect
                              {...field}
                              labelName="Restriction"
                              id="roleRestriction"
                              options={restrictionOptions}
                              disabled={true}
                              requiredStarOnLabel={true}
                            />
                          )}
                        />
                        {errors.roleRestriction?.message ? (
                          <FormErrorText>{errors.roleRestriction?.message}</FormErrorText>
                        ) : null}
                      </TkCol> */}

                      {/* remove inactive because we are currently giving static role */}

                      {/* <TkCol md={4} lg={3}>
                        <div className="mt-3 mb-3">
                          <TkLabel className="me-3 ">Inactive</TkLabel>
                          <TkCheckBox {...register("inactive")} id="inactive" disabled={true} />
                        </div>
                      </TkCol> */}

                      {/* given negative 1rem of margin as card has paddign of 1 rem, so it was getting some space around and was not touching edges */}
                      <h4 className="py-3 ps-3 border-bottom mx-negative-1rem">Permissions</h4>

                      <TkCard className="border">
                        <TkCardBody>
                          <TkRow className="justify-content-center">
                            <span>
                              Note - Timesheet, Today&apos;s task, Expense and Dashboard will be available to all the role
                              irrescpective of there permission
                            </span>
                          </TkRow>
                        </TkCardBody>
                      </TkCard>

                      {allPerExceptReport.map((permission) => (
                        <TkRow key={permission.id} className="mt-3 mb-3">
                          <TkCol md={4} lg={3}>
                            <h6>{permission.name}</h6>
                          </TkCol>

                          <TkCol md={4} lg={3}>
                            <TkCheckbox
                              className="taskCheckBox form-check-input"
                              checked={selectedCheckbox[permission.id] ? true : false}
                              onChange={(e) => {
                                handleOnChange(e, permission.id);
                              }}
                              disabled={true}
                            />
                          </TkCol>

                          <TkCol md={4} lg={3}>
                            <TkSelect
                              options={permissionAccessoptions}
                              disabled={true}
                              value={selectedPermissions[permission.id]}
                              onChange={(p) => {
                                setSelectedPermissions((prev) => ({ ...prev, [permission.id]: p }));
                              }}
                            />
                          </TkCol>
                        </TkRow>
                      ))}
                      <TkRow className="mt-3 mb-3">
                        <TkCol md={4} lg={3}>
                          <h6>{reportPermission[0].name}</h6>
                        </TkCol>

                        <TkCol md={4} lg={3}>
                          <TkCheckbox
                            className="taskCheckBox form-check-input"
                            checked={reportSelected}
                            onChange={(e) => {
                              // console.log("e.target.checked", e.target.checked);
                              setReportSelected(e.target.checked);
                            }}
                            disabled={true}
                          />
                        </TkCol>
                      </TkRow>
                    </>
                    {updateRole.isError ? <FormErrorBox>{updateRole.error?.message}</FormErrorBox> : null}

                    {/* we have deciede to remove dynamic role if in future we decide to give dynaice role uncomment the blow code 
                      to show button for updating the role */}

                    {/* <div className="d-flex space-childern">
                      {editMode && !data[0].isAdmin ? (
                        <div className="ms-auto">
                          <TkButton
                            disabled={updateRole.isLoading || data[0].isAdmin}
                            color="secondary"
                            onClick={() => router.push(`${urls.roles}`)}
                            className="ms-auto"
                            type="button"
                          >
                            Cancel
                          </TkButton>{" "}
                          <TkButton
                            disabled={data[0].isAdmin}
                            loading={updateRole.isLoading}
                            color="primary"
                            type="submit"
                          >
                            Update
                          </TkButton>
                        </div>
                      ) : null}
                      {viewMode && accessLevel >= perAccessIds.edit && !data[0].isAdmin ? (
                        <div className="ms-auto">
                          <TkButton
                            onClick={() => router.push(`${urls.roleEdit}/${rid}`)}
                            type="button"
                            color="primary"
                          >
                            Edit
                          </TkButton>
                        </div>
                      ) : null}
                    </div> */}
                  </TkCardBody>
                </TkForm>
              </>
              <Nav className="nav-tabs dropdown-tabs nav-tabs-custom mb-3">
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({ active: activeTab === tabs.users })}
                    onClick={() => {
                      toggleTab(tabs.users);
                    }}
                  >
                    Users
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent activeTab={activeTab}>
                <TabPane tabId={tabs.users}>
                  {/* <TkCard> */}
                  <TkCardBody>
                    {usersHighlightsData?.length > 0 ? (
                      <TkTableContainer
                        columns={userHighlightColumn}
                        data={usersHighlightsData || []}
                        loading={usersHighlightsLoading}
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
            </>
          ) : (
            <TkNoData />
          )}
        </TkCol>
      </div>
    </>
  );
};

export default EditRole;
