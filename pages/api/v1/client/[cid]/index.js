import prisma from "../../../../../lib/prisma";
import response from "../../../../../lib/response";
import { MaxEmailLength, MaxNameLength, MaxPhoneNumberLength, bigInpuMaxLength, clientSelectAll } from "../../../../../lib/constants";
import { authAndGetUserToken } from "../../../../../lib/getSessionData";
import { perAccessIds, permissionTypeIds } from "../../../../../DBConstants";
import { handlePrismaDeleteError, isUserHasAccess } from "../../../../../lib/backendUtils";
import * as yup from "yup";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    const id = Number(req.query.cid);
    let clientDetails = null;
    if (id) {
      clientDetails = await prisma.client.findUnique({
        where: {
          workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
        },
        select: clientSelectAll,
      });
      if (!clientDetails) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "The requested client does not exist.",
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "Client Id in URL is required",
      });
      return;
    }
    if (req.method === "GET") {
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.clients,
        perAccessIds.view,
        {}
      );
      if (hasAccess) {
        response({
          res,
          success: true,
          status_code: 200,
          data: [clientDetails],
          message: "Client details fetched successfully",
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 401,
          message: "You don't have access to view this client.",
        });
        return;
      }
    } else if (req.method === "PUT") {
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.clients,
        perAccessIds.edit,
        {}
      );
      if (hasAccess) {
        const { clientName, clientEmail, phoneNumber, active, notes } = req.body;
        if (!clientName) {
          response({
            res,
            success: false,
            status_code: 404,
            message: "Please provide clientName.",
          });
          return;
        }
        const clientExists = await prisma.client.findFirst({
          where: {
            name: clientName,
            workspaceId: userToken.workspaceId,
            id: {
              not: id,
            },
          },
        });
        if (clientExists) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Client with this name already exists.",
          });
          return;
        }

        const schema = yup.object().shape({
          clientName: yup.string().required().trim().max(MaxNameLength),
          clientEmail: yup.string().trim().email().max(MaxEmailLength).nullable(),
          phoneNumber: yup.string().trim().max(MaxPhoneNumberLength).nullable(),
          notes: yup.string().trim().max(bigInpuMaxLength).nullable(),
        });

        try {
          await schema.validate({
            clientName,
            clientEmail,
            phoneNumber,
            notes,
          });
        } catch (error) {
          console.error("error in client validation", error);
          response({
            res,
            success: false,
            status_code: 400,
            message: error.message,
          });
          return;
        }

        const updatedClient = await prisma.client.update({
          where: {
            workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
          },
          data: {
            name: clientName,
            email: clientEmail,
            phone: phoneNumber,
            active: active,
            notes: notes,
          },
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: [updatedClient],
          message: "Client details updated successfully",
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to edit this client.",
        });
        return;
      }
    } else if (req.method === "PATCH") {
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.clients,
        perAccessIds.edit,
        {}
      );
      if (hasAccess) {
        const { active } = req.body;
        const client = await prisma.client.update({
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
          data: [client],
          message: "Client Details updated successfully",
        });
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to edit this client.",
        });
        return;
      }
    } else if (req.method === "DELETE") {
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.clients,
        perAccessIds.all,
        {}
      );
      if (hasAccess) {
        try {
          const deletedClient = await prisma.client.delete({
            where: { workspaceId_id: { id: id, workspaceId: userToken.workspaceId } },
          });

          // redisDelClient(id, userToken.workspaceId);

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
            message: "Client deleted successfully",
          });
        } catch (e) {
          const errRes = handlePrismaDeleteError(e, "Client");
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
          status_code: 403,
          message: "You don't have access to delete this client.",
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "Method not allowed",
      });
      return;
    }
  } catch (error) {
    console.error("error in client/[cid] file", error);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
    return;
  }
}
