import response from "../../../../lib/response";
import { getAllLeadRestletScriptDeploymentId } from "../../../../src/utils/NsAPIcal";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const query = `SELECT COUNT(*) FROM customer WHERE searchstage='Lead' AND id > 29824`;

      try {
        const allLeadData = await getAllLeadRestletScriptDeploymentId(query);

        console.log("All Lead Data", allLeadData?.items[0]?.expr1);
        response({
          res,
          success: true,
          status_code: 200,
          data: [allLeadData?.items[0]?.expr1],
          message: "All Lead Fetched successfully",
        });
      } catch (error) {
        console.error("Error fetching lead data", error);
        response({
          res,
          success: false,
          status_code: 200,
          data: [0],
          message: "Error fetching lead data, returning count as 0",
        });
      }
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
