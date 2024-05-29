import response from "../../../../lib/response";
import { getLeadByIdRestletScriptDeploymentId } from "../../../../src/utils/NsAPIcal";

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
        filters: [["stage", "anyof", "LEAD"], "AND", ["datecreated", "onorafter", ["01/05/2024 12:00 am"]]],
        columns: ["CUSTRECORD_LMS_LEADNURT.custrecord_lms_lead_value"],
      };

      const allLeadData = await getLeadByIdRestletScriptDeploymentId(body);

      //   let result = [];
      //   allLeadData?.list?.forEach((dataItem) => {
      //     const leadId = dataItem.values.custentity_lms_channel_lead[0].value;
      //     const leadValue = Number(dataItem.values["CUSTRECORD_LMS_LEADNURT.custrecord_lms_lead_value"]);
      //     const existingLead = result.find((item) => item.custentity_lms_channel_lead_id === leadId);
      //     if (existingLead) {
      //       existingLead.custrecord_lms_lead_value += leadValue;
      //     } else {
      //       result.push({
      //         custentity_lms_channel_lead_id: leadId,
      //         custrecord_lms_lead_value: leadValue,
      //       });
      //     }
      //   });

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
