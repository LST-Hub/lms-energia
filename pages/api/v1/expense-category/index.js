import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { MaxNameLength, bigInpuMaxLength, expenseCategorySelectSome, maxTake } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { getRecordCounts, isUserAdmin } from "../../../../lib/backendUtils";
import * as yup from "yup";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const expenseCategories = await prisma.expenseCategory.findMany({
          where: {
            workspaceId: userToken.workspaceId,
          },
          take: maxTake,
          select: expenseCategorySelectSome,
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: expenseCategories,
          message: "Expese category fetched successfully",
        });
        return;
      } else {
        response({ res, success: false, status_code: 401, message: "You don't have access to view Expense Category" });
      }
    }
    if (req.method === "POST") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const { name, description } = req.body;
        if (!name) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Please provide all the required fields",
          });
          return;
        }

        const schema = yup.object().shape({
          name: yup.string().required().required().trim().max(MaxNameLength),
          description: yup.string().trim().max(bigInpuMaxLength),
        });

        try {
          await schema.validate({
            name,
            description,
          });
        } catch (error) {
          console.error("error in expense category validation", error);
          response({
            res,
            success: false,
            status_code: 400,
            message: error.message,
          });
          return;
        }

        const expenseCategoryExists = await prisma.expenseCategory.findFirst({
          where: {
            workspaceId: userToken.workspaceId,
            name: name,
          },
        });

        if (expenseCategoryExists) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Expense category with this name already exists",
          });
          return;
        }

        const counts = await getRecordCounts(userToken.workspaceId);
        const [expenseCategory, updateCount] = await prisma.$transaction([
          prisma.expenseCategory.create({
            data: {
              id: counts.expenseCategory + 1,
              name: name,
              description: description,
              workspaceId: userToken.workspaceId,
              createdById: userToken.userId,
            },
          }),
          prisma.recordCounts.update({
            where: {
              workspaceId: userToken.workspaceId,
            },
            data: {
              expenseCategory: {
                increment: 1,
              },
            },
          }),
        ]);

        response({
          res,
          success: true,
          status_code: 200,
          data: [expenseCategory],
          message: "Expense category created successfully",
        });
      } else {
        response({
          res,
          success: false,
          status_code: 401,
          message: "You don't have access to create expense category",
        });
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "Invalid request method",
      });
    }
  } catch (err) {
    console.error("error in client index file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
