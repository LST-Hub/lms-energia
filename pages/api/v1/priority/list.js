import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { prioritySelectSome } from "../../../../lib/constants";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { indexFilter } = req.query;
      const priorities = await prisma.priority.findMany({
        where: {
          workspaceId: userToken.workspaceId,
          active: indexFilter ? undefined : true, // show all the statuses in the list
        },
        select: prioritySelectSome,
      });
      response({ res, success: true, status_code: 200, data: priorities });
      return;
    } else {
      response({ res, success: false, status_code: 405, message: "Method not allowed" });
      return;
    }
  } catch (err) {
    console.error("error in priority index file", err);
    response({ res, success: false, status_code: 500, message: "Internal server error" });
  }
}
