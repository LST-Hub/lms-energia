import response from "../../../../lib/response";
import { getAllLeadRestletScriptDeploymentId } from "../../../../src/utils/NsAPIcal";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const query = `SELECT COUNT(*) FROM customer WHERE searchstage='Lead'`;
      const allLeadData = await getAllLeadRestletScriptDeploymentId(query);
      response({
        res,
        success: true,
        status_code: 200,
        data: allLeadData,
        message: "All Lead Fetched successfully",
      });
    } else {
      response({ res, success: false, status_code: 405, message: "Method not allowed" });
      return;
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
