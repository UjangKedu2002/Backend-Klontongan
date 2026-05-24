import { Response, NextFunction } from "express";

import { AuthRequest } from "./auth.middleware";

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): any => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  next();
};
