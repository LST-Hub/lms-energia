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
        columns: [
          "internalid",
          "firstname",
          "middlename",
          "lastname",
          "custentity_lms_createdby",
          "companyname",
          "address",
          "phone",
          "email",
          "entitystatus",
          "datecreated",
          "custentity_lms_channel_lead",
          "CUSTRECORD_LMS_LEADNURT.custrecord_lms_primary_action",
          "CUSTRECORD_LMS_LEADNURT.custrecord_lms_lead_value",
        ],
      };

      const allLeadData = await getLeadByIdRestletScriptDeploymentId(body);

      const formatted = allLeadData?.list?.map((item) => ({
        id: item.id,
        firstname: item.values.firstname || "",
        lastname: item.values.lastname || "",
        custentity_lms_createdby: item.values.custentity_lms_createdby[0].text || "",
        companyname: item.values.companyname || "",
        phone: item.values.phone || "",
        email: item.values.email || "",
        entitystatus: item.values.entitystatus[0].text || "",
        custentity_lms_channel_lead: item.values.custentity_lms_channel_lead[0].text || "",
        custrecord_lms_primary_action: !!item.values["CUSTRECORD_LMS_LEADNURT.custrecord_lms_primary_action"][0]
          ? item.values["CUSTRECORD_LMS_LEADNURT.custrecord_lms_primary_action"][0].text
          : "",
        custrecord_lms_lead_value: item.values["CUSTRECORD_LMS_LEADNURT.custrecord_lms_lead_value"]
          ? item.values["CUSTRECORD_LMS_LEADNURT.custrecord_lms_lead_value"]
          : 0,
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
