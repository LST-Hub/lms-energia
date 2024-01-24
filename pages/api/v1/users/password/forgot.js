import { createHash, randomBytes } from "crypto";
import sendEmail from "../../../../../lib/send-email";
import response from "../../../../../lib/response";
import prisma from "../../../../../lib/prisma";
import { urls } from "../../../../../src/utils/Constants";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { email } = req.body;

      if (!email) {
        response({
          res,
          success: false,
          status_code: 400,
          message: "Email is required",
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email: email },
      });

      if (!user) {
        response({
          res,
          success: false,
          status_code: 404,
          message: "This Email does not exists. Please signup.",
        });
        return;
      }

      if (!user.hashedPassword) {
        response({
          res,
          success: false,
          status_code: 403,
          message:
            "You have signed up with a Third party provider. Please login with the same provider. Ex. Google, etc",
        });
        return;
      }

      // generate a random token and send it to the user
      // before storing the token first hash it so no one can see waht token was
      // and while getting the token back from user again hash and find in Database
      const token = randomBytes(32).toString("hex");
      const hashedToken = createHash("sha256").update(token).digest("hex");

      // expire the reset link after one day
      const ONE_DAY_IN_SECONDS = 86400;
      const expires = new Date(Date.now() + ONE_DAY_IN_SECONDS * 1000);
      // we are currently inserting a new row for every request,
      // TODO: we can upadte the existing row if it exists,
      // like if a  user has already requested for passowrd reset his row exists, and if he again requuest t reset pass we again insert a new row for that user with a new token
      // we can upadte the same row with new token and expiry if it exists
      const saveToken = await prisma.verificationToken.create({
        data: {
          expires: expires,
          token: hashedToken,
          identifier: email,
        },
      });

      const url = `${process.env.APP_URL}/${urls.resetPassword}?token=${token}`;
      await sendEmail({
        name: "Info",
        email,
        subject: `Reset Password - ${process.env.APP_NAME}`,
        txt: `Reset Password Link for ${process.env.APP_NAME}`,
        html: html({ url, appName: process.env.APP_NAME, theme: {} }),
      });

      response({
        res,
        success: true,
        status_code: 200,
        message: "Reset Link sent to the Email. Please check your inbox",
      });
    } else {
      response({
        res,
        success: false,
        status_code: 405,
        message: "Only POST Method allowed",
      });
      return;
    }
  } catch (error) {
    console.error(error, "error in users/forgot-pass Api file");
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Error occured on Our Side. Please try Later",
    });
  }
}

function html({ url, appName, theme }) {
  const brandColor = theme.brandColor || "#346df1";
  const buttonText = theme.buttonText || "#fff";

  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText,
  };

  return `
  <body style="background: ${color.background};">
    <table width="100%" border="0" cellspacing="20" cellpadding="0"
      style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
      <tr>
        <td align="center"
          style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          Click the below button to Reset Your password for <strong>${appName}</strong>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                  target="_blank"
                  style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">
                  Reset Password</a></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center"
          style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          The Link will expire in 24 hours.
        </td>
      </tr>
      <tr>
        <td align="center"
          style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          If you did not request this email you can safely ignore it.
        </td>
      </tr>
    </table>
  </body>
  `;
}
