import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { IAuthService } from "../interfaces/IAuthService";
import { IUserRepository } from "../interfaces/IUserRepository";
import { RegisterDto } from "../dtos/RegisterDto";
import { LoginDto } from "../dtos/LoginDto";
import { UserModel, type IUser, UserRole } from "../models";
import { config } from "../config/index";
import { RefreshTokenRepository } from "../repositories";
import createHttpError from "http-errors";
import { IRefreshTokenRepository } from "../interfaces/IRefreshTokenRepository";
import { RefreshTokenDto } from "../dtos/RefreshTokenDto";

const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000;

export class AuthService implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private refreshTokenRepository: IRefreshTokenRepository = new RefreshTokenRepository()
  ) {}

  async register(
    dto: RegisterDto
  ): Promise<{ user: Partial<IUser>; token: string; refreshToken: string }> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) throw createHttpError.Conflict("Email already exists");

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
      role: dto.role || UserRole.USER,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.JWT_SECRECT,
      { expiresIn: "15m" }
    );

    const refreshToken = await this.generateRefreshToken(user._id.toString());

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
      refreshToken,
    };
  }

  async login(
    dto: LoginDto
  ): Promise<{ user: Partial<IUser>; token: string; refreshToken: string }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw createHttpError.Unauthorized("Invalid credentials");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.JWT_SECRECT,
      { expiresIn: "1d" }
    );

    const refreshToken = await this.generateRefreshToken(user._id.toString());

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
      refreshToken,
    };
  }

  async refresh(
    refreshTokenDto: RefreshTokenDto
  ): Promise<{ token: string; refreshToken: string }> {
    const refreshToken = await this.refreshTokenRepository.findByToken(
      refreshTokenDto.refreshToken
    );
    if (!refreshToken || refreshToken.isRevoked) {
      throw createHttpError.Unauthorized("Invalid refresh token");
    }

    if (refreshToken.expiresAt < new Date()) {
      await this.refreshTokenRepository.revoke(refreshToken.token);
      throw createHttpError.Unauthorized("Refresh token expired");
    }

    const user = await this.userRepository.findById(
      refreshToken.userId.toString()
    );
    if (!user) throw createHttpError.Unauthorized("User not found");

    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      config.JWT_SECRECT!,
      { expiresIn: "15m" }
    );
    const newRefreshToken = await this.generateRefreshToken(
      user._id.toString()
    );

    await this.refreshTokenRepository.revoke(refreshToken.token);

    return { token: newToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeByUserId(userId);
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = await this.refreshTokenRepository.create({
      userId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN),
    });
    return refreshToken.token;
  }
}
