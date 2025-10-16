import { Schema, model, Document, Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
export interface IRefreshToken extends Document {
  token: string;
  userId: string | Types.ObjectId;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

refreshTokenSchema.pre("save", function (next) {
  if (!this.token) this.token = uuidv4();
  next();
});

export const RefreshTokenModel = model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema
);
