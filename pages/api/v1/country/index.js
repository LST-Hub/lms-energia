import response from "../../../../lib/response";
import { getCountryRestletScriptDeploymentId, getDivisionRestletScriptDeploymentId } from "../../../../src/utils/NsAPIcal";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const query = `SELECT id, name FROM country`;
      // const query = `SELECT entityid, firstName, lastname, id, email, hireDate, releasedate, BUILTIN.DF( employeetype ) AS employeetype, BUILTIN.DF( employeestatus ) AS employeestatus, BUILTIN.DF( department ) AS department, BUILTIN.DF( location ) AS location, BUILTIN.DF( supervisor ) AS supervisor FROM employee`;
      const countryData = await getCountryRestletScriptDeploymentId(query);
      response({
        res,
        success: true,
        status_code: 200,
        data: countryData,
        message: "Country Fetched successfully",
      });
    } else if (req.method === "POST") {
      
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
