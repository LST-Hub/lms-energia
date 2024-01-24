import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { maxTake, expenseHighlights } from "../../../../lib/constants";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { userId } = req.query;
      const idForUser = userId ? Number(userId) : undefined;
      const expenses = await prisma.expense.findMany({
        where: {
          workspaceId: userToken.workspaceId,
          createdById: idForUser,
        },
        take: maxTake,
        select: expenseHighlights,
      });
      response({
        res,
        success: true,
        status_code: 200,
        data: expenses,
        message: "Expenses fetched successfully",
      });
      return;
    }
  } catch (err) {
    console.error("error in expense index file", err);
    response({ res, success: false, status_code: 500, message: "Some Internal Error Occured. Please try again later" });
  }
}
