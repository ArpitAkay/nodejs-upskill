import { Request, Response } from "express";
import prismaClient from "../../configs/prismaClient.config";

export const createPermission = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const isPermissionExists = await prismaClient.permissions.findUnique({
      where: {
        name: name,
      },
    });

    if (isPermissionExists) {
      return res.status(400).json({ message: "Permission already exists" });
    }

    const permissionInserted = await prismaClient.permissions.create({
      data: {
        name: name,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return res.status(201).json({
      message: "Permission created successfully",
      permission: permissionInserted,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePermission = async (req: Request, res: Response) => {
  try {
    const permissionId = req.params.permissionId;
    const { name } = req.body;

    const isPermissionExists = await prismaClient.permissions.findUnique({
      where: {
        id: parseInt(permissionId),
      },
    });

    if (!isPermissionExists) {
      return res.status(404).json({ message: "Permission not found" });
    }

    const permissionUpdated = await prismaClient.permissions.update({
      where: {
        id: parseInt(permissionId),
      },
      data: {
        name: name,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return res.status(200).json({
      message: "Permission updated successfully",
      permission: permissionUpdated,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await prismaClient.permissions.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    if (permissions.length === 0) {
      return res.status(404).json({ message: "No permissions found" });
    }
    return res.status(200).json({ permissions: permissions });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
