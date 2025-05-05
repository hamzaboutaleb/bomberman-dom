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
    if (e.key == " ") {
      ws.emit(GAME_EVENTS.PLACE_BOMB);
    }
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
  return (
    <div class="container">
      <div class="game-container">
        <div class="game-header">
          <div class="player-info">
            <h2 id="currentPlayer">
              Player: <span>{game.playerName}</span>
            </h2>
            <div class="stats">
              <div class="lives">Lives: {game.life}</div>
              <div class="bombs">
                Bombs: <span id="bombCount">{game.bombs}</span>
              </div>
              <div class="power">
                Bomb range: <span id="powerLevel">{game.bombRange}</span> |
                speed: <span id="powerLevel">{game.speed}</span> | max bombs:{" "}
                <span id="powerLevel">{game.maxBombs}</span>
              </div>
            </div>
          </div>
        </div>
        <For
          each={game.objects}
          container={
            <div
              tabindex="0"
              class="game-map"
              onKeyDown={onKeydown}
              onKeyUp={onKeyup}
              id="gameMap"
            ></div>
          }
          component={(cell) => <Cell cell={cell} />}
        />
        <Chat />
      </div>
    </div>
  );
}
