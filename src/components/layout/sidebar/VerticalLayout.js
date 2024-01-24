import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Collapse } from "reactstrap";
import sidebarOptions from "./LayoutMenuData";
import classNames from "classnames";
import TkIcon from "../../TkIcon";
import useSessionData from "../../../utils/hooks/useSessionData";

const VerticalLayout = ({ user }) => {
  const sessionData = useSessionData();
  const navData = sidebarOptions(user, sessionData);
  const router = useRouter();

  // useEffect(() => {
  //   const removeActivation = (items) => {
  //     let actiItems = items.filter((x) => x.classList.contains("active"));

  //     actiItems.forEach((item) => {
  //       if (item.classList.contains("menu-link")) {
  //         if (!item.classList.contains("active")) {
  //           item.setAttribute("aria-expanded", false);
  //         }
  //         if (item.nextElementSibling) {
  //           item.nextElementSibling.classList.remove("show");
  //         }
  //       }
  //       if (item.classList.contains("nav-link")) {
  //         if (item.nextElementSibling) {
  //           item.nextElementSibling.classList.remove("show");
  //         }
  //         item.setAttribute("aria-expanded", false);
  //       }
  //       item.classList.remove("active");
  //     });
  //   };

  //   function activateParentDropdown(item) {
  //     item.classList.add("active");
  //     let parentCollapseDiv = item.closest(".collapse.menu-dropdown");

  //     if (parentCollapseDiv) {
  //       // to set aria expand true remaining
  //       parentCollapseDiv.classList.add("show");
  //       parentCollapseDiv.parentElement.children[0].classList.add("active");
  //       parentCollapseDiv.parentElement.children[0].setAttribute("aria-expanded", "true");
  //       if (parentCollapseDiv.parentElement.closest(".collapse.menu-dropdown")) {
  //         parentCollapseDiv.parentElement.closest(".collapse").classList.add("show");
  //         if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling)
  //           parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.classList.add("active");
  //         if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse")) {
  //           parentCollapseDiv.parentElement
  //             .closest(".collapse")
  //             .previousElementSibling.closest(".collapse")
  //             .classList.add("show");
  //           parentCollapseDiv.parentElement
  //             .closest(".collapse")
  //             .previousElementSibling.closest(".collapse")
  //             .previousElementSibling.classList.add("active");
  //         }
  //       }
  //       return false;
  //     }
  //     return false;
  //   }

  //   // window.scrollTo({ top: 0, behavior: "smooth" });
  //   const initMenu = () => {
  //     const pathName = process.env.NEXT_PUBLIC_APP_NAME;
  //     const ul = document.getElementById("navbar-nav");
  //     const items = ul.getElementsByTagName("a");
  //     let itemsArray = [...items]; // converts NodeList to Array
  //     removeActivation(itemsArray);
  //     let matchingMenuItem = itemsArray.find((x) => {
  //       return x.pathname === pathName;
  //     });
  //     if (matchingMenuItem) {
  //       activateParentDropdown(matchingMenuItem);
  //     }
  //   };
  //   initMenu();
  // }, []);

  return (
    // TODO: add active clasname to link when user clicks it and remove active from other links
    <React.Fragment>
      {/* menu Items */}
      {(navData || []).map((item) => {
        return (
          <React.Fragment key={item.id}>
            {/* Main Header */}
            {/* {item["isHeader"] ? (
              <li className="menu-title">
                <span data-key="t-menu">{item.label} </span>
              </li>
            ) : item.subItems ? (
              <li className="nav-item">
                <Link href={item.link ? item.link : "/#"}>
                  <a onClick={item.click} className="nav-link menu-link" data-bs-toggle="collapse">
                    <i className={item.icon}></i>
                    <span data-key="t-apps">{item.label}</span>
                    {item.badgeName ? (
                      <span className={"badge badge-pill bg-" + item.badgeColor} data-key="t-new">
                        {item.badgeName}
                      </span>
                    ) : null}
                  </a>
                </Link>
                <Collapse className="menu-dropdown" isOpen={item.stateVariables} id="sidebarApps">
                  <ul className="nav nav-sm flex-column test">
                    {item.subItems &&
                      (item.subItems || []).map((subItem, key) => (
                        <React.Fragment key={key}>
                          {!subItem.isChildItem ? (
                            <li className="nav-item">
                              <Link href={subItem.link ? subItem.link : "/#"}>
                                <a className="nav-link">
                                  {subItem.label}
                                  {subItem.badgeName ? (
                                    <span
                                      className={"badge badge-pill bg-" + subItem.badgeColor}
                                      data-key="t-new"
                                    >
                                      {subItem.badgeName}
                                    </span>
                                  ) : null}
                                </a>
                              </Link>
                            </li>
                          ) : (
                            <li className="nav-item">
                              <Link href="/#">
                                <a
                                  onClick={subItem.click}
                                  className="nav-link"
                                  data-bs-toggle="collapse"
                                >
                                  {" "}
                                  {subItem.label}
                                </a>
                              </Link>
                              <Collapse
                                className="menu-dropdown"
                                isOpen={subItem.stateVariables}
                                id="sidebarEcommerce"
                              >
                                <ul className="nav nav-sm flex-column">
                                  {subItem.childItems &&
                                    (subItem.childItems || []).map((childItem, key) => (
                                      <React.Fragment key={key}>
                                        {!childItem.childItems ? (
                                          <li className="nav-item">
                                            <Link href={childItem.link ? childItem.link : "/#"}>
                                              <a className="nav-link">{childItem.label}</a>
                                            </Link>
                                          </li>
                                        ) : (
                                          <li className="nav-item">
                                            <Link href="/#">
                                              <a
                                                className="nav-link"
                                                onClick={childItem.click}
                                                data-bs-toggle="collapse"
                                              >
                                                {childItem.label}
                                              </a>
                                            </Link>
                                            <Collapse
                                              className="menu-dropdown"
                                              isOpen={childItem.stateVariables}
                                              id="sidebaremailTemplates"
                                            >
                                              <ul className="nav nav-sm flex-column">
                                                {childItem.childItems.map((subChildItem, key) => (
                                                  <li className="nav-item" key={key}>
                                                    <Link href={subChildItem.link}>
                                                      <a
                                                        className="nav-link"
                                                        data-key="t-basic-action"
                                                      >
                                                        {subChildItem.label}{" "}
                                                      </a>
                                                    </Link>
                                                  </li>
                                                ))}
                                              </ul>
                                            </Collapse>
                                          </li>
                                        )}
                                      </React.Fragment>
                                    ))}
                                </ul>
                              </Collapse>
                            </li>
                          )}
                        </React.Fragment>
                      ))}
                  </ul>
                </Collapse>
              </li>
            ) : ( */}
            <li className="nav-item" style={{ marginTop: "0.1rem", marginBottom: "0.1rem" }} id="nav-item">
              <Link href={item.link ? item.link : "/#"}>
                <a
                  className={classNames("nav-link menu-link", {
                    active: `${router.pathname}/`.startsWith(`${item.link}/`),
                  })}
                >
                  <TkIcon className={item.icon}></TkIcon>
                  <span className="vertical_layout ms-2">{item.label}</span>
                  {item.badgeName ? (
                    <span className={"badge badge-pill bg-" + item.badgeColor} data-key="t-new">
                      {item.badgeName}
                    </span>
                  ) : null}
                </a>
              </Link>
            </li>
            {/* )} */}
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
};

export default VerticalLayout;
