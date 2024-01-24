import { createTransport } from "nodemailer";
import { getProjectPMEmail, getUserNameFromId } from "./backendUtils";
import { convertSecToTime } from "../src/utils/time";

export default async function sendEmail({ name, email, subject, txt, html }) {
  const transporter = createTransport({
    // service: process.env.EMAIL_SERVER_SERVICE,
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    secure: process.env.EMAIL_SERVER_SECURE, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER, // generated ethereal user
      pass: process.env.EMAIL_SERVER_PASSWORD, // generated ethereal password
    },
  });
  // transporter.verify(function (error, success) {
  //   if (error) {
  //     console.error(error, "unable to verify email server");
  //     throw new Error("unable to verify email server");
  //   }
  // });

  /// if error is thrown while sendign email then should be cached in upper function who called this function
  const status = await transporter.sendMail({
    from: `"${name}" <${process.env.EMAIL_FROM}>`, // sender address
    to: email, // list of receivers
    subject: subject, // Subject line
    text: txt, // plain text body
    html: html, // html body
  });
}

const sendTimeApprovalEmail = async ({
  projectId,
  userId,
  workspaceId,
  multiple,
  projectIds,
  isTimesheet,
  isTodaytask,
  totalHrs,
  timeEntryData,
}) => {
  try {
    if (multiple) {
      projectIds = [...new Set(projectIds)];
      if (!Array.isArray(projectIds)) throw new Error("projectIds should be array");
      const name = await getUserNameFromId(userId, workspaceId);
      const uniqueEmails = [];
      projectIds.forEach(async (projectId) => {
        const email = await getProjectPMEmail(projectId, workspaceId);
        if (email && name && !uniqueEmails.includes(email)) {
          uniqueEmails.push(email);
          sendEmail({
            name: "Info",
            email: email,
            subject: `${isTodaytask ? "Today's Task" : "Timesheet"} : ${name}, Total Hrs: ${totalHrs} hrs`,
            txt: `${name} Submitted ${isTodaytask ? "Today's Task" : "Timesheet"}. You can approve or reject it from ${
              process.env.APP_NAME
            }.`,
            html: timesheetEmailHtml({ name, isTimesheet, isTodaytask, totalHrs, timeEntryData }),
          });
        }
      });
      return;
    }
    const email = await getProjectPMEmail(projectId, workspaceId);
    const name = await getUserNameFromId(userId, workspaceId);
    if (email && name) {
      sendEmail({
        name: "Info",
        email: email,
        subject: `${isTodaytask ? "Today's Task" : "Timesheet"} : ${name}, Total Hrs: ${totalHrs} hrs`,
        txt: `${name} Submitted ${isTodaytask ? "Today's Task" : "Timesheet"}. You can approve or reject it from ${
          process.env.APP_NAME
        }.`,
        html: timesheetEmailHtml({ name, isTimesheet, isTodaytask, totalHrs, timeEntryData }),
      });
    }
  } catch (e) {
    //TODO: send this error to error reporting, that we are not able to send email, and pass projectId and userId for extra info
    console.error("error in sendTimeApprovalEmail", e);
  }
};

export { sendTimeApprovalEmail };

// function timesheetEmailHtml({ name, isTimesheet, isTodaytask, data }) {
//   const brandColor = "#346df1";
//   const buttonText = "#fff";

//   const color = {
//     background: "#f9f9f9",
//     text: "#444",
//     mainBackground: "#fff",
//     buttonBackground: brandColor,
//     buttonBorder: brandColor,
//     buttonText,
//   };

//   return `
//   <body style="background: ${color.background};">
//     <table width="100%" border="0" cellspacing="20" cellpadding="0"
//       style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
//       <tr>
//         <td align="center"
//           style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
//            <strong>${name} submitted ${isTodaytask ? "Today's Task" : "Timesheet"}. You can Approve or reject it on ${
//     process.env.APP_NAME
//   }</strong>
//   </td>
//       </tr>
//     </table>
//   </body>
//   `;
// }

function timesheetEmailHtml({ name, isTimesheet, isTodaytask, totalHrs, timeEntryData }) {
  const brandColor = "#007bff"; //#346df1
  const buttonText = "#fff";

  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText,
  };

  const tableRows = timeEntryData
    .map(
      (item, index) => `
    <tr style="background: ${index % 2 === 0 ? color.background : color.mainBackground};">
      <td style="padding: 10px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">${
        item.projectName
      }</td>
      <td style="padding: 10px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">${item.taskName}</td>
      <td style="padding: 10px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">${convertSecToTime(
        item.duration
      )}</td>
      <td style="padding: 10px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">${item.date}</td>
      <td style="padding: 10px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">${item.ticket}</td>
      <td style="padding: 10px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">${
        item.description.length > 200 ? item.description.substring(0, 200) + "..." : item.description
      }</td>
    </tr>
  `
    )
    .join("");

  return `
    <body style="background: ${color.background};">
      <table width="100%" border="0" cellspacing="20" cellpadding="0"
        style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
        <tr>
          <td align="center"
            style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${
              color.text
            };">
            <strong>Name : ${name} <br/> Total hrs : ${totalHrs}</strong>
          </td>
        </tr>
        ${
          timeEntryData.length > 0
            ? `
        <tr>
          <td>
            <table width="100%" cellspacing="0" cellpadding="10">
              <tr>
                <th style="background: ${color.buttonBackground}; color: ${buttonText};">Project</th>
                <th style="background: ${color.buttonBackground}; color: ${buttonText};">Task</th>
                <th style="background: ${color.buttonBackground}; color: ${buttonText};">Duration</th>
                <th style="background: ${color.buttonBackground}; color: ${buttonText};">Date</th>
                <th style="background: ${color.buttonBackground}; color: ${buttonText};">Ticket</th>
                <th style="background: ${color.buttonBackground}; color: ${buttonText};">Description</th>
              </tr>
              ${tableRows}
            </table>
          </td>
        </tr>
        `
            : ""
        }
      </table>
    </body>
  `;
}
