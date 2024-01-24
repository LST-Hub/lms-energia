import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { statusSelectSome } from "../../../../lib/constants";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { indexFilter } = req.query;
      const status = await prisma.status.findMany({
        where: {
          workspaceId: userToken.workspaceId,
          active: indexFilter ? undefined : true, // show all the statuses in the list
        },
        select: statusSelectSome,
      });
      response({ res, success: true, status_code: 200, data: status, message: "Status fetched successfully" });
      return;
    } else {
      response({ res, success: false, status_code: 405, message: "Method not allowed" });
      return;
    }
  } catch (err) {
    console.error("error in status index file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
