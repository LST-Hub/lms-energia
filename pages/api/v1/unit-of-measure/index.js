import response from "../../../../lib/response";
import { getSegmentRestletScriptDeploymentId } from "../../../../src/utils/NsAPIcal";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const query = `SELECT id, name FROM CUSTOMLIST_LMS_UOM WHERE isinactive='F'`;
      const unitOfMeasureData = await getSegmentRestletScriptDeploymentId(query);
      response({
        res,
        success: true,
        status_code: 200,
        data: unitOfMeasureData,
        message: "Unit Of Measure Fetched successfully",
      });
    } else if (req.method === "POST") {
      //   try {
      //     const LeadData = await postRestletScriptDeploymentId();
      //     response({
      //       res,
      //       success: true,
      //       status_code: 200,
      //       data: LeadData,
      //       message: "Lead Fetched successfully",
      //     });
      //   } catch (err) {
      //     console.log("error in post request", err);
      //   }
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
