import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const userData = await prisma.account.findUnique({
        where: {
          userId: userToken.globalId,
        },
        select: {
          id: true,
          userId: true,
        },
      });
      response({
        res,
        success: true,
        status_code: 200,
        message: "User Data",
        data: [userData],
      });
      return;
    } else {
      response({
        res,
        success: false,
        status_code: 405,
        message: "Method Not Allowed",
      });
      return;
    }
  } catch (err) {
    console.error("error in user index page", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
    return;
  }
}
