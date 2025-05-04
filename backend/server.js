import { WebSocketServer } from "ws";
import { EventEmiter } from "./eventEmitter.js";
import { RoomManager } from "./roomManager.js";
import { SocketManager } from "./socketManager.js";
import { WS_EVENETS } from "./constante.js";

const wss = new WebSocketServer({ port: 8080 });
export const eventEmitter = new EventEmiter();
export const roomManager = new RoomManager();
export const socketManager = new SocketManager();

wss.on("connection", (ws) => {
  socketManager.addSocket(ws);
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      if (!data.type) throw new Error("event type is undefined");
      const { type, ...requestData } = data;
      eventEmitter.emit(type, ws, requestData);
    } catch (error) {
      console.error(error);
      ws.send(
        JSON.stringify({
          type: WS_EVENETS.ERROR,
          error: error.message,
        })
      );
    }
  });

  ws.on("close", () => {
    socketManager.delete(ws);
  });
});

let last = 0;
function server(timestamp) {
  const dt = (timestamp - last) / 1000;
  last = timestamp;
  roomManager.update(dt);
  setTimeout(() => server(Date.now()), 1000 / 60);
}

server();
