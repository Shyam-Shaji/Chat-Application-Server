import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("💥Error:", error);

  //HTTP Errors
  if (error.name === "HttpError") {
    return res.status(error.status).json({
      message: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }

  //validation Erros
  if (error.message?.includes("Validation failed")) {
    return res.status(400).json({
      message: error.message,
    });
  }

  //default
  res.status(500).json({
    message: "Internal server error",
  });
}
