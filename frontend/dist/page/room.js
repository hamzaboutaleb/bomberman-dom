import { For } from "../../core/For.js";
import { h } from "../../core/view.js";
import { room } from "../state.js";
export function RoomPage() {
  setInterval(() => {
    if (room.time.value != null) {
      console.log(room.time.value);
      room.time.value -= 1;
    } else {
      room.time.value = null;
    }
  }, 1000);
  return h("div", {
    class: "container"
  }, h("div", {
    class: "waiting-room"
  }, h("div", {
    class: "room-header"
  }, h("h1", null, "Waiting Room - ", room.type), h("div", {
    class: "room-info"
  }, h("div", {
    class: "timer"
  }, "Time:", " ", h("span", {
    class: () => room.type.value === "COUNTDOWN" ? "timer active" : "timer"
  }, () => (room.time.value ?? 0).toFixed(), " "), " ", h("span", null, " Seconds")), h("div", {
    class: "player-count"
  }, "Players:", " ", h("span", {
    id: "playerCount"
  }, () => {
    console.log(room.players.value);
    return room.players.value.length;
  })))), h("div", {
    class: "players-list"
  }, h("h2", null, "Players"), h(For, {
    each: room.players,
    component: p => h("div", null, p.name),
    container: h("ul", {
      id: "playersList"
    })
  })), h("div", {
    class: "chat-container"
  }, h("div", {
    class: "chat-messages",
    id: "chatMessages"
  }), h("div", {
    class: "chat-input"
  }, h("input", {
    type: "text",
    id: "messageInput",
    placeholder: "Type your message..."
  }), h("button", {
    id: "sendMessage"
  }, "Send")))));
}