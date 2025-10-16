import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: Number(process.env.PORT) || 8000,
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI!,
  JWT_SECRECT:
    process.env.JWT_SECRECT || "your-super-secret-key-change-in-production"!,
};
