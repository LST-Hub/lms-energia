import response from "../../../../lib/response";
import { getAllEventActivityRestletScriptDeploymentId, postCreateEventActivityRestletScriptDeploymentId, postCreatePhoneCallActivityRestletScriptDeploymentId } from "../../../../src/utils/createActivityNsAPI";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const query = `SELECT id,title,status,startdate,accessLevel FROM CalendarEvent`;
      const gettingAllEventActivityData =
        await getAllEventActivityRestletScriptDeploymentId(query);
      response({
        res,
        success: true,
        status_code: 200,
        data: gettingAllEventActivityData,
        message: "All Phone Call Activity Fetched successfully",
      });
    } else if (req.method === "POST") {
      try {
        const eventActivityData =
          await postCreateEventActivityRestletScriptDeploymentId(req);

        response({
          res,
          success: true,
          status_code: 200,
          data: [eventActivityData],
          message: "Event Avtivity created successfully",
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
