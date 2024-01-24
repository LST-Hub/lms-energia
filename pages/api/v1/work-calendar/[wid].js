import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { workCalSelectAll } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { handlePrismaDeleteError, isUserAdmin, isValidDate } from "../../../../lib/backendUtils";

export default async function handler(req, res) {
  try {
    const wid = req.query.wid;
    const id = Number(wid);
    const userToken = await authAndGetUserToken(req);
    let CalDetails = null;
    if (id) {
      CalDetails = await prisma.workCalendar.findUnique({
        where: {
          workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
        },
        select: workCalSelectAll,
      });
      if (!CalDetails) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "The requested work calendar does not exist.",
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "Work Calendar Id in URl is required",
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
          data: [CalDetails],
          message: "Work calendar details fetched successfully",
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 401,
          message: "You don't have access to view WorkCalendar Details",
        });
        return;
      }
    } else if (req.method === "PUT") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const {
          name,
          description,
          startTime,
          active,
          workingDays,
          setNonWorkingDays,
          addNonWorkinDays,
          deleteNonWorkingDaysIds,
        } = req.body;

        if (!name || startTime === null || startTime === undefined || startTime === "") {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Name is required and workingDays are required",
          });
          return;
        } else {
          const workCalExists = await prisma.workCalendar.findFirst({
            where: {
              workspaceId: userToken.workspaceId,
              name: name,
              id: {
                not: id,
              },
            },
          });
          if (workCalExists) {
            response({
              res,
              success: false,
              status_code: 400,
              message: "Work calendar with this name already exists",
            });
            return;
          }
        }

        const queryData = {
          name: name,
          description: description,
          startTime: startTime,
          active: active,
          weeklyWorkingDays: {
            // first delete all working days and then add new ones
            deleteMany: {},
            create: workingDays,
          },
        };

        // set empty array if nonWorkingDays is passed as empty array, means delete all non working days
        if (Array.isArray(setNonWorkingDays)) {
          const nonWdays = [];
          for (let i = 0; i < setNonWorkingDays.length; i++) {
            const d = new Date(setNonWorkingDays[i].date);
            if (!isValidDate(d)) {
              response({
                res,
                success: false,
                status_code: 400,
                message: "Invalid Date" + setNonWorkingDays[i].date + " " + "Please pass date in correct format.",
              });
              return;
            }
            nonWdays.push({
              date: new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())),
              description: setNonWorkingDays[i].description,
            });
          }
          //TODO: this will not work as set if done only on id's
          queryData.nonWorkingDays = {
            set: nonWdays,
          };
        } else {
          const addNonWdays = [];
          // check if soomething is passed in addNonWorkingDays, else dont add it
          if (Array.isArray(addNonWorkinDays) && addNonWorkinDays.length > 0) {
            for (let i = 0; i < addNonWorkinDays.length; i++) {
              const d = new Date(addNonWorkinDays[i].date);
              if (!isValidDate(d)) {
                response({
                  res,
                  success: false,
                  status_code: 400,
                  message: "Invalid Date" + addNonWorkinDays[i].date + " " + "Please pass date in correct format.",
                });
                return;
              }
              addNonWdays.push({
                date: new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())),
                description: addNonWorkinDays[i].description,
              });
            }

            // create a non working day if id does not exist or merge if it exists
            if (!queryData.nonWorkingDays) {
              queryData.nonWorkingDays = { create: addNonWdays };
            } else {
              queryData.nonWorkingDays.deleteMany = { id: { in: deleteNonWorkingDaysIds } };
            }
          }
          // create a non working day if id does not exist or merge if it exists
          if (Array.isArray(deleteNonWorkingDaysIds) && deleteNonWorkingDaysIds.length > 0) {
            if (!queryData.nonWorkingDays) {
              queryData.nonWorkingDays = { deleteMany: { id: { in: deleteNonWorkingDaysIds } } };
            } else {
              queryData.nonWorkingDays.deleteMany = { id: { in: deleteNonWorkingDaysIds } };
            }
          }
        }

        const cal = await prisma.workCalendar.update({
          where: {
            workspaceId_id: { id: id, workspaceId: userToken.workspaceId },
          },
          data: queryData,
        });

        response({
          res,
          success: true,
          status_code: 200,
          data: [cal],
          message: "Work calendar updated successfully",
        });
      } else {
        response({
          res,
          success: false,
          status_code: 401,
          message: "You don't have access to update work calendar Details",
        });
        return;
      }
    } else if (req.method === "PATCH") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const { active } = req.body;
        const cal = await prisma.workCalendar.update({
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
          data: [cal],
          message: "Work calendar updated successfully",
        });
      } else {
        response({
          res,
          success: false,
          status_code: 401,
          message: "You don't have access to update WorkCalendar Details",
        });
        return;
      }
    } else if (req.method === "DELETE") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        try {
          const workCal = await prisma.workCalendar.delete({
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
            message: "Work calendar deleted successfully",
          });
          return;
        } catch (e) {
          const errRes = handlePrismaDeleteError(e, "Work Calendar");
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
          message: "You don't have access to delete this Work Calendar",
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
  } catch (err) {
    console.error("error while fetching the work calendar details", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
