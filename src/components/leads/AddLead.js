import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  ButtonGroup,
  Form,
  FormGroup,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import { useRouter } from "next/router";
import { TkCardBody, TkCardHeader } from "../../../src/components/TkCard";
import TkRow, { TkCol } from "../../../src/components/TkRow";
// import { Controller, useForm } from "react-hook-form";
const tabs = {
  directCall: "primary",
  email: "email",
  socialMedia: "socialMedia",
  portals: "portals",
  directMarketing: "directMarketing",
  leadAssigning: "lead",
  leadNurutring: "nurturing",
  requirementDetails: "requirementDetails",
  locationDetails: "locationDetails",
  test: "test",
};
import DirectCall from "../../../src/components/leads/DirectCall";
import LeadEmail from "./LeadEmail";
import SocialMedia from "./SocialMedia";
import LeadPortals from "./LeadPortals";
import DirectMarketing from "./DirectMarketing";
import { useMutation } from "@tanstack/react-query";

function AddLead() {
  // const {
  //   control,
  //   register,
  //   handleSubmit,
  //   setValue,
  //   getValues,
  //   setError,
  //   formState: { errors, isDirty, dirtyFields },
  // } = useForm({
  //   resolver: yupResolver(schema),
  // });
  const router = useRouter();
  const [selectedButton, setSelectedButton] = useState({id: 1, refName: "directCall"});
  const [isLead, setIsLead] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [hiddenButtons, setHiddenButtons] = useState([]);

  useEffect(() => {
    setIsLead(true);
  }, []);

  const handleButtonClick = (button) => {
    setSelectedButton(button);
    setShowForm(true);
    setHiddenButtons(
      [
        "directCall",
        "email",
        "socialMedia",
        "portals",
        "directMarketing",
      ].filter((b) => b !== button.refName)
    );
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setShowForm(false);
  };

  return (
    <>
      {isLead && (
        <div>
          <TkRow className="mt-3">
            <TkCol>
              <TkCardHeader tag="h5" className="mb-3">
                <h4>Lead Types</h4>
              </TkCardHeader>
              <div>
                <Button
                  color="primary"
                  outline
                  style={{
                    marginRight: "20px",
                    marginBottom: "20px",
                    display: hiddenButtons.includes("directCall")
                      ? "none"
                      : "inline-block",
                  }}
                  active={selectedButton.refName === "directCall"}
                  onClick={() => handleButtonClick({id: 1, refName: "directCall"})}
                >
                  Direct Call
                </Button>

                <Button
                  color="primary"
                  outline
                  style={{
                    marginRight: "20px",
                    marginBottom: "20px",
                    display: hiddenButtons.includes("email")
                      ? "none"
                      : "inline-block",
                  }}
                  active={selectedButton.refName === "email"}
                  onClick={() => handleButtonClick({id: 2, refName: "email"})}
                >
                  Email
                </Button>

                <Button
                  color="primary"
                  outline
                  style={{
                    marginRight: "20px",
                    marginBottom: "20px",
                    display: hiddenButtons.includes("socialMedia")
                      ? "none"
                      : "inline-block",
                  }}
                  active={selectedButton.refName === "socialMedia"}
                  onClick={() => handleButtonClick({id: 3, refName: "socialMedia"})}
                >
                  SocialMedia
                </Button>

                <Button
                  color="primary"
                  outline
                  style={{
                    marginRight: "20px",
                    marginBottom: "20px",
                    display: hiddenButtons.includes("portals")
                      ? "none"
                      : "inline-block",
                  }}
                  active={selectedButton.refName === "portals"}
                  onClick={() => handleButtonClick({id: 4, refName: "portals"})}
                >
                  Portals
                </Button>

                <Button
                  color="primary"
                  outline
                  style={{
                    marginRight: "20px",
                    marginBottom: "20px",
                    display: hiddenButtons.includes("directMarketing")
                      ? "none"
                      : "inline-block",
                  }}
                  active={selectedButton.refName === "directMarketing"}
                  onClick={() => handleButtonClick({id: 5, refName: "directMarketing"})}
                >
                  Direct Marketing
                </Button>
              </div>
            </TkCol>
          </TkRow>
          <TkRow>
            <TkCol>
              {showForm && (
                // <Form>
                <div>
                  {selectedButton.refName === "directCall" && <DirectCall selectedButton={selectedButton} />}

                  {selectedButton.refName === "email" && <LeadEmail selectedButton={selectedButton}/>}

                  {selectedButton.refName === "socialMedia" && <SocialMedia selectedButton={selectedButton}/>}

                  {selectedButton.refName === "portals" && <LeadPortals selectedButton={selectedButton}/>}

                  {selectedButton.refName === "directMarketing" && <DirectMarketing selectedButton={selectedButton}/>}
                </div>

                // </Form>
              )}
            </TkCol>
          </TkRow>
        </div>
      )}
    </>
  );
}

export default AddLead;
