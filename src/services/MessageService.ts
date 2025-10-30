import { IMessageRepository } from "../interfaces/IMessageRepository";
import { ConversationRepository } from "../repositories/ConversationRepository";
import { SendMessageDto } from "../dtos/MessageDto";
import { EditMessageDto } from "../dtos/EditMessageDto";
import { MessageRepository } from "../repositories";
import createHttpError from "http-errors";
import { IMessage, MessageType } from "../models";
import { Types } from "mongoose";

export class MessageService {
  constructor(
    private messageRepo: IMessageRepository = new MessageRepository(),
    private conversationRepo: ConversationRepository = new ConversationRepository()
  ) {}

  async sendMessage(dto: SendMessageDto, senderId: string): Promise<IMessage> {
    let conversationId: string | undefined = dto.roomId;

    if (!conversationId && dto.receiverId) {
      const conversation =
        await this.conversationRepo.findOrCreatePrivateConversation(
          senderId,
          dto.receiverId
        );

      if (!conversation?._id) {
        throw new Error("Conversation creation failed — no ID returned");
      }

      conversationId = conversation._id.toString();
    }

    if (!conversationId) {
      throw new Error("Conversation ID is undefined — cannot send message");
    }

    const message = await this.messageRepo.create({
      content: dto.content,
      type: dto.type ?? MessageType.TEXT,
      attachments: dto.attachments ?? [],
      sender: new Types.ObjectId(senderId),
      receiver: dto.receiverId ? new Types.ObjectId(dto.receiverId) : null,
      roomId: new Types.ObjectId(conversationId),
    });

    await this.conversationRepo.updateLastMessage(
      conversationId,
      message._id.toString()
    );

    return message;
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
    if (!message) throw createHttpError.NotFound("Message not found");
    if (message.sender.toString() !== userId)
      throw createHttpError.Forbidden("You cannot edit this message");

    return this.messageRepo.update(messageId, { content: dto.content });
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepo.findById(messageId);
    if (!message) throw createHttpError.NotFound("Message not found");
    if (message.sender.toString() !== userId)
      throw createHttpError.Forbidden("You cannot delete this message");

    await this.messageRepo.delete(messageId);
  }

  async markRead(messageId: string, userId: string): Promise<void> {
    await this.messageRepo.markRead(messageId, userId);
  }
}
