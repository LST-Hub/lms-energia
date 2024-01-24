import { WeeklyDays } from "@prisma/client";
import {
  preDefinedStatus,
  preDefinedPriorities,
  preDefinedExpenseCategories,
  preDefinedCurrency,
  preDefinedWorkCalId,
  preDefinedRoles,
  preDefinedWorkCal,
  perDefinedAdminRoleID,
} from "../../../../DBConstants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";

export default async function workspaceHandler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "POST") {
      // here we have divide workspace creation in two parts
      // first part is to create workspace minimum requirements
      // second part creates extra defaults things that we give system generated

      // we divide this step in parts as one API call on vercel can last only 10 second on free plan,
      // and at other platform also this can be issue
      // while creating and initilizing the workspace the DB was taking longer than 10 seconds,
      // when we tested it , currently, may be due to low configuration and resources

      // so we divided the workspace creation in 2 parts
      const { workspaceName, companySize, initilize1, initilize2, workspaceId } = req.body;

      if (initilize1 || initilize2) {
        if (!workspaceId) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "workspaceId is required, when initilizing",
          });
          return;
        }

        if (initilize1) {
          const workspace = await prisma.workspace.update({
            where: {
              id: workspaceId,
              createdByGlobalId: userToken.globalId, // only the user who created the workspace can initilize it
            },
            data: {
              workCalendars: {
                create: preDefinedWorkCal,
              },
              status: {
                create: preDefinedStatus,
              },
              priorities: {
                create: preDefinedPriorities,
              },
              currencies: {
                create: preDefinedCurrency,
              },
              expenseCategories: {
                create: preDefinedExpenseCategories,
              },
              recordCounts: {
                update: {
                  data: {
                    expenseCategory: preDefinedExpenseCategories.length,
                    status: preDefinedStatus.length,
                    priority: preDefinedPriorities.length,
                    currency: preDefinedCurrency.length,
                    workCalendar: preDefinedWorkCal.length, // added a workcalendar to this workspace
                  },
                },
              },
            },
            select: {
              id: true,
            },
          });
          response({
            res,
            success: true,
            status_code: 200,
            data: [workspace],
            message: "Workspace Initilized Successfully.",
          });
          return;
        }

        if (initilize2) {
          // getting the workspace id of the user from DB, due to security
          // as any user can pass any workspace Id, so taking his own workspaceId
          const workspaceExist = await prisma.workspace.findUnique({
            where: {
              id: workspaceId,
            },
            select: {
              createdByGlobalId: true,
            },
          });

          if (!workspaceExist || workspaceExist.createdByGlobalId !== userToken.globalId) {
            response({
              res,
              success: true,
              status_code: 400,
              message: "Unable to find workspace or you have not created it.",
            });
            return;
          }

          const [user, count] = await prisma.$transaction([
            prisma.user.update({
              where: {
                globalId: userToken.globalId, // only the user who created the workspace can initilize it
              },
              data: {
                // assign user to workspace and role and workcalendar
                workspaceId: workspaceId,
                roleId: perDefinedAdminRoleID,
                workCalendarId: preDefinedWorkCalId,
              },
              select: {
                id: true,
              },
            }),
            prisma.recordCounts.update({
              where: {
                workspaceId: workspaceId, // only the user who created the workspace can initilize it
              },
              data: {
                user: 1, // added workspace Creater to the workspace
              },
            }),
          ]);
          response({
            res,
            success: true,
            status_code: 200,
            data: [{ id: workspaceId }], // returning workspaceId as ahve returned workspaceId in other success response
            message: "Added user to workspace Successfully.",
          });
          return;
        }
        // if came in if statement of initilization then return here only and dont go down
        return;
      }

      if (!workspaceName) {
        response({
          res,
          success: false,
          status_code: 400,
          message: "workspaceName is required",
        });
        return;
      }
      // check if user is already a part of some workspace  or not,if exist then don't allow user to create workspace,
      // as user can be part of only one workspace at a time
      if (userToken.workspaceId) {
        response({
          res,
          success: false,
          status_code: 400,
          message:
            "You are already a part of Some workspace. So you cannot create a workspace with your current email. To create a workspace Please use a different email for a new account.",
        });
        return;
      }

      const workspace = await prisma.workspace.create({
        data: {
          name: workspaceName,
          companySize: companySize,
          createdByGlobalId: userToken.globalId,
          todayTaskSettings: {
            create: {
              // to to create a new today task settings recored
            },
          },
          timesheetSettings: {
            create: {
              // to to create a new timesheet setting record
            },
          },
          workspaceSettings: {
            create: {
              // to to create a new workspace setting record
            },
          },
          recordCounts: {
            create: {
              role: preDefinedRoles.length, // for roles created below
            },
          },
          roles: {
            // create a admin role in workspace
            create: preDefinedRoles,
          },
        },
      });

      response({
        res,
        success: true,
        status_code: 200,
        data: [workspace],
        message: "Workspace created successfully",
      });
      return;
    } else {
      response({ res, success: false, status_code: 400, message: "Method not allowed" });
      return;
    }
  } catch (err) {
    console.log("error while creating workspace", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
