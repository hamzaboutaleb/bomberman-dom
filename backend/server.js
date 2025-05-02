const WebSocket = require("ws");
const { EventEmitter } = require("./eventEmitter.js");
const { RoomManager } = require("./roomManager.js");
const { SocketManager } = require("./socketManager.js");

const wss = new WebSocket.Server({ port: 8080 });
export const eventEmitter = new EventEmitter();
export const roomManager = new RoomManager();
export const socketManager = new SocketManager();

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      if (!data.type) throw new Error("event type is undefined");
      const { eventType, ...requestData } = data;
      eventEmitter.emit(eventType, ws, requestData);
    } catch (error) {
      console.error(error);
    }
  });

  ws.on("close", () => {});
});

let last = 0;
function server(timestamp) {
  const dt = (timestamp - last) / 1000;
  last = timestamp;
}
