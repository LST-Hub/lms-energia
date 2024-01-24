import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { clientSelectIdName } from "../../../../lib/constants";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { indexFilter } = req.query;
      const clients = await prisma.client.findMany({
        where: {
          workspaceId: userToken.workspaceId,
          active: indexFilter ? undefined : true,
        },
        orderBy: {
          name: "asc",
        },
        // return all results, dont return only 100
        select: clientSelectIdName,
      });
      response({ res, success: true, status_code: 200, data: clients, message: "Clients fetched successfully" });
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
