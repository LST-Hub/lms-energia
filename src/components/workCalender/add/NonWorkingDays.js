import React, { useMemo } from "react";

import TkButton from "../../TkButton";
import { TkCol } from "../../TkRow";
import { TkCardBody } from "../../TkCard";
import TkTableContainer from "../../TkTableContainer";
import { formatDate } from "../../../utils/date";
import HeaderForm from "../nonWorkingDayHeader";
import { UncontrolledTooltip } from "reactstrap";

function NonWorkingDays({ nonWorkDays, setNonWorkDays }) {
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
              onClick={() => {
                const newdays = nonWorkDays.filter((d) => d.date !== cellProps.row.original.date);
                setNonWorkDays(newdays);
              }}
            >
              Delete
            </TkButton>
          );
        },
      },
    ],
    [nonWorkDays, setNonWorkDays]
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
    const newdays = [...nonWorkDays, { date: formatDate(date), description: description }];
    setNonWorkDays(newdays);
  };

  return (
    <div className="row justify-content-center">
      <TkCol>
        {/* <TkCard id="tasksList"> */}
        <HeaderForm addNonWorkDay={addNonWorkDay} checkExistingDate={checkExistingDate} />
        <TkCardBody className="table-padding pt-0">
          {nonWorkDays.length ? <TkTableContainer columns={columns} data={nonWorkDays} /> : null}
        </TkCardBody>
        {/* </TkCard> */}
      </TkCol>
    </div>
  );
}

export default NonWorkingDays;
