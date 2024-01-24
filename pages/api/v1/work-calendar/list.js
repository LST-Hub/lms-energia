import { maxTake, workCalSelectSome } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const workCalendars = await prisma.workCalendar.findMany({
        where: {
          workspaceId: userToken.workspaceId,
          active: true,
        },
        orderBy: {
          name: "asc",
        },
        select: workCalSelectSome,
        take: maxTake,
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
  } catch (err) {
    console.log("error occured in work calendar index file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
