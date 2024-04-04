// UNCOMMENT THE BELOW CODE AND ADD IT IN pages/ws/roles/add.js (CREATE add.js FILE IN THE PATH) IF ROLES GET DYNAMIC IN FUTURE

// import React from "react";
// import Head from "next/head";
// import { Container } from "reactstrap";
// import Layout from "../../../src/components/layout";
// import Role from "../../../src/components/roles/Role";
// import BreadCrumb from "../../../src/utils/BreadCrumb";

// import TkPageHead from "../../../src/components/TkPageHead";
// import TkContainer from "../../../src/components/TkContainer";
// import { urls } from "../../../src/utils/Constants";

// const AddRole = () => {
//   return (
//     <>
//       <TkPageHead>
//         {/* TODO: get the name of role and set it to title */}
//         <title>{"Add Role"}</title>
//       </TkPageHead>
//       <div className="page-content">
//         <BreadCrumb pageTitle={"Add Role"} parentTitle={"Roles"} parentLink={`${urls.roles}`} />
//         <TkContainer>
//           <Role />
//         </TkContainer>
//       </div>
//     </>
//   );
// };

// export default AddRole;

// AddRole.options = {
//   layout: true,
//   auth: true,
// };

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { permissionTypeIds, perAccessIds, appPermissions, roleRestrictionIds } from "../../../DBConstants";
import TkInput from "../forms/TkInput";
import TkButton from "../TkButton";
import TkCheckbox from "../forms/TkCheckBox";
import TkCard, { TkCardBody, TkCardHeader } from "../TkCard";
import TkRow, { TkCol } from "../TkRow";
import TkForm from "../forms/TkForm";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../../../src/components/forms/ErrorText";
import { MinNameLength, MaxNameLength, bigInpuMaxLength, API_BASE_URL, urls } from "../../../src/utils/Constants";
import { useMutation } from "@tanstack/react-query";
import tkFetch from "../../../src/utils/fetch";
import { roleRestrictionLabels, permissionAccessLabels } from "../../utils/Constants";
import TkSelect from "../forms/TkSelect";
import hasPageModeAccess from "../../utils/hasPageAccess";
import TkAccessDenied from "../TkAccessDenied";
import useUserAccessLevel from "../../utils/hooks/useUserAccessLevel";

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

