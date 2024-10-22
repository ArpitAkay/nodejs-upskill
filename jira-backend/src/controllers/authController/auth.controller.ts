import { Request, Response } from "express";
import prismaClient from "../../configs/prismaClient.config";
import bcrypt from "bcrypt";
import {
  checkJwtTokenExpiry,
  createJwtToken,
  verifyJwtToken,
} from "../../util/jwt.util";
import { exclude } from "../../common/excludeKey.common";
import { IUser } from "../../types/users/user";
import { TOKEN_TYPE } from "../../types/token/TokenType";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const isUserExists = await prismaClient.users.findUnique({
      where: {
        email: email,
      },
    });

    if (isUserExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const encryptedPassword: string = await bcrypt.hash(password, 10);

    const isNormalRoleExists = await prismaClient.roles.findFirst({
      where: {
        name: "normal",
      },
    });

    if (!isNormalRoleExists) {
      return res.status(500).json({ message: "Role not found" });
    }

    const userInserted = await prismaClient.users.create({
      data: {
        name: name,
        email: email,
        password: encryptedPassword,
        roles: {
          create: {
            role: {
              connect: {
                id: isNormalRoleExists.id,
              },
            },
            assigned_by: "Automated",
          },
        },
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

    return res.status(201).json({
      message: "User created successfully",
      user: userInserted,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const isUserExists = await prismaClient.users.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        name: true,
        profile_url: true,
        password: true,
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

    const isPasswordMatch = await bcrypt.compare(
      password,
      isUserExists.password
    );

    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const accessToken = createJwtToken(
      { id: isUserExists.id, email: isUserExists.email },
      "30 days",
      TOKEN_TYPE.ACCESS_TOKEN
    );
    const refreshToken = createJwtToken(
      { id: isUserExists.id, email: isUserExists.email },
      "30 days",
      TOKEN_TYPE.REFRESH_TOKEN
    );

    const userWithFieldExcluded = exclude<IUser, "password">(isUserExists, [
      "password",
    ]);

    return res.status(200).json({
      message: "Login success",
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: userWithFieldExcluded,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const renewAccessToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    const decodedToken = verifyJwtToken(refreshToken);

    if (decodedToken.type !== TOKEN_TYPE.REFRESH_TOKEN) {
      return res
        .status(400)
        .json({ message: "Provided token is not refresh token" });
    }

    const isTokenExpired = checkJwtTokenExpiry(refreshToken);

    if (isTokenExpired) {
      return res.status(400).json({ message: "Token expired" });
    }

    const accessToken = createJwtToken(
      { id: decodedToken.data.id, email: decodedToken.data.email },
      "30 days",
      TOKEN_TYPE.ACCESS_TOKEN
    );

    return res.status(200).json({
      message: "Access token renewed",
      accessToken: accessToken,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
