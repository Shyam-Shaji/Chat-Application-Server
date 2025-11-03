import { Request, Response, NextFunction } from "express";
import { validateOrReject } from "class-validator";
import { MessageService } from "../services";
import { SendMessageDto } from "../dtos/MessageDto";
import { EditMessageDto } from "../dtos/EditMessageDto";
import createHttpError from "http-errors";

export class MessageController {
  constructor(private messageService: MessageService) {}

  async sendMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.id) throw createHttpError.Unauthorized();

      const dto = Object.assign(new SendMessageDto(), req.body);
      await validateOrReject(dto);

      const message = await this.messageService.sendMessage(dto, req.user.id);
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  }

  async getMessages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.id) throw createHttpError.Unauthorized();

      const { id: conversationId } = req.params;
      const limit = Number(req.query.limit) || 20;
      const cursor = req.query.cursor as string | undefined;

      const messages = await this.messageService.getMessages(conversationId, {
        limit,
        cursor,
      });

      const nextCursor =
        messages.length === limit
          ? messages[messages.length - 1].createdAt.getTime().toString()
          : null;

      res.json({
        messages,
        nextCursor,
      });
    } catch (error) {
      next(error);
    }
  }

  async editMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.id) throw createHttpError.Unauthorized();

      const { id: messageId } = req.params;
      const dto = Object.assign(new EditMessageDto(), req.body);
      await validateOrReject(dto);

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

  async deleteMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.id) throw createHttpError.Unauthorized();

      const { id: messageId } = req.params;
      await this.messageService.deleteMessage(messageId, req.user.id);

      res.json({ message: "Message deleted" });
    } catch (error) {
      next(error);
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) throw createHttpError.Unauthorized();

      const { id: messageId } = req.params;
      await this.messageService.markRead(messageId, req.user.id);

      res.json({ message: "Message marked as read" });
    } catch (error) {
      next(error);
    }
  }
}
