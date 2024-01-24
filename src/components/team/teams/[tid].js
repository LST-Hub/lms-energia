import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SimpleBar from "simplebar-react";

import avatar2 from "/public/images/users/avatar-2.jpg";
import avatar3 from "/public/images/users/avatar-3.jpg";
import avatar4 from "/public/images/users/avatar-4.jpg";
import avatar7 from "/public/images/users/avatar-7.jpg";
import BreadCrumb from "../../src/utils/BreadCrumb";

import TkButton from "../../src/components/TkButton";
import TkInput from "../../src/components/forms/TkInput";
import TkSelect from "../../src/components/forms/TkSelect";
import TkCard, { TkCardBody, TkCardHeader, TkCardTitle } from "../../src/components/TkCard";
import TkContainer from "../../src/components/TkContainer";
import TkIcon from "../../src/components/TkIcon";
import TkRow, { TkCol } from "../../src/components/TkRow";
import TkForm from "../../src/components/forms/TkForm";
import TkPageHead from "../../src/components/TkPageHead";
import TkEditCardHeader from "../../src/components/TkEditCardHeader";
import {
  TkDropdownItem,
  TkDropdownMenu,
  TkDropdownToggle,
  TkUncontrolledDropdown,
} from "../../src/components/TkDropdown";

import { TkToastInfo } from "../../src/components/TkToastContainer";
import "react-toastify/dist/ReactToastify.css";

import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText from "../../src/components/forms/ErrorText";
import { MinNameLength, MaxNameLength, smallInputMaxLength as MaxTeamIdLenght } from "../../src/utils/Constants";
import TkLoader from "../../src/components/TkLoader";

