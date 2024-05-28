import response from "../../../../lib/response";
import {
  deletePhoneCallByIdRestletScriptDeploymentId,
  updatePhoneActivityRestletScriptDeploymentId,
} from "../../../../src/utils/createActivityNsAPI";

export default async function handler(req, res) {
  try {
    const aid = Number(req.query.aid);
    if (req.method === "GET") {
      //   const allLeadData = await getLeadByIdRestletScriptDeploymentId(body);
      //   response({
      //     res,
      //     success: true,
      //     status_code: 200,
      //     data: [allLeadData],
      //     message: "All Lead Fetched successfully",
      //   });
    } else if (req.method === "PATCH") {
      const body = req.body;
      const activityUpdatedData =
        await updatePhoneActivityRestletScriptDeploymentId(body);
      response({
        res,
        success: true,
        status_code: 200,
        data: [activityUpdatedData],
        message: "Activity Updated successfully",
      });
    } else if (req.method === "DELETE") {
      const body = {
        resttype: "Delete",
        recordtype: "lead",
        filters: {
          bodyfilters: [["internalid", "anyof", aid]],
        },
      };
      const deleteLeadData = await deletePhoneCallByIdRestletScriptDeploymentId(
        body
      );
      response({
        res,
        success: true,
        status_code: 200,
        data: [deleteLeadData],
        message: "Activity Deleted successfully",
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
