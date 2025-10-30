import { IConversationRepository } from "../interfaces/IConversationRepository";
import { ConversationRepository } from "../repositories/ConversationRepository";
import { IConversation } from "../models/Conversation";

export class ConversationService {
  constructor(
    private conversationRepo: IConversationRepository = new ConversationRepository()
  ) {}

  async getUserConversation(userId: string): Promise<IConversation[]> {
    return this.conversationRepo.getUserConversation(userId);
  }
}
