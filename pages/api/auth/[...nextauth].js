import NextAuth from "next-auth";
import { CustomPrismaAdapter } from "../../../lib/customPrismaAdapter.js";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../../lib/prisma.js";
import { compare } from "bcrypt";
import { getUserCache, getUserRoleCache, isTodaysTaskEnabled } from "../../../lib/backendUtils.js";
import { urls } from "../../../src/utils/Constants.js";
import { DBgetUserByGlobalId } from "../../../lib/db-cache-operations.js";

export const authOptions = {
  providers: [
    CredentialsProvider({
      type: "credentials",
      name: "Credentials",
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error("email and password are required");
        }
        const storedUser = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });
        if (!storedUser) {
          throw new Error("No user found with this email");
        }
        if (!storedUser.hashedPassword) {
          const storedAccount = await prisma.account.findUnique({
            where: {
              userId: storedUser.globalId,
            },
          });

          if (!storedAccount) {
            console.error("Password dosent exist on this account", storedUser);
            throw new Error(
              "You have not done Signup yet. Please signup from the invitation link got in the mail, or tell the admin/manager to resend invite to you."
            );
          }
          if (storedAccount.provider)
            throw new Error(
              `You have not registered with email and password, You have logged in with ${storedAccount.provider}. Try login with ${storedAccount.provider}`
            );
        }
        try {
          const validatePassword = await compare(credentials.password, storedUser.hashedPassword);
          // console.log("validatePassword", validatePassword);
          if (validatePassword) {
            // chnaged the id and added localId as we have customized the id field for our user case
            // we need id as int but nextauth needs it as string, so we have chnaged come things for that
            // for more details read the comment written in CustomPrismaAdapter.js file
            storedUser.localId = storedUser.id;
            storedUser.id = storedUser.globalId;
            return storedUser;
          } else {
            throw new Error("Email or Password is incorrect");
          }
        } catch (err) {
          console.log(err);
          throw err;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      httpOptions: {
        timeout: 5000, // wait for 5 sec for google authincation
      },
    }),
  ],
  pages: {
    signIn: `${urls.login}`,
    // questions after sign up url below
    newUser: `${urls.start}`,
    error: "/auth-error", // Error code passed in query string as ?error=
    // signOut: '/auth/signout',
    // verifyRequest: '/auth/verify-request', // (used for check email message)
  },
  // only workspace creaer will be created by CustomPrismaAdapter, for more info read the commeny in CustomPrismaAdapter.js file for createUser function
  adapter: CustomPrismaAdapter(prisma), // not used default prismaAdapter, we require used globalId column for nextAuth insted of id columns, see the defination file of customPrismaAdapter for more info
  callbacks: {
    async jwt({ token, user /* comes from our customPrismaAdapter*/, account, profile, isNewUser }) {
      // the user here comes from our customPrismaAdapter
      // console.log("jwt in backend", token, "user", user, account, profile, isNewUser);
      if (isNewUser) {
        // TODO: check if this email is previously invited and if not accepteed invite, then show a option to user user that you are invited to a XYZ workspace do you wannt to join that workspace or create a new different accont
        if (account?.provider === "google" && (profile?.given_name || profile?.family_name)) {
          const firstName = profile?.given_name || "";
          const lastName = profile?.family_name || "";
          const fullName = firstName + " " + lastName;
          //IMP: I have add PM and supervisor permission here, as only admins are going to signup from google,
          // or any third party provider.
          // if you add any third party provifder in future then add PM and supervisor permission there as well
          const updateUser = await prisma.user
            .update({
              where: {
                email: token.email,
              },
              data: {
                firstName,
                lastName,
                name: fullName,
                // make admin PM and supervisor by default
                canBePM: true,
                canBeSupervisor: true,
              },
            })
            .catch((err) => console.error("error while upadting user name in jwt callback in nextauth", err));
        }
      }

      // if (!token.userId || !token.globalId || !token.workspaceId) {
      //   const user = await prisma.user.findUnique({
      //     where: {
      //       email: token.email,
      //     },
      //     select: {
      //       id: true,
      //       globalId: true,
      //       workspaceId: true,
      //     },
      //   });
      //   if (!user) throw new Error("user not found");
      //   token.userId = user.id;
      //   token.globalId = user.globalId;
      //   token.workspaceId = user.workspaceId;
      // }

      if (!token.userId && user?.localId) {
        token.userId = user.localId;
      }
      if (!token.globalId && user?.globalId) {
        token.globalId = user.globalId;
      }
      // add workspaceId to token so we can access it easily in every API route
      if (!token.workspaceId) {
        const workspaceUser = await prisma.user.findUnique({
          where: {
            email: token.email,
          },
          select: {
            workspaceId: true,
          },
        });
        token.workspaceId = workspaceUser?.workspaceId;
      }

      return token;
    },
    async session({ session, token, user }) {
      // console.log("session in backend", session, token, user);

      const userId = token.userId;
      const workspaceId = token.workspaceId;
      // globaId and sub will both have users globalId column
      const globalId = token.globalId || token.sub;
      if (session.user) {
        let storedUser = null;
        if (userId && workspaceId) {
          storedUser = await getUserCache(userId, workspaceId);
        } else {
          storedUser = await DBgetUserByGlobalId(globalId);
        }
        if (!storedUser) {
          return null;
        }
        // if (!storedUser.active) {
        //   // user is not active, then dont allow login
        //   return null;
        // }
        session.user = storedUser;

        if (storedUser.workspaceId) {
          // when admin is on /start page then he will not thave workspace id as he has not created a workspace yet
          // hence will not have any role
          const userRole = await getUserRoleCache(storedUser.id || userId, storedUser.workspaceId);
          session.user.role = userRole;
          const isTTEnabled = await isTodaysTaskEnabled(storedUser.workspaceId);
          session.todaysTaskEnabled = isTTEnabled;
        }
      }
      return session;
    },
  },
  // this strategy is required for using credentials provider
  session: {
    strategy: "jwt",
  },
};

export default NextAuth(authOptions);
