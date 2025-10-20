import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { MessageService } from "../services";
import { SendMessageDto } from "../dtos/MessageDto";
import { EditMessageDto } from "../dtos/EditMessageDto";
import createHttpError from "http-errors";

export class MessageController {
  constructor(private messageService: MessageService) {}

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = new SendMessageDto();
      Object.assign(dto, req.body);
      await validate(dto);

      if (!req.user?.id) throw createHttpError.Unauthorized();

      const message = await this.messageService.sendMessage(dto, req.user.id);
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: conversationId } = req.params;
      const { limit, cursor } = req.query;

      const message = await this.messageService.getMessages(conversationId, {
        limit: Number(limit) || 20,
        cursor: cursor as string,
      });

      res.json({
        message,
        nextCursor:
          message.length === 20
            ? message[message.length - 1].createdAt.getTime().toString()
            : null,
      });
    } catch (error) {
      next(error);
    }
  }

  async editMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: messageId } = req.params;
      const dto = new EditMessageDto();
      Object.assign(dto, req.body);
      await validate(dto);

      if (!req.user?.id) throw createHttpError.Unauthorized();

      const message = await this.messageService.editMessage(
        messageId,
        dto,
        req.user.id
      );
      res.json(message);
    } catch (error) {
      next(error);
    }
  }

  async deleteMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: messageId } = req.params;
      if (!req.user?.id) throw createHttpError.Unauthorized();

      await this.messageService.deleteMessage(messageId, req.user.id);
      res.json({ message: "Message deleted" });
    } catch (error) {
      next(error);
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: messageId } = req.params;
      if (!req.user?.id) throw createHttpError.Unauthorized();

      await this.messageService.markRead(messageId, req.user.id);
      res.json({ message: "Message read" });
    } catch (error) {
      next(error);
    }
  }
}
