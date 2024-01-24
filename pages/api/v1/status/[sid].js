import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { statusSelectSome } from "../../../../lib/constants";
import { isUserAdmin } from "../../../../lib/backendUtils";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    const id = Number(req.query.sid);
    let statusDetails = null;
    if (id) {
      statusDetails = await prisma.status.findUnique({
        where: {
          workspaceId_id:{id: id,
          workspaceId: userToken.workspaceId,}
        },
        select: statusSelectSome,
      });
      if (!statusDetails) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "The requested status does not exist.",
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "status Id in URL is required",
      });
      return;
    }
    if (req.method === "PUT") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const { statusName, statusColor } = req.body;
        if (!statusName || !statusColor) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Please provide status name",
          });
          return;
        } else {
          const status = await prisma.status.update({
            where: {
              workspaceId_id:{id: id,
              workspaceId: userToken.workspaceId,}
            },
            data: {
              name: statusName,
            },
          });
          response({ res, success: true, status_code: 200, data: [status], message: "Status updated successfully" });
          return;
        }
      } else {
        response({ res, success: false, status_code: 401, message: "You are not authorized to perform this action" });
        return;
      }
    } else if (req.method === "PATCH") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const { active } = req.body;
        const status = await prisma.status.update({
          where: {
            workspaceId_id:{id: id,
            workspaceId: userToken.workspaceId,}
          },
          data: {
            active: active,
          },
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: [status],
          message: "Status updated successfully",
        });
        return;
      } else {
        response({ res, success: false, status_code: 401, message: "You are not authorized to perform this action" });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 405,
        message: "Method not allowed",
      });
      return;
    }
  } catch (error) {
    console.log("Error in status/[sid].js: ", error);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
