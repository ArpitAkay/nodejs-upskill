import { Request, Response } from "express";
import prismaClient from "../../configs/prismaClient.config";
import { extractUserEmailFromJwtToken } from "../../util/jwt.util";
import {
  generatePreSignedUrl,
  removeImageFromMinio,
  uploadImageToMinio,
} from "../../util/minio.util";
import { MINIO_PROFILE_IMAGES_BUCKET_NAME } from "../../configs/env.config";
import { v4 as uuidv4 } from "uuid";

export const getUserInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { id } = req.body.userData.data;

    const isUserExists = await prismaClient.users.findUnique({
      where: {
        id: parseInt(userId),
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
              },
            },
          },
        },
      },
    });

    if (!isUserExists) {
      return res.status(400).json({ message: "User not found" });
    }

    if (id !== isUserExists.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view user info" });
    }

    return res.status(200).json({
      message: "User found",
      user: isUserExists,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllUserInfos = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 0;
    const pageSize = Number(req.query.pageSize) || 10;
    const users = await prismaClient.users.findMany({
      skip: page * pageSize,
      take: pageSize,
      orderBy: [
        {
          created_at: "desc",
        },
      ],
      select: {
        id: true,
        name: true,
        profile_url: true,
        email: true,
        created_at: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const totalUsers = await prismaClient.users.count();

    return res.status(200).json({
      message: "Users found",
      users: users,
      totalResult: totalUsers,
      totalPages: Math.ceil(totalUsers / pageSize),
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { name } = JSON.parse(req.body.userData);
    const { email }: { email: string } = await extractUserEmailFromJwtToken(
      req,
      res
    );
    const profileImage = req.file;

    const isUserExists = await prismaClient.users.findUnique({
      where: {
        id: parseInt(userId),
      },
    });

    if (!isUserExists) {
      return res.status(400).json({ message: "User not found" });
    }

    if (isUserExists.email !== email) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update user info" });
    }

    if (!profileImage) {
      return res.status(400).json({ message: "Profile image is required" });
    }

    if (isUserExists.profile_name) {
      await removeImageFromMinio(
        MINIO_PROFILE_IMAGES_BUCKET_NAME,
        isUserExists.profile_name
      );
    }

    let objectName = "";
    try {
      objectName = `user-${isUserExists.id}/${uuidv4()}-${
        profileImage.originalname
      }`;
      uploadImageToMinio(
        MINIO_PROFILE_IMAGES_BUCKET_NAME,
        objectName,
        profileImage
      );
    } catch (error: any) {
      console.log(error);
      return res.status(400).json({
        message: "Error uploading image to minio",
      });
    }

    const presignedUrl = await generatePreSignedUrl(
      MINIO_PROFILE_IMAGES_BUCKET_NAME,
      objectName,
      7
    );

    const userUpdated = await prismaClient.users.update({
      where: {
        id: parseInt(userId),
      },
      data: {
        name: name,
        profile_url: presignedUrl,
        profile_name: objectName,
        profile_url_expiry: new Date(
          new Date().getTime() + 7 * 24 * 60 * 60 * 1000
        ),
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
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      message: "User updated",
      user: userUpdated,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const isUserExists = await prismaClient.users.findUnique({
      where: {
        id: parseInt(userId),
      },
    });

    if (!isUserExists) {
      return res.status(400).json({ message: "User not found" });
    }

    await prismaClient.users.delete({
      where: {
        id: parseInt(userId),
      },
    });

    return res.status(200).json({ message: "User deleted" });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const restoreUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const isUserExists = await prismaClient.users.findFirst({
      where: {
        id: parseInt(userId),
        deleted_at: {
          not: null,
        },
      },
    });

    if (!isUserExists) {
      return res.status(400).json({ message: "User not found" });
    }

    await prismaClient.users.update({
      where: {
        id: parseInt(userId),
      },
      data: {
        deleted_at: null,
      },
    });

    return res.status(200).json({ message: "User restored" });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
