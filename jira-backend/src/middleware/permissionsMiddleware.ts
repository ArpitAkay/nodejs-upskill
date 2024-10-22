import { Request, Response, NextFunction } from "express";
import { PERMISSION } from "../configs/permissions.config";
import prismaClient from "../configs/prismaClient.config";

export const validatePermissions =
  (permission: PERMISSION) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.body.userData.data.email;
      const isUserExists = await prismaClient.users.findUnique({
        where: {
          email: email,
        },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!isUserExists) {
        return res.status(401).json({ message: "User not found" });
      }

      const hasPermission = isUserExists.roles.some((userHasRole) =>
        userHasRole.role.permissions.some(
          (roleHasPermission) =>
            roleHasPermission.permission.name === permission.toString()
        )
      );

      if (!hasPermission) {
        return res
          .status(401)
          .json({ message: "You don't have permission to access" });
      }

      console.log(isUserExists);
      next();
    } catch (error: any) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
