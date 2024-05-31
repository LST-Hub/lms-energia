import response from "../../../../lib/response";
import {
  deletePhoneCallByIdRestletScriptDeploymentId,
  deleteTaskByIdRestletScriptDeploymentId,
  getTaskIdRestletScriptDeploymentId,
  updatePhoneActivityRestletScriptDeploymentId,
  updateTaskActivityRestletScriptDeploymentId,
} from "../../../../src/utils/createActivityNsAPI";

export default async function handler(req, res) {
  try {
    const tid = Number(req.query.tid);
    if (req.method === "GET") {
      const body = {
        resttype: "Record",
        recordtype: "task",
        recordid: tid,
        bodyfields: [
          "internalid",
          "title",
          "priority",
          "status",
          "startdate",
          "duedate",
          "company",
          "message"
        ],
      };

      const taskActivityData = await getTaskIdRestletScriptDeploymentId(body);
      response({
        res,
        success: true,
        status_code: 200,
        data: [taskActivityData],
        message: "Task Activity Fetched successfully",
      });
    } else if (req.method === "PATCH") {
      const body = req.body;
      const taskActivityUpdatedData =
        await updateTaskActivityRestletScriptDeploymentId(body);
      response({
        res,
        success: true,
        status_code: 200,
        data: [taskActivityUpdatedData],
        message: "Task Activity Updated successfully",
      });
    } else if (req.method === "DELETE") {
      const body = {
        resttype: "Delete",
        recordtype: "task",
        filters: {
          bodyfilters: [["internalid", "anyof", tid]],
        },
      };
      const deleteTaskData = await deleteTaskByIdRestletScriptDeploymentId(
        body
      );
      response({
        res,
        success: true,
        status_code: 200,
        data: [deleteTaskData],
        message: "Task Deleted successfully",
      });
    } else {
      response({
        res,
        success: false,
        status_code: 405,
        message: "Method Not Allowed",
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
