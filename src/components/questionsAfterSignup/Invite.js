import React, { useState } from "react";
import TkRow, { TkCol } from "../TkRow";
import TkInput from "../forms/TkInput";
import TkButton from "../TkButton";
import TkIcon from "../TkIcon";
import TkLabel from "../forms/TkLabel";

function Invite() {
  const [formIds, setFormIds] = useState([0]);

  const addForm = () => {
    setFormIds([...formIds, formIds.length]);
  };

  const InviteForm = () => {
    return (
      <div className="mt-3 mb-3 ms-4">
        <TkInput
          // labelName="Teammates"
          type="test"
          id="teammates"
          name="teammates"
          requiredStarOnLabel={true}
          required={true}
        />
      </div>
    );
  };

  return (
    <div>
      <TkRow>
        <TkCol lg={12}>
          <div className="mt-3 mb-3 ms-4">
            <h1>Add your team</h1>
          </div>
        </TkCol>
        <TkCol lg={12}>
          <div className="mt-3 mb-3 ms-4">
            <h5>Include anyone you&apos;d like to schedule</h5>
          </div>
        </TkCol>
        <TkCol xl={8}>
          <TkLabel className="ms-4 mt-3" tag="h5">Teammates</TkLabel>
          {formIds.map((id) => (
            <InviteForm key={id} />
          ))}
          <TkButton type="button" color="link" className="text-decoration-none ms-2" onClick={addForm}>
            <TkIcon className="ri-add-line"></TkIcon> Add Another
          </TkButton>
          {/* <TkButton type="button" onClick={addForm} className="bg-transparent border-0 ps-0 ms-0 text-center">
            <span className="badge p-1 rounded-circle badge-soft-dark fs-4">
              <TkIcon className="ri-add-line"></TkIcon>
            </span>
          </TkButton> */}
        </TkCol>
      </TkRow>
    </div>
  );
}

export default Invite;
