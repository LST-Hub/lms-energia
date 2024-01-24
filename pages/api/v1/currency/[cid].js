import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { handlePrismaDeleteError, isUserAdmin } from "../../../../lib/backendUtils";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    const id = Number(req.query.cid);
    if (req.method === "DELETE") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        try {
          const currency = await prisma.currency.delete({
            where: {
              workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
            },
          });
          response({
            res,
            success: true,
            status_code: 200,
            data: [
              {
                deleted: true,
                hasChild: false,
                error: false,
              },
            ],
            message: "Currency deleted successfully",
          });
          return;
        } catch (e) {
          console.error("error in currency delete", e);
          const errRes = handlePrismaDeleteError(e, "Currency");
          response({
            res,
            success: false,
            status_code: 400,
            data: [
              {
                deleted: false,
                ...errRes,
              },
            ],
            message: errRes.message,
          });
          return;
        }
      } else {
        response({ res, success: false, status_code: 401, message: "You don't have access to delete Currency" });
      }
    } else {
      response({ res, success: false, status_code: 405, message: "Method not allowed" });
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
