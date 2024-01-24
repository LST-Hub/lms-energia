import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { maxTake, roleSelectList } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const roles = await prisma.role.findMany({
        where: {
          workspaceId: userToken.workspaceId,
          /** we are fetching active true because we want to show the filed which is active in the
           * dropdown  */
          active: true,
        },
        orderBy: {
          name: "asc",
        },
        // return all results, dont return only 100
        select: roleSelectList,
      });
      response({ res, success: true, status_code: 200, data: roles, message: "Roles fetched successfully" });
      return;
    } else {
      response({ res, success: false, status_code: 405, message: "Method not allowed" });
      return;
    }
  } catch (error) {
    console.log("error", error);
    response({ res, success: false, status_code: 500, message: error.message });
  }
}
