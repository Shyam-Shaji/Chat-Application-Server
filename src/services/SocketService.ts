import { Socket, Server } from "socket.io";
import jwt from "jsonwebtoken";
import { MessageService } from "./MessageService";
import { UserRepository } from "../repositories";
import { config } from "../config/index";
import { ISocketService, SocketRequest } from "../interfaces/ISocketService";
import { Types } from "mongoose";
import { UserStatus } from "../models";

export class SocketService implements ISocketService {
  private io!: Server;
  private userSockets = new Map<string, string[]>();
  private onlineUsers = new Set<string>();

  constructor(private messageService = new MessageService()) {}

  init(io: Server) {
    this.io = io;
    io.on("connection", (socket) => this.handleConnection(socket));
  }

  handleConnection(socket: Socket) {
    //JWT Auth
    socket.on("authenticate", async (token: string) => {
      try {
        const decoded = jwt.verify(token, config.JWT_SECRECT!) as {
          id: string;
        };
        socket.data.userId = decoded.id;

        //Track user
        if (!this.userSockets.has(decoded.id)) {
          this.userSockets.set(decoded.id, []);
        }
        this.userSockets.get(decoded.id)!.push(socket.id);
        this.onlineUsers.add(decoded.id);

        //update status
        await new UserRepository().updateProfile(decoded.id, {
          status: UserStatus.ONLINE,
        });

        socket.join(decoded.id); //personal room
        socket.emit("authenticated", { userId: decoded.id });

        console.log(`✅ User ${decoded.id} connected`);
      } catch (error) {
        socket.disconnect();
      }
    });

    //Message
    socket.on("send-message", async (data: SocketRequest) => {
      const message = await this.messageService.sendMessage(
        data,
        socket.data.userId!
      );
      this.io
        .to(data.receiverId || "general")
        .emit("message-received", message);
    });

    //Typing
    socket.on("typing", (data: { roomId: string; isTyping: boolean }) => {
      socket
        .to(data.roomId)
        .emit("user-typing", { userId: socket.data.userId, ...data });
    });

    //Read
    socket.on("message-read", async (data: { messageId: string }) => {
      await this.messageService.markRead(data.messageId, socket.data.userId!);
      this.io.to(data.messageId).emit("message-read", {
        messageId: data.messageId,
        userId: socket.data.userId,
      });
    });

    socket.on("disconnect", () => this.handleDisconnect(socket));
  }

  handleDisconnect(socket: Socket) {
    const userId = socket.data.userId as string;
    if (userId) {
      const sockets = this.userSockets.get(userId) || [];
      const index = sockets.indexOf(socket.id);
      if (index > -1) sockets.splice(index, 1);

      if (sockets.length === 0) {
        this.userSockets.delete(userId);
        this.onlineUsers.delete(userId);
        new UserRepository().updateProfile(userId, {
          status: UserStatus.OFFLINE,
        });
        this.io.emit("user-offline", { userId });
      }
    }
  }
}
