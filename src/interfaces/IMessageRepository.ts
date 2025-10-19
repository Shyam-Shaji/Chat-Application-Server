import { IMessage, MessageType } from "../models";

export interface IMessageRepository {
  create(message: Partial<IMessage>): Promise<IMessage>;
  findByConversation(
    conversationId: string,
    options: { limit?: number; cursor?: string }
  ): Promise<IMessage[]>;
  findById(id: string): Promise<IMessage | null>;
  update(id: string, updates: Partial<IMessage>): Promise<IMessage | null>;
  delete(id: string): Promise<void>;
  markRead(messageId: string, userId: string): Promise<void>;
}
