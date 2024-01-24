import React, { useContext, useEffect } from "react";
import Link from "next/link";
import Image from "next/future/image";
import SimpleBar from "simplebar-react";

//import logo
// import logoSm from "/public/images/logo-sm.png";
import logoSm from "/public/images/tasksprint-logo.png";
import logoDark from "/public/images/logo-dark.png";
import logoLight from "/public/images/logo-light.png";

//Import Components
import VerticalLayout from "./VerticalLayout";
import { Container } from "reactstrap";
import { AuthContext } from "../../../utils/Contexts";
import { urls } from "../../../utils/Constants";

const Sidebar = () => {
  const sessionData = useContext(AuthContext);

  useEffect(() => {
    var verticalOverlay = document.getElementsByClassName("vertical-overlay");
    if (verticalOverlay) {
      verticalOverlay[0].addEventListener("click", function () {
        document.body.classList.remove("vertical-sidebar-enable");
      });
    }
  }, []);

  const addEventListenerOnSmHoverMenu = () => {
    // add listener Sidebar Hover icon on change layout from setting
    if (document.documentElement.getAttribute("data-sidebar-size") === "sm-hover") {
      document.documentElement.setAttribute("data-sidebar-size", "sm-hover-active");
    } else {
      document.documentElement.setAttribute("data-sidebar-size", "sm-hover");
    }
  };

  return (
    <>
      <div className="app-menu navbar-menu">
        <div className="navbar-brand-box">
          {/* <Link href="/dashboard">
            <a className="logo logo-dark">
              <span className="logo-sm">
                <Image
                  src={logoSm}
                  height={22}
                  //   width={120}
                  placeholder="blur"
                  className="w-auto"
                  // layout="responsive"
                  alt="logo"
                />
              </span>
              <span className="logo-lg">
                <h3 className="mt-4 mb-4">{process.env.NEXT_PUBLIC_APP_NAME}</h3>
              </span>
            </a>
          </Link> */}

          <Link href={`${urls.dashboard}`}>
            <a className="logo logo-light">
              <span className="logo-sm">
                <Image
                  src={logoSm}
                  height={22}
                  //   width={120}
                  // placeholder="blur"
                  className="w-auto"
                  // layout="responsive"
                  alt="logo light"
                />
              </span>
              <span className="animate-container logo-lg">
                <div className="animate">
                  {/* <span className="first fs-1">
                    <Image
                      src={logoSm}
                      height={22}
                      //   width={120}
                      // placeholder="blur"
                      className="w-auto"
                      // layout="responsive"
                      alt="logo light"
                    />
                  </span>{" "} */}
                  <span className="slide">
                    <h3 className="second mt-4 mb-4 logo-text fs-3">{process.env.NEXT_PUBLIC_APP_NAME}</h3>
                  </span>
                </div>
              </span>
            </a>
          </Link>
          <button
            onClick={addEventListenerOnSmHoverMenu}
            type="button"
            className="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover"
            id="vertical-hover"
          >
            <i className="ri-record-circle-line"></i>
          </button>
        </div>
        <>
          <SimpleBar id="scrollbar" className="h-100">
            <Container fluid>
              <div id="two-column-menu"></div>
              <ul className="navbar-nav" id="navbar-nav">
                <VerticalLayout user={sessionData.user} />
              </ul>
            </Container>
          </SimpleBar>
          <div className="sidebar-background"></div>
        </>
      </div>
      <div className="vertical-overlay"></div>
    </>
  );
};

export default Sidebar;
