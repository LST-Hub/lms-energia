import response from "../../../../lib/response";
import {
  getUserPasswordRestletScriptDeploymentId,
  loginPasswordAddUpdateRestletScriptDeploymentId,
} from "../../../../src/utils/loginPasswordNsAPI";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { email } = req.body;

      const body = {
        resttype: "Search",
        recordtype: "employee",
        filters: [["email", "is", email]],
        columns: ["custentity_lms_emppassword","custentity_lms_roles"],
      };

      const getLoginForgotPasswordData =
        await getUserPasswordRestletScriptDeploymentId(body);

      console.log(
        "getLoginForgotPasswordData",
        getLoginForgotPasswordData.list[0].values
      );

      response({
        res,
        success: true,
        status_code: 200,
        data: [getLoginForgotPasswordData],
        message: "Get password Fetched successfully",
      });
    } else {
      response({
        res,
        success: false,
        status_code: 500,
        message: "Method not allowed",
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
