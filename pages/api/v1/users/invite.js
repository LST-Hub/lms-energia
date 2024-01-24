import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import sendEmail from "../../../../lib/send-email";
import { perAccessIds, permissionTypeIds } from "../../../../DBConstants";
import { createHash, randomBytes } from "crypto";
import { getRecordCounts, getRoleCache, isUserHasAccess, updateUserCache } from "../../../../lib/backendUtils";
import { urls } from "../../../../src/utils/Constants";
import * as yup from "yup";
import { MaxEmailLength, MaxNameLength, MaxPhoneNumberLength, bigInpuMaxLength } from "../../../../lib/constants";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "POST") {
      const hasAccess = await isUserHasAccess(
        userToken.userId,
        userToken.workspaceId,
        permissionTypeIds.users,
        perAccessIds.create
      );
      if (hasAccess) {
        const newUser = await inviteUser({ body: req.body, userToken });
        response({
          res,
          ...newUser,
        });
      } else {
        response({
          res,
          success: false,
          status_code: 403,
          message: "You don't have access to invite user",
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 405,
        message: "Only POST method is allowed",
      });
    }
  } catch (err) {
    console.error("error while inviting the user", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}

async function inviteUser({ body, userToken }) {
  const {
    firstName,
    lastName,
    email,
    designation,
    phoneNumber,
    supervisorId,
    departmentId,
    type,
    roleId,
    zipCode,
    country,
    gender,
    notes,
    workCalendarId,
    canBePM,
    canBeSupervisor,
    address,
    image,
  } = body;

  console.log("body", body);

  // TODO: verify email and password schema( is email and password has correct structure, ie. valid email and mmin passwod length 8, capital word, etc)
  // if (!email || !firstName || !lastName || !roleId || !workCalendarId) {
  //   return {
  //     success: false,
  //     status_code: 400,
  //     message: "Email, firstName, lastName, roleId, workCalendarId are required",
  //   };
  // }

  const schema = yup.object().shape({
    firstName: yup.string().required().trim().max(MaxNameLength),
    lastName: yup.string().required().trim().max(MaxNameLength),
    email: yup.string().required().trim().email().max(MaxEmailLength),
    designation: yup.string().trim().max(MaxNameLength).nullable(),
    phoneNumber: yup.string().trim().max(MaxPhoneNumberLength).nullable(),
    supervisorId: yup.number().nullable(),
    departmentId: yup.number().nullable(),
    type: yup.string().nullable(),
    roleId: yup.number().required(),
    zipCode: yup.string().max(MaxPhoneNumberLength).nullable(),
    country: yup.string().nullable(),
    gender: yup.string().nullable(),
    notes: yup.string().trim().max(bigInpuMaxLength).nullable(),
    workCalendarId: yup.number().required(),
    canBePM: yup.boolean(),
    canBeSupervisor: yup.boolean(),
    address: yup.string().max(bigInpuMaxLength).nullable(),
    image: yup.string().nullable(),
  });

  try {
    await schema.validate({
      firstName,
      lastName,
      email,
      designation,
      phoneNumber,
      supervisorId,
      departmentId,
      type,
      roleId,
      zipCode,
      country,
      gender,
      notes,
      workCalendarId,
      canBePM,
      canBeSupervisor,
      address,
      image,
    });
  } catch (error) {
    console.error("error in invite user validation", error);
    return {
      success: false,
      status_code: 400,
      message: error.message,
    };
  }

  // we are making supervisorId optional for now
  // if (!supervisorId) {
  //   // supervisor for Admin role is not mandatory
  //   const adminRole = await isAdminRole(roleId, userToken.workspaceId);
  //   if (!adminRole) {
  //     // if the assigned role is not admin then supervisor is mandatory
  //     return {
  //       success: false,
  //       status_code: 400,
  //       message: "SupervisorId is required",
  //     };
  //   }
  // }

  const userExists = await prisma.user.findUnique({
    where: { email: email },
  });

  if (userExists && userExists.workspaceId === userToken.workspaceId && userExists.invited) {
    return { success: false, status_code: 403, message: "This User is already Invited." };
  }
  if (userExists && userExists.workspaceId === userToken.workspaceId) {
    return { success: false, status_code: 403, message: "This User already exists." };
  }
  if (userExists) {
    return {
      success: false,
      status_code: 403,
      message:
        "Cannot Invite User. This Email already exists in some other Workspace account. Please use different email.",
    };
  }

  if (canBePM === true) {
    const role = await getRoleCache(roleId, userToken.workspaceId);
    if (!role) {
      return {
        success: false,
        status_code: 400,
        message: "Role not found",
      };
    }

    let havePermission = false;
    if (typeof role.permissions === "object") {
      if (
        role.permissions[permissionTypeIds.projAndTask] &&
        role.permissions[permissionTypeIds.projAndTask]?.accessLevel
      ) {
        havePermission = true;
      }
    } else {
      return {
        success: false,
        status_code: 400,
        message: "Some error occured while getting permissions of role. Please try again later.",
      };
    }
    if (!havePermission) {
      return {
        success: false,
        status_code: 400,
        message:
          "The Role of user does not have permission to create project, so he cannot become Project Manager. Please select a different role for user to make him Project Manager.",
      };
    }
  }

  const counts = await getRecordCounts(userToken.workspaceId);
  const [user, updateCount] = await prisma.$transaction([
    prisma.user.create({
      data: {
        id: counts.user + 1,
        firstName,
        lastName,
        email,
        designation,
        phoneNumber,
        supervisorId,
        type,
        roleId,
        zipCode,
        country,
        gender,
        notes,
        workCalendarId,
        departmentId,
        canBePM,
        canBeSupervisor,
        address,
        invited: true,
        workspaceId: userToken.workspaceId,
        name: firstName + " " + lastName,
        createdById: userToken.userId,
        image,
      },
    }),
    prisma.recordCounts.update({
      where: {
        workspaceId: userToken.workspaceId,
      },
      data: {
        user: {
          increment: 1, // increment user count by 1, as new user added
        },
      },
    }),
  ]);

  if (user) {
    // update user cache, here it will create the user cache
    updateUserCache(user.id, userToken.workspaceId);
  }

  try {
    // generate a random token and send it to the user
    // before storing the token first hash it so no one can see waht token was
    // and while getting the token back from user again hash and find in Database
    const token = randomBytes(32).toString("hex");
    const hashedToken = createHash("sha256").update(token).digest("hex");

    // expire the reset link after one day
    const ONE_DAY_IN_SECONDS = 86400;
    const expires = new Date(Date.now() + ONE_DAY_IN_SECONDS * 1000);
    const saveToken = await prisma.verificationToken.create({
      data: {
        expires: expires,
        token: hashedToken,
        identifier: email,
      },
    });

    try {
      // we are passing the token in the url so that we can use it to get th data filed by manager,
      // but before getting the data check that does user has accepted invite already if yes then sow error screen thta you ahe aready acceped inviet
      const url = `${process.env.APP_URL}/${urls.inviteSignup}?token=${token}`;
      sendEmail({
        name: "Info",
        email: email,
        subject: `You are Invited to ${process.env.APP_NAME}`,
        txt: `You are invited to ${process.env.APP_NAME}`,
        html: html({ url }),
      });
    } catch (err) {
      console.log("error in sending email in invite user", err);
      return {
        success: false,
        status_code: 500,
        message: "User Created but failed to send invite email. Please again reinvite user after some time.",
      };
    }
    return {
      success: true,
      status_code: 200,
      data: [user],
      message: "User Invited successfully",
    };
  } catch (err) {
    console.log("error in sending email in invite user", err);
    return {
      success: false,
      status_code: 500,
      message: "Created user but failed to send invite email. Please again reinvite user after some time.",
    };
  }
}

function html({ url }) {
  const brandColor = "#346df1";
  const buttonText = "#fff";

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
          Click the below button to Signup on <strong>${process.env.APP_NAME}</strong>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                  target="_blank"
                  style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">
                  Accept Invite</a></td>
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
        </td>
      </tr>
    </table>
  </body>
  `;
}
