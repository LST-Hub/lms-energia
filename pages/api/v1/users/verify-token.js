import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { createHash } from "crypto";
import { verifyTokenSelectAll } from "../../../../lib/constants";

export default async function VerifyToken(req, res) {
  //verify token of reset passowr link

  if (req.method === "POST") {
    try {
      const { token } = req.body;
      if (!token) {
        response({
          res,
          success: false,
          status_code: 400,
          message: "Token is required",
        });
        return;
      }

      const hashedToken = createHash("sha256").update(token).digest("hex");
      const verificationToken = await prisma.verificationToken.findUnique({
        where: { token: hashedToken },
        select: verifyTokenSelectAll,
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
          message: "The Link has expired. Try generating new One",
        });
        return;
      }
      verificationToken["email"] = verificationToken.identifier;
      response({
        res,
        success: true,
        status_code: 200,
        data: [verificationToken],
        message: "Token verified",
      });
      return;
    } catch (err) {
      console.log("err", err);
      response({
        res,
        success: false,
        status_code: 500,
        message: "Error Occured while verifying the link. Please try generating new Link",
      });
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
}
