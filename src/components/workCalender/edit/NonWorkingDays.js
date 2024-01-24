import React, { useMemo, useEffect, useState } from "react";
import TkButton from "../../TkButton";
import TkRow, { TkCol } from "../../TkRow";
import TkCard, { TkCardBody } from "../../TkCard";
import TkTableContainer from "../../TkTableContainer";
import { formatDate } from "../../../utils/date";
// import HeaderForm from "../nonWorkingDayHeader";
import { bigInpuMaxLength, modes } from "../../../utils/Constants";
import TkForm from "../../forms/TkForm";
import FormErrorText from "../../forms/ErrorText";
import TkInput from "../../forms/TkInput";
import TkIcon from "../../TkIcon";
import TkDate from "../../forms/TkDate";
import { UncontrolledTooltip } from "reactstrap";

function HeaderForm({ addNonWorkDay, checkExistingDate, disabled, mode }) {
  const [date, setDate] = useState(null);
  const [description, setDescription] = useState("");
  const [dateError, setDateError] = useState(null);
  const [descriptionError, setDescriptionError] = useState(null);

  const viewMode = mode === modes.view;
  const editMode = mode === modes.edit;

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
            options={{ altInput: true, dateFormat: "d M, Y" }}
            onChange={(date) => {
              setDate(date);
            }}
            disabled={disabled || viewMode}
            requiredStarOnLabel={editMode}
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
            disabled={disabled || viewMode}
            requiredStarOnLabel={editMode}
          />
          {descriptionError ? <FormErrorText>{descriptionError}</FormErrorText> : null}
        </TkCol>
        <TkCol lg={4}>
          <TkButton className="mt-4" color="primary" type="submit" disabled={disabled || viewMode}>
            <TkIcon className="ri-add-fill align-bottom"></TkIcon> Add
          </TkButton>
        </TkCol>
      </TkRow>
    </TkForm>
  );
}

function NonWorkingDays(props) {
  const { nonWorkDays, setNonWorkDays, setAddNWorkDay, addNWorkDay, delNWorkDay, setDelNWorkDay, mode } = props;
  const viewMode = mode === modes.view;

  const columns = useMemo(
    () => [
      {
        Header: "Date",
        accessor: "date",
        filterable: false,
      },
      {
        Header: "Description",
        accessor: "description",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div className="table-text">
              {cellProps.row.original.description?.length > 50 ? (
                <>
                  <span id={`toolTip${cellProps.row.id}`}>
                    {cellProps.row.original.description?.substring(0, 50) + "..."}
                  </span>
                  <UncontrolledTooltip
                    target={`toolTip${cellProps.row.id}`}
                    className="custom-tooltip-style"
                    style={{ backgroundColor: "#dfe6eb", color: "#212529" }}
                  >
                    {cellProps.row.original.description}
                  </UncontrolledTooltip>
                </>
              ) : (
                cellProps.row.original.description
              )}
            </div>
          );
        },
      },
      {
        Header: "Delete",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <TkButton
              color="secondary"
              disabled={viewMode}
              onClick={() => {
                // remove deleted dates from nonWorkDays array
                if (viewMode) return;
                const newdays = nonWorkDays.filter((d) => d.date !== cellProps.row.original.date);
                setNonWorkDays(newdays);

                // if deleting row is newly added row, remove it from addNWorkDay array
                for (let i = 0; i < addNWorkDay.length; i++) {
                  if (addNWorkDay[i].date === cellProps.row.original.date) {
                    const days = [...addNWorkDay];
                    days.splice(i, 1);
                    setAddNWorkDay(days);
                    return;
                  }
                }

                // this row has come from database, so store its id and remove it from DB
                setDelNWorkDay([...delNWorkDay, cellProps.row.original.id]);
              }}
            >
              Delete
            </TkButton>
          );
        },
      },
    ],
    [addNWorkDay, delNWorkDay, nonWorkDays, setAddNWorkDay, setDelNWorkDay, setNonWorkDays, viewMode]
  );

  const checkExistingDate = (date) => {
    const d = formatDate(date);
    for (let i = 0; i < nonWorkDays.length; i++) {
      if (nonWorkDays[i].date === d) {
        return true;
      }
    }
    return false;
  };

  const addNonWorkDay = (date, description) => {
    // make a array to store new dates added
    const newdays = [...addNWorkDay, { date: formatDate(date), description: description }];
    setAddNWorkDay(newdays);
    // merge previous dates and added new dates
    setNonWorkDays([...nonWorkDays, { date: formatDate(date), description: description }]);
  };

  return (
    <div className="row justify-content-center">
      <TkCol>
        {/* <TkCard id="tasksList"> */}
        <HeaderForm addNonWorkDay={addNonWorkDay} checkExistingDate={checkExistingDate} mode={mode} />
        <TkCardBody className="table-padding pt-0">
          {nonWorkDays.length ? <TkTableContainer columns={columns} data={nonWorkDays} /> : null}
        </TkCardBody>
        {/* </TkCard> */}
      </TkCol>
    </div>
  );
}

export default NonWorkingDays;
