import response from "../../../../lib/response";
import { getAllLeadRestletScriptDeploymentId } from "../../../../src/utils/NsAPIcal";
import { getLeadByIdRestletScriptDeploymentId } from "../../../../src/utils/createNsAPIcal";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const query = `SELECT COUNT(*) FROM customer WHERE searchstage='Lead' AND id > 29824`;

      const body = {
        resttype: "Search",
        recordtype: "lead",
        filters: [
          ["stage", "anyof", "LEAD"],
          "AND",
          ["custentity_lms_createdby", "anyof", `8077`],
          "AND",
          ["systemnotes.date", "onorafter", "01/05/2024 12:00 am"],
        ],
        columns: [
          "internalid",
          "entityid",
          "custentity_lms_channel_lead",
          "altname",
          "firstname",
          "middlename",
          "lastname",
          "custentity_lms_enquiryby",
          "custentity_lms_client_type",
          "custentity_lms_createdby",
          "companyname",
          "phone",
          "email",
        ],
      };

      try {
        const allLeadData = await getLeadByIdRestletScriptDeploymentId(body);

        response({
          res,
          success: true,
          status_code: 200,
          data: [allLeadData.total],
          message: "All Lead Fetched successfully",
        });
      } catch (error) {
        console.error("Error fetching lead data", error);
        response({
          res,
          success: false,
          status_code: 200,
          data: [0],
          message: "Error fetching lead data, returning count as 0",
        });
      }
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
