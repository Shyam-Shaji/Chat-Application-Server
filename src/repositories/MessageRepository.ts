import { IMessageRepository } from "../interfaces/IMessageRepository";
import { IMessage, MessageModel } from "../models/Message";
import { Types } from "mongoose";

export class MessageRepository implements IMessageRepository {
  async create(message: Partial<IMessage>): Promise<IMessage> {
    const msg = await MessageModel.create({
      ...message,
      readBy: [],
    });
    return msg.toObject() as IMessage;
  }

  async findByConversation(
    conversationId: string,
    options: { limit?: number; cursor?: string } = {}
  ): Promise<IMessage[]> {
    const { limit = 20, cursor } = options;

    const query: Record<string, any> = {
      $or: [
        { roomId: new Types.ObjectId(conversationId) },
        {
          $and: [
            { sender: new Types.ObjectId(conversationId) },
            { receiver: new Types.ObjectId(conversationId) },
          ], //[ ]
        },
      ],
      deletedAt: null,
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
      .populate("sender", "username displayName avatarUrl")
      .lean<IMessage | null>();
  }

  async update(
    id: string,
    updates: Partial<IMessage>
  ): Promise<IMessage | null> {
    return MessageModel.findByIdAndUpdate(
      id,
      { ...updates, editedAt: new Date() },
      { new: true }
    ).lean<IMessage | null>();
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
