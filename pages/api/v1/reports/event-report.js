import response from "../../../../lib/response";
import { getLeadByIdRestletScriptDeploymentId } from "../../../../src/utils/NsAPIcal";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const body = {
        resttype: "Search",
        recordtype: "calendarevent",
        filters: [["systemnotes.type", "is", "T"], "AND", ["systemnotes.date", "onorafter", "01/05/2024 12:00 am"]],
        columns: [
          "internalid",
          "title",
          "startdate",
          "starttime",
          "endtime",
          "owner",
          "status",
          "markdone",
          "company",
          "message",
        ],
      };

      const eventData = await getLeadByIdRestletScriptDeploymentId(body);

      const formatted = eventData?.list?.map((item) => ({
        id: item.id,
        title: item.values.title || "",
        status: item.values.status[0].text || "",
        startdate: item.values.startdate || "",
        starttime: item.values.starttime || "",
        endtime: item.values.endtime || "",
        owner: item.values.owner[0].text || "",
        markdone: item.values.markdone || "",
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
