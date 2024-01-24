import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { maxTake, projectsHighlights } from "../../../../lib/constants";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { clientId, userId } = req.query;
      const idForClient = clientId ? Number(clientId) : undefined;
      const idForUser = userId ? Number(userId) : undefined;
      if (userId) {
        const projects = await prisma.project.findMany({
          where: {
            workspaceId: userToken.workspaceId,
            projectUsers: {
              some: {
                userId: idForUser,
              },
            },
          },
          take: maxTake,
          select: projectsHighlights,
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: projects,
          message: "Projects fetched successfully",
        });
        return;
      } else {
        const projects = await prisma.project.findMany({
          where: {
            workspaceId: userToken.workspaceId,
            clientId: idForClient,
          },
          take: maxTake,
          select: projectsHighlights,
        });
        response({
          res,
          success: true,
          status_code: 200,
          data: projects,
          message: "Projects fetched successfully",
        });
        return;
      }
    }
  } catch (err) {
    console.log("error in highlights/projects.js", err);
    response({ res, success: false, status_code: 500, message: "Some Internal Error Occured. Please try again later" });
  }
}
