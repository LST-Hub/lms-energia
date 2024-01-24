import prisma from "../../../../lib/prisma";
import { hash } from "bcrypt";
import { createHash } from "crypto";
import response from "../../../../lib/response";
import { verifyTokenSelectAll, numOfSaltRounds } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";

// this api is used for initial login of user who is invited
export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const token = req.query.token;
      const { valid, data } = await validateToken(token);
      if (!valid) {
        response({ res, ...data });
        return;
      }
      //check user is login or not
      const userToken = await authAndGetUserToken(req);
      const user = await prisma.user.findUnique({
        where: {
          workspaceId_id: {
            id: userToken.userId,
            workspaceId: userToken.workspaceId,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          firstName: true,
          lastName: true,
          designation: true,
          phoneNumber: true,
          // I am returning the names and not id's because, we dont want to access supervisor and department list to get thrie name from Id,, hence we are directly passign names here
          // why we dont want list of supervisor and department? because this user has been invited and just sign up and we want him to edit his persnal details , but we dont know waht permission he has
          // we can take his permissions and work from that, but any way user is only able to edit his nam ean dsome personal detials, so we dont ned to get inot his permissions
          supervisor: {
            select: {
              id: true,
              name: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          type: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
          zipCode: true,
          country: true,
          address: true,
          gender: true,
          notes: true,
        },
      });
      response({
        res,
        success: true,
        status_code: 200,
        data: [user],
        message: "User fetched successfully",
      });
      return;
    } else if (req.method === "POST") {
      const { firstName, lastName, name, phoneNumber, zipCode, country, address, gender, image, token } = req.body;
      const { valid, data } = await validateToken(token);
      if (!valid) {
        response({ res, ...data });
        return;
      }
      //check user is login or not
      const userToken = await authAndGetUserToken(req);
      // never update email
      const fullName = name || `${firstName} ${lastName}`;
      // not upadting cache here as it does not upadte and user cache , but later if changed the upadte cache
      const userUpdate = await prisma.user.update({
        where: {
          workspaceId_id: {
            id: userToken.userId,
            workspaceId: userToken.workspaceId,
          },
        },
        data: {
          firstName: firstName,
          lastName: lastName,
          name: fullName,
          image: image,
          phoneNumber: phoneNumber,
          zipCode: zipCode,
          country: country,
          address: address,
          gender: gender,
        },
      });
      response({
        res,
        success: true,
        status_code: 200,
        data: [userUpdate],
        message: "user Updated succesfully",
      });
      return;
    } else if (req.method === "PATCH") {
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
      const { valid, data } = await validateToken(token);
      if (!valid) {
        response({ res, ...data });
        return;
      }

      hash(password, numOfSaltRounds)
        .then(async (hash) => {
          // Store hash in your password DB.
          const user = await prisma.user.update({
            where: {
              email: data.identifier, // identifier is email
            },
            data: {
              hashedPassword: hash,
            },
            select: {
              id: true,
            },
          });
          // console.log("user afetr create in prisma", user);
          response({
            res,
            success: true,
            status_code: 200,
            message: "Password saved successfully",
          });
          return;
        })
        .catch((err) => {
          console.error("err while hashing password in accept invite API", err);
          response({
            res,
            success: false,
            status_code: 500,
            message: "Error Occured while saving the password. Please try again later",
          });
        });
    } else {
      response({
        res,
        success: false,
        status_code: 405,
        message: "Method not allowed",
      });
    }
  } catch (err) {
    console.error("error in file accept invite API", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Error Occured while upadting the password. Please try again later",
    });
  }
}

const validateToken = async (token) => {
  // this functionis a quick fix and don't follow nice practice and it reutns the data of various shapes according to valid arugment
  // dont copy this style anywhere else in application code

  if (!token) {
    return {
      valid: false,
      data: {
        success: false,
        status_code: 400,
        message: "Token is required",
      },
    };
  }

  // hash the token and find in DB
  const hashedToken = createHash("sha256").update(token).digest("hex");
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token: hashedToken },
    select: verifyTokenSelectAll,
  });

  if (!verificationToken) {
    return {
      valid: false,
      data: {
        success: false,
        status_code: 404,
        message: "Invalid Token in Link",
      },
    };
  }

  const expires = new Date(verificationToken.expires);
  const now = new Date();
  if (now > expires) {
    return {
      valid: false,
      data: {
        success: false,
        status_code: 403,
        message: "This Link is expired. Try generating new One",
      },
    };
  }

  return {
    valid: true,
    data: verificationToken,
  };
};
