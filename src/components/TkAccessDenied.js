import React from "react";
import { FormErrorBox } from "./forms/ErrorText";

function TkAccessDenied() {
  return <FormErrorBox errMessage={"You don't have permission to access to this page"} />;
}

export default TkAccessDenied;
