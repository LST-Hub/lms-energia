import React from "react";
import TkRow, { TkCol } from "../TkRow";
import TkSelect from "../forms/TkSelect";
import { perDefinedProjectManagerRoleID } from "../../utils/Constants";
import useSessionData from "../../utils/hooks/useSessionData";

const tableSelectOptions = [{ label: "Leads", value: "leads" }];

const TopBar = ({ onTableChange }) => {
  const sessionData = useSessionData();
  const filteredOptions = tableSelectOptions.filter((option) => {
    if (sessionData?.user?.roleId === perDefinedProjectManagerRoleID) {
      return option.value !== "client" && option.value !== "user";
    }
    return true;
  });
  return (
    <>
      <TkRow>
        <TkCol xs={12}>
          <div className="page-title-box d-sm-flex align-items-center space-childern fs-small">
            <TkCol lg={3}>
              <TkSelect placeholder="Select Reports" options={filteredOptions} onChange={onTableChange} />
            </TkCol>
          </div>
        </TkCol>
      </TkRow>
    </>
  );
};

export default TopBar;
