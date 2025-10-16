import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { config } from "../config/index";
import createHttpError from "http-errors";

// Extend Request
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}

export class AuthMiddleware {
  static authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authHeader =
        req.headers["authorization"] || req.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer")) {
        throw createHttpError.Unauthorized("Missing or invalid token");
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, config.JWT_SECRECT!) as {
        id: string;
        role: string;
      };
      req.user = { id: decoded.id, role: decoded.role };
      next();
    } catch (error) {
      next(createHttpError.Unauthorized("Invalid token"));
    }
  };
}
