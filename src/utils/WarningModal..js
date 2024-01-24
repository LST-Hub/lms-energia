import PropTypes from "prop-types";
import React from "react";
import TkButton from "../components/TkButton";
import TkModal, { TkModalBody } from "../components/TkModal";

const WarningModal = ({ show, onOkClick, onCancelClick, loading, warnHeading, warnText, cancelBtnText, okBtnText }) => {
  return (
    <TkModal isOpen={show} toggle={onCancelClick} centered={true}>
      <TkModalBody className="py-3 px-5">
        <div className="mt-2 text-center">
          <svg width="80" height="80" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="none"
              stroke="#FFBD2E"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m12 3 10 18H2L12 3Zm0 6v6m0 1v2"
            />
          </svg>
          <div className="mt-3 fs-15">
            <h4>{warnHeading}</h4>
            <p className="text-muted mx-2 mb-0">{warnText}</p>
          </div>
        </div>
        <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
          <TkButton
            type="button"
            className="btn w-sm"
            data-bs-dismiss="modal"
            color="secondary"
            onClick={onCancelClick}
            disabled={loading}
          >
            {cancelBtnText ? cancelBtnText : "Cancel"}
          </TkButton>
          <TkButton type="button" color="primary" className="btn w-sm" onClick={onOkClick} loading={loading}>
            {okBtnText ? okBtnText : "Ok"}
          </TkButton>
        </div>
      </TkModalBody>
    </TkModal>
  );
};

WarningModal.propTypes = {
  onCancelClick: PropTypes.func,
  onOkClick: PropTypes.func,
  show: PropTypes.bool,
  warnHeading: PropTypes.string,
  warnText: PropTypes.string,
  cancelBtnText: PropTypes.string,
  okBtnText: PropTypes.string,
  loading: PropTypes.bool,
};

export default WarningModal;
