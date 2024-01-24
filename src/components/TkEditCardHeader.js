import React, { useState } from "react";
import PropTypes from "prop-types";
import { TkCardHeader } from "./TkCard";
import TkRow, { TkCol } from "./TkRow";
import TkIcon from "./TkIcon";
import { TkDropdownItem, TkDropdownMenu, TkDropdownToggle, TkUncontrolledDropdown } from "./TkDropdown";
import TkButton from "./TkButton";
import { useRouter } from "next/router";
import { perAccessIds } from "../../DBConstants";

export default function TkEditCardHeader({ title, onDeleteClick, isEditAccess, disableDelete, editLink,toggleDeleteModel}) {
  const router = useRouter();
  
  return (
    <TkCardHeader className="fs-5">
      <TkRow className="justify-content-between align-items-center tk-card-header">
        <TkCol xs={true} lg={10}>
          <h3>{title}</h3>
        </TkCol>
        <TkCol xs={true} lg={2} className="d-flex align-items-center justify-content-end gap-3">
          {/* we have checked active == false and not !active as initally active comes as undefined,and it shows a inctiive though user may be active */}
          {/* {active === false ? (
            <span className="badge badge-soft-danger rounded-pill text-uppercase">{`Inactive`}</span>
          ) : null} */}
          {isEditAccess ? (
            <TkButton color="primary" onClick={() => router.push(editLink)} type="button">
              Edit
            </TkButton>
          ) : onDeleteClick && (
            <TkUncontrolledDropdown direction="start" className="text-end">
              <TkDropdownToggle tag="a" id="dropdownMenuLink2" role="button">
                <TkIcon className="ri-more-fill fs-4"></TkIcon>
              </TkDropdownToggle>
              <TkDropdownMenu>
                {/* <TkDropdownItem onClick={onActiveClick} disabled={disableActive} className="edit-list">
                <TkIcon className="ri-indeterminate-circle-line me-2 align-bottom text-muted"></TkIcon>
                {active ? "Inactive" : "Active"}
              </TkDropdownItem> */}
                <TkDropdownItem onClick={toggleDeleteModel} disabled={disableDelete} className="edit-list">
                  <TkIcon className="ri-delete-bin-line me-2 align-bottom text-muted"></TkIcon>
                  {"Delete"}
                </TkDropdownItem>
              </TkDropdownMenu>
            </TkUncontrolledDropdown>
          )}
        </TkCol>
      </TkRow>
    </TkCardHeader>
  );
}

TkEditCardHeader.propTypes = {
  title: PropTypes.string,
  status: PropTypes.bool,
  onActiveClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
};
