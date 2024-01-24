import React, { useEffect, useState } from "react";

//import Components
import Header from "./headerFooter/Header";
import Sidebar from "./sidebar/index";
import Footer from "./headerFooter/Footer";
// import RightSidebar from '../Components/Common/RightSidebar';

//import actions
// import {
//   changeLayout,
//   changeSidebarTheme,
//   changeLayoutMode,
//   changeLayoutWidth,
//   changeLayoutPosition,
//   changeTopbarTheme,
//   changeLeftsidebarSizeType,
//   changeLeftsidebarViewType,
//   changeSidebarImageType,
// } from "../store/actions";

//redux
// import { useSelector, useDispatch } from "react-redux";


const Layout = (props) => {
  //   const dispatch = useDispatch();
  //   const {
  //     layoutType,
  //     leftSidebarType,
  //     layoutModeType,
  //     layoutWidthType,
  //     layoutPositionType,
  //     topbarThemeType,
  //     leftsidbarSizeType,
  //     leftSidebarViewType,
  //     leftSidebarImageType,
  //   } = useSelector((state) => ({
  //     layoutType: state.Layout.layoutType,
  //     leftSidebarType: state.Layout.leftSidebarType,
  //     layoutModeType: state.Layout.layoutModeType,
  //     layoutWidthType: state.Layout.layoutWidthType,
  //     layoutPositionType: state.Layout.layoutPositionType,
  //     topbarThemeType: state.Layout.topbarThemeType,
  //     leftsidbarSizeType: state.Layout.leftsidbarSizeType,
  //     leftSidebarViewType: state.Layout.leftSidebarViewType,
  //     leftSidebarImageType: state.Layout.leftSidebarImageType,
  //   }));

  /*
    layout settings
    */
  //   useEffect(() => {
  //     if (
  //       layoutType ||
  //       leftSidebarType ||
  //       layoutModeType ||
  //       layoutWidthType ||
  //       layoutPositionType ||
  //       topbarThemeType ||
  //       leftsidbarSizeType ||
  //       leftSidebarViewType ||
  //       leftSidebarImageType
  //     ) {
  //       dispatch(changeLeftsidebarViewType(leftSidebarViewType));
  //       dispatch(changeLeftsidebarSizeType(leftsidbarSizeType));
  //       dispatch(changeSidebarTheme(leftSidebarType));
  //       dispatch(changeLayoutMode(layoutModeType));
  //       dispatch(changeLayoutWidth(layoutWidthType));
  //       dispatch(changeLayoutPosition(layoutPositionType));
  //       dispatch(changeTopbarTheme(topbarThemeType));
  //       dispatch(changeLayout(layoutType));
  //       dispatch(changeSidebarImageType(leftSidebarImageType));
  //     }
  //   }, [
  //     layoutType,
  //     leftSidebarType,
  //     layoutModeType,
  //     layoutWidthType,
  //     layoutPositionType,
  //     topbarThemeType,
  //     leftsidbarSizeType,
  //     leftSidebarViewType,
  //     leftSidebarImageType,
  //     dispatch,
  //   ]);
  /*
    call dark/light mode
    */

  // class add remove in header

  // console.log('Layout rerendered')

  return (
    <>
      <div id="layout-wrapper">
        <Header />
        <Sidebar />
        <div className="main-content">
          {props.children}
          {/* <Footer /> */}
        </div>
      </div>
      {/* <RightSidebar /> */}
    </>
  );
};

export default Layout;
