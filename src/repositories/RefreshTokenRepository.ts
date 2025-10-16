import { IRefreshToken, RefreshTokenModel } from "../models";
import { IRefreshTokenRepository } from "@interfaces/IRefreshTokenRepository";
import Types from "mongoose";

export class RefreshTokenRepository implements IRefreshTokenRepository {
  async create(token: Partial<IRefreshToken>): Promise<IRefreshToken> {
    return RefreshTokenModel.create(token);
  }

  async findByToken(token: string): Promise<IRefreshToken | null> {
    return RefreshTokenModel.findOne({ token, isRevoked: false });
  }

  async revokeByUserId(userId: string | Types.ObjectId): Promise<void> {
    //change Types.ObjectId
    await RefreshTokenModel.updateMany({ userId }, { isRevoked: true });
  }

  async revoke(token: string): Promise<void> {
    await RefreshTokenModel.updateOne({ token }, { isRevoked: true });
  }
}
