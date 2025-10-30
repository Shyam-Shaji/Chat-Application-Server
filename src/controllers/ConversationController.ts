import { Request, Response, NextFunction } from "express";
import { ConversationService } from "../services";
import { ConversationType } from "../models/Conversation";

export class ConversationController {
  private conversationService = new ConversationService();

  getUserConversations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      // Fetch conversations (make sure your repository populates participants + lastMessage)
      const conversations = await this.conversationService.getUserConversation(
        userId
      );

      const formatted = conversations.map((c: any) => {
        // Identify the other participant (for private chats)
        const otherUser =
          c.type === ConversationType.PRIVATE
            ? c.participants.find((p: any) => p._id?.toString() !== userId)
            : null;

        return {
          id: c._id.toString(),
          name:
            c.type === ConversationType.GROUP
              ? c.name || "Unnamed Group"
              : otherUser?.username || "Unknown User",
          avatar:
            c.type === ConversationType.GROUP
              ? c.groupAvatar || null
              : otherUser?.avatarUrl || null,
          lastMessage: c.lastMessage?.content || "",
          timestamp: c.lastMessage?.createdAt || c.updatedAt,
          unread: false, // You can implement unread count later
        };
      });

      res.status(200).json(formatted);
    } catch (error) {
      next(error);
    }
  };
}
