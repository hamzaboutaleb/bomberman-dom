import { PlayerSocket } from "./playerSocket.js";

export class SocketManager {
  constructor() {
    /** @type {Map<WebSocket, PlayerSocket>} */
    this.sockets = new Map();
  }

  addSocket(ws) {
    const newSocket = new PlayerSocket(ws);
    this.sockets.set(ws, newSocket);
  }

  getSocket(ws) {
    const socket = this.sockets.get(ws);
    return socket;
  }

  delete(ws) {
    if (this.sockets.has(ws)) {
      this.sockets.get(ws).clean();
      this.sockets.delete(ws);
    }
  }
}
