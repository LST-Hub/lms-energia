import response from "../../../../lib/response";
import {  getAllTaskActivityRestletScriptDeploymentId, postCreateTaskActivityRestletScriptDeploymentId } from "../../../../src/utils/createActivityNsAPI";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const query = `SELECT id,title,status,priority,startdate,accessLevel FROM Task`;
      const gettingAllTaskActivityData =
        await getAllTaskActivityRestletScriptDeploymentId(query);
      response({
        res,
        success: true,
        status_code: 200,
        data: gettingAllTaskActivityData,
        message: "All Task Activity Fetched successfully",
      });
    } else if (req.method === "POST") {
      try {
        const taskActivityData =
          await postCreateTaskActivityRestletScriptDeploymentId(req);

        response({
          res,
          success: true,
          status_code: 200,
          data: [taskActivityData],
          message: "Task Avtivity created successfully",
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
