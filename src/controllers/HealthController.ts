import { Request, Response } from "express";

export class HealthController {
  public async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      staus: "Ok",
      timeStamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  }

  public async dbCheck(req: Request, res: Response): Promise<void> {
    const { dbConnection } = await import("../config/db");
    res.status(200).json({
      status: "Ok",
      database: dbConnection.isConnectionActive()
        ? "Connected"
        : "Disconnected",
      readyStaus: dbConnection.getConnectionState(),
    });
  }
}
