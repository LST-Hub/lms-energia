import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { currencySelectSome } from "../../../../lib/constants";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const currency = await prisma.currency.findMany({
        where: {
          workspaceId: userToken.workspaceId,
          /** we are active true because we want to show the filed which is active in the
           * dropdown  */
          active: true,
        },
        select: currencySelectSome,
      });
      response({
        res,
        success: true,
        status_code: 200,
        message: "Currency list fetched successfully",
        data: currency,
      });
      return;
    }
  } catch (err) {
    console.error("error in currency index file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
