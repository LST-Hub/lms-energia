import response from "../../../../lib/response";
import {
  deleteRestletScriptDeploymentId,
  getRecentCreateLeadRestletScriptDeploymentId,
} from "../../../../src/utils/NsAPIcal";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const query = `SELECT id FROM Customer WHERE searchstage='Lead' AND companyname= 'companyname'  AND email='email'`;
      const getRecetLeadData = await getRecentCreateLeadRestletScriptDeploymentId(query);
      response({
        res,
        success: true,
        status_code: 200,
        data: getRecetLeadData,
        message: "Recenet Lead Data Fetched successfully",
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
