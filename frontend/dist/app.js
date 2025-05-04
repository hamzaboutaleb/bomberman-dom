import { createRouter, RouterView } from "../core/router.js";
import { h, render } from "../core/view.js";
import { ROOM_EVENTS, SWITCH_EVENTS, WS_EVENETS } from "./constant.js";
import { EntryPage } from "./page/entry.js";
import { RoomPage } from "./page/room.js";
import { WS } from "./socket/ws.js";
import { room } from "./state.js";
const routes = [{
  path: "/",
  component: EntryPage
}, {
  path: "/room",
  component: RoomPage
}];
export const {
  Link,
  ...router
} = createRouter(routes);
export const ws = new WS();
ws.on(ROOM_EVENTS.IDLE, data => {
  console.log(data);
  room.type.value = "WAITING";
  room.players.value = data.players;
  room.time.value = null;
  router.navigate("/room");
});
ws.on(ROOM_EVENTS.WAIT, data => {
  console.log("data", data);
  room.type.value = "WAITING";
  room.players.value = data.players;
  room.time.value = data.time;
  router.navigate("/room");
});
ws.on(ROOM_EVENTS.COUNTDOWN, data => {
  room.type.value = "COUNTDOWN";
  room.players.value = data.players;
  room.time.value = data.time;
  router.navigate("/room");
});
ws.on(SWITCH_EVENTS.ROOM_IDLE, () => {
  room.time.value = null;
});
ws.on(SWITCH_EVENTS.ROOM_WAIT, data => {
  room.time.value = data.time;
});
ws.on(SWITCH_EVENTS.ROOM_COUNTDOWN, data => {
  room.type.value = "COUNTDOWN";
  room.time.value = data.time;
});
ws.on(WS_EVENETS.PLAYER_JOIN_ROOM, data => {
  room.players.value = [...room.players.value, {
    id: data.id,
    name: data.name
  }];
});
ws.on(WS_EVENETS.PLAYER_LEAVE_ROOM, ({
  id
}) => {
  room.players.value = room.players.value.filter(p => p.id != id);
});
ws.onOpen = () => {
  console.log("welcome");
};
ws.onClose = () => {
  console.log("closed");
};
ws.connect();
const main = h(RouterView, {
  router: router
});
function App() {
  router.navigate("/");
  return main;
}
render(App(), document.getElementById("root"));