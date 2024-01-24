import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { MaxEmailLength, MaxNameLength, MaxPhoneNumberLength, bigInpuMaxLength, clientSelectSome, maxTake } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import { perAccessIds, permissionTypeIds, roleRestrictionIds } from "../../../../DBConstants";
import { getRecordCounts, getUserRoleRestrictionId, isUserHasAccess } from "../../../../lib/backendUtils";
import { minSearchLength } from "../../../../src/utils/Constants";
import * as yup from "yup";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "GET") {
      const { active, search } = req.query;
      let clientActive = undefined;
      if (active) {
        clientActive = active === "true" ? true : false;
      }
      const searchArr =
        search && search.length >= minSearchLength
          ? [
              {
                // db column name
                name: {
                  startsWith: search,
                  // mode: "insensitive",
                },
              },
            ]
          : undefined;
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.clients,
        perAccessIds.view
      );
      if (hasAccess) {
        const restrictionId = await getUserRoleRestrictionId(userToken.userId, userToken.workspaceId);
        let clients = [];
        switch (restrictionId) {
          // case roleRestrictionIds.own:
          //   // the below query will return all clients who are created by the current user
          //   clients = await prisma.client.findMany({
          //     where: {
          //       AND: {
          //         workspaceId: userToken.workspaceId,
          //         active: clientActive,
          //         createdById: userToken.userId,
          //       },
          //       OR: searchArr,
          //     },
          //     take: maxTake,
          //     select: clientSelectSome,
          //   });
          //   break;
          // case roleRestrictionIds.subordinates:
          //   // the below query will return all clients which are created by the subordinates of the current user and the clients which are created by the current user
          //   const subordinateIds = await getSubordinateIds(userToken.userId, userToken.workspaceId);
          //   clients = await prisma.client.findMany({
          //     where: {
          //       AND: {
          //         workspaceId: userToken.workspaceId,
          //         active: clientActive,
          //         OR: [
          //           {
          //             createdById: { in: subordinateIds },
          //           },
          //           {
          //             createdById: userToken.userId,
          //           },
          //         ],
          //       },
          //       OR: searchArr,
          //     },

          //     take: maxTake,
          //     select: clientSelectSome,
          //   });
          //   break;
          case roleRestrictionIds.none:
            // the below query will return all clients of workspace
            clients = await prisma.client.findMany({
              where: {
                workspaceId: userToken.workspaceId,
                active: clientActive,
                OR: searchArr,
              },
              take: maxTake,
              orderBy: [
                {
                  name: "asc",
                },
              ],
              select: clientSelectSome,
            });
            break;
          default:
            clients = [];
            break;
        }
        // clients = await prisma.client.findMany({
        //   where: {
        //     workspaceId: userToken.workspaceId,
        //     active: clientActive,
        //     OR: searchArr,
        //   },
        //   take: maxTake,
        //   select: clientSelectSome,
        // });
        response({ res, success: true, status_code: 200, data: clients, message: "Clients fetched successfully" });
        return;
      } else {
        response({ res, success: false, status_code: 401, message: "You don't have access to view Clients" });
        return;
      }
    } else if (req.method === "POST") {
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.clients,
        perAccessIds.create
      );
      if (hasAccess) {
        const { clientName, clientEmail, phoneNumber, notes } = req.body;
        if (!clientName) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Please provide all the required fields",
          });
          return;
        }

        const schema = yup.object().shape({
          clientName: yup.string().required().trim().max(MaxNameLength),
          clientEmail: yup.string().trim().email().max(MaxEmailLength).nullable(),
          phoneNumber: yup.string().trim().max(MaxPhoneNumberLength).nullable(),
          notes: yup.string().trim().max(bigInpuMaxLength).nullable(),
        });

        try {
          await schema.validate({
            clientName,
            clientEmail,
            phoneNumber,
            notes,
          });
        } catch (error) {
          console.error("error in client validation", error);
          response({
            res,
            success: false,
            status_code: 400,
            message: error.message,
          });
          return;
        }

        // check if client with same name already exists
        const clientExists = await prisma.client.findFirst({
          where: {
            workspaceId: userToken.workspaceId,
            name: clientName,
          },
        });
        // if client exists then return error
        if (clientExists) {
          response({
            res,
            success: false,
            status_code: 400,
            message: "Client with this name already exists",
          });
          return;
        }

        const counts = await getRecordCounts(userToken.workspaceId);
        const [client, updateCount] = await prisma.$transaction([
          prisma.client.create({
            data: {
              id: counts.client + 1,
              name: clientName,
              email: clientEmail,
              phone: phoneNumber,
              notes: notes,
              workspaceId: userToken.workspaceId,
              createdById: userToken.userId,
            },
          }),
          prisma.recordCounts.update({
            where: {
              workspaceId: userToken.workspaceId,
            },
            data: {
              client: {
                increment: 1,
              },
            },
          }),
        ]);

        // redisSetClient(client.id, userToken.workspaceId, { id: client.id, createdById: userToken.userId });

        response({ res, success: true, status_code: 200, data: [client], message: "Client created successfully" });
        return;
      } else {
        response({ res, success: false, status_code: 401, message: "You don't have access to create Clients" });
        return;
      }
    } else if (req.method === "PATCH") {
      // we use patch request to delete multiple records in batch
      // delete all client cache when client delete in batch
      // for (id of ids) redisDelClient(client.id, userToken.workspaceId);
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "Method not allowed",
      });
      return;
    }
  } catch (err) {
    console.error("error in client index file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
