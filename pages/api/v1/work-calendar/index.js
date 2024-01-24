import { getRecordCounts, isUserAdmin, isValidDate } from "../../../../lib/backendUtils";
import { MaxNameLength, bigInpuMaxLength, maxTake, workCalSelectSome } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import * as yup from "yup";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { active } = req.query;
      let workCalendarsActive = undefined;
      if (active) {
        workCalendarsActive = active === "true" ? true : false;
      }
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const workCalendars = await prisma.workCalendar.findMany({
          where: {
            workspaceId: userToken.workspaceId,
            active: workCalendarsActive,
          },
          select: workCalSelectSome,
          take: maxTake,
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: workCalendars,
          message: "Work calendars are fetched successfully",
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 401,
          message: "You don't have access to view Work Calendars",
        });
        return;
      }
    } else if (req.method === "POST") {
      const hasAccess = await isUserAdmin(userToken.userId, userToken.workspaceId);
      if (hasAccess) {
        const { name, description, startTime, workingDays, nonWorkingDays } = req.body;

        const schema = yup.object().shape({
          name: yup.string().required().trim().max(MaxNameLength),
          description: yup.string().trim().max(bigInpuMaxLength),
          startTime: yup.number().required(),
          workingDays: yup.array().of(
            yup.object().shape({
              day: yup.string().required(),
              time: yup.number().required(),
            })
          ),
          nonWorkingDays: yup.array().of(
            yup.object().shape({
              date: yup.string(),
              description: yup.string().trim().max(bigInpuMaxLength),
            })
          ),
        });

        try {
          await schema.validate({
            name,
            description,
            startTime,
            workingDays,
            nonWorkingDays,
          });
        } catch (error) {
          console.error("error in work calendar validation", error);
          response({
            res,
            success: false,
            status_code: 400,
            message: error.message,
          });
          return;
        }

        if (
          !name ||
          !Array.isArray(nonWorkingDays) ||
          !Array.isArray(workingDays) ||
          startTime === null ||
          startTime === undefined ||
          startTime === ""
        ) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Name is required and startTime are required",
          });
          return;
        } else {
          const workCalExists = await prisma.workCalendar.findFirst({
            where: {
              workspaceId: userToken.workspaceId,
              name: name,
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
          const nonWdays = [];
          for (let i = 0; i < nonWorkingDays.length; i++) {
            const d = new Date(nonWorkingDays[i].date);
            if (!isValidDate(d)) {
              response({
                res,
                success: false,
                status_code: 400,
                message: "Invalid Date" + nonWorkingDays[i].date + " " + "Please pass date in correct format.",
              });
              return;
            }
            nonWdays.push({
              date: d,
              description: nonWorkingDays[i].description,
            });
          }

          const counts = await getRecordCounts(userToken.workspaceId);
          const [cal, updateCount] = await prisma.$transaction([
            prisma.workCalendar.create({
              data: {
                id: counts.workCalendar + 1,
                name: name,
                description: description,
                startTime: startTime,
                weeklyWorkingDays: {
                  create: workingDays,
                },
                nonWorkingDays: {
                  create: nonWdays,
                },
                workspaceId: userToken.workspaceId,
                createdById: userToken.userId,
              },
            }),
            prisma.recordCounts.update({
              where: {
                workspaceId: userToken.workspaceId,
              },
              data: {
                workCalendar: {
                  increment: 1,
                },
              },
            }),
          ]);

          response({
            res,
            success: true,
            status_code: 200,
            data: [cal],
            message: "Work calendar is created successfully",
          });
          return;
        }
      } else {
        response({
          res,
          success: false,
          status_code: 401,
          message: "You don't have access to create Work Calendar",
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
    console.log("error occured in work calendar index file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
