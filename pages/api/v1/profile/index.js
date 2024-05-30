import response from "../../../../lib/response";
import { getAllEmployeeData } from "../../../../src/utils/employeeNsAPI";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // const { emailDynamic } = req.query;

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
          "title",
          "supervisor",
          "comments",
          "email",
          "phone",
          "altphone",
          "mobilephone",
          "homephone",
          "fax",
          "billaddress",
          "department",
          "class",
          "location",
          "subsidiary",
          "employeetype",
          "employeestatus",
          "jobdescr",
          "workcalendar",
          "hiredate",
          "gender",
          "giveaccess",
          "isinactive",
          "custentity_lms_roles",
        ],
      };

      const employeeData = await getAllEmployeeData(body);

      formatedEmployeeData = employeeData.map((emp) => {
        return {
          internalid: emp.internalid,
          entityid: emp.entity  
        }
      })


      // const query = `SELECT * FROM employee`;
      // const employeeData = await getRestletScriptDeploymentId(query);
      response({
        res,
        success: true,
        status_code: 200,
        data: formatedEmployeeData,
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
