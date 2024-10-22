import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

// Soft delete
prismaClient.$use(async (params, next) => {
  if (params.model === "Users") {
    if (params.action === "delete") {
      params.action = "update";
      params.args["data"] = { deleted_at: new Date() };
    } else if (params.action === "deleteMany") {
      params.action = "updateMany";
      params.args["data"] = { deleted_at: new Date() };
    } else if (params.action === "findUnique") {
      params.action = "findFirst";
      params.args["where"]["deleted_at"] = null;
    }
  }

  return next(params);
});

export default prismaClient;