const Role = () => {
  const router = useRouter();

  const accessLevel = useUserAccessLevel(permissionTypeIds.roles);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [selectedCheckbox, setSelectedCheckbox] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [reportSelected, setReportSelected] = useState(false);
  // const [showWarningModal, setShowWarningModal] = useState(false);
  // const [selectedData, setSelectedData] = useState({});

  useEffect(() => {
    setValue("roleRestriction", restrictionOptions[0]);
  }, [setValue]);

  const handleOnChange = (e, id) => {
    if (e.target.checked) {
      setSelectedCheckbox((prev) => ({ ...prev, [id]: true }));
      setSelectedPermissions((prev) => ({ ...prev, [id]: permissionAccessoptions[0] })); // view access
    } else {
      setSelectedCheckbox((prev) => ({ ...prev, [id]: false }));
      setSelectedPermissions((prev) => ({ ...prev, [id]: null }));
    }
  };

  const updateRole = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/roles`),
  });

  const onSubmit = (formData) => {
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
      // setSelectedData({
      //   roleName: formData.roleName.trim(),
      //   roleDescription: formData.roleDescription.trim(),
      //   restrictionId: formData.roleRestriction.value,
      //   permissions: apiPermissionsData,
      // });
      // setShowWarningModal(true);
    }
    // else {
    const apiData = {
      roleName: formData.roleName.trim(),
      roleDescription: formData.roleDescription.trim(),
      restrictionId: formData.roleRestriction.value,
      permissions: apiPermissionsData,
    };
    updateRole.mutate(apiData, {
      onSuccess: (data) => {
        router.push(`${urls.roles}`);
        TkToastSuccess("Role Created Successfully");
      },
      onError: (error) => {
        // TkToastError("Role Creation Failed", { autoClose: 5000 }); // we have shown error below the form
        console.log("error", error);
      },
    });
    //}
  };

  // const saveRole = () => {
  //   setShowWarningModal(false);
  //   updateRole.mutate(selectedData, {
  //     onSuccess: (data) => {
  //       TkToastSuccess("Role Created Successfully");
  //       router.push("/roles");
  //     },
  //     onError: (error) => {
  //       // TkToastError("Role Creation Failed", { autoClose: 5000 }); // we have shown error below the form
  //       console.log("error", error);
  //     },
  //   });
  // };

  // if (!(Number(accessLevel) >= perAccessIds.create)) {
  //   return <TkAccessDenied />;
  // }

  return (
    <>
      {/* <WarningModal
        show={showWarningModal}
        okBtnText={"Proceed"}
        cancelBtnText={"Cancel"}
        onCancelClick={() => {
          setShowWarningModal(false);
        }}
        onOkClick={saveRole}
        warnHeading={"Reports"}
        warnText={"By having Reports access, users with this role will be able to View all data present in reports."}
      /> */}

      <div className="row justify-content-center">
        <TkCol lg={10}>
          <TkCard id="tasksList">
            <TkForm onSubmit={handleSubmit(onSubmit)}>
              <TkCardHeader>
                <h4>Create Roles</h4>
              </TkCardHeader>
              <TkCardBody className="first-child-max-width-100 pt-0 mt-3">
                <>
                  <TkInput
                    {...register("roleName")}
                    id="roleName"
                    type="text"
                    labelName="Role Name"
                    // placeholder="Role Name"
                    requiredStarOnLabel={true}
                    autoFocus
                  />
                  {errors.roleName?.message ? <FormErrorText>{errors.roleName?.message}</FormErrorText> : null}
                  <div className="mt-3 mb-3">
                    <TkInput
                      {...register("roleDescription")}
                      id="roleDescription"
                      type="text"
                      labelName="Role Description"
                      // placeholder="Role Description"
                    />
                    
                  </div>
                  <TkCol md={4} lg={3} className="mb-3">
                    <Controller
                      name="roleRestriction"
                      control={control}
                      render={({ field }) => (
                        <TkSelect
                          {...field}
                          labelName="Restriction"
                          id="roleRestriction"
                          options={restrictionOptions}
                          requiredStarOnLabel={true}
                        />
                      )}
                    />
                   
                  </TkCol>

                  {/* <TkTableContainer
                    columns={workspacecolumns}
                    data={permissions}
                    isSearch={false}
                    defaultPageSize={20}
                    showPagination={false}
                  /> */}

                  {/* given negative 1rem of margin as card has paddign of 1 rem, so it was getting some space around and was not touching edges */}
                  <h6 className="py-3 ps-3 fw-bold light-gray-bg mx-negative-1rem">Permissions</h6>

                  {allPerExceptReport.map((permission) => (
                    <TkRow key={permission.id} className="mt-3 mb-3">
                      <TkCol md={4} lg={3}>
                        <h6>{permission.name}</h6>
                      </TkCol>

                      <TkCol md={4} lg={3}>
                        <TkCheckbox
                          className="taskCheckBox form-check-input"
                          onChange={(e) => {
                            handleOnChange(e, permission.id);
                          }}
                        />
                      </TkCol>

                      <TkCol md={4} lg={3}>
                        <TkSelect
                          options={permissionAccessoptions}
                          disabled={selectedCheckbox[permission.id] ? false : true}
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
                      />
                    </TkCol>
                  </TkRow>
                </>
                {updateRole.isError ? <FormErrorBox errMessage={updateRole.error?.message} /> : null}
                <div className="d-flex space-childern">
                  <TkButton
                    disabled={updateRole.isLoading}
                    color="secondary"
                    onClick={() => router.push(`${urls.roles}`)}
                    className="ms-auto"
                    type="button"
                  >
                    Cancel
                  </TkButton>
                  <TkButton loading={updateRole.isLoading} color="primary" type="submit">
                    Save
                  </TkButton>
                </div>
              </TkCardBody>
            </TkForm>
          </TkCard>
        </TkCol>
      </div>
    </>
  );
};

export default Role;
