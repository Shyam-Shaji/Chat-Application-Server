import { IRefreshToken } from "../models";

export interface IRefreshTokenRepository {
  create(token: Partial<IRefreshToken>): Promise<IRefreshToken>;
  findByToken(token: string): Promise<IRefreshToken | null>;
  revokeByUserId(userId: string): Promise<void>;
  revoke(token: string): Promise<void>;
}
