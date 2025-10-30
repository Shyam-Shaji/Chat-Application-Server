import express, { Application } from "express";
import { Server } from "socket.io";
import { ChatSocket } from "./sockets";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import { config } from "./config";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { MessageService, SocketService } from "./services";

export class App {
  public app: Application;
  private httpServer: http.Server;
  private io!: Server;
  private chatSocket: ChatSocket;
  constructor() {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.io = new Server(this.httpServer, {
      cors: {
        origin: ["http://localhost:5173"], // frontend URL
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
      },
    });
    this.setMiddleWare();
    this.setRoutes();
    this.chatSocket = new ChatSocket(new SocketService(new MessageService()));
    this.chatSocket.init(this.io);
  }

  private setMiddleWare(): void {
    this.app.use(
      cors({
        origin: ["http://localhost:5173"],
        credentials: true,
      })
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use((err: any, req: any, res: any, next: any) => {
      errorHandler(err, req, res, next);
    });
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
      console.log(`🗨️  Socket.IO ready on ws://localhost:${config.PORT}`);
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
