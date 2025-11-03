import { IConversationRepository } from "../interfaces/IConversationRepository";
import { ConversationType, IConversation } from "../models/Conversation";
import { ConversationModel } from "../models/Conversation";
import { Types } from "mongoose";

// export class ConversationRepository {
//   async findOrCreatePrivateConversation(
//     userA: string,
//     userB: string
//   ): Promise<IConversation> {
//     let conversation = await ConversationModel.findOne({
//       type: "private",
//       participants: {
//         $all: [new Types.ObjectId(userA), new Types.ObjectId(userB)],
//       },
//       isDeleted: false,
//     });

//     if (!conversation) {
//       conversation = await ConversationModel.create({
//         type: "private",
//         participants: [userA, userB],
//       });
//     }
//     return conversation as IConversation;
//   }

//   async getUserConversation(userId: string): Promise<IConversation[]> {
//     return ConversationModel.find({
//       participants: new Types.ObjectId(userId),
//       isDeleted: false,
//     })
//       .populate("participants", "username displayName avatarUrl status")
//       .populate("lastMessage")
//       .sort({ updatedAt: -1 })
//       .lean<IConversation[]>();
//   }

//   async createGroupConversation(
//     name: string,
//     creatorId: string,
//     participantIds: string[],
//     groupAvatar?: string
//   ): Promise<IConversation> {
//     const conversation = await ConversationModel.create({
//       type: "group",
//       name,
//       groupAvatar,
//       participants: [creatorId, ...participantIds],
//       createdBy: new Types.ObjectId(creatorId),
//     });
//     return conversation;
//   }

//   async updateLastMessage(
//     conversationId: string,
//     messageId: string
//   ): Promise<void> {
//     await ConversationModel.findByIdAndUpdate(conversationId, {
//       lastMessage: messageId,
//       updatedAt: new Date(),
//     });
//   }
// }

export class ConversationRepository implements IConversationRepository {
  async create(data: Partial<IConversation>): Promise<IConversation> {
    return ConversationModel.create(data);
  }

  async findById(id: Types.ObjectId): Promise<IConversation | null> {
    return ConversationModel.findById(id)
      .populate("participants", "username displayName avatarUrl status") // fixed typo
      .populate("lastMessage")
      .populate("createdBy", "username displayName")
      .lean<IConversation>();
  }

  async findByParticipants(
    user1: Types.ObjectId,
    user2: Types.ObjectId
  ): Promise<IConversation | null> {
    return ConversationModel.findOne({
      type: ConversationType.PRIVATE,
      participants: { $all: [user1, user2], $size: 2 },
      isDeleted: false,
    })
      .populate("participants", "username displayName avatarUrl status")
      .populate("lastMessage")
      .lean<IConversation>();
  }

  async findUserConversations(
    userId: Types.ObjectId
  ): Promise<IConversation[]> {
    return ConversationModel.find({
      participants: userId,
      isDeleted: false,
    })
      .populate("participants", "username displayName avatarUrl status")
      .populate("lastMessage")
      .populate("createdBy", "username displayName")
      .sort({ updatedAt: -1 })
      .lean<IConversation[]>();
  }

  async updateLastMessage(
    convId: Types.ObjectId,
    messageId: Types.ObjectId
  ): Promise<void> {
    await ConversationModel.findByIdAndUpdate(convId, {
      lastMessage: messageId,
      updatedAt: new Date(),
    });
  }

  async addParticipant(
    convId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<void> {
    await ConversationModel.findByIdAndUpdate(convId, {
      $addToSet: { participants: userId },
    });
  }

  async softDelete(convId: Types.ObjectId): Promise<void> {
    await ConversationModel.findByIdAndUpdate(convId, {
      isDeleted: true,
      updatedAt: new Date(),
    });
  }
}
