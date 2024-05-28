import response from "../../../../lib/response";
import { getAllLeadRestletScriptDeploymentId } from "../../../../src/utils/NsAPIcal";
import { getLeadChannelAmmount, postCreateLeadRestletScriptDeploymentId } from "../../../../src/utils/createNsAPIcal";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const query = `SELECT id, companyname,custentity_lms_name, email, phone, entitystatus AS entitystatus_id, BUILTIN.DF( entitystatus ) AS entitystatus_name, custentity_lms_enquiryby AS custentity_lms_enquiryby_id, BUILTIN.DF( custentity_lms_enquiryby ) AS custentity_lms_enquiryby_name, custentity_lms_client_type AS custentity_lms_client_type_id, BUILTIN.DF( custentity_lms_client_type ) AS custentity_lms_client_type_name FROM customer WHERE searchstage='Lead' AND id > 29824`;
      // const query = `SELECT * FROM customer WHERE id > 29325`;
      // const query = `SELECT id, companyname,custentity_lms_name,custentity_lms_channel_lead,custrecord_lms_lead_value, email, phone, entitystatus AS entitystatus_id, BUILTIN.DF( entitystatus ) AS entitystatus_name, custentity_lms_enquiryby AS custentity_lms_enquiryby_id, BUILTIN.DF( custentity_lms_enquiryby ) AS custentity_lms_enquiryby_name, custentity_lms_client_type AS custentity_lms_client_type_id, BUILTIN.DF( custentity_lms_client_type ) AS custentity_lms_client_type_name FROM customer WHERE searchstage='Lead' AND id > 31624`;
      const allLeadData = await getAllLeadRestletScriptDeploymentId(query);
      response({
        res,
        success: true,
        status_code: 200,
        data: allLeadData,
        message: "All Lead Fetched successfully",
      });
    } else if (req.method === "POST") {
      try {
        const leadData = await getLeadChannelAmmount(req.bod);

        response({
          res,
          success: true,
          status_code: 200,
          data: [leadData],
          message: "Lead Fetched successfully",
        });

        // if ( leadData.status === 204) {
        //   response({
        //     res,
        //     success: true,
        //     status_code: 204,
        //     data: [leadData],
        //     message: "Lead Fetched successfully",
        //   });
        //   return;
        // } else {
        //   response({
        //     res,
        //     success: false,
        //     status_code: 400,
        //     message: "Lead Not Fetched successfully",
        //   });
        //   return;
        // }
      } catch (err) {
        console.log("error in post request", err);
      }
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
