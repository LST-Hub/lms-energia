import React, { useState, useEffect, useCallback } from "react";

import TkCard, { TkCardBody, TkCardHeader } from "../TkCard";
import TkRow, { TkCol } from "../TkRow";
import TkInput from "../forms/TkInput";
import TkSelect from "../forms/TkSelect";
import TkForm from "../forms/TkForm";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";

import { API_BASE_URL, MinNameLength, MaxNameLength, allTimezones } from "../../utils/Constants";

import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";

import { RQ } from "../../utils/Constants";
import TkLoader from "../TkLoader";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import TkButton from "../TkButton";
import TkToggle from "../forms/TkToggle";
import TkCheckBox from "../forms/TkCheckBox";

const schema = Yup.object({
  workspaceName: Yup.string()
    .min(MinNameLength, `Workspace name must be at least ${MinNameLength} character.`)
    .max(MaxNameLength, `Workspace name must be at most ${MaxNameLength} characters.`)
    .required("Workspace name is required"),
  approvalCycleForTT: Yup.boolean(),
  approvalCycleForTS: Yup.boolean(),
  emailToPMForTS: Yup.boolean(),
  emailToPMForTT: Yup.boolean(),
  includePendingTimeForTS: Yup.boolean(),
  todaysTaskEnabled: Yup.boolean(),
  // timezone: Yup.object().nullable(),
  workCal: Yup.object().nullable(),
}).required();

