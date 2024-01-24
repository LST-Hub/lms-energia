import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { MaxNameLength, deptSelectSome, maxTake } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { getRecordCounts, isUserAdmin } from "../../../../lib/backendUtils";
import * as yup from "yup";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const dept = await prisma.department.findMany({
          where: {
            workspaceId: userToken.workspaceId,
          },
          take: maxTake,
          select: deptSelectSome,
        });
        response({ res, success: true, status_code: 200, data: dept, message: "Department fetched successfully" });
        return;
      } else {
        response({ res, success: false, status_code: 403, message: "You don't have access to view departments" });
        return;
      }
    } else if (req.method === "POST") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const { departmentName } = req.body;
        if (!departmentName) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Please provide all the required fields",
          });
          return;
        }

        const schema = yup.object().shape({
          departmentName: yup.string().required().trim().max(MaxNameLength),
        });

        try {
          await schema.validate({
            departmentName,
          });
        } catch (error) {
          console.error("error in department validation", error);
          response({
            res,
            success: false,
            status_code: 400,
            message: error.message,
          });
          return;
        }

        // check if department already exists
        const departmentExists = await prisma.department.findFirst({
          where: {
            workspaceId: userToken.workspaceId,
            name: departmentName,
          },
        });
        // return error if department already exists
        if (departmentExists) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Department with this name already exists",
          });
          return;
        }

        const counts = await getRecordCounts(userToken.workspaceId);
        const [dept, updateCount] = await prisma.$transaction([
          prisma.department.create({
            data: {
              id: counts.department + 1,
              name: departmentName,
              workspaceId: userToken.workspaceId,
              createdById: userToken.userId,
            },
          }),
          prisma.recordCounts.update({
            where: {
              workspaceId: userToken.workspaceId,
            },
            data: {
              department: {
                increment: 1,
              },
            },
          }),
        ]);

        response({ res, success: true, status_code: 200, data: [dept], message: "Department created successfully" });
        return;
      } else {
        response({ res, success: false, status_code: 403, message: "You don't have access to create department" });
        return;
      }
    } else {
      response({ res, success: false, status_code: 405, message: "Method not allowed" });
      return;
    }
  } catch (err) {
    console.error("error in department index file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
