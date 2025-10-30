import { IConversation } from "../models/Conversation";

export interface IConversationRepository {
  findOrCreatePrivateConversation(
    userA: string,
    userB: string
  ): Promise<IConversation>;
  getUserConversation(userId: string): Promise<IConversation[]>;
  updateLastMessage(conversationId: string, messageId: string): Promise<void>;
}
