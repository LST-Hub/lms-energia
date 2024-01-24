import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { expenseCategorySelectList, maxTake } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const {indexFilter} = req.query;
      const expenseCategories = await prisma.expenseCategory.findMany({
        where: {
          workspaceId: userToken.workspaceId,
          active: indexFilter ? undefined : true,
        },
        orderBy: {
          name: "asc",
        },
        take: maxTake,
        select: expenseCategorySelectList,
      });
      response({ res, success: true, status_code: 200, data: expenseCategories });
      return;
    } else {
      response({ res, success: false, status_code: 400, message: "Method not allowed" });
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
