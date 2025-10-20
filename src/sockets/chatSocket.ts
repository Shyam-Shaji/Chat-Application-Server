import { Socket, Server } from "socket.io";
import { SocketService } from "../services";

export class ChatSocket {
  constructor(private socketService: SocketService) {}

  init(io: Server) {
    this.socketService.init(io);
  }
}
