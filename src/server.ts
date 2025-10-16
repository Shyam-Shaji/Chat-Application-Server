import { App } from "./app";
import { config } from "./config/index";
import { dbConnection } from "./config/db";

class Server {
  private app: App;
  private isRunning: boolean = false;

  constructor() {
    this.app = new App();
  }

  public async start(): Promise<void> {
    try {
      console.log("🔄 Starting MongoDB connection...");
      await dbConnection.connect();

      console.log("🚀 Starting HTTP Server...");
      this.app.start(Number(config.PORT));
      this.isRunning = true;

      // Graceful shutdown handlers
      this.setupShutdownHandlers();
    } catch (error) {
      console.error("💥 Failed to start server:", error);
      process.exit(1);
    }
  }

  private setupShutdownHandlers(): void {
    //SIGTERM
    process.on("SIGTERM", async () => {
      console.log("🛑 SIGTERM received, shutting down gracefully...");
      await this.shutdown();
    });

    // SIGINT
    process.on("SIGINT", async () => {
      console.log("🛑 SIGINT received, shutting down gracefully...");
      await this.shutdown();
    });

    // Uncaught exceptions
    process.on("uncaughtException", async (error) => {
      console.error("💥 Uncaught Exception:", error);
      await this.shutdown();
    });

    // Unhandled promise rejections
    process.on("unhandledRejection", async (reason) => {
      console.error("💥 Unhandled Rejection:", reason);
      await this.shutdown();
    });
  }

  private async shutdown(): Promise<void> {
    if (!this.isRunning) {
      return;
    }
    try {
      console.log("🔄 Shutting down gracefully...");
      await this.app.stop();
      await dbConnection.disconnect();

      this.isRunning = false;
      console.log("✅ Server shutdown complete");
      process.exit(0);
    } catch (error) {
      console.error("💥 Shutdown error:", error);
      process.exit(1);
    }
  }
}

const server = new Server();
server.start().catch(console.error);
