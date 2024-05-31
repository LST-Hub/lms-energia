import response from "../../../../lib/response";
import { getSalesSuppRoleRestletScriptDeploymentId } from "../../../../src/utils/rolesNsAPI";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { userId } = req.query;

      const salesSupportRepRoles =
        await getSalesSuppRoleRestletScriptDeploymentId(userId);

      const formatted =
        salesSupportRepRoles?.list && salesSupportRepRoles?.list.length > 0
          ? salesSupportRepRoles?.list?.map((item) => ({
              id: item.id,
              custentity_lms_channel_lead:
                item.values.custentity_lms_channel_lead[0].text || "",
              custentity_lms_createdby:
                item.values.custentity_lms_createdby[0].text || "",

              companyname: item.values.companyname || "",
              phone: item.values.phone || "",
              email: item.values.email || "",
              custentity_lms_client_type:
                item.values.custentity_lms_client_type[0].text || "",
              custentity_lms_enquiryby:
                item.values.custentity_lms_enquiryby[0].text || "",
            }))
          : [];

      response({
        res,
        success: true,
        status_code: 200,
        data: formatted,
        message: "Lead Campaign Fetched successfully",
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
