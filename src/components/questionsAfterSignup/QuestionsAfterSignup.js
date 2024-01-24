import React, { useState } from "react";
import TkRow, { TkCol } from "../TkRow";
import TkForm from "../forms/TkForm";
import TkButton from "../TkButton";

import CompanyInfo from "./CompanyInfo";
import FeedBack from "./FeedBack";
import Invite from "./Invite";

import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";

import { API_BASE_URL, urls } from "../../../src/utils/Constants";
import { useMutation } from "@tanstack/react-query";
import tkFetch from "../../../src/utils/fetch";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import { useRouter } from "next/router";

// const steps = ["COMPANY INFO", "FEEDBACK", "INVITE"];

function QuestionsAfterSignup() {
  // const router = useRouter();
  const [goSteps, setGoSteps] = useState(0);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    companySize: "",
  });
  const [errorsFields, setErrors] = useState({
    companyNameExist: false,
    companyNameGreater: false,
    companyNameLess: false,
    companySize: false,
  });
  const [creatingText, setCreatingText] = useState("");

  const updateCompanyInfo = (data) => {
    setCompanyInfo({ ...companyInfo, ...data });
    if (data.companyName) {
      setErrors((prevValues) => ({ ...prevValues, companyNameExist: false }));
    }
    if (data.companySize) {
      setErrors((prevValues) => ({ ...prevValues, companySize: false }));
    }
    //fill the form then  show the toast message company info updated successfully
  };

  const createWs = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/workspace`),
  });

  const createWorkspace = () => {
    if (companyInfo.companyName.length > 50) {
      setErrors((prevValues) => ({ ...prevValues, companyNameLess: false, companyNameGreater: true }));
      return;
    }

    if (companyInfo.companyName && companyInfo.companySize) {
      setErrors((prevValues) => ({
        ...prevValues,
        companyNameExist: false,
        companyNameLess: false,
        companyNameGreater: false,
      }));
      setCreatingText("Creating new Workspace.");
      createWs.mutate(
        { workspaceName: companyInfo.companyName, companySize: companyInfo.companySize },
        {
          onSuccess: (data) => {
            // again mutate the same api call to initilize workspace with default values
            setCreatingText("Adding Default values to Workspace.");
            createWs.mutate(
              { workspaceId: data[0].id, initilize1: true },
              {
                onSuccess: (data) => {
                  // again mutate the same api call to add user to workspace and assign other records to him
                  setCreatingText("Adding You to Workspace.");
                  createWs.mutate(
                    { workspaceId: data[0].id, initilize2: true },
                    {
                      onSuccess: (data) => {
                        // navigating with window.location.href to make a full page refres, as we need workspaceId in the user token
                        // so when we create a workspace here then we need to inset workspaceId in the user token, but by using next router
                        // when doing full refresh nextauth session function is not called, and wwe insert workspaceId in the user token,
                        // there may be other solutiopns but currently this works
                        //TODO: dont navigate to dashboarrd, but acccept answer to more questions
                        setCreatingText("");
                        TkToastSuccess("Company Info updated successfully");
                        window.location.href = `${urls.dashboard}`;
                      },
                      onError: (error) => {
                        console.log(error);
                        TkToastError(
                          "Unable to add default values to database. Try again or contact support for help."
                        );
                        setCreatingText("");
                      },
                    }
                  );
                },
                onError: (error) => {
                  console.log(error);
                  TkToastError("Unable to add default values to database. Try again or contact support for help.");
                  setCreatingText("");
                },
              }
            );
          },
          onError: (error) => {
            console.log(error);
            TkToastError(error.message);
            setCreatingText("");
          },
        }
      );
    } else {
      if (!companyInfo.companyName) {
        setErrors((prevValues) => ({ ...prevValues, companyNameExist: true, companyNameLess: false, companyNameGreater: false }));
      }
      if (!companyInfo.companySize) {
        setErrors((prevValues) => ({ ...prevValues, companySize: true }));
      }
    }
  };

  // const handleStep = (step) => () => {
  //   setGoSteps(step);
  // };

  return (
    <TkRow>
      <TkCol lg={6}>
        {/* <div className="mb-3">
          <Box sx={{ width: "100%" }}>
            <Stepper activeStep={goSteps} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepButton color="inherit" onClick={handleStep(index)}>
                    {label}
                  </StepButton>
                </Step>
              ))}
            </Stepper>
          </Box>
        </div> */}
        {goSteps === 0 && (
          <>
            <CompanyInfo errorsFields={errorsFields} onUpdate={updateCompanyInfo} />
            <TkRow className="align-items-center">
              <TkCol xl={4}>
                <div className="mt-3 mb-3 ms-4">
                  <TkButton
                    className="btn btn-primary w-100"
                    loading={createWs.isLoading}
                    onClick={() => {
                      createWorkspace();
                      // setGoSteps(1);
                    }}
                  >
                    Next <i className="ri-arrow-right-line align-bottom me-1"></i>
                  </TkButton>
                </div>
              </TkCol>
              <TkCol xl={6}>{creatingText && <h6 className="text-muted mt-2">{creatingText}</h6>}</TkCol>
            </TkRow>
          </>
        )}
        {goSteps === 1 && (
          <>
            <FeedBack />
            <TkRow>
              <TkCol xl={3}>
                <div className="mt-3 mb-3 ms-4">
                  <TkButton className="btn btn-primary w-100" type="submit" onClick={() => setGoSteps(2)}>
                    Next <i className="ri-arrow-right-line align-bottom me-1"></i>
                  </TkButton>
                </div>
              </TkCol>
            </TkRow>
          </>
        )}
        {goSteps === 2 && (
          <>
            <Invite />
            <TkRow>
              <TkCol xl={3}>
                <div className="mt-3 mb-3 ms-4">
                  <TkButton className="btn btn-primary w-100" onClick={() => setGoSteps(2)}>
                    Finish <i className="ri-arrow-right-line align-bottom me-1"></i>
                  </TkButton>
                </div>
              </TkCol>
            </TkRow>
          </>
        )}
      </TkCol>
      <TkCol lg={6}>
        <div className="right-design d-none d-sm-block d-md-none d-lg-block"></div>
      </TkCol>
    </TkRow>
  );
}

export default QuestionsAfterSignup;
