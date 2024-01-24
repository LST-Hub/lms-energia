import { workspaceCreaterId } from "../DBConstants";

// we have created this CustomPrismaAdapter,as we were having custom requirement, for the column name id.
// refer to the link https://authjs.dev/reference/adapters/prisma#naming-conventions or https://next-auth.js.org/adapters/prisma#create-the-prisma-schema

// you can see in the above links that Next-auth or Authjs requires id field on user table, and it should be string,
// but we have used id column as integer ofr all other tables, like project,, task , client and every table, and that id column for all tables is integer.
// we have also used this id column in UI,for logic purposes
// but as next-auth requires id column of user table as string, which was reakign consistency in the application.
// so I decided to make a custom prisma adapter for next-auth and manage globalId column ad id in file.

// what I have done,
// here Next-auth dosent directly interact with database, it intractes with database with a adapter, (in our case it's prisma adapter)
// so Next-auth return id field to this adapter and assumes that he get correct result witj the same id field.
// so I have taken the Id field from next-auth and treat it as globalId and return it as id field again to next-auth.

// and for user table globalId is string , but for other tablopes it is auto Incremented integers

// I have copied the adapter code from https://github.com/nextauthjs/next-auth/blob/94beef77e655d208363f56f2765732c7a76869fa/packages/adapter-prisma/src/index.ts
// and modified it according to our requirements
export function CustomPrismaAdapter(p) {
  return {
    // if you want to add or edit the user returned user.localId or user.id, then change it also in authorize callback of nextauth credentials provider
    // hereI have assumed taht this createUser function will only create workspaceCrteator, meanshe is not part of any worksapce currwnt and will create new workspace in future.
    // if you want you want to use this function to create others users from this function then pass a diffrent id brelow, I have passed workspaceCreaterId id, as I have assumes that this user will create new workspacew
    async createUser(data) {
      const user = await p.user.create({ data: { ...data, id: workspaceCreaterId } });
      user.localId = user.id;
      user.id = user.globalId;
      return user;
    },
    async getUser(id) {
      const user = await p.user.findUnique({ where: { globalId: id } });
      if (user) {
        user.localId = user.id;
        user.id = user.globalId;
      }
      return user;
    },
    async getUserByEmail(email) {
      const user = await p.user.findUnique({ where: { email } });
      if (user) {
        user.localId = user.id;
        user.id = user.globalId;
      }
      return user;
    },
    async getUserByAccount(provider_providerAccountId) {
      const account = await p.account.findUnique({
        where: { provider_providerAccountId },
        select: { user: true },
      });
      if (account?.user) {
        account.user.localId = account.user.id;
        account.user.id = account.user.globalId;
      }
      return account?.user ?? null;
    },
    async updateUser({ id, ...data }) {
      const user = await p.user.update({ where: { globalId: id }, data });
      if (user) {
        user.localId = user.id;
        user.id = user.globalId;
      }
      return user;
    },
    async deleteUser(id) {
      const user = await p.user.delete({ where: { globalId: id } });
      if (user) {
        user.localId = user.id;
        user.id = user.globalId;
      }
      return user;
    },
    linkAccount: (data) => p.account.create({ data }),
    unlinkAccount: (provider_providerAccountId) =>
      p.account.delete({
        where: { provider_providerAccountId },
      }),
    async getSessionAndUser(sessionToken) {
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!userAndSession) return null;
      const { user, ...session } = userAndSession;
      user.localId = user.id;
      user.id = user.globalId;
      return { user, session };
    },
    createSession: (data) => p.session.create({ data }),
    updateSession: (data) => p.session.update({ where: { sessionToken: data.sessionToken }, data }),
    deleteSession: (sessionToken) => p.session.delete({ where: { sessionToken } }),
    async createVerificationToken(data) {
      const verificationToken = await p.verificationToken.create({ data });
      // @ts-expect-errors // MongoDB needs an ID, but we don't
      if (verificationToken.id) delete verificationToken.id;
      return verificationToken;
    },
    async useVerificationToken(identifier_token) {
      try {
        const verificationToken = await p.verificationToken.delete({
          where: { identifier_token },
        });
        // @ts-expect-errors // MongoDB needs an ID, but we don't
        if (verificationToken.id) delete verificationToken.id;
        return verificationToken;
      } catch (error) {
        // If token already used/deleted, just return null
        // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
        if (error.code === "P2025") return null;
        throw error;
      }
    },
  };
}
