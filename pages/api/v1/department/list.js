import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { deptSelectIdName, maxTake } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const dept = await prisma.department.findMany({
        where: {
          workspaceId: userToken.workspaceId,
          active: true,
        },
        orderBy: {
          name: "asc",
        },
        take: maxTake,
        select: deptSelectIdName,
      });
      response({ res, success: true, status_code: 200, data: dept });
      return;
    } else {
      response({ res, success: false, status_code: 405, message: "Method not allowed" });
      return;
    }
  } catch (err) {
    console.error("error in department index file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
