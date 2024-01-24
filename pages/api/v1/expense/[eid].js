import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import {
  MaxAmountLength,
  bigInpuMaxLength,
  expenseSelectAll,
  fileAttachmentSizeLimit,
  timeEntryStatus,
} from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { getAttachmentSize, handlePrismaDeleteError, isDataExists } from "../../../../lib/backendUtils";
import * as yup from "yup";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    const id = Number(req.query.eid);
    let expenseDetails = null;
    if (id) {
      expenseDetails = await prisma.expense.findUnique({
        where: {
          workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
          // createdById: userToken.userId,
        },
        select: expenseSelectAll,
      });
      if (!expenseDetails) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "The requested expense does not exist.",
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "Expense Id in URL is required",
      });
      return;
    }
    if (req.method === "GET") {
      response({
        res,
        success: true,
        status_code: 200,
        data: [expenseDetails],
        message: "Expense details fetched successfully",
      });
      return;
    } else if (req.method === "PUT") {
      const {
        date,
        amount,
        currencyId,
        categoryId,
        projectId,
        description,
        attachmentsData,
        submittedForApproval,
        deleteAttachment,
      } = req.body;

      const allValuesButAttachments = [date, amount, currencyId, categoryId, description];

      if (attachmentsData?.length > 0 && deleteAttachment !== true) {
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

      if (!isDataExists(allValuesButAttachments) && attachmentsData) {
        const updatedExpense = await prisma.expense.update({
          where: {
            workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
            createdById: userToken.userId,
          },
          data: {
            attachments: attachmentsData
              ? {
                  deleteMany: {},
                  create: attachmentsData.map((file) => {
                    return {
                      key: file?.key,
                      name: file?.name,
                      sizeInKb: file?.sizeInKb,
                      createdById: userToken.userId,
                      workspaceId: userToken.workspaceId,
                    };
                  }),
                }
              : undefined,
          },
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: [updatedExpense],
          message: "Expense updated successfully",
        });
        return;
      }
      // else if (!id || !date || !amount || !currencyId || !categoryId || !projectId) {
      //   response({
      //     res,
      //     success: false,
      //     status_code: 404,
      //     message: "Please provide all the required fields.",
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
      }

      const updatedExpense = await prisma.expense.update({
        where: {
          workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
          createdById: userToken.userId,
        },
        data: {
          date: new Date(date),
          amount: parseFloat(amount),
          currencyId: currencyId,
          expenseCategoryId: categoryId,
          projectId: projectId,
          memo: description,
          createdById: userToken.userId,
          workspaceId: userToken.workspaceId,
          attachments: attachmentsData
            ? {
                deleteMany: {},
                create: attachmentsData.map((file) => {
                  return {
                    key: file?.key,
                    name: file?.name,
                    sizeInKb: file?.sizeInKb,
                    createdById: userToken.userId,
                    workspaceId: userToken.workspaceId,
                  };
                }),
              }
            : attachmentsData,
          submittedForApproval: submittedForApproval,
          status: submittedForApproval === true ? timeEntryStatus.Pending : undefined,
        },
      });
      response({
        res,
        success: true,
        status_code: 200,
        data: [updatedExpense],
        message: "Expense updated successfully",
      });
      return;
    } else if (req.method === "PATCH") {
      const { id, submittedForApproval, status } = req.body;
      if (!id || !submittedForApproval || !status) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "Please provide all the required fields.",
        });
        return;
      } else {
        const updateApprovalStatus = await prisma.expense.update({
          where: {
            workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
            createdById: userToken.userId,
          },
          data: {
            submittedForApproval: submittedForApproval,
            status: submittedForApproval === true ? timeEntryStatus.Pending : undefined,
          },
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: [updateApprovalStatus],
          message: "Expense updated successfully",
        });
      }
    } else if (req.method === "DELETE") {
      try {
        const deletedExpense = await prisma.expense.delete({
          where: {
            workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
            createdById: userToken.userId,
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
          message: "Expense deleted successfully",
        });
        return;
      } catch (e) {
        const errRes = handlePrismaDeleteError(e, "Expense");
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
        status_code: 405,
        message: "Method not allowed",
      });
      return;
    }
  } catch (error) {
    console.log(error);
    response({ res, success: false, status_code: 500, message: "Some Internal Error Occured. Please try again later" });
    return;
  }
}
