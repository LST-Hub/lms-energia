import response from "../../../../lib/response";
import { postLeadAssignRestletScriptDeploymentId } from "../../../../src/utils/NsAPIcal";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
    } else if (req.method === "POST") {
      try {
        const body = req.body;
        const leadData = await postLeadAssignRestletScriptDeploymentId(req, body);

        response({
          res,
          success: true,
          status_code: 200,
          data: [leadData],
          message: "Lead Fetched successfully",
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
