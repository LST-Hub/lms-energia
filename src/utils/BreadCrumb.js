import React from "react";
// import { Link } from 'react-router-dom';
import Link from "next/link";
import PropTypes from "prop-types";
import TkRow, { TkCol } from "../components/TkRow";
import TkButton from "../components/TkButton";

const checkURl = (str) => {
  // simple type checking if given string is a  url of our site
  return str && str.length > 0 && str.startsWith("/");
};

const BreadCrumb = ({ parentTitle, pageTitle, parentLink, buttonText, onButtonClick }) => {
  return (
    <>
      <TkRow>
        <TkCol xs={12}>
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            {/* <h4 className="mb-sm-0">{pageTitle}</h4> */}

            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                {checkURl(parentLink) && (
                  <li className="breadcrumb-item">
                    <Link href={parentLink}>
                      <a>{parentTitle}</a>
                    </Link>
                  </li>
                )}
                <li className="breadcrumb-item active">{pageTitle}</li>
              </ol>
            </div>
            {buttonText ? (
              <div>
                <TkButton color="primary" className="btn add-btn me-1" onClick={onButtonClick}>
                  <div className="d-flex">
                    <i className="ri-add-circle-fill fs-4 align-bottom me-1"></i>
                    <div className="d-flex align-items-center">{buttonText}</div>
                  </div>
                </TkButton>
              </div>
            ) : null}
          </div>
        </TkCol>
      </TkRow>
    </>
  );
};

BreadCrumb.propTypes = {
  title: PropTypes.string,
  pageTitle: PropTypes.string,
  parentLink: PropTypes.string,
  buttonText: PropTypes.string,
  onButtonClick: PropTypes.func,
};

export default BreadCrumb;
