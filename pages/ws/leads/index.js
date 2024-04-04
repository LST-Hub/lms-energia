// import React, { useEffect, useMemo, useState } from "react";
// import TkPageHead from "../../../src/components/TkPageHead";
// import BreadCrumb from "../../../src/utils/BreadCrumb";
// import { urls } from "../../../src/utils/Constants";
// import { useRouter } from "next/router";
// import { TkCardBody } from "../../../src/components/TkCard";
// import TkTableContainer from "../../../src/components/TkTableContainer";
// import TkRow, { TkCol } from "../../../src/components/TkRow";
// import TkContainer from "../../../src/components/TkContainer";
// import Link from "next/link";
// import TkButton from "../../../src/components/TkButton";
// import TkIcon from "../../../src/components/TkIcon";

// const tabs = {
//   directCall: "directCall",
//   email: "email",
//   socialMedia: "socialMedia",
//   portals: "portals",
//   directMarketing: "directMarketing",
//   // leadAssigning: "leadAssigning",
//   // leadNurutring: "leadNurutring",
// };

// function Leads() {
//   const [isClient, setIsClient] = useState(false);

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   const router = useRouter();

//   const handleButtonClick = () => {
//     console.log("handleButtonClick");
//     router.push(`${urls.leadAdd}`);
//   };

//   const columns = useMemo(
//     () => [
//       {
//         Header: " Edit",
//         accessor: "id",
//         filterable: false,
//         Cell: (cellProps) => {
//           return (
//             //   <div className="flex-grow-1 tasks_name">{cellProps.value}</div>
//             <div className="d-flex align-items-center">
//               {/* <ul className="ps-0 mb-0">
//                 <li className="list-inline-item">
//                   <Link href={`${urls.phoneCallView}/${cellProps.value}`}>
//                     <a>
//                       <TkButton color="none">
//                         <TkIcon className="ri-eye-fill align-bottom me-2 text-muted"></TkIcon>
//                       </TkButton>
//                     </a>
//                   </Link>
//                 </li>
//               </ul> */}

//               <ul className="ps-0 mb-0">
//                 <li className="list-inline-item">
//                   <Link href={`${urls.phoneCallAdd}`}>
//                     <a>
//                       <TkButton color="none">
//                         <TkIcon className="ri-edit-line fs-4 -fill align-bottom me-2 text-muted"></TkIcon>
//                       </TkButton>
//                     </a>
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//           );
//         },
//       },
//       {
//         Header: "Name",
//         accessor: "name",
//         filterable: false,
//         Cell: (cellProps) => {
//           return (
//             <>
//               <Link href={`${urls.leadAdd}/`}>
//                 <a className="fw-medium table-link text-primary">
//                   <div>{cellProps.value.length > 17 ? cellProps.value.substring(0, 17) + "..." : cellProps.value}</div>
//                 </a>
//               </Link>
//             </>
//           );
//         },
//       },
//       {
//         Header: "Company Name",
//         accessor: "companyName",
//         Cell: (cellProps) => {
//           return <div className="table-text">{cellProps.value}</div>;
//         },
//       },
//       {
//         Header: "Region",
//         accessor: "region",
//         Cell: (cellProps) => {
//           return <div className="table-text">{cellProps.value}</div>;
//         },
//       },
//       {
//         Header: "CR No",
//         accessor: "crNo",
//         Cell: (cellProps) => {
//           return <div className="table-text">{cellProps.value}</div>;
//         },
//       },
//     ],
//     []
//   );

//   const data = [
//     {
//       id: 1,
//       name: "John Doe",
//       companyName: "Company 1",
//       region: "Region 1",
//       crNo: "8754165110",
//     },
//     {
//       id: 2,
//       name: "Steave Smith",
//       companyName: "Company 2",
//       region: "Region 2",
//       crNo: "875418453",
//     },
//     {
//       id: 3,
//       name: "Will Smith",
//       companyName: "Company 3",
//       region: "Region 3",
//       crNo: "8754165110",
//     },
//     {
//       id: 4,
//       name: "Adam Miller",
//       companyName: "Company 4",
//       region: "Region 4",
//       crNo: "875418453",
//     },
//     {
//       id: 5,
//       name: "Tom Riddle",
//       companyName: "Company 5",
//       region: "Region 5",
//       crNo: "8754165110",
//     },
//   ];

//   return (
//     <div>
//       {isClient ? (
//         <>
//           <TkPageHead>
//             <title>{"Leads"}</title>
//           </TkPageHead>
//           <div className="page-content">
//             <BreadCrumb pageTitle="Leads" buttonText={"Add Lead"} onButtonClick={handleButtonClick} />
//             <TkContainer>
//               <TkRow>
//                 <TkCol lg={12}>
//                   <TkCardBody>
//                     <TkTableContainer
//                       columns={columns}
//                       data={data}
//                       defaultPageSize={10}
//                       customPageSize={true}
//                       showPagination={true}
//                       showSelectedRowCount={true}
//                     />
//                   </TkCardBody>
//                 </TkCol>
//               </TkRow>
//             </TkContainer>
//           </div>
//         </>
//       ) : null}
//     </div>
//   );
// }

// export default Leads;

// Leads.options = {
//   layout: true,
//   auth: false,
// };
