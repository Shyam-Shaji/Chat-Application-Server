import { Request, Response, NextFunction } from "express";
import { validate, Validate } from "class-validator";
import { UserRepository } from "../repositories";
import { UpdateProfileDto } from "../dtos/ProfileDto";
import { AddContactDto } from "../dtos/ContactDto";
import createHttpError from "http-errors";

export class ProfileController {
  constructor(private userRepository = new UserRepository()) {}

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw createHttpError.Unauthorized();
      const user = await this.userRepository.findByIdWithContacts(req.user.id);
      if (!user) throw createHttpError.NotFound("User not found");

      res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        status: user.status,
        lastSeen: user.lastSeen,
        contacts: user.contacts,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw createHttpError.Unauthorized();

      const dto = new UpdateProfileDto();
      Object.assign(dto, req.body);
      await validate(dto);

      const user = await this.userRepository.updateProfile(req.user.id, {
        ...dto,
        lastSeen: new Date(),
      });

      res.json({
        id: user?._id,
        username: user?.username,
        displayName: user?.displayName,
        avatarUrl: user?.avatarUrl,
        bio: user?.bio,
        status: user?.status,
      });
    } catch (error) {
      next(error);
    }
  }
}
