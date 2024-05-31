import response from "../../../../lib/response";
import { getEmployeeByIdRestletScriptDeploymentId, getEmployeeIdRestletScriptDeploymentId } from "../../../../src/utils/NsAPIcal";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const id = Number(req.query.uid);
      const userDataId = await getEmployeeByIdRestletScriptDeploymentId(id);
      response({
        res,
        success: true,
        status_code: 200,
        data: [userDataId],
        message: "Lead Fetched successfully",
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
