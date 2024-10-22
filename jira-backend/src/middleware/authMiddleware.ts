import { NextFunction, Request, Response } from "express";
import { checkJwtTokenExpiry, verifyJwtToken } from "../util/jwt.util";
import { TOKEN_TYPE } from "../types/token/TokenType";

export const validateJwtToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let jwtToken = req.header("Authorization");

    if (!jwtToken) {
      return res.status(401).json({ message: "Provide jwt token" });
    }

    if (jwtToken.startsWith("Bearer ")) {
      jwtToken = jwtToken.split(" ")[1];
    }

    if (checkJwtTokenExpiry(jwtToken)) {
      return res.status(401).json({ message: "Jwt token has expired" });
    }

    const data = verifyJwtToken(jwtToken);
    const tokenType = data.tokenType;
    if (tokenType === TOKEN_TYPE.REFRESH_TOKEN) {
      return res
        .status(401)
        .json({ message: "You cannot use refresh token for APIs" });
    }
    req.body.userData = data;
    next();
  } catch (error: any) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
