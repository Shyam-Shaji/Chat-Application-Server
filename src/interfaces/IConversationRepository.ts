import { IConversation } from "../models/Conversation";
import { Types } from "mongoose";

// export interface IConversationRepository {
//   findOrCreatePrivateConversation(
//     userA: string,
//     userB: string
//   ): Promise<IConversation>;
//   getUserConversation(userId: string): Promise<IConversation[]>;
//   updateLastMessage(conversationId: string, messageId: string): Promise<void>;
// }

export interface IConversationRepository {
  create(data: Partial<IConversation>): Promise<IConversation>;
  findById(id: Types.ObjectId): Promise<IConversation | null>;
  findByParticipants(user1: Types.ObjectId, user2: Types.ObjectId): Promise<IConversation | null>;
  findUserConversations(userId: Types.ObjectId): Promise<IConversation[]>;
  updateLastMessage(convId: Types.ObjectId, messageId: Types.ObjectId): Promise<void>;
  addParticipant(convId: Types.ObjectId, userId: Types.ObjectId): Promise<void>;
}
