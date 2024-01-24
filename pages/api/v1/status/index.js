import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { maxTake, statusSelectSome } from "../../../../lib/constants";
import { getRecordCounts, isUserAdmin } from "../../../../lib/backendUtils";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const status = await prisma.status.findMany({
          where: {
            workspaceId: userToken.workspaceId,
          },
          take: maxTake,
          select: statusSelectSome,
        });
        response({ res, success: true, status_code: 200, data: status, message: "Status fetched successfully" });
        return;
      } else {
        response({ res, success: false, status_code: 403, message: "You don't have access to view status" });
        return;
      }
    } else if (req.method === "POST") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const { statusName } = req.body;
        if (!statusName) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Please provide status name",
          });
          return;
        }
        const statusExists = await prisma.status.findFirst({
          where: {
            workspaceId: userToken.workspaceId,
            name: statusName,
          },
        });
        if (statusExists) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Status with this name already exists",
          });
          return;
        }
        const counts = await getRecordCounts(userToken.workspaceId);
        const [status, updateCount] = await prisma.$transaction([
          prisma.status.create({
            data: {
              id: counts.status + 1,
              name: statusName,
              createdById: userToken.userId,
              workspaceId: userToken.workspaceId,
            },
          }),
          prisma.recordCounts.update({
            where: {
              workspaceId: userToken.workspaceId,
            },
            data: {
              status: {
                increment: 1,
              },
            },
          }),
        ]);

        response({ res, success: true, status_code: 200, data: [status], message: "Status created successfully" });
        return;
      } else {
        response({ res, success: false, status_code: 403, message: "You don't have access to create status" });
        return;
      }
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
