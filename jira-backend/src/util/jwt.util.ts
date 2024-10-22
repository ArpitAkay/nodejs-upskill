import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs/env.config";
import { Request, Response } from "express";
import { TOKEN_TYPE } from "../types/token/TokenType";

interface IUSER {
  id: number;
  email: string;
}

export const createJwtToken = (
  userData: IUSER,
  validity: string,
  tokenType: TOKEN_TYPE
) => {
  const token = jwt.sign(
    {
      data: userData,
      type: tokenType,
    },
    JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: validity,
    }
  );

  return token;
};

export const verifyJwtToken = (jwtToken: string) => {
  try {
    const decodedToken = jwt.verify(jwtToken, JWT_SECRET);
    if (!decodedToken || typeof decodedToken === "string") {
      throw new Error("Invalid jwt token");
    }
    return decodedToken;
  } catch (error: any) {
    throw new Error("Invalid jwt token");
  }
};

export const checkJwtTokenExpiry = (jwtToken: string) => {
  const decodedToken = jwt.decode(jwtToken);
  console.log(decodedToken);
  if (
    !decodedToken ||
    typeof decodedToken === "string" ||
    !("exp" in decodedToken) ||
    decodedToken.exp === undefined
  ) {
    return true;
  }

  const expiryDate = new Date(decodedToken.exp * 1000);
  const currentDate = new Date();
  return currentDate > expiryDate;
};

export const extractToken = (jwtToken: string | undefined) => {
  if (!jwtToken) {
    throw new Error("JWT Token is empty or null");
  }
  if (jwtToken.startsWith("Bearer ")) {
    return jwtToken.slice(7);
  }
  return jwtToken;
};

export const extractUserEmailFromJwtToken = (req: Request, res: Response) => {
  let jwtToken = req.header("Authorization");
  if (!jwtToken) {
    return res.status(400).json({ message: "Provide jwt token" });
  }

  if (jwtToken.startsWith("Bearer ")) {
    jwtToken = jwtToken.split(" ")[1];
  }

  const userData = verifyJwtToken(jwtToken);
  return userData.data;
};
