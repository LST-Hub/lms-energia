import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { projectSelectIdName } from "../../../../lib/constants";
// import { isUserHasAccess } from "../../../../lib/backendUtils";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { myProjects, PMprojects,indexFilter } = req.query;
      // we decide dto not to check access for listt api's, but later will have access checks
      // const hasAccess = await isUserHasAccess(userToken.userId,userToken.workspaceId, permissionTypeIds.projAndTask, perAccessIds.view);
      const project = await prisma.project.findMany({
        where: {
          workspaceId: userToken.workspaceId,
          active: indexFilter ? undefined : true,
          projectUsers:
            // by default return all projets of the current user, and optionally return all projects if asked
            myProjects === "true"
              ? {
                  some: { userId: userToken.userId },
                }
              : undefined,
          pmId: PMprojects === "true" ? userToken.userId : undefined,
        },
        orderBy: {
          name: "asc",
        },
        // return all results, dont return only 100
        select: projectSelectIdName,
      });
      response({ res, success: true, status_code: 200, data: project, message: "Project fetched successfully" });
      return;
      // if (hasAccess) {
      // } else {
      //   response({ res, success: true, status_code: 403, message: "Users dont have access to this resource." });
      //   return;
      // }
    }
  } catch (error) {
    console.log("error", error);
    response({ res, success: false, status_code: 500, message: error.message });
  }
}
