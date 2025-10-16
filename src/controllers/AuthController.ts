import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { AuthService } from "../services";
import { RegisterDto } from "../dtos/RegisterDto";
import { LoginDto } from "../dtos/LoginDto";
import createHttpError from "http-errors";
import { RefreshTokenDto } from "../dtos/RefreshTokenDto";

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = new RegisterDto();
      Object.assign(dto, req.body);
      await validate(dto);
      const result = await this.authService.register(dto);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = new LoginDto();
      Object.assign(dto, req.body);
      await validate(dto);
      const result = await this.authService.login(dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = new RefreshTokenDto();
      Object.assign(dto, req.body);
      await validate(dto);
      const result = await this.authService.refresh(dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw createHttpError.Unauthorized("No user found");
      await this.authService.logout(req.user.id);
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  }
}
