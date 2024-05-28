import response from "../../../../lib/response";
import { getLeadNameListRestletScriptDeploymentId } from "../../../../src/utils/createActivityNsAPI";


export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const query = `SELECT id, companyname FROM customer WHERE searchstage='Lead'`;
      // const query = `SELECT entityid, firstName, lastname, id, email, hireDate, releasedate, BUILTIN.DF( employeetype ) AS employeetype, BUILTIN.DF( employeestatus ) AS employeestatus, BUILTIN.DF( department ) AS department, BUILTIN.DF( location ) AS location, BUILTIN.DF( supervisor ) AS supervisor FROM employee`;
    //   const leadCampaignData = await getCampaignRestletScriptDeploymentId(query);
      const leadNameData = await getLeadNameListRestletScriptDeploymentId(query);
      console.log("leadNameData", leadNameData)
      response({
        res,
        success: true,
        status_code: 200,
        data: leadNameData,
        message: "Lead Campaign Fetched successfully",
      });
    } else if (req.method === "POST") {
      //   try {
      //     const LeadData = await postRestletScriptDeploymentId();
      //     response({
      //       res,
      //       success: true,
      //       status_code: 200,
      //       data: LeadData,
      //       message: "Lead Fetched successfully",
      //     });
      //   } catch (err) {
      //     console.log("error in post request", err);
      //   }
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
