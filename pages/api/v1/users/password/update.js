import prisma from "../../../../../lib/prisma";
import { hash, compare } from "bcrypt";
import response from "../../../../../lib/response";
import { numOfSaltRounds } from "../../../../../lib/constants";
import { authAndGetUserToken } from "../../../../../lib/getSessionData";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const userToken = await authAndGetUserToken(req); // verify that user is logged in, before upadting the password
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        response({
          res,
          success: false,
          status_code: 400,
          message: "Current Password and New Password are required",
        });
        return;
      }
      if (currentPassword === newPassword) {
        response({
          res,
          success: false,
          status_code: 400,
          message: "Current Password and New Password cannot be same",
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: {
          globalId: userToken.globalId,
        },
      });

      if (!user) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "User not found",
        });
        return;
      }

      if (!user.hashedPassword) {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You have signup with a third party provider (like google), so you cannot update your password.",
        });
        return;
      }

      const isPasswordCorrect = await compare(currentPassword, user.hashedPassword);
      if (!isPasswordCorrect) {
        response({
          res,
          success: false,
          status_code: 403,
          message: "Current password is Incorrect",
        });
        return;
      }

      hash(newPassword, numOfSaltRounds)
        .then(async (hash) => {
          // Store hash in your password DB.
          const user = await prisma.user.update({
            where: {
              globalId: userToken.globalId,
            },
            data: {
              hashedPassword: hash,
            },
          });
          response({
            res,
            success: true,
            status_code: 200,
            message: "Password updated successfully",
          });
          return;
        })
        .catch((err) => {
          console.log("err", err);
          response({
            res,
            success: false,
            status_code: 500,
            message: "Error Occured while updating the password. Please try again later",
          });
        });
    } catch (err) {
      console.log("err", err);
      response({
        res,
        success: false,
        status_code: 500,
        message: "Error Occured while updating the password. Please try again later",
      });
    }
  } else {
    response({
      res,
      success: false,
      status_code: 405,
      message: "Method not allowed",
    });
  }
}