function WorkspaceSetting({ mounted }) {
  const [workCalList, setWorkCalList] = useState([]);
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.workspaceSettings],
    queryFn: tkFetch.get(`${API_BASE_URL}/workspace/settings`),
    enabled: mounted,
  });

  const {
    data: allWorkCals,
    isLoading: isWorkCalLoading,
    isError: isWorkCalError,
    error: workCalError,
  } = useQuery({
    queryKey: [RQ.allWorkCals],
    queryFn: tkFetch.get(`${API_BASE_URL}/work-calendar/list`),
  });

  useEffect(() => {
    if (isWorkCalError) {
      TkToastError(workCalError.message);
      return;
    }
    if (Array.isArray(allWorkCals) && allWorkCals.length > 0) {
      setWorkCalList(
        allWorkCals.filter((cal) => cal.active === true).map((cal) => ({ label: cal.name, value: cal.id }))
      );
    }
  }, [allWorkCals, isWorkCalError, workCalError]);
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      setValue("workspaceName", data[0].workspaceName);
      setValue("approvalCycleForTT", data[0].approvalEnabledForTT);
      setValue("approvalCycleForTS", data[0].approvalEnabledForTS);
      setValue("emailToPMForTS", data[0].mailToPmForTSApproval);
      setValue("emailToPMForTT", data[0].mailToPmForTTApproval);
      setValue("includePendingTimeForTS", data[0].addPendingInActualTimeForTS);
      setValue("todaysTaskEnabled", data[0].todaysTaskEnabled);
      // setValue("timezone", data.timezone);
      setValue(
        "workCal",
        data[0].defaultWorkCal ? { value: data[0].defaultWorkCal.id, label: data[0].defaultWorkCal.name } : null
      );
    }
  }, [data, setValue]);

  const updateWorkspace = useMutation({
    mutationFn: tkFetch.put(`${API_BASE_URL}/workspace/settings`),
  });

  const onSubmit = (formData) => {
    const apiData = {
      workspaceName: formData.workspaceName,
      approvalEnabledForTT: formData.approvalCycleForTT,
      approvalEnabledForTS: formData.approvalCycleForTS,
      mailToPmForTSApproval: formData.emailToPMForTS,
      mailToPmForTTApproval: formData.emailToPMForTT,
      addPendingInActualTimeForTS: formData.includePendingTimeForTS,
      defaultWorkCalId: formData.workCal?.value ? formData.workCal.value : null,
      todaysTaskEnabled: formData.todaysTaskEnabled,
    };

    updateWorkspace.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Workspace settings updated successfully");
      },
      onError: (error) => {
        console.log("error", error);
        TkToastError(error?.message);
      },
    });
  };

  return (
    <>
      {isLoading ? (
        <TkLoader />
      ) : isError ? (
        <FormErrorBox errMessage={error?.message} />
      ) : (
        <TkCard style={{ minHeight: "300px" }}>
          <TkCardBody>
            <TkForm onSubmit={handleSubmit(onSubmit)}>
              <TkRow>
                <TkCol lg={10}>
                  <TkRow className="align-items-center mt-3">
                    <TkCol lg={7}>
                      <h6 className="mb-0">
                        Workspace Name <span className="text-danger">*</span>{" "}
                      </h6>
                    </TkCol>
                    <TkCol lg={4}>
                      <TkInput {...register("workspaceName")} type="text" placeholder="Workspace Name" />
                      {errors.workspaceName && <FormErrorText>{errors.workspaceName.message}</FormErrorText>}
                    </TkCol>
                  </TkRow>
                  <TkRow className="align-items-center mt-3">
                    <TkCol lg={7}>
                      <h6 className="mb-0">Enable Today&apos;s Tasks feature </h6>
                    </TkCol>
                    <TkCol lg={4}>
                      <TkToggle {...register("todaysTaskEnabled")} id="todaysTaskEnabled" />
                    </TkCol>
                  </TkRow>
                  <TkRow className="align-items-center mt-3">
                    <TkCol lg={7}>
                      <h6 className="mb-0">Enable Approval Cycle for Today&apos;s Tasks </h6>
                    </TkCol>
                    <TkCol lg={4}>
                      <TkToggle {...register("approvalCycleForTT")} id="approvalCycleForTT" />
                    </TkCol>
                  </TkRow>
                  <TkRow className="align-items-center mt-3">
                    <TkCol lg={7}>
                      <h6 className="mb-0">Enable Approval Cycle for Timesheet </h6>
                    </TkCol>
                    <TkCol lg={4}>
                      <TkToggle {...register("approvalCycleForTS")} id="approvalCycleForTS" />
                    </TkCol>
                  </TkRow>
                  <TkRow className="align-items-center mt-3">
                    <TkCol lg={7}>
                      <h6 className="mb-0">Send Email to Project Manager for Timesheet Approval </h6>
                    </TkCol>
                    <TkCol lg={4}>
                      <TkToggle {...register("emailToPMForTS")} id="emailToPMForTS" />
                    </TkCol>
                  </TkRow>
                  <TkRow className="align-items-center mt-3">
                    <TkCol lg={7}>
                      <h6 className="mb-0">Send Email to Project Manager for Today&apos;s Tasks Approval </h6>
                    </TkCol>
                    <TkCol lg={4}>
                      <TkToggle {...register("emailToPMForTT")} id="emailToPMForTT" />
                    </TkCol>
                  </TkRow>
                  <TkRow className="mt-3">
                    <TkCol lg={7}>
                      <h6 className="mb-1">Include pending timesheet&apos;s time in actual time </h6>
                      <small className="text-muted">
                        (Draft & Rejected time are not included in actual time, approved always included )
                      </small>
                    </TkCol>
                    <TkCol lg={4}>
                      <div className="d-flex align-items-center">
                        <p className="mb-0">Pending </p> &nbsp; &nbsp;
                        <TkCheckBox {...register("includePendingTimeForTS")} />
                        {/* curretly approved time is always included in actual time calculation (may change later) */}
                        <p className="ms-4 mb-0">Approved </p> &nbsp; &nbsp;{" "}
                        <TkCheckBox checked={true} disabled={true} />
                      </div>
                    </TkCol>
                  </TkRow>
                  {/* <TkRow className="align-items-center mt-3">
                  <TkCol lg={7}>
                    <h6 className="mb-0">Default Timezone </h6>
                  </TkCol>
                  <TkCol lg={4}>
                    <Controller
                      name="currency"
                      control={control}
                      render={({ field }) => (
                        <TkSelect
                          {...field}
                          options={allTimezones}
                        />
                      )}
                    />
                  </TkCol>
                </TkRow> */}
                  <TkRow className="align-items-center mt-3">
                    <TkCol lg={7}>
                      <h6 className="mb-0">Default Work Calendar </h6>
                    </TkCol>
                    <TkCol lg={4}>
                      <Controller
                        name="workCal"
                        control={control}
                        render={({ field }) => (
                          <TkSelect
                            {...field}
                            placeholder="Select Work Calendar"
                            loading={isWorkCalLoading}
                            options={workCalList}
                          />
                        )}
                      />
                    </TkCol>
                  </TkRow>
                  <TkRow>
                    <TkCol lg={11}>
                      <div className="d-flex mt-4 space-childern">
                        <div className="ms-auto me-0">
                          <TkButton loading={updateWorkspace.isLoading} type="submit" color="primary">
                            Update
                          </TkButton>
                        </div>
                      </div>
                    </TkCol>
                  </TkRow>
                </TkCol>
              </TkRow>
            </TkForm>
          </TkCardBody>
        </TkCard>
      )}
    </>
  );
}

export default WorkspaceSetting;
