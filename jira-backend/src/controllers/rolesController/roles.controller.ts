import { Request, Response } from "express";
import prismaClient from "../../configs/prismaClient.config";

export const createRoleAndAssignPermissions = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      permissions,
    }: { name: string; permissions: { id: number }[] } = req.body;

    const isRoleExists = await prismaClient.roles.findFirst({
      where: {
        name: name,
      },
    });

    if (isRoleExists) {
      return res.status(400).json({ message: "Role already exists" });
    }

    const permissionsId = permissions.map((permission) => permission.id);
    const permissionsData = await prismaClient.permissions.findMany({
      where: {
        id: {
          in: permissionsId,
        },
      },
    });

    if (permissionsData.length !== permissionsId.length) {
      return res.status(400).json({ message: "Some permissions do not exist" });
    }

    const roleInserted = await prismaClient.roles.create({
      data: {
        name: name,
        permissions: {
          create: permissionsId.map((permissionId: number) => {
            return {
              permission_id: permissionId,
            };
          }),
        },
      },
      select: {
        id: true,
        name: true,
        permissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return res.status(201).json({
      message: "Role created successfully",
      role: roleInserted,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const assignRoleToUser = async (req: Request, res: Response) => {
  try {
    const { email }: { email: string } = req.body.userData.data;
    const { userId, roleId }: { userId: number; roleId: number } = req.body;

    const isUserExists = await prismaClient.users.findUnique({
      where: {
        id: userId,
      },
    });

    if (!isUserExists) {
      return res.status(400).json({ message: "User not found" });
    }

    const isRoleExists = await prismaClient.roles.findUnique({
      where: {
        id: roleId,
      },
    });

    if (!isRoleExists) {
      return res.status(400).json({ message: "Role not found" });
    }

    const isRoleAssigned = await prismaClient.userHasRole.findFirst({
      where: {
        user_id: userId,
        role_id: roleId,
      },
    });

    if (isRoleAssigned) {
      return res.status(400).json({ message: "Role already assigned" });
    }

    await prismaClient.userHasRole.create({
      data: {
        user_id: userId,
        role_id: roleId,
        assigned_by: email,
      },
    });

    // get update user
    const user = await prismaClient.users.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        profile_url: true,
        email: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                permissions: {
                  select: {
                    permission: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return res.status(201).json({
      message: "Role assigned successfully",
      user: user,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prismaClient.roles.findMany({
      select: {
        id: true,
        name: true,
        permissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (roles.length === 0) {
      return res.status(404).json({ message: "No roles found" });
    }
    return res.status(200).json({ roles: roles });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateRoleWithPermissions = async (
  req: Request,
  res: Response
) => {
  try {
    const roleId = parseInt(req.params.roleId);
    const {
      name,
      permissions,
    }: { name: string; permissions: { id: number }[] } = req.body;

    const isRoleExists = await prismaClient.roles.findUnique({
      where: {
        id: roleId,
      },
    });

    if (!isRoleExists) {
      return res.status(400).json({ message: "Role not found" });
    }

    const permissionsId = permissions.map((permission) => permission.id);
    const permissionsData = await prismaClient.permissions.findMany({
      where: {
        id: {
          in: permissionsId,
        },
      },
    });

    if (permissionsData.length !== permissionsId.length) {
      return res.status(400).json({ message: "Some permissions do not exist" });
    }

    await prismaClient.roles.update({
      where: {
        id: roleId,
      },
      data: {
        name: name,
        permissions: {
          deleteMany: {},
          create: permissionsId.map((permissionId: number) => {
            return {
              permission_id: permissionId,
            };
          }),
        },
      },
    });

    const role = await prismaClient.roles.findUnique({
      where: {
        id: roleId,
      },
      select: {
        id: true,
        name: true,
        permissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      message: "Role updated successfully",
      role: role,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
