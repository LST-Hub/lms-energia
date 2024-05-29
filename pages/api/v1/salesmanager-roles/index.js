import response from "../../../../lib/response";
import { getSalesManagerRoleRestletScriptDeploymentId } from "../../../../src/utils/rolesNsAPI";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const {id} = req.query;
      const query = `SELECT * FROM customer INNER JOIN employee ON ( employee.id = customer.custentity_lms_createdby ) WHERE ((searchstage='Lead') AND (custentity_lms_createdby IN (${id}) OR employee.custentity_lms_roles IN ('3')))`;
      const salesManagerRoles = await getSalesManagerRoleRestletScriptDeploymentId(
        query
      );
      response({
        res,
        success: true,
        status_code: 200,
        data: salesManagerRoles,
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
