import React, { useMemo, useState, useEffect, useCallback } from "react";
import TkTableContainer from "../../TkTableContainer";

import TkCard, { TkCardBody } from "../../TkCard";
// import TkCardBody from "../TkCardBody";
import TkRow, { TkCol } from "../../TkRow";
import TkInput from "../../forms/TkInput";
import TkCheckBox from "../../forms/TkCheckBox";
import { convertToDayTime } from "../../../utils/time";

const days = [
  {
    id: "Sunday",
    option: "Sunday",
  },
  {
    id: "Monday",
    option: "Monday",
  },
  {
    id: "Tuesday",
    option: "Tuesday",
  },
  {
    id: "Wednesday",
    option: "Wednesday",
  },
  {
    id: "Thursday",
    option: "Thursday",
  },
  {
    id: "Friday",
    option: "Friday",
  },
  {
    id: "Saturday",
    option: "Saturday",
  },
];

// Create an editable cell renderer, we are creating this cell because we lloose focus afetr typing in tkinput
const EditableCell = ({
  type,
  name,
  disabled,
  value: initialValue,
  updateValue, // This is a custom function that we supplied to our table instance
}) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = React.useState(initialValue);
  const onChange = (e) => {
    setValue(e.target.value);
  };
  // We'll only update the external data when the input is blurred
  const onBlur = (e) => {
    const time = convertToDayTime(e.target.value);
    if (time) {
      updateValue(time);
    } else {
      updateValue("0");
      setValue("0");
    }
  };
  return <TkInput type={type} name={name} disabled={disabled} value={value} onChange={onChange} onBlur={onBlur} />;
};

function WorkingDays({ selectedDayHours, setSelectedDayHours }) {
  const handelDaySelection = useCallback(
    (rows) => {
      setSelectedDayHours((prevValue) => {
        const value = { ...prevValue };
        rows.forEach((row) => {
          if (!value[row.original.id]) {
            value[row.original.id] = "8:00";
          }
        });
        for (const key in value) {
          if (!rows.find((row) => row.original.id === key)) {
            delete value[key];
          }
        }
        return value;
        // if (e.target.checked) {
        //   return { ...prevValue, [id]: "8:00" };
        // } else {
        //   return { ...prevValue, [id]: undefined };
        // }
      });
    },
    [setSelectedDayHours]
  );

  const columns = useMemo(
    () => [
      // {
      //   Header: "Select",
      //   Cell: (cellProps) => {
      //     return (
      //       <TkCheckBox
      //         checked={selectedDayHours[cellProps.row.original.id] !== undefined}
      //         onChange={(e) => {
      //           handelDaySelection(e, cellProps.row.original.id);
      //         }}
      //       />
      //     );
      //   },
      // },
      {
        Header: "Day",
        accessor: "option",
        filterable: false,
      },
      {
        Header: "Work Hours",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <TkRow>
              <TkCol lg={3}>
                <EditableCell
                  type="text"
                  name="hours"
                  disabled={selectedDayHours[cellProps.row.original.id] === undefined}
                  value={selectedDayHours[cellProps.row.original.id]}
                  updateValue={(value) => {
                    setSelectedDayHours((prevValue) => {
                      // console.log("prevValue", prevValue);
                      return { ...prevValue, [cellProps.row.original.id]: value };
                    });
                  }}
                />
              </TkCol>
            </TkRow>
          );
        },
      },
    ],
    [selectedDayHours, setSelectedDayHours]
  );

  return (
    <div className="row justify-content-center">
      <TkCol lg={12}>
        {/* <TkCard> */}
          <TkCardBody className={"pt-0"}>
            <TkTableContainer columns={columns} data={days} rowSelection={true} onRowSelection={handelDaySelection} />
          </TkCardBody>
        {/* </TkCard> */}
      </TkCol>
    </div>
  );
}

export default WorkingDays;
