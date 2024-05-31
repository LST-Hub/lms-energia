import response from "../../../../lib/response";
import { getAllActivityRestletScriptDeploymentId } from "../../../../src/utils/createActivityNsAPI";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
     const query = `SELECT * FROM activity`;
      const allActivityData = await getAllActivityRestletScriptDeploymentId();
      response({
        res,
        success: true,
        status_code: 200,
        data: [allActivityData],
        message: "All Activity Fetched successfully",
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
