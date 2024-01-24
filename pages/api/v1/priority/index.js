import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { MaxNameLength, maxTake, prioritySelectSome } from "../../../../lib/constants";
import { getRecordCounts, isUserAdmin } from "../../../../lib/backendUtils";
import * as yup from "yup";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const priorities = await prisma.priority.findMany({
          where: {
            workspaceId: userToken.workspaceId,
          },
          take: maxTake,
          select: prioritySelectSome,
        });
        response({ res, success: true, status_code: 200, data: priorities, message: "Priority fetched successfully" });
        return;
      } else {
        response({ res, success: false, status_code: 403, message: "You don't have access to view priorities" });
        return;
      }
    } else if (req.method === "POST") {
      const { priorityName } = req.body;
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        if (!priorityName) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Please provide priority name",
          });
          return;
        }

        const schema = yup.object().shape({
          priorityName: yup.string().required().trim().max(MaxNameLength),
        });

        try {
          await schema.validate({
            priorityName,
          });
        } catch (error) {
          console.error("error in priority validation", error);
          response({
            res,
            success: false,
            status_code: 400,
            message: error.message,
          });
          return;
        }

        const priorityExists = await prisma.priority.findFirst({
          where: {
            workspaceId: userToken.workspaceId,
            name: priorityName,
          },
        });
        if (priorityExists) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Priority with this name already exists",
          });
          return;
        }

        const counts = await getRecordCounts(userToken.workspaceId);
        const [priority, updateCount] = await prisma.$transaction([
          prisma.priority.create({
            data: {
              id: counts.priority + 1,
              name: priorityName,
              createdById: userToken.userId,
              workspaceId: userToken.workspaceId,
            },
          }),
          prisma.recordCounts.update({
            where: {
              workspaceId: userToken.workspaceId,
            },
            data: {
              priority: {
                increment: 1,
              },
            },
          }),
        ]);

        response({ res, success: true, status_code: 200, data: [priority], message: "Priority created successfully" });
      } else {
        response({ res, success: false, status_code: 403, message: "You don't have access to create priority" });
      }
    } else {
      response({ res, success: false, status_code: 405, message: "Method not allowed" });
      return;
    }
  } catch (err) {
    console.error("error in priority index file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
