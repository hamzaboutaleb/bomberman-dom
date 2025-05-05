import { For } from "../../core/For.js";
import { h } from "../../core/view.js";
import { ws } from "../app.js";
import { Chat } from "../components/chat.js";
import { PLAYER_EVENTS } from "../constant.js";
import { room } from "../state.js";
export function RoomPage() {
  setInterval(() => {
    if (room.time.value != null) {
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
  }, () => room.players.value.length)))), h("div", {
    class: "players-list"
  }, h("h2", null, "Players"), h(For, {
    each: room.players,
    component: p => h("div", null, p.name),
    container: h("ul", {
      id: "playersList"
    })
  })), h(Chat, null)));
}