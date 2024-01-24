import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import Image from "next/future/image";
import SearchOption from "./SearchOption";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";
import LightDark from "./LightDark";
import { AuthContext } from "../../../utils/Contexts";

//import images
import logoSm from "/public/images/logo-sm.png";
import logoDark from "/public/images/logo-dark.png";
import logoLight from "/public/images/logo-light.png";

const Header = (props) => {
  const [headerClass, setHeaderClass] = useState("");

  useEffect(() => {
    function scrollNavigation() {
      var scrollup = document.documentElement.scrollTop;
      if (scrollup > 50) {
        setHeaderClass("topbar-shadow");
      } else {
        setHeaderClass("");
      }
    }
    window.addEventListener("scroll", scrollNavigation);

    return () => {
      window.removeEventListener("scroll", scrollNavigation);
    };
  }, []);

  const toogleMenuBtn = () => {
    var windowSize = document.documentElement.clientWidth;

    if (windowSize > 767) document.querySelector(".hamburger-icon").classList.toggle("extend");
   

    //For collapse vertical menu
    if (document.documentElement.getAttribute("data-layout") === "vertical") {
      if (windowSize < 1025 && windowSize > 767) {
        document.body.classList.remove("vertical-sidebar-enable");
        document.documentElement.getAttribute("data-sidebar-size") === "sm"
          ? document.documentElement.setAttribute("data-sidebar-size", "")
          : document.documentElement.setAttribute("data-sidebar-size", "sm");
      } else if (windowSize > 1025) {
        document.body.classList.remove("vertical-sidebar-enable");
        document.documentElement.getAttribute("data-sidebar-size") === "lg"
          ? document.documentElement.setAttribute("data-sidebar-size", "sm")
          : document.documentElement.setAttribute("data-sidebar-size", "lg");
      } else if (windowSize <= 767) {
        document.body.classList.add("vertical-sidebar-enable");
        document.documentElement.setAttribute("data-sidebar-size", "lg");
      }
    }
  };

  return (
    <>
      <header id="page-topbar" className={headerClass}>
        <div className="layout-width">
          <div className="navbar-header">
            <div className="d-flex">
              <div className="navbar-brand-box horizontal-logo">
                <Link href="/">
                  <a className="logo logo-dark">
                    <span className="logo-sm">
                      <Image
                        src={logoSm}
                        alt="logo small"
                        // placeholder="blur"
                        height={22}
                        className="w-auto"
                      />
                      {/* <img src={logoSm} alt="" height="22" /> */}
                    </span>
                    <span className="logo-lg">
                      <Image src={logoDark} alt="logo small" placeholder="blur" height={17} className="w-auto" />
                      {/* <img src={logoDark} alt="" height="17" /> */}
                    </span>
                  </a>
                </Link>

                <Link href="/">
                  <a className="logo logo-light">
                    <span className="logo-sm">
                      <Image
                        src={logoSm}
                        alt="logo small"
                        // placeholder="blur"
                        height={22}
                        className="w-auto"
                      />
                      {/* <img src={logoSm} alt="" height="22" /> */}
                    </span>
                    <span className="logo-lg">
                      <Image src={logoLight} alt="logo small" placeholder="blur" height={17} className="w-auto" />
                      {/* <img src={logoLight} alt="" height="17" /> */}
                    </span>
                  </a>
                </Link>
              </div>

              <button
                onClick={toogleMenuBtn}
                type="button"
                className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger"
                id="topnav-hamburger-icon"
              >
                <span className="hamburger-icon">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>

              {/* <SearchOption /> */}
            </div>

            <div className="d-flex align-items-center">
              {/* Dropdown for Search Feild */}
              {/* <Dropdown
                isOpen={search}
                toggle={toogleSearch}
                className="d-md-none topbar-head-dropdown header-item"
              >
                <DropdownToggle
                  type="button"
                  tag="button"
                  className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
                >
                  <i className="bx bx-search fs-22"></i>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-lg dropdown-menu-end p-0">
                  <Form className="p-3">
                    <div className="form-group m-0">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search ..."
                          aria-label="Recipient's username"
                        />
                        <button className="btn btn-primary" type="submit">
                          <i className="mdi mdi-magnify"></i>
                        </button>
                      </div>
                    </div>
                  </Form>
                </DropdownMenu>
              </Dropdown> */}

              {/* LanguageDropdown */}
              {/* <LanguageDropdown /> */}

              {/* WebAppsDropdown */}
              {/* <WebAppsDropdown /> */}

              {/* MyCartDropdwon */}
              {/* <MyCartDropdown /> */}

              {/* FullScreenDropdown */}
              {/* <FullScreenDropdown /> */}

              {/* Dark/Light Mode set */}
              {/* <LightDark /> */}

              {/* NotificationDropdown */}
              {/* <NotificationDropdown /> */}

              {/* ProfileDropdown */}
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
