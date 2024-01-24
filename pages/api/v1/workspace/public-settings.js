import { getTimesheetSettingsCache, getTodaysTaskSettingsCache } from "../../../../lib/backendUtils";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";

export default async function workspaceHandler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);

    // this method is used to get workspace settigns, inseted of ceating a new workspace settings api
    // htoigh its a post method, but it is used to get workspace settings
    if (req.method === "POST") {
      const { approvals, defaults, todaysTaskEnabled } = req.body;
      if (!approvals && !defaults) {
        response({
          res,
          success: false,
          status_code: 400,
          message: "approvals or defaults is required",
        });
        return;
      }
      const data = {};
      if (approvals) {
        const tsSettings = await getTimesheetSettingsCache(userToken.workspaceId);
        const ttSettings = await getTodaysTaskSettingsCache(userToken.workspaceId);
        data.approvalEnabledForTT = ttSettings.approvalEnabled;
        data.approvalEnabledForTS = tsSettings.approvalEnabled;
      }
      if (defaults || todaysTaskEnabled) {
        const select = {};
        if (todaysTaskEnabled) {
          select.todaysTaskEnabled = true;
        }
        if (defaults) {
          select.defaultWorkCal = {
            select: {
              id: true,
              name: true,
            },
          };
        }

        const workCal = await prisma.workspaceSettings.findUnique({
          where: {
            workspaceId: userToken.workspaceId,
          },
          select: select,
        });
        data.defaultWorkCal = workCal.defaultWorkCal;
        data.todaysTaskEnabled = workCal.todaysTaskEnabled;
      }

      response({
        res,
        success: true,
        status_code: 200,
        data: [data],
        message: "Workspace settings fetched successfully",
      });
      return;
    } else {
      response({ res, success: false, status_code: 400, message: "Method not allowed" });
      return;
    }
  } catch (err) {
    console.log("error in workspace public-settings page", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
