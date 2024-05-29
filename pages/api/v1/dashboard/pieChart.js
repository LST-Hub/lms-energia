import response from "../../../../lib/response";
import { getAllLeadRestletScriptDeploymentId } from "../../../../src/utils/NsAPIcal";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // const query = `SELECT id, companyname,custentity_lms_name, email, phone, entitystatus AS entitystatus_id, BUILTIN.DF( entitystatus ) AS entitystatus_name, custentity_lms_enquiryby AS custentity_lms_enquiryby_id, BUILTIN.DF( custentity_lms_enquiryby ) AS custentity_lms_enquiryby_name, custentity_lms_client_type AS custentity_lms_client_type_id, BUILTIN.DF( custentity_lms_client_type ) AS custentity_lms_client_type_name FROM customer WHERE searchstage='Lead' AND id > 29824`;
      //   const query = `SELECT * FROM customer WHERE id > 29325`;
      const query = `SELECT custentity_lms_channel_lead, COUNT(*) as count FROM customer WHERE custentity_lms_channel_lead IN (1, 2, 3, 4, 5) GROUP BY custentity_lms_channel_lead;`;
      const allLeadData = await getAllLeadRestletScriptDeploymentId(query);
      response({
        res,
        success: true,
        status_code: 200,
        data: allLeadData,
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
