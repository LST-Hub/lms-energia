import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { deptSelectAll } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { handlePrismaDeleteError, isUserAdmin } from "../../../../lib/backendUtils";
import * as yup from "yup";

export default async function handler(req, res) {
  try {
    const did = req.query.did;
    const id = Number(did);
    const userToken = await authAndGetUserToken(req);
    let deptDetails = null;
    if (id) {
      deptDetails = await prisma.department.findUnique({
        where: {
          workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
        },
        select: deptSelectAll,
      });
      if (!deptDetails) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "The requested department does not exist.",
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "Please provide department Id the URL",
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
          data: [deptDetails],
          message: "Department details fetched successfully",
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to view departments",
        });
        return;
      }
    } else if (req.method === "PUT") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const { departmentName, departmentId, users } = req.body;
        // console.log("departmentName : ", departmentName);
        // console.log("departmentId : ", departmentId);
        // console.log("users : ", users);
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
          departmentName: yup.string().required().trim().max(50),
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

        // const u = users.map((user) => ({
        //   id: user.id,
        // }));
        // console.log("u : ", u);
        const departmentExists = await prisma.department.findFirst({
          where: {
            workspaceId: userToken.workspaceId,
            name: departmentName,
            id: {
              not: id,
            },
          },
        });
        if (departmentExists) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Department with this name already exists",
          });
          return;
        }
        const dept = await prisma.department.update({
          //TODO: Add workspaceId check and solve error after adding workspaceId
          where: {
            workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
          },
          data: {
            name: departmentName,
            // users: {
            //   set: u,
            // },
          },
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: [dept],
          message: "Department updated successfully",
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to update departments",
        });
        return;
      }
    } else if (req.method === "PATCH") {
      // console.log("INSIDE PATCH", req.body);
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const { active } = req.body;
        const department = await prisma.department.update({
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
          data: [department],
          message: "Department details updated successfully",
        });
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to update departments",
        });
        return;
      }
    } else if (req.method === "DELETE") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        try {
          const department = await prisma.department.delete({
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
            message: "Department deleted successfully",
          });
          return;
        } catch (e) {
          const errRes = handlePrismaDeleteError(e, "Department");
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
          message: "You don't have access to delete departments",
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
    console.error("error in department index file", error);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
    return;
  }
}
