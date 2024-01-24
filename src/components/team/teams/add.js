import React, { useState } from "react";

import Layout from "../../src/components/layout";
import BreadCrumb from "../../src/utils/BreadCrumb";

import TkButton from "../../src/components/TkButton";
import TkInput from "../../src/components/forms/TkInput";
import TkSelect from "../../src/components/forms/TkSelect";
import TkCard, { TkCardBody, TkCardHeader, TkCardTitle } from "../../src/components/TkCard";
import TkContainer from "../../src/components/TkContainer";
import TkForm from "../../src/components/forms/TkForm";
import TkRow, { TkCol } from "../../src/components/TkRow";
import TkPageHead from "../../src/components/TkPageHead";

import { TkToastSuccess } from "../../src/components/TkToastContainer";

import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText from "../../src/components/forms/ErrorText";
import { smallInputMaxLength, smallInputMinLength } from "../../src/utils/Constants";

const schema = Yup.object({
  teamName: Yup.string()
    .min(smallInputMinLength, `Team name must be at least ${smallInputMinLength} characters.`)
    .max(smallInputMaxLength, `Team name must be at most ${smallInputMaxLength} characters.`)
    .required("Team name is required"),

  teamId: Yup.string()
    .max(smallInputMaxLength, `Team ID must be at most ${smallInputMaxLength} characters.`)
}).required();

const userOptions = [
  // TODO: take user ids as values here
  { value: "anna-adame", label: "Anna Adame" },
  { value: "frak-hook", label: "Frak Hook" },
  { value: "alexis-clarke", label: "Alexis Clarke" },
  { value: "herbert-stokes", label: "Herbert Stokes" },
  { value: "michael-morris", label: "Michael Morris" },
  { value: "nancy-martino", label: "Nancy Martino" },
  { value: "thomas-taylor", label: "Thomas Taylor" },
  { value: "tonya-noble", label: "Tonya Noble" },
];

const selectLead = [
  { value: "anna-adame", label: "Anna Adame" },
  { value: "frak-hook", label: "Frak Hook" },
  { value: "alexis-clarke", label: "Alexis Clarke" },
  { value: "herbert-stokes", label: "Herbert Stokes" },
];

const AddTeam = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onChange = () => {
    const submitBtn = document.getElementById("update-task-submit-btns");
    if (submitBtn) {
      submitBtn.style.display = "block";
    }
  };

  const [assignUsers, setAssignusers] = useState([userOptions[0], userOptions[1]]);

  const handleAssignUsers = (selectedMulti) => {
    // console.log(selectedMulti, 'selectedMulti');
    setAssignusers(selectedMulti);
  };

  const Msg = () => (
    <div>
      <h5>Team Created</h5>
    </div>
  );

  const onSubmit = (data) => {
    TkToastSuccess(<Msg />, { hideProgressBar: true }, { hideProgressBar: true });
    // e.preventDefault();
    // console.log('toggle called in form submit')
    // validation.handleSubmit();
    // return false;
  };

  return (
    <>
      <TkPageHead>
        <title>{"Add Member"}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Add Member"} parentTitle="Teams" parentLink="/teams" />
        <TkContainer>
          <div className="row justify-content-center">
            <TkCol lg={11}>
              <TkCard>
                <TkCardHeader className="border-0">
                  <div className="d-flex align-items-center">
                    <TkCardTitle tag="h4" className="mb-0 flex-grow-1">
                      Add Team
                    </TkCardTitle>
                  </div>
                </TkCardHeader>
                <TkCardBody className="pt-0">
                  <TkForm onSubmit={handleSubmit(onSubmit)}>
                    <div>
                      <TkRow className="g-3">
                        <TkCol lg={4}>
                          <div>
                            <TkInput
                              {...register("teamName")}
                              labelName="Team Name"
                              type="text"
                              id="teamName"
                              placeholder="Enter Team Name"
                            />
                            {errors.teamName && <FormErrorText>{errors.teamName.message}</FormErrorText>}
                          </div>
                        </TkCol>
                        <TkCol lg={4}>
                          <TkInput
                            {...register("teamId")}
                            labelName="Team ID"
                            type="text"
                            name="teamId"
                            id="teamId"
                            placeholder="Enter Team ID"
                          />
                          {errors.teamId && <FormErrorText>{errors.teamId.message}</FormErrorText>}
                        </TkCol>

                        <TkCol lg={4}>
                          <TkSelect
                            labelName="Team Lead"
                            name="teamLead"
                            id="teamLead"
                            options={selectLead}
                            placeholder="Select Team Lead"
                          />
                        </TkCol>

                        <TkCol lg={4}>
                          <div>
                            <TkSelect
                              labelName="Assign Users"
                              name="assignUsers"
                              id="assignUsers"
                              options={userOptions}
                              placeholder="Select Users"
                              isMulti={true}
                              onChange={(e) => {
                                onChange();
                                handleAssignUsers(e);
                              }}
                            />
                          </div>
                        </TkCol>
                      </TkRow>
                      <div className="d-flex mt-4 space-childern">
                        <TkButton color="secondary" type="reset" className="ms-auto">
                          Cancel
                        </TkButton>
                        <TkButton color="primary" type="submit" className="ms-2">
                          Save
                        </TkButton>
                      </div>
                    </div>
                  </TkForm>
                </TkCardBody>
              </TkCard>
            </TkCol>
          </div>
        </TkContainer>
      </div>
    </>
  );
};

export default AddTeam;

AddTeam.options = {
  layout: true,
  auth: true,
};