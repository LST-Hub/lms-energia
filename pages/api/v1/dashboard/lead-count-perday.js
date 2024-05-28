import response from "../../../../lib/response";
import { getLeadByIdRestletScriptDeploymentId } from "../../../../src/utils/NsAPIcal";
import { postCreateLeadRestletScriptDeploymentId } from "../../../../src/utils/createNsAPIcal";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const body = {
        resttype: "Search",
        recordtype: "lead",
        access: {
          user: {
            value: "6899",
            text: "EMP-1213 Netsuite Livestrong",
          },
          role: {
            value: "1",
            text: "Sales Head",
          },
        },
        filters: [["stage", "anyof", "LEAD"]],
        columns: ["datecreated"],
      };

      const allLeadData = await getLeadByIdRestletScriptDeploymentId(body);

      const data = allLeadData?.list;

      const dateCounts = {};

      data?.forEach((lead) => {
        const date = lead.values.datecreated.split(" ")[0];

        if (dateCounts[date]) {
          dateCounts[date]++;
        } else {
          dateCounts[date] = 1;
        }
      });

      const result = Object.keys(dateCounts).map((date) => {
        return { date, count: dateCounts[date] };
      });

      response({
        res,
        success: true,
        status_code: 200,
        data: result,
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
