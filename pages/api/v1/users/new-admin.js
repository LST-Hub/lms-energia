import prisma from "../../../../lib/prisma";
import { hash } from "bcrypt";
import response from "../../../../lib/response";
import { numOfSaltRounds } from "../../../../lib/constants";
import { workspaceCreaterId } from "../../../../DBConstants";

// we are using this API endpooint to create new user  , currently only for sign up with credentials, not third party providers (like google, facebook etc)
// third party providers are handeled by next-auth

// firstUser is for know that this user if first user of a workspace, it will only come from signup page only and for this user workspaceId os not required, ad for all other users workspaceID is required
export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const reply = await createUser(req.body);
      response({
        res,
        ...reply,
      });
    } else {
      response({
        res,
        success: false,
        status_code: 405,
        message: "Only POST method is allowed",
      });
    }
  } catch (err) {
    console.error("error while creating the admin user", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Error Occured while creating the user. Please try again later",
    });
  }
}

async function createUser(body) {
  const { email, password, firstName, lastName, name } = body;
  // TODO: verify email and password schema( is email and password has correct structure, ie. valid email and mmin passwod length 8, capital word, etc)
  if (!email || !password || !firstName || !lastName) {
    return {
      success: false,
      status_code: 400,
      message: "Email, password and firstName, lastName  are required",
    };
  }

  const userExists = await prisma.user.findUnique({
    where: { email: email },
  });
  // TODO: check if this email is previously invited and if not accepteed invite, then show a option to user user that you are invited to a XYZ workspace do you wannt to join that workspace or create a new different accont
  if (userExists) {
    return { success: false, status_code: 403, message: "This Email already exists. Please login." };
  }

  return hash(password, numOfSaltRounds)
    .then(async (hash) => {
      const fullName = name || firstName + " " + lastName;

      //IMP: don't store this user in cache currently as it does not have a workspacid and role here
      // but store it in cache when he creates new workspace or joins a workspace

      // IMP: don't increase user count in of recordCounts table here as not workspace exist at this point, only user has signup and not created workspace
      const user = await prisma.user.create({
        data: {
          id: workspaceCreaterId,
          email: email,
          hashedPassword: hash,
          firstName: firstName,
          lastName: lastName,
          name: fullName,
          // make admin PM and supervisor by default
          canBePM: true,
          canBeSupervisor: true,
        },
        select: {
          id: true,
        },
      });

      // console.log("user afetr create in prisma", user);
      return {
        success: true,
        status_code: 200,
        data: [user],
        message: "User created successfully",
      };
    })
    .catch((err) => {
      console.log("err", err);
      return {
        success: false,
        status_code: 500,
        message: "Error Occured while creating the user. Please try again later",
      };
    });
}
