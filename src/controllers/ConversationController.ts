import { Request, Response, NextFunction } from "express";
import { ConversationService } from "../services";
import { ConversationType } from "../models/Conversation";
import createHttpError from "http-errors";
import { AddParticipantDto, CreateGroupDto } from "../dtos/ConversationDto";
import { validateOrReject } from "class-validator";
import { Types } from "mongoose";

// export class ConversationController {
//   private conversationService = new ConversationService();

//   getUserConversations = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) => {
//     try {
//       const userId = req.user?.id;
//       if (!userId) return res.status(401).json({ message: "Unauthorized" });

//       // Fetch conversations (make sure your repository populates participants + lastMessage)
//       const conversations = await this.conversationService.getUserConversation(
//         userId
//       );

//       const formatted = conversations.map((c: any) => {
//         // Identify the other participant (for private chats)
//         const otherUser =
//           c.type === ConversationType.PRIVATE
//             ? c.participants.find((p: any) => p._id?.toString() !== userId)
//             : null;

//         return {
//           id: c._id.toString(),
//           name:
//             c.type === ConversationType.GROUP
//               ? c.name || "Unnamed Group"
//               : otherUser?.username || "Unknown User",
//           avatar:
//             c.type === ConversationType.GROUP
//               ? c.groupAvatar || null
//               : otherUser?.avatarUrl || null,
//           lastMessage: c.lastMessage?.content || "",
//           timestamp: c.lastMessage?.createdAt || c.updatedAt,
//           unread: false, // You can implement unread count later
//         };
//       });

//       res.status(200).json(formatted);
//     } catch (error) {
//       next(error);
//     }
//   };
// }

export class ConversationController {
  constructor(private conversationService = new ConversationService()) {}

  // GET /api/conversations
  async getMyConversations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.id) throw createHttpError.Unauthorized();

      const userId = new Types.ObjectId(req.user.id);
      const convs = await this.conversationService.getUserConversations(
        userId.toString()
      );

      res.json({ conversations: convs });
    } catch (error) {
      next(error);
    }
  }

  //POST /api/conversations/group
  async createGroup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.id) throw createHttpError.Unauthorized();

      const dto = new CreateGroupDto();
      Object.assign(dto, req.body);
      await validateOrReject(dto); // ← proper validation

      const creatorId = new Types.ObjectId(req.user.id);
      const conv = await this.conversationService.createGroup(
        creatorId.toString(),
        dto.name,
        dto.participants
      );

      res.status(201).json(conv);
    } catch (error) {
      next(error);
    }
  }

  //POST /api/conversations/:id/participants
  async addParticipant(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.id) throw createHttpError.Unauthorized();

      const dto = new AddParticipantDto();
      Object.assign(dto, req.body);
      await validateOrReject(dto);

      const convId = new Types.ObjectId(req.params.id);
      const userId = new Types.ObjectId(dto.userId);

      await this.conversationService.addParticipant(
        convId.toString(),
        userId.toString()
      );

      res.json({ message: "Participant added" });
    } catch (error) {
      next(error);
    }
  }
}
