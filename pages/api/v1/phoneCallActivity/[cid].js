import response from "../../../../lib/response";
import {
  deletePhoneCallByIdRestletScriptDeploymentId,
  getPhoneCallIdRestletScriptDeploymentId,
  updatePhoneActivityRestletScriptDeploymentId,
} from "../../../../src/utils/createActivityNsAPI";

export default async function handler(req, res) {
  try {
    const cid = Number(req.query.cid);
    if (req.method === "GET") {
      const body = {
        resttype: "Record",
        recordtype: "phonecall",
        recordid: cid,
        bodyfields: [
          "title",
          "phone",
          "status",
          "organizer",
          "startdate",
          "message",
          "company",
        ],
      };

      const phoneCallData = await getPhoneCallIdRestletScriptDeploymentId(body);
      response({
        res,
        success: true,
        status_code: 200,
        data: [phoneCallData],
        message: "Phone Call Activity Fetched successfully",
      });
    } else if (req.method === "PATCH") {
      const body = req.body;
      console.log("phone call updated body");

      const activityUpdatedData =
        await updatePhoneActivityRestletScriptDeploymentId(body);
      response({
        res,
        success: true,
        status_code: 200,
        data: [activityUpdatedData],
        message: "Phone Call Activity Updated successfully",
      });
    } else if (req.method === "DELETE") {
      const body = {
        resttype: "Delete",
        recordtype: "phonecall",
        filters: {
          bodyfilters: [["internalid", "anyof", cid]],
        },
      };
      const deletePhoneCallData =
        await deletePhoneCallByIdRestletScriptDeploymentId(body);
      response({
        res,
        success: true,
        status_code: 200,
        data: [deletePhoneCallData],
        message: "Phone Call Activity Deleted successfully",
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
