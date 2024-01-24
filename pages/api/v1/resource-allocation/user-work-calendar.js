import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { workCalSelectAll } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { isUserAdmin } from "../../../../lib/backendUtils";

export default async function handler(req, res) {
  try {
    const { userId } = req.query;
    const id = Number(userId);
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const workCalendars = await prisma.workCalendar.findMany({
          where: {
            users: {
              some: {
                id: id,
              },
            },
            workspaceId: userToken.workspaceId,
          },
          select: workCalSelectAll,
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: workCalendars,
          message: "Work Calendars are fetched successfully",
        });
        return;
      }
    }
  } catch (err) {
    console.error("error while fetching the work calendar details", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
