import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { MaxNameLength, prioritySelectSome } from "../../../../lib/constants";
import { handlePrismaDeleteError, isUserAdmin } from "../../../../lib/backendUtils";
import * as yup from "yup";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    const id = Number(req.query.pid);
    let priorityDetails = null;
    if (id) {
      priorityDetails = await prisma.priority.findUnique({
        where: {
          workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
        },
        select: prioritySelectSome,
      });
      if (!priorityDetails) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "The requested priority does not exist.",
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "priority Id in URL is required",
      });
      return;
    }
    if (req.method === "GET") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        response({
          res,
          success: true,
          status_code: 200,
          data: [priorityDetails],
          message: "Priority fetched successfully",
        });
        return;
      }
    } else if (req.method === "PUT") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const { priorityName } = req.body;
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
            name: priorityName,
            workspaceId: userToken.workspaceId,
            id: {
              not: id,
            },
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

        const priority = await prisma.priority.update({
          where: {
            workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
          },
          data: {
            name: priorityName,
          },
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: [priority],
          message: "Priority updated successfully",
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 401,
          message: "You don't have access to update priority",
        });
        return;
      }
    } else if (req.method === "PATCH") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const { active } = req.body;
        const priority = await prisma.priority.update({
          where: {
            workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
          },
          data: {
            active: active,
          },
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: [priority],
          message: "Priority status updated successfully",
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 401,
          message: "You don't have access to update priority",
        });
        return;
      }
    } else if (req.method === "DELETE") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        try {
          const priorityDelet = await prisma.priority.delete({
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
            message: "Priority deleted successfully",
          });
          return;
        } catch (e) {
          const errRes = handlePrismaDeleteError(e, "Priority");
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
        response({
          res,
          success: false,
          status_code: 401,
          message: "You don't have access to delete priority",
        });
        return;
      }
    } else {
      response({ res, success: false, status_code: 405, message: "Method not Allowed" });
      return;
    }
  } catch (err) {
    console.log("Error in priority/[pid].js: ", err);
    response({ res, success: false, status_code: 500, message: "Some Internal Error Occured. Please try again later" });
  }
}
