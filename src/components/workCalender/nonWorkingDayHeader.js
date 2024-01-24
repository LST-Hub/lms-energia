import React, { useState } from "react";
import FormErrorText from "../forms/ErrorText";
import TkDate from "../forms/TkDate";
import TkForm from "../forms/TkForm";
import TkInput from "../forms/TkInput";
import TkButton from "../TkButton";
import TkIcon from "../TkIcon";
import TkRow, { TkCol } from "../TkRow";
import { bigInpuMaxLength } from "../../utils/Constants";

function HeaderForm({ addNonWorkDay, checkExistingDate, disabled }) {
  const [date, setDate] = useState(null);
  const [description, setDescription] = useState("");
  const [dateError, setDateError] = useState(null);
  const [descriptionError, setDescriptionError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date) {
      setDateError("Date is Required");
      return;
    } else {
      setDateError(null);
    }
    if (!description) {
      setDescriptionError("Description is Required");
      return;
    } else {
      setDescriptionError(null);
    }
    if (description.length > bigInpuMaxLength) {
      setDescriptionError(`Description should have at most ${bigInpuMaxLength} characters.`);
      return;
    } else {
      setDescriptionError(null);
    }

    const exist = checkExistingDate(date);
    if (exist) {
      setDateError("Date already exists");
      return;
    }

    addNonWorkDay(date, description);
    setDate(null);
    setDescription("");
  };

  return (
    <TkForm onSubmit={handleSubmit}>
      <TkRow className="mb-3 ms-auto">
        <TkCol lg={4}>
          <TkDate
            id="date"
            labelName="Date"
            placeholder="Select Date"
            value={date}
            options={{ dateFormat: "d-M-Y" }}
            onChange={(date) => {
              setDate(date);
            }}
            disabled={disabled}
            requiredStarOnLabel={true}
          />
          {dateError ? <FormErrorText>{dateError}</FormErrorText> : null}
        </TkCol>
        <TkCol lg={4}>
          <TkInput
            id="description"
            labelName="Description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter Description"
            disabled={disabled}
            requiredStarOnLabel={true}
          />
          {descriptionError ? <FormErrorText>{descriptionError}</FormErrorText> : null}
        </TkCol>
        <TkCol lg={4}>
          <TkButton className="mt-4" color="primary" type="submit" disabled={disabled}>
            <TkIcon className="ri-add-fill align-bottom"></TkIcon> Add
          </TkButton>
        </TkCol>
      </TkRow>
    </TkForm>
  );
}

export default HeaderForm;
