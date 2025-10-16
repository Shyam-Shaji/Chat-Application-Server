import mongoose from "mongoose";
import HttpError from "http-errors";
import { config } from "../config/index";

class ConnectMongo {
  private dataBaseUrl: string;
  private isConnected: boolean = false;
  private connectionPromise: Promise<void> | null = null;
  constructor() {
    this.dataBaseUrl = config.MONGODB_URI;
  }

  /**
   * Connect to MongoDB with singleton pattern
   * @returns promise<void>
   */

  public async connect(): Promise<void> {
    //Prevent multiple connections
    if (this.isConnected) {
      return;
    }

    // Use existing promise if already connecting
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.createConnection();
    await this.connectionPromise;
    this.connectionPromise = null;
  }

  /**
   * Create new MongoDB connection
   * @private
   */
  private async createConnection(): Promise<void> {
    try {
      // MongoDB connection option for production readiness
      const mongooseOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      // Event listener for connection state
      mongoose.connection.on("connected", () => {
        this.isConnected = true;
        console.log("✅ MongoDB connected successfully");
      });

      mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB connection error:", err);
        this.isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        this.isConnected = false;
        console.log("⚠️ MongoDB disconnected");
        // Auto-reconnect after 5 seconds
        setTimeout(() => this.connect(), 5000);
      });

      // Connect to MongoDB
      await mongoose.connect(this.dataBaseUrl, mongooseOptions);
    } catch (error) {
      this.isConnected = false;
      console.error("❌ MongoDB connection failed:", error);
      throw new HttpError.InternalServerError("Databse connection failed");
    }
  }

  /**
   * Gracefull disconnect from mongoDB
   */

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log("🔌 MongoDB disconnected");
    }
  }

  /**
   * Check if connection is active
   */
  public isConnectionActive(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Get connection state
   */
  public getConnectionState(): number {
    return mongoose.connection.readyState;
  }
}

export const dbConnection = new ConnectMongo();
