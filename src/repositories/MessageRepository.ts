import { IMessageRepository } from "../interfaces/IMessageRepository";
import { IMessage, MessageModel } from "../models/Message";
import { Types } from "mongoose";

export class MessageRepository implements IMessageRepository {
  async create(message: Partial<IMessage>): Promise<IMessage> {
    return MessageModel.create({
      ...message,
      readBy: [],
    });
  }

  async findByConversation(
    conversationId: string,
    options: { limit?: number; cursor?: string }
  ): Promise<IMessage[]> {
    const { limit = 20, cursor } = options;
    const query: any = {
      $or: [
        { roomId: conversationId },
        { $and: [{ sender: conversationId }, { receiver: conversationId }] },
      ],
      deletedAt: { $exists: false },
    };

    if (cursor) {
      query.createdAt = { $lt: new Date(parseInt(cursor)) };
    }

    return MessageModel.find(query)
      .populate("sender", "username displayName avatarUrl status")
      .populate("receiver", "username displayName")
      .populate("readBy", "username")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<IMessage[]>();
  }

  async findById(id: string): Promise<IMessage | null> {
    return MessageModel.findById(id)
      .populate("sender", "username displayName")
      .lean<IMessage | null>();
  }

  async update(
    id: string,
    updates: Partial<IMessage>
  ): Promise<IMessage | null> {
    return MessageModel.findByIdAndUpdate(id, {
      ...updates,
      editedAt: new Date(),
    }).lean<IMessage | null>();
  }

  async delete(id: string): Promise<void> {
    await MessageModel.findByIdAndUpdate(id, { deletedAt: new Date() });
  }

  async markRead(messageId: string, userId: string): Promise<void> {
    await MessageModel.findByIdAndUpdate(messageId, {
      $addToSet: { readBy: new Types.ObjectId(userId) },
    });
  }
}
