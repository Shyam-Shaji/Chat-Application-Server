import { IMessageRepository } from "../interfaces/IMessageRepository";
import { SendMessageDto } from "../dtos/MessageDto";
import { EditMessageDto } from "../dtos/EditMessageDto";
import { MessageRepository } from "../repositories";
import createHttpError from "http-errors";
import { IMessage, MessageType } from "../models";
import { Types } from "mongoose";
import { ConversationService } from "./ConversationService";

export class MessageService {
  constructor(
    private messageRepo: IMessageRepository = new MessageRepository(),
    private conversationService: ConversationService = new ConversationService()
  ) {}

  private toObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw createHttpError.BadRequest(`Invalid ID: ${id}`);
    }
    return new Types.ObjectId(id);
  }

  async sendMessage(dto: SendMessageDto, senderId: string): Promise<IMessage> {
    let conversationId: string;

    // 1. Private chat → get or create via ConversationService
    if (!dto.roomId && dto.receiverId) {
      const conversation = await this.conversationService.getOrCreatePrivate(
        senderId,
        dto.receiverId
      );
      conversationId = conversation._id.toString();
    }
    // 2. Group chat → use provided roomId
    else if (dto.roomId) {
      conversationId = dto.roomId;
    }
    // 3. Missing both
    else {
      throw createHttpError.BadRequest(
        "Either roomId or receiverId is required"
      );
    }

    // Validate conversation exists (via repo inside service)
    const convObjId = this.toObjectId(conversationId);
    const conversation = await this.conversationService
      .getRepo()
      .findById(convObjId);
    if (!conversation) throw createHttpError.NotFound("Conversation not found");

    // Build message data
    const messageData: Partial<IMessage> = {
      content: dto.content,
      type: dto.type ?? MessageType.TEXT,
      attachments: dto.attachments ?? [],
      sender: this.toObjectId(senderId),
      conversation: convObjId,
    };

    if (!dto.roomId && dto.receiverId) {
      messageData.receiver = this.toObjectId(dto.receiverId);
    }

    // Create message
    const message = await this.messageRepo.create(messageData);

    // Update lastMessage in conversation
    await this.conversationService
      .getRepo()
      .updateLastMessage(convObjId, message._id as Types.ObjectId);

    // Return populated message
    const populated = await this.messageRepo.findById(message._id.toString());
    if (!populated)
      throw createHttpError.InternalServerError(
        "Message not found after creation"
      );

    return populated;
  }

  async getMessages(
    conversationId: string,
    options: { limit?: number; cursor?: string } = {}
  ): Promise<IMessage[]> {
    const convObjId = this.toObjectId(conversationId);
    return this.messageRepo.findByConversation(convObjId.toString(), options);
  }

  async editMessage(
    messageId: string,
    dto: EditMessageDto,
    userId: string
  ): Promise<IMessage> {
    const msgObjId = this.toObjectId(messageId);
    const message = await this.messageRepo.findById(msgObjId.toString());
    if (!message) throw createHttpError.NotFound("Message not found");
    if (message.sender.toString() !== userId) {
      throw createHttpError.Forbidden("You can only edit your own messages");
    }

    const updated = await this.messageRepo.update(msgObjId.toString(), {
      content: dto.content,
    });
    if (!updated) throw createHttpError.InternalServerError("Failed to update");
    return updated;
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const msgObjId = this.toObjectId(messageId);
    const message = await this.messageRepo.findById(msgObjId.toString());
    if (!message) throw createHttpError.NotFound("Message not found");
    if (message.sender.toString() !== userId) {
      throw createHttpError.Forbidden("You can only delete your own messages");
    }

    await this.messageRepo.delete(msgObjId.toString());
  }

  async markRead(messageId: string, userId: string): Promise<void> {
    const msgObjId = this.toObjectId(messageId);
    const message = await this.messageRepo.findById(msgObjId.toString());
    if (!message) throw createHttpError.NotFound("Message not found");
    if (message.receiver?.toString() !== userId) {
      throw createHttpError.Forbidden("You can only mark received messages");
    }

    await this.messageRepo.markRead(msgObjId.toString(), userId);
  }
}
