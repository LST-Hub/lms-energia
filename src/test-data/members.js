// Import Images
import smallImage1 from "/public/images/small/img-1.jpg";
import smallImage2 from "/public/images/small/img-2.jpg";
import smallImage3 from "/public/images/small/img-3.jpg";
import smallImage4 from "/public/images/small/img-4.jpg";
import smallImage5 from "/public/images/small/img-5.jpg";
import smallImage6 from "/public/images/small/img-6.jpg";
import smallImage7 from "/public/images/small/img-7.jpg";
import smallImage8 from "/public/images/small/img-8.jpg";
import smallImage9 from "/public/images/small/img-9.jpg";
import smallImage10 from "/public/images/small/img-10.jpg";
import smallImage11 from "/public/images/small/img-11.jpg";
import smallImage12 from "/public/images/small/img-12.jpg";

//User Images
import avatar1 from "/public/images/users/avatar-1.jpg";
import avatar2 from "/public/images/users/avatar-2.jpg";
import avatar3 from "/public/images/users/avatar-3.jpg";
import avatar5 from "/public/images/users/avatar-5.jpg";
import avatar4 from "/public/images/users/avatar-4.jpg";
import avatar6 from "/public/images/users/avatar-6.jpg";
import avatar7 from "/public/images/users/avatar-7.jpg";
import avatar8 from "/public/images/users/avatar-8.jpg";

