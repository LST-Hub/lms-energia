import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { maxTake, timeEntryStatus, timesheetHighlights } from "../../../../lib/constants";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { roleId } = req.query;
      const idForRole = roleId ? Number(roleId) : undefined;
      const users = await prisma.user.findMany({
        where: {
          workspaceId: userToken.workspaceId,
          roleId: idForRole,
        },
        take: maxTake,
        select: {
          id: true,
          name: true,
          email: true,
          supervisor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      response({
        res,
        success: true,
        status_code: 200,
        data: users,
        message: "Users fetched successfully",
      });
      return;
    }
  } catch (err) {
    console.log("error in highlights/users.js", err);
    response({ res, success: false, status_code: 500, message: "Some Internal Error Occured. Please try again later" });
  }
}
