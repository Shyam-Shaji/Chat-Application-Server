import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import { config } from "./config";
import routes from "./routes";

export class App {
  public app: Application;
  private httpServer: http.Server;
  constructor() {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.setMiddleWare();
    this.setRoutes();
  }

  private setMiddleWare(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
    this.app.use(morgan("dev"));
  }

  //routes setup method
  private setRoutes(): void {
    this.app.use("/api", routes); //All routes under /api prefix
  }

  public getApp() {
    return this.app;
  }

  public getHttpServer(): http.Server {
    return this.httpServer;
  }

  public start(port: number): void {
    this.httpServer.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`📊 Environment: ${config.NODE_ENV}`);
      console.log(`📋 Routes: /api/health, /api/health/db`);
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer.close(() => {
        console.log("🔌 Server stopped");
        resolve();
      });
    });
  }
}