const teamMembers = [
  {
    id: 1,
    backgroundImg: smallImage9,
    userImage: avatar2,
    name: "Nancy Martino",
    designation: "Team Leader & HR",
    projectCount: 225,
    taskCount: 197,
    type: "Employee",
    role: "Manager",
  },
  {
    id: 2,
    backgroundImg: smallImage12,
    userImage: null,
    userShortName: "HB",
    name: "Henry Baird",
    designation: "Full Stack Developer",
    projectCount: 352,
    taskCount: 376,
    bgColor: "light",
    textColor: "primary",
    type: "Employee",
    role: "Manager",
  },
  {
    id: 3,
    backgroundImg: smallImage11,
    userImage: avatar3,
    name: "Frank Hook",
    designation: "Project Manager",
    projectCount: 162,
    taskCount: 192,
    type: "Employee",
    role: "Manager",
  },
  {
    id: 4,
    backgroundImg: smallImage1,
    userImage: avatar8,
    name: "Jennifer Carter",
    designation: "UI/UX Designer",
    projectCount: 241,
    taskCount: 205,
    type: "Employee",
    role: "Manager",
  },
  {
    id: 5,
    backgroundImg: smallImage10,
    userImage: null,
    userShortName: "ME",
    name: "Megan Elmore",
    designation: "Team Leader & Web Developer",
    projectCount: 201,
    taskCount: 263,
    bgColor: "light",
    textColor: "primary",
    type: "Employee",
    role: "Manager",
  },
  {
    id: 6,
    backgroundImg: smallImage2,
    userImage: avatar4,
    name: "Alexis Clarke",
    designation: "Backend Developer",
    projectCount: 132,
    taskCount: 147,
    type: "Employee",
    role: "Manager",
  },
  {
    id: 7,
    backgroundImg: smallImage4,
    userImage: null,
    userShortName: "NC",
    name: "Nathan Cole",
    designation: "Front-End Developer",
    projectCount: 352,
    taskCount: 376,
    bgColor: "light",
    textColor: "primary",
    type: "Employee",
    role: "Manager",
  },
  {
    id: 8,
    backgroundImg: smallImage7,
    userImage: avatar6,
    name: "Joseph Parker",
    designation: "Full Stack Developer",
    projectCount: 64,
    taskCount: 93,
    type: "Employee",
    role: "Manager",
  },
  {
    id: 9,
    backgroundImg: smallImage3,
    userImage: avatar5,
    name: "Erica Kernan",
    designation: "Web Designer",
    projectCount: 345,
    taskCount: 298,
    type: "Employee",
    role: "Manager",
  },
  {
    id: 10,
    backgroundImg: smallImage5,
    userImage: null,
    userShortName: "DP",
    name: "Donald Palmer",
    designation: "Wed Developer",
    projectCount: 95,
    taskCount: 135,
    bgColor: "light",
    textColor: "primary",
    type: "Employee",
    role: "Manager",
  },
  {
    id: 11,
    backgroundImg: smallImage8,
    userImage: avatar7,
    name: "Jack Gough",
    designation: "React Js Developer",
    projectCount: 87,
    taskCount: 121,
    type: "Employee",
    role: "Manager",
  },
  {
    id: 12,
    backgroundImg: smallImage6,
    userImage: null,
    userShortName: "MW",
    name: "Marie Ward",
    designation: "Backend Developer",
    projectCount: 145,
    taskCount: 210,
    bgColor: "light",
    textColor: "primary",
    type: "Employee",
    role: "Manager",
  },
  {
    id: 1,
    backgroundImg: smallImage9,
    userImage: avatar2,
    name: "Nancy Martino",
    designation: "Team Leader & HR",
    projectCount: 225,
    taskCount: 197,
    type: "Employee",
    role: "Manager",
  },
  {
    id: 2,
    backgroundImg: smallImage12,
    userImage: null,
    userShortName: "HB",
    name: "Henry Baird",
    designation: "Full Stack Developer",
    projectCount: 352,
    taskCount: 376,
    bgColor: "light",
    textColor: "primary",
    type: "Employee",
    role: "Manager",
  },
  {
    id: 3,
    backgroundImg: smallImage11,
    userImage: avatar3,
    name: "Frank Hook",
    designation: "Project Manager",
    projectCount: 162,
    taskCount: 192,
    type: "Employee",
    role: "Manager",
  },
  {
    id: 4,
    backgroundImg: smallImage1,
    userImage: avatar8,
    name: "Jennifer Carter",
    designation: "UI/UX Designer",
    projectCount: 241,
    taskCount: 205,
    type: "Employee",
    role: "Manager",
  },
  {
    id: 5,
    backgroundImg: smallImage10,
    userImage: null,
    userShortName: "ME",
    name: "Megan Elmore",
    designation: "Team Leader & Web Developer",
    projectCount: 201,
    taskCount: 263,
    bgColor: "light",
    textColor: "primary",
    type: "Employee",
    role: "Manager",
  },
  {
    id: 6,
    backgroundImg: smallImage2,
    userImage: avatar4,
    name: "Alexis Clarke",
    designation: "Backend Developer",
    projectCount: 132,
    taskCount: 147,
    type: "Employee",
    role: "Manager",
  },
  {
    id: 7,
    backgroundImg: smallImage4,
    userImage: null,
    userShortName: "NC",
    name: "Nathan Cole",
    designation: "Front-End Developer",
    projectCount: 352,
    taskCount: 376,
    bgColor: "light",
    textColor: "primary",
    type: "Employee",
    role: "Manager",
  },
  {
    id: 8,
    backgroundImg: smallImage7,
    userImage: avatar6,
    name: "Joseph Parker",
    designation: "Full Stack Developer",
    projectCount: 64,
    taskCount: 93,
    type: "Employee",
    role: "Manager",
  },
  {
    id: 9,
    backgroundImg: smallImage3,
    userImage: avatar5,
    name: "Erica Kernan",
    designation: "Web Designer",
    projectCount: 345,
    taskCount: 298,
    type: "Employee",
    role: "Manager",
  },
  {
    id: 10,
    backgroundImg: smallImage5,
    userImage: null,
    userShortName: "DP",
    name: "Donald Palmer",
    designation: "Wed Developer",
    projectCount: 95,
    taskCount: 135,
    bgColor: "light",
    textColor: "primary",
    type: "Employee",
    role: "Manager",
  },
  {
    id: 11,
    backgroundImg: smallImage8,
    userImage: avatar7,
    name: "Jack Gough",
    designation: "React Js Developer",
    projectCount: 87,
    taskCount: 121,
    type: "Employee",
    role: "Manager",
  },
  {
    id: 12,
    backgroundImg: smallImage6,
    userImage: null,
    userShortName: "MW",
    name: "Marie Ward",
    designation: "Backend Developer",
    projectCount: 145,
    taskCount: 210,
    bgColor: "light",
    textColor: "primary",
    type: "Employee",
    role: "Manager",
  },
];

export { teamMembers };
