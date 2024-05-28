// import prisma from "../../../../lib/prisma";
// import { authAndGetUserToken } from "../../../../lib/getSessionData";
// import response from "../../../../lib/response";
// import { MaxPhoneNumberLength, profileDetailsSelectAll } from "../../../../lib/constants";
// import { MaxNameLength, bigInpuMaxLength } from "../../../../lib/constants";
// import * as yup from "yup";

// export default async function handler(req, res) {
//   try {
//     const userToken = await authAndGetUserToken(req);
//     if (req.method === "GET") {
//       const userData = await prisma.user.findUnique({
//         where: {
//           workspaceId_id: { id: userToken.userId, workspaceId: userToken.workspaceId },
//         },
//         select: profileDetailsSelectAll,
//       });
//       response({
//         res,
//         success: true,
//         status_code: 200,
//         message: "Profile fetched successfully",
//         data: [userData],
//       });
//       return;
//     } else if (req.method === "PUT") {
//       const { firstName, lastName, phoneNumber, address, zipCode, country, gender, image } = req.body;
//       // not upadting acache here as this api dosent change any property that is stored in cache for user
//       const fullName = firstName && lastName ? `${firstName} ${lastName}` : undefined;

//       const schema = yup.object().shape({
//         firstName: yup.string().required().trim().max(MaxNameLength),
//         lastName: yup.string().required().trim().max(MaxNameLength),
//         phoneNumber: yup.string(),
//         address: yup.string().max(bigInpuMaxLength),
//         zipCode: yup.string().max(MaxPhoneNumberLength),
//         country: yup.string(),
//         gender: yup.string(),
//         image: yup.string(),
//       });

//       try {
//         await schema.validate({
//           firstName,
//           lastName,
//           phoneNumber,
//           address,
//           zipCode,
//           country,
//           gender,
//           image,
//         });
//       } catch (error) {
//         console.error("error in profile validation", error);
//         response({
//           res,
//           success: false,
//           status_code: 400,
//           message: error.message,
//         });
//         return;
//       }

//       const userData = await prisma.user.update({
//         where: {
//           workspaceId_id: { id: userToken.userId, workspaceId: userToken.workspaceId },
//         },
//         data: {
//           firstName: firstName,
//           lastName: lastName,
//           name: fullName,
//           phoneNumber: phoneNumber,
//           address: address,
//           gender: gender,
//           zipCode: zipCode,
//           country: country,
//           image: image,
//         },
//       });
//       response({
//         res,
//         success: true,
//         status_code: 200,
//         message: "Profile updated successfully",
//         data: [userData],
//       });
//       return;
//     } else if (req.method === "PATCH") {
//       const { image } = req.body;
//       // not upadting acache here as this api dosent change any property that is stored in cache for user
//       const userData = await prisma.user.update({
//         where: {
//           workspaceId_id: { id: userToken.userId, workspaceId: userToken.workspaceId },
//         },
//         data: {
//           image: image,
//         },
//       });
//       response({
//         res,
//         success: true,
//         status_code: 200,
//         message: "Profile updated successfully",
//         data: [userData],
//       });
//       return;
//     } else {
//       response({
//         res,
//         success: false,
//         status_code: 405,
//         message: "Method Not Allowed",
//       });
//       return;
//     }
//   } catch (err) {
//     console.error("error in profile index file", err);
//     response({
//       res,
//       success: false,
//       status_code: 500,
//       message: "Some Internal Error Occured. Please try again later",
//     });
//     return;
//   }
// }

import response from "../../../../lib/response";
import { getRestletScriptDeploymentId } from "../../../../src/utils/NsAPIcal";
import { getEmployeeData } from "../../../../src/utils/loginPasswordNsAPI";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { emailDynamic } = req.query;

      const body = {
        resttype: "Search",
        recordtype: "employee",
        filters: [["email", "is", emailDynamic]],
        columns: [
          "internalid",
          "entityid",
          "altname",
          "firstname",
          "middlename",
          "lastname",
          "title",
          "custentity_lms_roles",
        ],
      };

      const employeeData = await getEmployeeData(body);

      response({
        res,
        success: true,
        status_code: 200,
        data: employeeData,
        message: "Employee Fetched successfully",
      });
    }
  } catch (err) {
    console.error("error in project index file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
