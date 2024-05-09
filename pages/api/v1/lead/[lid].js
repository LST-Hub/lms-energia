import {
  getLeadByIdRestletScriptDeploymentId,
  getRestletScriptDeploymentId,
  updateLeadRestletScriptDeploymentId,
} from "../../../../src/utils/NsAPIcal";
import response from "../../../../lib/response";

export default async function handler(req, res) {
  try {
    const id = Number(req.query.lid);
    if (req.method === "GET") {
      const allLeadData = await getLeadByIdRestletScriptDeploymentId(id);
      response({
        res,
        success: true,
        status_code: 200,
        data: [allLeadData],
        message: "All Lead Fetched successfully",
      });
    } else if (req.method === "PATCH") {
      const body = req.body;
      const leadUpdatedData = await updateLeadRestletScriptDeploymentId(id,body);

      response({
        res,
        success: true,
        status_code: 200,
        data: [leadUpdatedData],
        message: "Lead Updated successfully",
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
