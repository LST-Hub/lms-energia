import response from "../../../../lib/response";
import { getLeadNurturStatusRestletScriptDeploymentId } from "../../../../src/utils/NsAPIcal";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const query = `SELECT id, name FROM CUSTOMLIST_LMS_PROSPECT_NURTURING WHERE isinactive='F'`;
      // const query = `SELECT key AS id, name FROM EntityStatus WHERE inactive='F' AND entitytype in('LEAD', 'PROSPECT', 'CUSTOMER'`;
      // const query = `SELECT entityid, firstName, lastname, id, email, hireDate, releasedate, BUILTIN.DF( employeetype ) AS employeetype, BUILTIN.DF( employeestatus ) AS employeestatus, BUILTIN.DF( department ) AS department, BUILTIN.DF( location ) AS location, BUILTIN.DF( supervisor ) AS supervisor FROM employee`;
      const leadNuturingStatusData =
        await getLeadNurturStatusRestletScriptDeploymentId(query);

        
      response({
        res,
        success: true,
        status_code: 200,
        data: leadNuturingStatusData,
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
