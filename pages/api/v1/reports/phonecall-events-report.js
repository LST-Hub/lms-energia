import response from "../../../../lib/response";
import { getLeadByIdRestletScriptDeploymentId } from "../../../../src/utils/NsAPIcal";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const body = {
        resttype: "Search",
        recordtype: "phonecall",
        filters: [["systemnotes.type", "is", "T"], "AND", ["systemnotes.date", "onorafter", "01/05/2024 12:00 am"]],
        columns: [
          "internalid",
          "title",
          "status",
          "startdate",
          "enddate",
          "starttime",
          "phone",
          "assigned",
          "company",
          "custevent_lms_status",
          "custevent_lms_lead_name",
          "message",
        ],
      };

      const phoneCallData = await getLeadByIdRestletScriptDeploymentId(body);

      const formatted = phoneCallData?.list?.map((item) => ({
        id: item.id,
        title: item.values.title || "",
        status: item.values.status[0].text || "",
        startdate: item.values.startdate || "",
        enddate: item.values.enddate || "",
        phone: item.values.phone || "",
        assigned: item.values.assigned[0].text || "",
        company: item.values.company[0] ? item.values.company[0].text : "",
        // custevent_lms_status: item.values.custevent_lms_status || "",
        // custevent_lms_lead_name: item.values.custevent_lms_lead_name || "",
        // message: item.values.message || "",
      }));

      response({
        res,
        success: true,
        status_code: 200,
        data: formatted,
        message: "All Lead Fetched successfully",
      });
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
