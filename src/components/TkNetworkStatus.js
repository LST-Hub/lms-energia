import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { TkToastError } from "./TkToastContainer";

export default function TkNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState(true);

  useEffect(() => {
    function changeStatus() {
      setNetworkStatus(navigator.onLine);
    }
    window.addEventListener("online", changeStatus);
    window.addEventListener("offline", changeStatus);
    return () => {
      window.removeEventListener("online", changeStatus);
      window.removeEventListener("offline", changeStatus);
    };
  }, []);

  if (!networkStatus) {
    TkToastError("Internet Connection Lost", {
      autoClose: false,
      hideProgressBar: true,
      closeOnClick: true,
    });
  }

  return <></>;
}

