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

  async addContact(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw createHttpError.Unauthorized();

      const dto = new AddContactDto();
      Object.assign(dto, req.body);
      await validate(dto);

      const contact = await this.userRepository.findById(dto.contactId);
      if (!contact) throw createHttpError.NotFound("Contact not found");

      await this.userRepository.addContact(req.user.id, dto.contactId);
      res.json({ message: "Contact added successfully" });
    } catch (error) {
      next(error);
    }
  }

  async getContacts(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw createHttpError.Unauthorized();
      const user = await this.userRepository.findByIdWithContacts(req.user.id);
      res.json({
        contacts: (user?.contacts || []).map((c: any) => ({
          id: c._id ?? c.id,
          username: c.username,
          displayName: c.displayName,
          avatarUrl: c.avatarUrl,
          status: c.status,
          lastSeen: c.lastSeen,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  async removeContact(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw createHttpError.Unauthorized();
      await this.userRepository.removeContact(req.user.id, req.params.id);
      res.json({ message: "Contact removed successfully" });
    } catch (error) {
      next(error);
    }
  }

  async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw createHttpError.Unauthorized();
      const query = req.query.q as string;
      if (!query) throw createHttpError.BadRequest("Search query is required");

      const users = await this.userRepository.searchUsers(query);
      res.json({
        users: users.map((user) => ({
          id: user._id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          status: user.status,
          lastSeen: user.lastSeen,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw createHttpError.Unauthorized();

      const users = await this.userRepository.findAll();

      res.json({
        users: users.map((user) => ({
          id: user._id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          email: user.email,
          status: user.status,
          lastSeen: user.lastSeen,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
}
