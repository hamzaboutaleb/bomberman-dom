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
  return (
    <div class="container">
      <div class="game-container">
        <div class="game-header">
          <div class="player-info">
            <h2 id="currentPlayer">
              Player: <span></span>
            </h2>
            <div class="stats">
              <div class="lives">
                Lives:
                <span class="life">❤️</span>
                <span class="life">❤️</span>
                <span class="life">❤️</span>
              </div>
              <div class="bombs">
                Bombs: <span id="bombCount">3</span>
              </div>
              <div class="power">
                Power: <span id="powerLevel">1</span>
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
