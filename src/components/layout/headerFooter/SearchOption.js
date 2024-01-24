import React, { useEffect, useState } from "react";
import Image from "next/future/image";
import Link from "next/link";
import { Input } from "reactstrap";

//SimpleBar
import SimpleBar from "simplebar-react";

//import images
import image2 from "/public/images/users/avatar-2.jpg";
import image3 from "/public/images/users/avatar-3.jpg";
import image5 from "/public/images/users/avatar-5.jpg";

const SearchOption = () => {
  const [value, setValue] = useState("");
  const onChangeData = (value) => {
    setValue(value);
  };

  useEffect(() => {
    var searchOptions = document.getElementById("search-close-options");
    var dropdown = document.getElementById("search-dropdown");
    var searchInput = document.getElementById("search-options");

    searchInput.addEventListener("focus", function () {
      var inputLength = searchInput.value.length;
      if (inputLength > 0) {
        dropdown.classList.add("show");
        searchOptions.classList.remove("d-none");
      } else {
        dropdown.classList.remove("show");
        searchOptions.classList.add("d-none");
      }
    });

    searchInput.addEventListener("keyup", function () {
      var inputLength = searchInput.value.length;
      if (inputLength > 0) {
        dropdown.classList.add("show");
        searchOptions.classList.remove("d-none");
      } else {
        dropdown.classList.remove("show");
        searchOptions.classList.add("d-none");
      }
    });

    searchOptions.addEventListener("click", function () {
      searchInput.value = "";
      dropdown.classList.remove("show");
      searchOptions.classList.add("d-none");
    });

    document.body.addEventListener("click", function (e) {
      if (e.target.getAttribute("id") !== "search-options") {
        dropdown.classList.remove("show");
        searchOptions.classList.add("d-none");
      }
    });
  }, []);

  return (
    <>
      <form className="app-search d-none d-md-block">
        <div className="position-relative">
          <Input
            type="text"
            className="form-control"
            placeholder="Search..."
            id="search-options"
            value={value}
            onChange={(e) => {
              onChangeData(e.target.value);
            }}
          />
          <span className="mdi mdi-magnify search-widget-icon"></span>
          <span
            className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none"
            id="search-close-options"
          ></span>
        </div>
        <div className="dropdown-menu dropdown-menu-lg" id="search-dropdown">
          <SimpleBar style={{ height: "320px" }}>
            <div className="dropdown-header">
              <h6 className="text-overflow text-muted mb-0 text-uppercase">
                Recent Searches
              </h6>
            </div>

            <div className="dropdown-item bg-transparent text-wrap">
              <Link href="/">
                <a className="btn btn-soft-secondary btn-sm btn-rounded">
                  how to setup <i className="mdi mdi-magnify ms-1"></i>
                </a>
              </Link>
              <Link href="/">
                <a className="btn btn-soft-secondary btn-sm btn-rounded">
                  buttons <i className="mdi mdi-magnify ms-1"></i>
                </a>
              </Link>
            </div>

            <div className="dropdown-header mt-2">
              <h6 className="text-overflow text-muted mb-1 text-uppercase">
                Pages
              </h6>
            </div>

            <Link href="#">
              <a className="dropdown-item notify-item">
                <i className="ri-bubble-chart-line align-middle fs-18 text-muted me-2"></i>
                <span>Analytics Dashboard</span>
              </a>
            </Link>

            <Link href="#">
              <a className="dropdown-item notify-item">
                <i className="ri-lifebuoy-line align-middle fs-18 text-muted me-2"></i>
                <span>Help Center</span>
              </a>
            </Link>

            <Link href="#">
              <a className="dropdown-item notify-item">
                <i className="ri-user-settings-line align-middle fs-18 text-muted me-2"></i>
                <span>My account settings</span>
              </a>
            </Link>

            <div className="dropdown-header mt-2">
              <h6 className="text-overflow text-muted mb-2 text-uppercase">
                Users
              </h6>
            </div>

            <div className="notification-list">
              <Link href="#">
                <a className="dropdown-item notify-item py-2">
                  <div className="d-flex">
                    <Image
                      src={image2}
                      //   height={17}
                      layout="responsive"
                      placeholder="blur"
                      className="w-auto me-3 rounded-circle avatar-xs"
                      alt="user-pic"
                    />
                    <div className="flex-1">
                      <h6 className="m-0">Angela Bernier</h6>
                      <span className="fs-11 mb-0 text-muted">Manager</span>
                    </div>
                  </div>
                </a>
              </Link>

              <Link href="#">
                <a className="dropdown-item notify-item py-2">
                  <div className="d-flex">
                  <Image 
                        src={image3}
                        layout="responsive"
                        placeholder="blur"
                        className="w-auto me-3 rounded-circle avatar-xs"
                        alt="user-pic"
                  />
                    {/* <img
                      src={image3}
                      className="me-3 rounded-circle avatar-xs"
                      alt="user-pic"
                    /> */}
                    <div className="flex-1">
                      <h6 className="m-0">David Grasso</h6>
                      <span className="fs-11 mb-0 text-muted">
                        Web Designer
                      </span>
                    </div>
                  </div>
                </a>
              </Link>

              <Link href="#">
                <a className="dropdown-item notify-item py-2">
                  <div className="d-flex">
                  <Image 
                        src={image5}
                        layout="responsive"
                        placeholder="blur"
                        className="w-auto me-3 rounded-circle avatar-xs"
                        alt="user-pic"
                  />
                    {/* <img
                      src={image5}
                      className="me-3 rounded-circle avatar-xs"
                      alt="user-pic"
                    /> */}
                    <div className="flex-1">
                      <h6 className="m-0">Mike Bunch</h6>
                      <span className="fs-11 mb-0 text-muted">
                        React Developer
                      </span>
                    </div>
                  </div>
                </a>
              </Link>
            </div>
          </SimpleBar>

          <div className="text-center pt-3 pb-1">
            <Link href="/pages-search-results">
              <a className="btn btn-primary btn-sm">
                View All Results <i className="ri-arrow-right-line ms-1"></i>
              </a>
            </Link>
          </div>
        </div>
      </form>
    </>
  );
};

export default SearchOption;
