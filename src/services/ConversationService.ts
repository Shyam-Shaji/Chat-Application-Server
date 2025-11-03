import { IConversationRepository } from "../interfaces/IConversationRepository";
import { ConversationRepository } from "../repositories/ConversationRepository";
import { ConversationType, IConversation } from "../models/Conversation";
import createHttpError from "http-errors";
import { Types } from "mongoose";

// export class ConversationService {
//   constructor(
//     private conversationRepo: IConversationRepository = new ConversationRepository()
//   ) {}

//   async getUserConversation(userId: string): Promise<IConversation[]> {
//     return this.conversationRepo.getUserConversation(userId);
//   }
// }

export class ConversationService {
  constructor(
    private conversationRepo: IConversationRepository = new ConversationRepository()
  ) {}

  // Helper: Convert string → ObjectId
  private toObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw createHttpError.BadRequest(`Invalid ID: ${id}`);
    }
    return new Types.ObjectId(id);
  }

  // Get or create private conversation
  async getOrCreatePrivate(
    user1: string,
    user2: string
  ): Promise<IConversation> {
    const user1Id = this.toObjectId(user1);
    const user2Id = this.toObjectId(user2);

    let conv = await this.conversationRepo.findByParticipants(user1Id, user2Id);
    if (!conv) {
      conv = await this.conversationRepo.create({
        type: ConversationType.PRIVATE,
        participants: [user1Id, user2Id],
        createdBy: user1Id,
      });
    }
    return conv;
  }

  async getUserConversations(userId: string): Promise<IConversation[]> {
    const userObjectId = this.toObjectId(userId);
    return this.conversationRepo.findUserConversations(userObjectId);
  }

  async createGroup(
    creatorId: string,
    name: string,
    participantIds: string[]
  ): Promise<IConversation> {
    const creatorObjectId = this.toObjectId(creatorId);
    const participantObjectIds = participantIds.map((id) =>
      this.toObjectId(id)
    );

    const participants = [
      ...new Set([creatorObjectId, ...participantObjectIds]),
    ];

    return this.conversationRepo.create({
      type: ConversationType.GROUP,
      name,
      participants,
      createdBy: creatorObjectId,
    });
  }

  async addParticipant(convId: string, userId: string): Promise<void> {
    const convObjectId = this.toObjectId(convId);
    const userObjectId = this.toObjectId(userId);

    const conv = await this.conversationRepo.findById(convObjectId);
    if (!conv) throw createHttpError.NotFound("Conversation not found");
    if (conv.type !== ConversationType.GROUP) {
      throw createHttpError.BadRequest("Cannot add to private chat");
    }

    await this.conversationRepo.addParticipant(convObjectId, userObjectId);
  }

  async updateLastMessage(convId: string, messageId: string): Promise<void> {
    const convObjectId = this.toObjectId(convId);
    const messageObjectId = this.toObjectId(messageId);

    await this.conversationRepo.updateLastMessage(
      convObjectId,
      messageObjectId
    );
  }

  public getRepo(): IConversationRepository {
    return this.conversationRepo;
  }
}
