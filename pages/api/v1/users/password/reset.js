import prisma from "../../../../../lib/prisma";
import { hash } from "bcrypt";
import { createHash } from "crypto";
import response from "../../../../../lib/response";
import {  numOfSaltRounds } from "../../../../../lib/constants";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { password, token } = req.body;
      if (!token || !password) {
        response({
          res,
          success: false,
          status_code: 400,
          data: null,
          message: "Password and Token are required",
        });
        return;
      }
      // hash the token and find in DB
      const hashedToken = createHash("sha256").update(token).digest("hex");
      const verificationToken = await prisma.verificationToken.findUnique({
        where: { token: hashedToken },
      });

      if (!verificationToken) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "Invalid Token in Link",
        });
        return;
      }

      const expires = new Date(verificationToken.expires);
      const now = new Date();
      if (now > expires) {
        response({
          res,
          success: false,
          status_code: 403,
          message: "This Reset Password Link is expired. Try generating new One",
        });
        return;
      }

      // TODO: currently we are not checking if the password is same as previous password
      // we directly update the password, we may do it later
      hash(password, numOfSaltRounds)
        .then(async (hash) => {
          // Store hash in your password DB.
          const user = await prisma.user.update({
            where: {
              email: verificationToken.identifier, // identifier is email
            },
            data: {
              hashedPassword: hash,
            },
          });
          // console.log("user afetr create in prisma", user);
          response({
            res,
            success: true,
            status_code: 200,
            message: "Password Updated successfully",
          });
          return;
        })
        .catch((err) => {
          console.error("err while hashing password in reset passowrd API", err);
          response({
            res,
            success: false,
            status_code: 500,
            message: "Error Occured while updating the password. Please try again later",
          });
        });
    } catch (err) {
      console.error("error in file reset passowrd API", err);
      response({
        res,
        success: false,
        status_code: 500,
        message: "Error Occured while upadting the password. Please try again later",
      });
    }
  } else {
    response({
      res,
      success: false,
      status_code: 405,
      message: "Only POST method is allowed",
    });
  }
}
