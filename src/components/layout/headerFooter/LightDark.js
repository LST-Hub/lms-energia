import React from "react";

// import { themeModeTypes } from "../index";

const themeModeTypes = {
  LIGHTMODE: "light",
  DARKMODE: "dark",
};

const LightDark = () => {
  //TODO: check local storage and prefers-color-scheme before setting default to light mode
  const [mode, setMode] = React.useState(themeModeTypes["LIGHTMODE"]);

  function changeHTMLAttribute(attribute, value) {
    if (document && document.documentElement)
      document.documentElement.setAttribute(attribute, value);
  }
  const changeThemeMode = () => {
    // if darkmode is selected then set mode variable to lightmode as on click we need to set theme mode to light
    // suppose user is in dark mode and when he click the icon he need to go in light mode
    // when it is dark mode we set mode variable to light mode so when user clicks the onclick event below in buton will set the mode to light
    if (mode === themeModeTypes["DARKMODE"]) {
      changeHTMLAttribute("data-layout-mode", themeModeTypes["LIGHTMODE"]);
      setMode(themeModeTypes["LIGHTMODE"]);
    } else {
      changeHTMLAttribute("data-layout-mode", themeModeTypes["DARKMODE"]);
      setMode(themeModeTypes["DARKMODE"]);
    }
  };
  return (
    <div className="ms-1 header-item d-none d-sm-flex">
      <button
        onClick={changeThemeMode}
        type="button"
        className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle light-dark-mode"
      >
        <i className="bx bx-moon fs-22"></i>
      </button>
    </div>
  );
};

export default LightDark;
