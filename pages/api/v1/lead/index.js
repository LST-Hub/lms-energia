import response from "../../../../lib/response";
import { getAllLeadRestletScriptDeploymentId } from "../../../../src/utils/NsAPIcal";
import { postCreateLeadRestletScriptDeploymentId } from "../../../../src/utils/createNsAPIcal";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const query = `SELECT id, companyname,custentity_lms_channel_lead,custentity_lms_createdby,custentity_lms_name, email, phone, BUILTIN.DF(custentity_lms_channel_lead) AS custentity_lms_channel_lead_name,entitystatus AS entitystatus_id, BUILTIN.DF( entitystatus ) AS entitystatus_name, custentity_lms_enquiryby AS custentity_lms_enquiryby_id, BUILTIN.DF( custentity_lms_enquiryby ) AS custentity_lms_enquiryby_name, custentity_lms_client_type AS custentity_lms_client_type_id, BUILTIN.DF( custentity_lms_client_type ) AS custentity_lms_client_type_name FROM customer WHERE searchstage='Lead' AND id > 31624`;
      const allLeadData = await getAllLeadRestletScriptDeploymentId(query);

      const formatted = allLeadData?.list?.map((item) => ({
        id: item.id,
        companyname: item.values.companyname || "",
        custentity_lms_channel_lead:
          item.values.custentity_lms_channel_lead[0].text || "",
          custentity_lms_createdby:
          item.values.custentity_lms_createdby[0].text || "",
        custentity_lms_name: item.values.custentity_lms_name || "",
        email: item.values.email || "",
        phone: item.values.phone || "",
        custentity_lms_channel_lead_name:
          item.values.custentity_lms_channel_lead_name || "",
        entitystatus_id: item.values.entitystatus_id || "",
        entitystatus_name: item.values.entitystatus_name || "",
        custentity_lms_enquiryby: 
          item.values.custentity_lms_enquiryby[0].text || "",
        custentity_lms_enquiryby_name:
          item.values.custentity_lms_enquiryby_name || "",
          custentity_lms_client_type:
          item.values.custentity_lms_client_type[0].text || "",
        custentity_lms_client_type_name:
          item.values.custentity_lms_client_type_name || "",
      }));
      response({
        res,
        success: true,
        status_code: 200,
        data: allLeadData,
        message: "All Lead Fetched successfully",
      });
    } else if (req.method === "POST") {
      try {
        const leadData = await postCreateLeadRestletScriptDeploymentId(req);
        response({
          res,
          success: true,
          status_code: 200,
          data: [leadData],
          message: "Lead Fetched successfully",
        });
      } catch (err) {
        console.log("error in post request", err);
      }
    } else {
      response({
        res,
        success: false,
        status_code: 500,
        message: "Method not allowed",
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
