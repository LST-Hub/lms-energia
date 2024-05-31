import { getPhoneCallDataActivityRestletScriptDeploymentId } from "../../../../../src/utils/allActivityNsAPI";
import response from "../../../../../lib/response";

export default async function handler(req, res) {
  try {
    const lid = Number(req.query.leadId);

    if (req.method === "GET") {
      // const query = `SELECT id, companyname,custentity_lms_channel_lead,custentity_lms_name, email, phone, BUILTIN.DF(custentity_lms_channel_lead) AS custentity_lms_channel_lead_name,entitystatus AS entitystatus_id, BUILTIN.DF( entitystatus ) AS entitystatus_name, custentity_lms_enquiryby AS custentity_lms_enquiryby_id, BUILTIN.DF( custentity_lms_enquiryby ) AS custentity_lms_enquiryby_name, custentity_lms_client_type AS custentity_lms_client_type_id, BUILTIN.DF( custentity_lms_client_type ) AS custentity_lms_client_type_name FROM customer WHERE searchstage='Lead' AND id > 31624`;
      const allPhoneCallActivityData =
        await getPhoneCallDataActivityRestletScriptDeploymentId(lid);

      const formattedData = allPhoneCallActivityData.list.map(
        (item) => item.values
      );

      response({
        res,
        success: true,
        status_code: 200,
        data: formattedData,
        message: "All Phone Call Fetched successfully",
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
