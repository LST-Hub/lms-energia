import response from "../../../../lib/response";
import { getLeadByIdRestletScriptDeploymentId } from "../../../../src/utils/NsAPIcal";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const body = {
        resttype: "Search",
        recordtype: "task",
        filters: [["systemnotes.type", "is", "T"], "AND", ["systemnotes.date", "onorafter", "01/05/2024 12:00 am"]],
        columns: [
          "internalid",
          "order",
          "title",
          "priority",
          "status",
          "startdate",
          "duedate",
          "accesslevel",
          "assigned",
          "company",
          "message",
        ],
      };

      try {
        const taskData = await getLeadByIdRestletScriptDeploymentId(body);

        response({
          res,
          success: true,
          status_code: 200,
          data: [taskData?.list.length],
          message: "All Lead Fetched successfully",
        });
      } catch (error) {
        console.error("Error fetching calls data", error);
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
