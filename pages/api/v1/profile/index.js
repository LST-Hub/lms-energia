import response from "../../../../lib/response";
import { getAllEmployeeData } from "../../../../src/utils/employeeNsAPI";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { userId } = req.query;
      const employeeData = await getAllEmployeeData(userId);

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
