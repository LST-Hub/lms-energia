import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      // log: ["query", "info", "warn"],
    });
  }
  prisma = global.prisma;
  // prisma.$use(async (params, next) => {
  //   if (params.model !== "Permissions" || params.model !== "RolePermissions")
  //     if (!params.args.where?.workspaceId) {
  //       console.error(
  //         `workspace ID is not checked while quering ${params.model} model, while doing ${params.action} operation`,
  //         "the arguments are",
  //         params.args
  //       );
  //     }
  //   // Manipulate params here
  //   const result = await next(params);
  //   // See results here
  //   return result;
  // });
}

export default prisma;
