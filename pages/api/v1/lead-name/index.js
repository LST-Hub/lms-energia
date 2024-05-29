import response from "../../../../lib/response";
import { getLeadNameListRestletScriptDeploymentId } from "../../../../src/utils/createActivityNsAPI";


export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const query = `SELECT id,entityid,companyname FROM customer WHERE searchstage='Lead'`;
      const leadNameData = await getLeadNameListRestletScriptDeploymentId(query);
      response({
        res,
        success: true,
        status_code: 200,
        data: leadNameData,
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
