import { Socket } from "socket.io";
import { IUser } from "../models";
import { MessageType } from "../models";

export interface ISocketService {
  handleConnection(socket: Socket): void;
  handleDisconnect(socket: Socket): void;
}

export interface SocketRequest {
  user: IUser;
  socket: Socket;
  receiverId?: string; // for private messages
  roomId?: string; // for group messages
  content: string; // actual message content
  type?: MessageType;
  attachments?: string[]; // optional
}
