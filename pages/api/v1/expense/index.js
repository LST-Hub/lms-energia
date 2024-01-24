import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import {
  MaxAmountLength,
  bigInpuMaxLength,
  expenseSelectSome,
  fileAttachmentSizeLimit,
  maxTake,
  timeEntryStatus,
} from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { getAttachmentSize, getRecordCounts } from "../../../../lib/backendUtils";
import * as yup from "yup";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { expenseCategoryId, status } = req.query;
      const idForCategory = expenseCategoryId ? Number(expenseCategoryId) : undefined;
      const idForStatus = status ? status : undefined;
      const expenses = await prisma.expense.findMany({
        where: {
          AND: {
            workspaceId: userToken.workspaceId,
            createdById: userToken.userId,
            expenseCategoryId: idForCategory,
            status: idForStatus,
          },
        },
        take: maxTake,
        orderBy: {
          date: "desc",
        },
        select: expenseSelectSome,
      });

      response({ res, success: true, status_code: 200, data: expenses, message: "Expense fetched successfully" });
      return;
    } else if (req.method === "POST") {
      const { date, amount, currencyId, categoryId, projectId, description, attachmentsData, submittedForApproval } =
        req.body;

      // if (!date || !amount || !currencyId || !categoryId || !projectId) {
      //   response({
      //     res,
      //     success: false,
      //     status_code: 400,
      //     message: "Please provide Date , Amount, Currency, Project and Category",
      //   });
      //   return;
      // }

      const schema = yup.object().shape({
        date: yup.date().required(),
        amount: yup.number().required().max(MaxAmountLength),
        currencyId: yup.number().required(),
        categoryId: yup.number().required(),
        projectId: yup.number().required(),
        description: yup.string().trim().max(bigInpuMaxLength),
      });

      try {
        await schema.validate({
          date,
          amount,
          currencyId,
          categoryId,
          projectId,
          description,
        });
      } catch (error) {
        console.error("error in expense index file", error);
        response({
          res,
          success: false,
          status_code: 400,
          message: error.message,
        });
        return;
      }

      if (attachmentsData?.length > 0) {
        let newFilesSize = 0;
        attachmentsData.forEach((file) => {
          newFilesSize += file.sizeInKb;
        });

        const attachmentSize = await getAttachmentSize(userToken.userId, userToken.workspaceId);

        if (attachmentSize + newFilesSize >= fileAttachmentSizeLimit) {
          response({
            res,
            success: false,
            status_code: 400,
            message: `You have exceeded the attachment limit of ${fileAttachmentSizeLimit}KB`,
          });
          return;
        }
      }

      const counts = await getRecordCounts(userToken.workspaceId);
      const [expense, updateCount] = await prisma.$transaction([
        prisma.expense.create({
          data: {
            id: counts.expense + 1,
            date: new Date(date),
            amount: Number(amount),
            currencyId: currencyId,
            projectId: projectId,
            expenseCategoryId: categoryId,
            memo: description,
            createdById: userToken.userId,
            workspaceId: userToken.workspaceId,
            attachments: attachmentsData
              ? {
                  create: attachmentsData.map((file) => {
                    return {
                      key: file.key,
                      name: file.name,
                      sizeInKb: file.sizeInKb,
                      createdById: userToken.userId,
                      workspaceId: userToken.workspaceId,
                    };
                  }),
                }
              : attachmentsData,
            submittedForApproval: submittedForApproval,
            status: submittedForApproval === true ? timeEntryStatus.Pending : timeEntryStatus.Draft,
          },
        }),
        prisma.recordCounts.update({
          where: {
            workspaceId: userToken.workspaceId,
          },
          data: {
            expense: {
              increment: 1,
            },
          },
        }),
      ]);

      response({ res, success: true, status_code: 200, data: [expense], message: "Expense added successfully" });
      return;
    } else if (req.method === "PATCH") {
      const { expenseIds, submittedForApproval, status } = req.body;
      if (!expenseIds) {
        response({
          res,
          success: false,
          status_code: 400,
          message: "Please provide expense Ids",
        });
        return;
      }
      if (Array.isArray(expenseIds) && expenseIds.length > 0) {
        let updateExpense = [];
        expenseIds.map(async (id) => {
          const expense = await prisma.expense.update({
            where: {
              workspaceId_id: { id: Number(id), workspaceId: userToken.workspaceId },
              createdById: userToken.userId,
            },
            data: {
              submittedForApproval: submittedForApproval,
              status: submittedForApproval === true ? timeEntryStatus.Pending : undefined,
            },
          });
          updateExpense.push(expense);
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: [updateExpense],
          message: "Expense updated successfully",
        });
      }
    } else {
      response({ res, success: false, status_code: 405, message: "Method Not Allowed" });
      return;
    }
  } catch (err) {
    console.error("error in expense index file", err);
    response({ res, success: false, status_code: 500, message: "Some Internal Error Occured. Please try again later" });
  }
}
