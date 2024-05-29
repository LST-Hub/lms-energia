import response from "../../../../lib/response";
import { getSalesSupportRoleRestletScriptDeploymentId } from "../../../../src/utils/rolesNsAPI";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const {id} = req.query;
      console.log("req", req.query)

      const query = `SELECT * FROM customer WHERE searchstage='Lead' AND custentity_lms_createdby IN (${id})`;
      const salesManagerRoles = await getSalesSupportRoleRestletScriptDeploymentId(
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
