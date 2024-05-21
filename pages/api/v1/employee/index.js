import response from "../../../../lib/response";
import { getRestletScriptDeploymentId } from "../../../../src/utils/NsAPIcal";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const body = {
        resttype: "Search",
        recordtype: "employee",
        filters: [],
        columns: [
          "internalid",
          "entityid",
          "altname",
          "firstname",
          "middlename",
          "lastname",
          "email",
          "title",
          "phone",
          "supervisor",
          "department",
          "employeetype",
          "role",
        ],
      };

      const query= `SELECT * FROM employee`
      const employeeData = await getRestletScriptDeploymentId(query);
      response({
        res,
        success: true,
        status_code: 200,
        data: employeeData,
        message: "Employee Fetched successfully",
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
