import response from "../../../../lib/response";
import {
  getUserPasswordRestletScriptDeploymentId,
  loginPasswordAddUpdateRestletScriptDeploymentId,
} from "../../../../src/utils/loginPasswordNsAPI";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { emailDynamic } = req.query;
      const body = {
        resttype: "Search",
        recordtype: "employee",
        filters: [["email", "is", emailDynamic]],
        columns: ["custentity_lms_emppassword"
        ,"custentity_lms_roles"]
      };

      const getLoginForgotPasswordData =
        await getUserPasswordRestletScriptDeploymentId(body);
      response({
        res,
        success: true,
        status_code: 200,
        data: [getLoginForgotPasswordData],
        message: "Get password Fetched successfully",
      });
    } else if (req.method === "PATCH") {
      try {
        const email = req.body.email;
        const password = req.body.password;

        const body = {
          resttype: "Update",
          recordtype: "employee",
          bodyfields: {
            custentity_lms_emppassword: password,
          },
          filters: {
            bodyfilters: [["email", "is", email]],
          },
        };

        const loginForgotPasswordUpdateData =
          await loginPasswordAddUpdateRestletScriptDeploymentId(body);

        if (loginForgotPasswordUpdateData.status === 200) {
          response({
            res,
            success: true,
            status_code: 200,
            data: [loginForgotPasswordUpdateData.data],
            message: "Forgot password updated successfully",
          });
        } else {
          response({
            res,
            success: false,
            status_code: 500,
            message: "Some Internal Error Occured. Please try again later",
          });
        }
      } catch (err) {
        console.log("error in post request", err);
      }
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
