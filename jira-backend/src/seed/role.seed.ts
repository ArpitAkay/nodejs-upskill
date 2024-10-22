import { PERMISSION } from "../configs/permissions.config";
import prismaClient from "../configs/prismaClient.config";

export const getPermissionsForAdminRole = () => {
  const permissions = Object.values(PERMISSION);
  return permissions;
};

export const getPermissionsForNormalRole = () => {
  const roleWhichNormalRoleShouldNotHave = [
    PERMISSION.GET_ALL_USERS,
    PERMISSION.RESTORE_USER,
    PERMISSION.GET_ALL_ROLES,
    PERMISSION.CREATE_ROLE,
    PERMISSION.ASSIGN_ROLE_TO_USER,
    PERMISSION.UPDATE_ROLE_WITH_PERMISSIONS,
    PERMISSION.GET_ALL_PERMISSIONS,
    PERMISSION.UPDATE_PERMISSION,
    PERMISSION.CREATE_PERMISSION,
    PERMISSION.GET_ALL_PROJECTS,
  ];
  const permissions = getPermissionsForAdminRole().filter((permission) => {
    return !roleWhichNormalRoleShouldNotHave.includes(permission);
  });

  return permissions;
};

export const seedRole = async (roleName: string, permissions: string[]) => {
  const isRoleExists = await prismaClient.roles.findUnique({
    where: {
      name: roleName,
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  const permissionsIds = await prismaClient.permissions.findMany({
    where: {
      name: {
        in: permissions,
      },
    },
  });

  if (isRoleExists) {
    // update permissions which are not present
    const existingPermissionsIds = isRoleExists.permissions.map(
      (rolePermission) => rolePermission.permission.id
    );

    const permissionsToCreate = permissionsIds.filter((permission) => {
      return !existingPermissionsIds.includes(permission.id);
    });

    if (permissionsToCreate.length === 0) {
      console.log(`Role ${roleName} already exists`);
      return;
    }

    await prismaClient.roles.update({
      where: {
        id: isRoleExists.id,
      },
      data: {
        permissions: {
          create: permissionsToCreate.map((permission) => {
            return {
              permission: {
                connect: {
                  id: permission.id,
                },
              },
            };
          }),
        },
      },
    });
    return;
  }

  await prismaClient.roles.create({
    data: {
      name: roleName,
      permissions: {
        create: permissionsIds.map((permission) => {
          return {
            permission: {
              connect: {
                id: permission.id,
              },
            },
          };
        }),
      },
    },
  });

  console.log(`Role ${roleName} created`);
};
