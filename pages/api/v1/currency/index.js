import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { currencySelectSome } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { getRecordCounts, handlePrismaDeleteError, isUserAdmin } from "../../../../lib/backendUtils";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const currencies = await prisma.currency.findMany({
          where: {
            workspaceId: userToken.workspaceId,
          },
          select: currencySelectSome,
        });
        const resCurr = currencies.map((curr) => {
          return {
            id: curr.id,
            country: curr.currency.country,
            code: curr.currency.code,
            active: curr.active,
          };
        });
        response({ res, success: true, status_code: 200, data: resCurr, message: "Currency fetched successfully" });
      } else {
        response({ res, success: false, status_code: 401, message: "You don't have access to view Currency" });
      }
    } else if (req.method === "POST") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const { currencyId } = req.body;

        if (typeof currencyId !== "number") {
          response({ res, success: false, status_code: 400, message: "currencyId must be a number" });
          return;
        }

        if (!currencyId) {
          response({ res, success: false, status_code: 400, message: "Please select currency" });
          return;
        }

        const currencyExists = await prisma.currency.findFirst({
          where: {
            workspaceId: userToken.workspaceId,
            currencyId: currencyId,
          },
        });
        if (currencyExists) {
          response({ res, success: false, status_code: 400, message: "Currency already exists" });
          return;
        }

        const counts = await getRecordCounts(userToken.workspaceId);
        const [currency, updateCount] = await prisma.$transaction([
          prisma.currency.create({
            data: {
              id: counts.currency + 1,
              currencyId: currencyId,
              createdById: userToken.userId,
              workspaceId: userToken.workspaceId,
            },
          }),
          prisma.recordCounts.update({
            where: {
              workspaceId: userToken.workspaceId,
            },
            data: {
              currency: {
                increment: 1,
              },
            },
          }),
        ]);

        response({ res, success: true, status_code: 200, data: [currency], message: "Currency added successfully" });
      } else {
        response({ res, success: false, status_code: 401, message: "You don't have access to add Currency" });
      }
    } else if (req.method === "PATCH") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const { id, active } = req.body;
        const currencyStatus = await prisma.currency.update({
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
          data: [currencyStatus],
          message: "Currency status updated successfully",
        });
      } else {
        response({ res, success: false, status_code: 401, message: "You don't have access to update Currency" });
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "Methos not allowed.",
      });
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
