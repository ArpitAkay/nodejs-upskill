import { PERMISSION } from "../configs/permissions.config";
import prismaClient from "../configs/prismaClient.config";

export const getAllPermissions = () => {
  const permissions = Object.values(PERMISSION);
  return permissions;
};

export const seedPermissions = async () => {
  const permissions: string[] = getAllPermissions();
  console.log(permissions);

  for (const permission of permissions) {
    const isPermissionExists = await prismaClient.permissions.findUnique({
      where: {
        name: permission,
      },
    });

    if (!isPermissionExists) {
      const permissionInserted = await prismaClient.permissions.create({
        data: {
          name: permission,
        },
      });

      console.log(`Permission ${permissionInserted.name} is created`);
      continue;
    }

    console.log(`Permission ${permission} is already exists in the database`);
  }
};
