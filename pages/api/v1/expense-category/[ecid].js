import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { MaxNameLength, bigInpuMaxLength, expenseCategorySelectAll } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { handlePrismaDeleteError, isUserAdmin } from "../../../../lib/backendUtils";
import * as yup from "yup";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    const id = Number(req.query.ecid);
    let expenseCategoryDetails = null;
    if (id) {
      expenseCategoryDetails = await prisma.expenseCategory.findUnique({
        where: {
          workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
        },
        select: expenseCategorySelectAll,
      });
      if (!expenseCategoryDetails) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "The requested expense category does not exist.",
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "Expense Category Id in URL is required",
      });
      return;
    }
    if (req.method === "GET") {
      const hasAccess = isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        response({
          res,
          success: true,
          status_code: 200,
          data: [expenseCategoryDetails],
          message: "Expense Category Details fetched successfully",
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 401,
          message: "You don't have access to view Expense Category Details",
        });
        return;
      }
    } else if (req.method === "PUT") {
      const hasAccess = isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const { name, active, description } = req.body;
        const schema = yup.object().shape({
          name: yup.string().required().trim().max(MaxNameLength),
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

        if (!name) {
          response({
            res,
            success: false,
            status_code: 404,
            message: "Please provide expense category Name.",
          });
          return;
        } else {
          const expenseCategoryExists = await prisma.expenseCategory.findFirst({
            where: {
              workspaceId: userToken.workspaceId,
              name: name,
              id: {
                not: id,
              },
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
        }

        const updatedExpenseCategory = await prisma.expenseCategory.update({
          where: {
            workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
          },
          data: {
            name: name,
            active: active,
            description: description,
          },
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: [updatedExpenseCategory],
          message: "Expense category updated successfully",
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 401,
          message: "You don't have access to update Expense Category Details",
        });
        return;
      }
    } else if (req.method === "PATCH") {
      const hasAccess = isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const { active } = req.body;
        const client = await prisma.expenseCategory.update({
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
          message: "Expense Category Details updated successfully",
        });
      } else {
        response({
          res,
          success: false,
          status_code: 400,
          message: "Invalid Request",
        });
        return;
      }
    } else if (req.method === "DELETE") {
      const hasAccess = isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        try {
          const deletedExpenseCategory = await prisma.expenseCategory.delete({
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
            message: "Expense category deleted successfully",
          });
          return;
        } catch (e) {
          const errRes = handlePrismaDeleteError(e, "Expense Category");
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
          message: "You don't have access to delete Expense Category Details",
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "Invalid Request",
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
