import { For } from "../../core/For.js";
import { h } from "../../core/view.js";
import { ws } from "../app.js";
import { Cell } from "../components/cell.js";
import { Chat } from "../components/chat.js";
import { GAME_EVENTS } from "../constant.js";
import { game } from "../state.js";
const keys = {};
export function GamePage() {
  function onKeyup(e) {
    e.preventDefault();
    keys[e.key.toLowerCase()] = false;
  }
  function onKeydown(e) {
    e.preventDefault();
    keys[e.key.toLowerCase()] = true;
  }
  function gameloop(t) {
    if (keys["d"]) {
      ws.emit(GAME_EVENTS.RIGHT);
    }
    if (keys["q"]) {
      ws.emit(GAME_EVENTS.LEFT);
    }
    if (keys["z"]) {
      ws.emit(GAME_EVENTS.TOP);
    }
    if (keys["s"]) {
      ws.emit(GAME_EVENTS.BOTTOM);
    }
    if (keys[" "]) {
      ws.emit(GAME_EVENTS.PLACE_BOMB);
    }
    requestAnimationFrame(gameloop);
  }
  gameloop();

  // function onKeydown(e) {
  //   e.preventDefault();
  //   if (e.key == "d") {
  //     ws.emit(GAME_EVENTS.RIGHT);
  //   }
  //   if (e.key == "q") {
  //     ws.emit(GAME_EVENTS.LEFT);
  //   }
  //   if (e.key == "z") {
  //     ws.emit(GAME_EVENTS.TOP);
  //   }
  //   if (e.key == "s") {
  //     ws.emit(GAME_EVENTS.BOTTOM);
  //   }
  //   if (e.key == " ") {
  //     ws.emit(GAME_EVENTS.PLACE_BOMB);
  //   }
  // }
  return h("div", {
    class: "container"
  }, h("div", {
    class: "game-container"
  }, h("div", {
    class: "game-header"
  }, h("div", {
    class: "player-info"
  }, h("h2", {
    id: "currentPlayer"
  }, "Player: ", h("span", null, game.playerName)), h("div", {
    class: "stats"
  }, h("div", {
    class: "lives"
  }, "Lives: ", game.life), h("div", {
    class: "bombs"
  }, "Bombs: ", h("span", {
    id: "bombCount"
  }, game.bombs)), h("div", {
    class: "power"
  }, "Bomb range: ", h("span", {
    id: "powerLevel"
  }, game.bombRange), " | speed: ", h("span", {
    id: "powerLevel"
  }, game.speed), " | max bombs:", " ", h("span", {
    id: "powerLevel"
  }, game.maxBombs))))), h(For, {
    each: game.objects,
    container: h("div", {
      tabindex: "0",
      class: "game-map",
      onKeyDown: onKeydown,
      onKeyUp: onKeyup,
      id: "gameMap"
    }),
    component: cell => h(Cell, {
      cell: cell
    })
  }), h(Chat, null)));
}