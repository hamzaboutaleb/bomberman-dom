import { For } from "../../core/For.js";
import { h } from "../../core/view.js";
import { ws } from "../app.js";
import { Cell } from "../components/cell.js";
import { Chat } from "../components/chat.js";
import { GAME_EVENTS } from "../constant.js";
import { game } from "../state.js";
export function GamePage() {
  function onKeydown(e) {
    e.preventDefault();
    console.log(e.key);
    if (e.key == "d") {
      ws.emit(GAME_EVENTS.RIGHT);
    } else if (e.key == "q") {
      ws.emit(GAME_EVENTS.LEFT);
    } else if (e.key == "z") {
      ws.emit(GAME_EVENTS.TOP);
    } else if (e.key == "s") {
      ws.emit(GAME_EVENTS.BOTTOM);
    } else if (e.key == " ") {
      ws.emit(GAME_EVENTS.PLACE_BOMB);
    }
  }
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
  }, "Player: ", h("span", null)), h("div", {
    class: "stats"
  }, h("div", {
    class: "lives"
  }, "Lives:", h("span", {
    class: "life"
  }, "\u2764\uFE0F"), h("span", {
    class: "life"
  }, "\u2764\uFE0F"), h("span", {
    class: "life"
  }, "\u2764\uFE0F")), h("div", {
    class: "bombs"
  }, "Bombs: ", h("span", {
    id: "bombCount"
  }, "3")), h("div", {
    class: "power"
  }, "Power: ", h("span", {
    id: "powerLevel"
  }, "1"))))), h(For, {
    each: game.objects,
    container: h("div", {
      tabindex: "0",
      class: "game-map",
      onKeyDown: onKeydown,
      id: "gameMap"
    }),
    component: cell => h(Cell, {
      cell: cell
    })
  }), h(Chat, null)));
}