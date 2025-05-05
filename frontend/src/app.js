import { createRouter, RouterView } from "../core/router.js";
import { h, render } from "../core/view.js";
import {
  GAME_EVENTS,
  PLAYER_EVENTS,
  ROOM_EVENTS,
  SWITCH_EVENTS,
  WS_EVENETS,
} from "./constant.js";
import { EntryPage } from "./page/entry.js";
import { GamePage } from "./page/game.js";
import { RoomPage } from "./page/room.js";
import { WS } from "./socket/ws.js";
import { game, room } from "./state.js";

const routes = [
  { path: "/", component: EntryPage },
  { path: "/room", component: RoomPage },
  { path: "/game", component: GamePage },
];

export const { Link, ...router } = createRouter(routes);

export const ws = new WS();
ws.on(ROOM_EVENTS.IDLE, (data) => {
  console.log(data);
  room.type.value = "WAITING";
  room.players.value = data.players;
  room.time.value = null;
  router.navigate("/room");
});

ws.on(ROOM_EVENTS.WAIT, (data) => {
  console.log("data", data);
  room.type.value = "WAITING";
  room.players.value = data.players;
  room.time.value = data.time;
  router.navigate("/room");
});

ws.on(ROOM_EVENTS.COUNTDOWN, (data) => {
  room.type.value = "COUNTDOWN";
  room.players.value = data.players;
  room.time.value = data.time;
  router.navigate("/room");
});

ws.on(SWITCH_EVENTS.ROOM_IDLE, () => {
  room.type.value = "WAITING";
  room.time.value = null;
});

ws.on(SWITCH_EVENTS.ROOM_WAIT, (data) => {
  room.type.value = "WAITING";
  room.time.value = data.time;
});

ws.on(SWITCH_EVENTS.ROOM_COUNTDOWN, (data) => {
  room.type.value = "COUNTDOWN";
  room.time.value = data.time;
});

ws.on(WS_EVENETS.PLAYER_JOIN_ROOM, (data) => {
  room.players.value = [
    ...room.players.value,
    { id: data.id, name: data.name },
  ];
});

ws.on(WS_EVENETS.PLAYER_LEAVE_ROOM, ({ id }) => {
  room.players.value = room.players.value.filter((p) => p.id != id);
});

ws.on(SWITCH_EVENTS.GAME, ({ objects }) => {
  game.objects.value = objects;
  router.navigate("/game");
});

ws.on(GAME_EVENTS.BOTTOM, ({ id, x, y }) => {
  console.log("bottom", id, x, y);
  game.objects.value = game.objects.value.map((p) => {
    if (p.id == id) {
      return { ...p, x, y };
    }
    return p;
  });
});

ws.on(GAME_EVENTS.TOP, ({ id, x, y }) => {
  console.log("top", id, x, y);
  game.objects.value = game.objects.value.map((p) => {
    if (p.id == id) {
      return { ...p, x, y };
    }
    return p;
  });
});

ws.on(GAME_EVENTS.LEFT, ({ id, x, y }) => {
  console.log("left", id, x, y);
  game.objects.value = game.objects.value.map((p) => {
    if (p.id == id) {
      return { ...p, x, y };
    }
    return p;
  });
});

ws.on(GAME_EVENTS.RIGHT, ({ id, x, y }) => {
  console.log("right", id, x, y);
  game.objects.value = game.objects.value.map((p) => {
    if (p.id == id) {
      return { ...p, x, y };
    }
    return p;
  });
});

ws.on(GAME_EVENTS.PLAYER_DIE, ({ id, life }) => {
  game.objects.value = game.objects.value.filter((p) => p.id != id);
});

ws.on(GAME_EVENTS.PLAYER_HIT, ({ life }) => {
  console.log("player hit", life);
  game.life.value = life;
});

ws.on(GAME_EVENTS.PLACE_BOMB, ({ bomb }) => {
  console.log("bomb test", bomb);
  game.objects.value = [bomb, ...game.objects.value];
});

ws.on(
  GAME_EVENTS.PLAYER_STATE,
  ({ playerName, life, speed, bombs, bombRange }) => {
    game.playerName.value = playerName;
    game.life.value = life;
    game.speed.value = speed;
    game.bombs.value = bombs;
    game.bombRange.value = bombRange;
  }
);

ws.on(PLAYER_EVENTS.MESSAGE, ({ name, message }) => {
  room.messages.value = [...room.messages.value, { name, message }];
});

ws.on(GAME_EVENTS.ADD_OBJECT, ({ objects }) => {
  console.log("add object", objects);
  game.objects.value = [...objects, ...game.objects.value];
});

ws.on(GAME_EVENTS.DELETE_OBJECT, ({ ids }) => {
  console.log("delete object", ids);
  game.objects.value = game.objects.value.filter((p) => !ids.includes(p.id));
});

ws.onOpen = () => {
  console.log("welcome");
};
ws.onClose = () => {
  console.log("closed");
};
ws.connect();

const main = <RouterView router={router} />;
function App() {
  router.navigate("/");
  return main;
}
render(App(), document.getElementById("root"));
