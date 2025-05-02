import { PlayerSocket } from "./playerSocket.js";

export class SocketManager {
  constructor() {
    /** @type {Map<WebSocket, PlayerSocket>} */
    this.sockets = new Map();
  }

  addSocket(ws) {
    const newSocket = PlayerSocket(ws);
    this.sockets.set(ws, newSocket);
  }
}
