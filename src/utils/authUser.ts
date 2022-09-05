import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authUser = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.headers.authorization);
  if (!req.headers.authorization) {
    return;
  }
  const decoded = jwt.decode(
    req.headers.authorization.replace("Bearer ", "")
  ) as { id: number; admin: boolean };

  if (!decoded) {
    return;
  }

  return decoded;
};
