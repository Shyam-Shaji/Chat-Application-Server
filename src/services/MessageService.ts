import { IMessageRepository } from "../interfaces/IMessageRepository";
import { SendMessageDto } from "../dtos/MessageDto";
import { EditMessageDto } from "../dtos/EditMessageDto";
import { MessageRepository } from "../repositories";
import createHttpError from "http-errors";
import { IMessage } from "../models";
import { Types } from "mongoose";

export class MessageService {
  constructor(
    private messageRepo: IMessageRepository = new MessageRepository()
  ) {}

  async sendMessage(dto: SendMessageDto, senderId: string): Promise<IMessage> {
    return this.messageRepo.create({
      ...dto,
      sender: new Types.ObjectId(senderId),
      receiver: dto.receiverId ? new Types.ObjectId(dto.receiverId) : undefined,
      roomId: dto.roomId ? new Types.ObjectId(dto.roomId) : undefined,
    });
  }

  async getMessages(
    conversationId: string,
    options: { limit?: number; cursor?: string } = {}
  ): Promise<IMessage[]> {
    return this.messageRepo.findByConversation(conversationId, options);
  }

  async editMessage(
    messageId: string,
    dto: EditMessageDto,
    userId: string
  ): Promise<IMessage | null> {
    const message = await this.messageRepo.findById(messageId);
    if (!message || message.sender.toString() !== userId) {
      throw createHttpError.Forbidden("Cannot edit this message");
    }
    return this.messageRepo.update(messageId, { content: dto.content });
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepo.findById(messageId);
    if (!message || message.sender.toString() !== userId) {
      throw createHttpError.Forbidden("Cannot delete this message");
    }
    await this.messageRepo.delete(messageId);
  }

  async markRead(messageId: string, userId: string): Promise<void> {
    await this.messageRepo.markRead(messageId, userId);
  }
}
