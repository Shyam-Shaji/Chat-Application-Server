import { IConversation } from "../models/Conversation";
import { ConversationModel } from "../models/Conversation";
import { Types } from "mongoose";

export class ConversationRepository {
  async findOrCreatePrivateConversation(
    userA: string,
    userB: string
  ): Promise<IConversation> {
    let conversation = await ConversationModel.findOne({
      type: "private",
      participants: {
        $all: [new Types.ObjectId(userA), new Types.ObjectId(userB)],
      },
      isDeleted: false,
    });

    if (!conversation) {
      conversation = await ConversationModel.create({
        type: "private",
        participants: [userA, userB],
      });
    }
    return conversation as IConversation;
  }

  async getUserConversation(userId: string): Promise<IConversation[]> {
    return ConversationModel.find({
      participants: new Types.ObjectId(userId),
      isDeleted: false,
    })
      .populate("participants", "username displayName avatarUrl status")
      .populate("lastMessage")
      .sort({ updatedAt: -1 })
      .lean<IConversation[]>();
  }

  async createGroupConversation(
    name: string,
    creatorId: string,
    participantIds: string[],
    groupAvatar?: string
  ): Promise<IConversation> {
    const conversation = await ConversationModel.create({
      type: "group",
      name,
      groupAvatar,
      participants: [creatorId, ...participantIds],
      createdBy: new Types.ObjectId(creatorId),
    });
    return conversation;
  }

  async updateLastMessage(
    conversationId: string,
    messageId: string
  ): Promise<void> {
    await ConversationModel.findByIdAndUpdate(conversationId, {
      lastMessage: messageId,
      updatedAt: new Date(),
    });
  }
}
