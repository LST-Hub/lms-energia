import response from "../../../../lib/response";
import {
  deleteEventByIdRestletScriptDeploymentId,
  deletePhoneCallByIdRestletScriptDeploymentId,
  getEventIdRestletScriptDeploymentId,
  updateEventActivityRestletScriptDeploymentId,
  updatePhoneActivityRestletScriptDeploymentId,
} from "../../../../src/utils/createActivityNsAPI";

export default async function handler(req, res) {
  try {
    const eid = Number(req.query.eid);
    if (req.method === "GET") {
      const body = {
        resttype: "Record",
        recordtype: "calendarevent",
        recordid: eid,
        bodyfields: [
          "internalid",
          "title",
          "location",
          "startdate",
          "starttime",
          "endtime",
          "status",
          "company",
          "message"
        ],
      };

      const eventCallData = await getEventIdRestletScriptDeploymentId(body);
      response({
        res,
        success: true,
        status_code: 200,
        data: [eventCallData],
        message: "Event Activity Fetched successfully",
      });

    }else if (req.method === "PATCH") {
      const body = req.body;
      const eventActivityUpdatedData =
        await updateEventActivityRestletScriptDeploymentId(body);
      response({
        res,
        success: true,
        status_code: 200,
        data: [eventActivityUpdatedData],
        message: "Event Activity Updated successfully",
      });
    } else if (req.method === "DELETE") {
      const body = {
        resttype: "Delete",
        recordtype: "calendarevent",
        filters: {
          bodyfilters: [["internalid", "anyof", eid]],
        },
      };
      const deleteLeadData = await deleteEventByIdRestletScriptDeploymentId(
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
