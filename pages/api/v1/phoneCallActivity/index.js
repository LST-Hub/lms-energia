import response from "../../../../lib/response";
import {
  getAllPhoneCallActivityRestletScriptDeploymentId,
  postCreatePhoneCallActivityRestletScriptDeploymentId,
} from "../../../../src/utils/createActivityNsAPI";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // const query = `SELECT id,title,phone, status, contact AS contact_id, BUILTIN.DF( contact ) AS contact_text, company AS company_id, BUILTIN.DF( company ) AS company_text, timedevent FROM PhoneCall`;

     
      const gettingAllPhoneCallActivityData =
        await getAllPhoneCallActivityRestletScriptDeploymentId();
      response({
        res,
        success: true,
        status_code: 200,
        data: gettingAllPhoneCallActivityData,
        message: "All Phone Call Activity Fetched successfully",
      });
    } else if (req.method === "POST") {
      try {
        const phoneCallActivityData =
          await postCreatePhoneCallActivityRestletScriptDeploymentId(req);

        response({
          res,
          success: true,
          status_code: 200,
          data: [phoneCallActivityData],
          message: "Avtivity created successfully",
        });
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
