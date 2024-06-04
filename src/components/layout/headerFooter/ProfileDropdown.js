import React, { useState, useEffect } from "react";
import Image from "next/future/image";
import Link from "next/link";

import {
  TkDropdown,
  TkDropdownItem,
  TkDropdownMenu,
  TkDropdownToggle,
} from "../../TkDropdown";
import { signOut } from "next-auth/react";
import useGlobalStore from "../../../utils/globalStore";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, RQ, urls } from "../../../utils/Constants";
import tkFetch from "../../../utils/fetch";
import { DropdownItem } from "reactstrap";
import { useRouter } from "next/router";

const themeModeTypes = {
  LIGHTMODE: "light",
  DARKMODE: "dark",
};

const ProfileDropdown = () => {
  const [setUserAuthenticated, setUserSessionData] = useGlobalStore((state) => [
    state.setUserAuthenticated,
    state.setUserSessionData,
  ]);
  //Dropdown Toggle
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);
  const [user, setUser] = useState({});
  const [email, setEmail] = useState("");
  const toggleProfileDropdown = () => {
    setIsProfileDropdown(!isProfileDropdown);
  };
  const [userId, setUserId] = useState(null);

  const router = useRouter();

  // const { data, isLoading, isError, error } = useQuery({
  //   queryKey: [RQ.profileData],
  //   queryFn: tkFetch.get(`${API_BASE_URL}/profile?email=${email}`),
  // });

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const storedId = window.localStorage.getItem("internalid");
      setUserId(storedId);
    }
  }, []);

  const { data, isFetched, isLoading, isError, error } = useQuery({
    queryKey: [RQ.profileData],
    queryFn: tkFetch.get(`${API_BASE_URL}/profile?userId=${userId}`),
    enabled: !!userId,
  });
  // if(isFetched){
  //   console.log("data", data);
  // }

  // console.log("data", data.list[0]);

  // useEffect(() => {
  //   if (Array.isArray(data) && data.length > 0) {
  //     setUser(data[0]);
  //   }
  // }, [data]);

  //change theme mode
  // const [mode, setMode] = React.useState(themeModeTypes["LIGHTMODE"]);

  // function changeHTMLAttribute(attribute, value) {
  //   if (document && document.documentElement) document.documentElement.setAttribute(attribute, value);
  // }
  // const changeThemeMode = () => {
  //   // if darkmode is selected then set mode variable to lightmode as on click we need to set theme mode to light
  //   // suppose user is in dark mode and when he click the icon he need to go in light mode
  //   // when it is dark mode we set mode variable to light mode so when user clicks the onclick event below in buton will set the mode to light
  //   if (mode === themeModeTypes["DARKMODE"]) {
  //     changeHTMLAttribute("data-layout-mode", themeModeTypes["LIGHTMODE"]);
  //     setMode(themeModeTypes["LIGHTMODE"]);
  //   } else {
  //     changeHTMLAttribute("data-layout-mode", themeModeTypes["DARKMODE"]);
  //     setMode(themeModeTypes["DARKMODE"]);
  //   }
  // };

  const logout = async () => {
    localStorage.removeItem("email");
    localStorage.removeItem("password");
    router.push(`${urls.login} `);
  };

  const signOutHandler = async () => {
    setUserAuthenticated(false);
    setUserSessionData(null);
    // dont keep redirect to false, as it creates a problem currently
    // if we keep redirect redirect to false, it dont refresh the tab and setuserauthenticated cals with false, this rerender the Auth Component in _app.js,
    // and useSession hooks returns the cached version of session, though user gets logged out.
    // so we need to refresh the page and take user to login screen
    //TODO: its a workarounnd but later may find some other solution
    await signOut({ callbackUrl: `${urls.login}` });
  };
  return (
    <>
      {/* {!isLoading && !isError && ( */}
      <TkDropdown
        isOpen={isProfileDropdown}
        toggle={toggleProfileDropdown}
        className="ms-sm-3 header-item topbar-user"
      >
        {/* show the first name & last name and user role name */}
        {/* <div className="d-flex align-items-center">
            <span className="text-start ms-xl-2">
              <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">{user?.role?.name}</span>
            </span>
          </div> */}

        <TkDropdownToggle tag="button" type="button" className="btn">
          <span className="d-flex align-items-center">
            <span className="text-start ms-xl-2">
              <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
                {/* {data?.list[0]?.values?.entityid}  */}
                {data &&
                  data.list &&
                  data.list.length > 0 &&
                  data.list[0].values &&
                  data.list[0].values.entityid + " " + data.list[0].values.firstname + " " + data.list[0].values.middlename + " " + data.list[0].values.lastname}
              </span>
              <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">
                {/* { data?.list[0]?.values?.custentity_lms_roles[0].text} */}
                {data &&
                  data.list &&
                  data.list.length > 0 &&
                  data.list[0].values &&
                  data.list[0].values.custentity_lms_roles[0].text}
              </span>
            </span>
          </span>
        </TkDropdownToggle>
        <TkDropdownMenu className="dropdown-menu-end">
          <Link href={`${urls.profileView}`}>
            <a>
              <TkDropdownItem>
                <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
                <span className="align-middle">Profile</span>
              </TkDropdownItem>
            </a>
          </Link>
          {/* <TkDropdownItem onClick={changeThemeMode}>
            <div>
              {mode === themeModeTypes["DARKMODE"] ? (
                <>
                  <i className="bx bx-sun text-muted fs-16 align-middle me-1"></i>
                  <span className="align-middle">Light Mode</span>
                </>
              ) : (
                <>
                  <i className="bx bx-moon text-muted fs-16 align-middle me-1"></i>
                  <span className="align-middle">Dark Mode</span>
                </>
              )}
            </div>
          </TkDropdownItem> */}
          {/* <DropdownItem href="/apps-chat">
            <i className="mdi mdi-message-text-outline text-muted fs-16 align-middle me-1"></i>{" "}
            <span className="align-middle">Messages</span>
          </DropdownItem> */}
          {/* <DropdownItem href="#">
            <i className="mdi mdi-calendar-check-outline text-muted fs-16 align-middle me-1"></i>{" "}
            <span className="align-middle">Taskboard</span>
          </DropdownItem> */}
          {/* <Link href={`${urls.help}`}>
            <a>
              <TkDropdownItem>
                <i className="mdi mdi-lifebuoy text-muted fs-16 align-middle me-1"></i>{" "}
                <span className="align-middle">Help</span>
              </TkDropdownItem>
            </a>
          </Link> */}
          {/* <div className="dropdown-divider"></div> */}
          {/* <DropdownItem href="/pages-profile">
            <i className="mdi mdi-wallet text-muted fs-16 align-middle me-1"></i>{" "}
            <span className="align-middle">
              Balance : <b>$5971.67</b>
            </span>
          </DropdownItem> */}
          {/* <DropdownItem href="/pages-profile-settings">
            <span className="badge bg-soft-success text-success mt-1 float-end">New</span>
            <i className="mdi mdi-cog-outline text-muted fs-16 align-middle me-1"></i>{" "}
            <span className="align-middle">Settings</span>
          </DropdownItem> */}
          {/* <DropdownItem href="/auth-lockscreen-basic">
            <i className="mdi mdi-lock text-muted fs-16 align-middle me-1"></i>{" "}
            <span className="align-middle">Lock screen</span>
          </DropdownItem> */}
          {/* <Link href="/login">
            <a> */}
          <TkDropdownItem onClick={logout}>
            <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>{" "}
            <span className="align-middle" data-key="t-logout">
              Logout
            </span>
          </TkDropdownItem>
          {/* </a>
          </Link> */}
        </TkDropdownMenu>
      </TkDropdown>
      {/* )} */}
    </>
  );
};

export default ProfileDropdown;