const schema = Yup.object({
  teamName: Yup.string()
    .min(MinNameLength, `Team name must be at least ${MinNameLength} characters.`)
    .max(MaxNameLength, `Team name must be at most ${MaxNameLength} characters.`)
    .required("Team name is required"),

  teamId: Yup.string().max(MaxTeamIdLenght, `Team id must be at most ${MaxTeamIdLenght} characters.`),
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

const TeamDetailsPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onChange = () => {
    const submitBtn = document.getElementById("update-team-submit-btns");
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
      <h5>Team Updated</h5>
    </div>
  );

  const onSubmit = (e) => {
    TkToastInfo(<Msg />, { hideProgressBar: true });
    // e.preventDefault();
    // console.log('toggle called in form submit')
    // validation.handleSubmit();
    // return false;
  };

  const [hideLoader, setHideLoader] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setHideLoader(false);
    }, 3000);
  }, []);

  return (
    <>
      <TkPageHead>
        <title>{"Team Details"}</title>
      </TkPageHead>

      <div className="page-content">
        <BreadCrumb pageTitle={"Edit Team"} parentTitle="Teams" parentLink="/teams" />
        {hideLoader ? (
          <TkLoader />
        ) : (
          <TkContainer>
            <TkRow className="justify-content-center">
              <TkCol lg={11}>
                <TkCard>
                  <TkEditCardHeader title="Edit Team" />
                  <TkCardBody>
                    <div>
                      <TkForm onSubmit={handleSubmit(onSubmit)}>
                        <TkRow className="g-3">
                          <TkCol lg={4}>
                            <div>
                              <TkInput
                                {...register("teamName", { onChange })}
                                labelName="Team Name"
                                type="text"
                                id="teamName"
                                placeholder="Enter Team Name"
                                defaultValue="Developers"
                              />
                              {errors.teamName && <FormErrorText>{errors.teamName.message}</FormErrorText>}
                            </div>
                          </TkCol>
                          <TkCol lg={4}>
                            <TkInput
                              {...register("teamId", { onChange })}
                              labelName="Team ID"
                              type="text"
                              id="teamId"
                              placeholder="Enter Team ID"
                              defaultValue="#Dev02"
                            />
                            {errors.teamId && <FormErrorText>{errors.teamId.message}</FormErrorText>}
                          </TkCol>

                          <TkCol lg={4}>
                            <TkSelect
                              labelName="Team Lead"
                              name="teamLead"
                              id="teamLead"
                              options={userOptions}
                              onChange={onChange}
                              defaultValue={userOptions[0]}
                            />
                          </TkCol>

                          <TkCol lg={4}>
                            <div>
                              <TkSelect
                                labelName="Assign Users"
                                name="assignUsers"
                                id="assignUsers"
                                placeholder="Select Users"
                                onChange={(e) => {
                                  onChange();
                                  handleAssignUsers(e);
                                }}
                                value={assignUsers}
                                options={userOptions}
                                isMulti={true}
                              />
                            </div>
                          </TkCol>
                        </TkRow>

                        <div className="d-flex mt-4 space-childern">
                          <div className="ms-auto" style={{ display: "none" }} id="update-team-submit-btns">
                            <TkButton color="secondary" className="ms-auto">
                              Cancel
                            </TkButton>
                            <TkButton color="primary" className="ms-2" type="submit">
                              Save
                            </TkButton>
                          </div>
                        </div>
                      </TkForm>

                      <TkRow className="mt-2">
                        <TkCol>
                          <TkCard>
                            <TkCardHeader className="align-items-center d-flex border-bottom-dashed">
                              <TkCardTitle tag="h4" className=" mb-0 flex-grow-1">
                                Members
                              </TkCardTitle>
                            </TkCardHeader>
                            <TkCardBody>
                              <SimpleBar data-simplebar style={{ height: "235px" }} className="mx-n3 px-3">
                                <div className="vstack gap-3">
                                  <TkRow>
                                    <TkCol lg={4}>
                                      {/* <TkRow> */}
                                      <div className="row align-items-center">
                                        <TkCol lg={2}>
                                          <div className="avatar-xs flex-shrink-0 me-3">
                                            <Image src={avatar2} alt="avatar" className="img-fluid rounded-circle" />
                                          </div>
                                        </TkCol>
                                        <TkCol lg={6}>
                                          <div className="flex-grow-1">
                                            <h5 className="fs-13 mb-0">
                                              <Link href="#">
                                                <a className="text-body d-block ">Nancy Martino</a>
                                              </Link>
                                            </h5>
                                          </div>
                                        </TkCol>
                                        <TkCol lg={2}>
                                          <div className="flex-shrink-0 me-4">
                                            <div className="d-flex align-items-center gap-1">
                                              <TkUncontrolledDropdown>
                                                <TkDropdownToggle
                                                  tag="button"
                                                  className="btn btn-icon btn-sm fs-16 text-muted dropdown"
                                                >
                                                  <TkIcon className="ri-more-fill"></TkIcon>
                                                </TkDropdownToggle>
                                                <TkDropdownMenu>
                                                  <li>
                                                    <TkDropdownItem>
                                                      <TkIcon className="ri-eye-fill text-muted me-2 align-bottom"></TkIcon>
                                                      View
                                                    </TkDropdownItem>
                                                  </li>

                                                  <li>
                                                    <TkDropdownItem>
                                                      <TkIcon className="ri-delete-bin-5-fill text-muted me-2 align-bottom"></TkIcon>
                                                      Remove
                                                    </TkDropdownItem>
                                                  </li>
                                                </TkDropdownMenu>
                                              </TkUncontrolledDropdown>
                                            </div>
                                          </div>
                                        </TkCol>
                                      </div>
                                      {/* </TkRow> */}
                                    </TkCol>
                                    <TkCol lg={4}>
                                      <div className="row align-items-center">
                                        <TkCol lg={2}>
                                          <div className="avatar-xs flex-shrink-0 me-3">
                                            <Image src={avatar3} alt="avatar" className="img-fluid rounded-circle" />
                                          </div>
                                        </TkCol>
                                        <TkCol lg={6}>
                                          <div className="flex-grow-1">
                                            <h5 className="fs-13 mb-0">
                                              <Link href="#">
                                                <a className="text-body d-block">Frank Hook</a>
                                              </Link>
                                            </h5>
                                          </div>
                                        </TkCol>
                                        <TkCol lg={2}>
                                          <div className="flex-shrink-0">
                                            <div className="d-flex align-items-center gap-1">
                                              <TkUncontrolledDropdown>
                                                <TkDropdownToggle
                                                  tag="button"
                                                  className="btn btn-icon btn-sm fs-16 text-muted dropdown"
                                                >
                                                  <TkIcon className="ri-more-fill"></TkIcon>
                                                </TkDropdownToggle>
                                                <TkDropdownMenu>
                                                  <li>
                                                    <TkDropdownItem>
                                                      <TkIcon className="ri-eye-fill text-muted me-2 align-bottom"></TkIcon>
                                                      View
                                                    </TkDropdownItem>
                                                  </li>
                                                  <li>
                                                    <TkDropdownItem>
                                                      <TkIcon className="ri-delete-bin-5-fill text-muted me-2 align-bottom"></TkIcon>
                                                      Remove
                                                    </TkDropdownItem>
                                                  </li>
                                                </TkDropdownMenu>
                                              </TkUncontrolledDropdown>
                                            </div>
                                          </div>
                                        </TkCol>
                                      </div>
                                    </TkCol>
                                    <TkCol lg={4}>
                                      <div className="row align-items-center">
                                        <TkCol lg={2}>
                                          <div className="avatar-xs flex-shrink-0 me-3">
                                            <Image src={avatar4} alt="avatar" className="img-fluid rounded-circle" />
                                          </div>
                                        </TkCol>
                                        <TkCol lg={6}>
                                          <div className="flex-grow-1">
                                            <h5 className="fs-13 mb-0">
                                              <Link href="#">
                                                <a className="text-body d-block">Jennifer Carter</a>
                                              </Link>
                                            </h5>
                                          </div>
                                        </TkCol>
                                        <TkCol lg={2}>
                                          <div className="flex-shrink-0">
                                            <div className="d-flex align-items-center gap-1">
                                              <TkUncontrolledDropdown>
                                                <TkDropdownToggle
                                                  tag="button"
                                                  className="btn btn-icon btn-sm fs-16 text-muted dropdown"
                                                >
                                                  <TkIcon className="ri-more-fill"></TkIcon>
                                                </TkDropdownToggle>
                                                <TkDropdownMenu>
                                                  <li>
                                                    <TkDropdownItem>
                                                      <TkIcon className="ri-eye-fill text-muted me-2 align-bottom"></TkIcon>
                                                      View
                                                    </TkDropdownItem>
                                                  </li>

                                                  <li>
                                                    <TkDropdownItem>
                                                      <TkIcon className="ri-delete-bin-5-fill text-muted me-2 align-bottom"></TkIcon>
                                                      Remove
                                                    </TkDropdownItem>
                                                  </li>
                                                </TkDropdownMenu>
                                              </TkUncontrolledDropdown>
                                            </div>
                                          </div>
                                        </TkCol>
                                      </div>
                                    </TkCol>
                                  </TkRow>

                                  <TkRow>
                                    <TkCol lg={4}>
                                      <div className="row align-items-center">
                                        <TkCol lg={2}>
                                          <div className="avatar-xs flex-shrink-0 me-3">
                                            <div className="avatar-title bg-soft-success text-success rounded-circle">
                                              AC
                                            </div>
                                          </div>
                                        </TkCol>
                                        <TkCol lg={6}>
                                          <div className="flex-grow-1">
                                            <h5 className="fs-13 mb-0">
                                              <Link href="#">
                                                <a className="text-body d-block">Alexis Clarke</a>
                                              </Link>
                                            </h5>
                                          </div>
                                        </TkCol>
                                        <TkCol lg={2}>
                                          <div className="flex-shrink-0">
                                            <div className="d-flex align-items-center gap-1">
                                              <TkUncontrolledDropdown>
                                                <TkDropdownToggle
                                                  tag="button"
                                                  className="btn btn-icon btn-sm fs-16 text-muted dropdown"
                                                >
                                                  <TkIcon className="ri-more-fill"></TkIcon>
                                                </TkDropdownToggle>
                                                <TkDropdownMenu>
                                                  <li>
                                                    <TkDropdownItem>
                                                      <TkIcon className="ri-eye-fill text-muted me-2 align-bottom"></TkIcon>
                                                      View
                                                    </TkDropdownItem>
                                                  </li>

                                                  <li>
                                                    <TkDropdownItem>
                                                      <TkIcon className="ri-delete-bin-5-fill text-muted me-2 align-bottom"></TkIcon>
                                                      Remove
                                                    </TkDropdownItem>
                                                  </li>
                                                </TkDropdownMenu>
                                              </TkUncontrolledDropdown>
                                            </div>
                                          </div>
                                        </TkCol>
                                      </div>
                                    </TkCol>
                                    <TkCol lg={4}>
                                      <div className="row align-items-center">
                                        <TkCol lg={2}>
                                          <div className="avatar-xs flex-shrink-0 me-3">
                                            <Image src={avatar7} alt="avatar" className="img-fluid rounded-circle" />
                                          </div>
                                        </TkCol>
                                        <TkCol lg={6}>
                                          <div className="flex-grow-1">
                                            <h5 className="fs-13 mb-0">
                                              <Link href="#">
                                                <a className="text-body d-block">Joseph Parker</a>
                                              </Link>
                                            </h5>
                                          </div>
                                        </TkCol>
                                        <TkCol lg={2}>
                                          <div className="flex-shrink-0">
                                            <div className="d-flex align-items-center gap-1">
                                              <TkUncontrolledDropdown>
                                                <TkDropdownToggle
                                                  tag="button"
                                                  className="btn btn-icon btn-sm fs-16 text-muted dropdown"
                                                >
                                                  <TkIcon className="ri-more-fill"></TkIcon>
                                                </TkDropdownToggle>
                                                <TkDropdownMenu>
                                                  <li>
                                                    <TkDropdownItem>
                                                      <TkIcon className="ri-eye-fill text-muted me-2 align-bottom"></TkIcon>
                                                      View
                                                    </TkDropdownItem>
                                                  </li>

                                                  <li>
                                                    <TkDropdownItem>
                                                      <TkIcon className="ri-delete-bin-5-fill text-muted me-2 align-bottom"></TkIcon>
                                                      Remove
                                                    </TkDropdownItem>
                                                  </li>
                                                </TkDropdownMenu>
                                              </TkUncontrolledDropdown>
                                            </div>
                                          </div>
                                        </TkCol>
                                      </div>
                                    </TkCol>
                                  </TkRow>
                                </div>
                              </SimpleBar>
                            </TkCardBody>
                          </TkCard>
                        </TkCol>
                      </TkRow>
                    </div>
                  </TkCardBody>
                </TkCard>
              </TkCol>
            </TkRow>
          </TkContainer>
        )}
      </div>
    </>
  );
};

export default TeamDetailsPage;

TeamDetailsPage.options = {
  layout: true,
  auth: true,
};
