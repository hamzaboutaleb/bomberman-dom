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

  return (
    <div class="container">
      <div class="waiting-room">
        <div class="room-header">
          <h1>Waiting Room - {room.type}</h1>
          <div class="room-info">
            <div class="timer">
              Time:{" "}
              <span
                class={() =>
                  room.type.value === "COUNTDOWN" ? "timer active" : "timer"
                }
              >
                {() => (room.time.value ?? 0).toFixed()}{" "}
              </span>{" "}
              <span> Seconds</span>
            </div>
            <div class="player-count">
              Players:{" "}
              <span id="playerCount">{() => room.players.value.length}</span>
            </div>
          </div>
        </div>

        <div class="players-list">
          <h2>Players</h2>
          <For
            each={room.players}
            component={(p) => <div>{p.name}</div>}
            container={<ul id="playersList"></ul>}
          />
        </div>

        <Chat />
      </div>
    </div>
  );
}
