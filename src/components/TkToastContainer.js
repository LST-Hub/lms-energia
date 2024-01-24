import React from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";

const convertToH6 = (message) => {
  return <h6 className="mb-0">{message}</h6>;
};

export function TkToastSuccess(message, options) {
  if (typeof message === "string") {
    message = convertToH6(message);
  }
  toast.success(message, {
    position: "top-center",
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options,
  });
}

export function TkToastError(message, options) {
  if (typeof message === "string") {
    message = convertToH6(message);
  }
  toast.error(message, {
    position: "top-center",
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options,
  });
}

export function TkToastWarning(message, options) {
  if (typeof message === "string") {
    message = convertToH6(message);
  }
  toast.warning(message, {
    position: "top-center",
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options,
  });
}

export function TkToastInfo(message, options) {
  if (typeof message === "string") {
    message = convertToH6(message);
  }
  toast.info(message, {
    position: "top-center",
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options,
  });
}

TkToastSuccess.propTypes = {
  message: PropTypes.oneOf([PropTypes.string, PropTypes.node]),
};

TkToastError.propTypes = {
  message: PropTypes.oneOf([PropTypes.string, PropTypes.node]),
};

TkToastWarning.propTypes = {
  message: PropTypes.oneOf([PropTypes.string, PropTypes.node]),
};

TkToastInfo.propTypes = {
  message: PropTypes.oneOf([PropTypes.string, PropTypes.node]),
};