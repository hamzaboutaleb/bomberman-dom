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
              <span id="playerCount">
                {() => {
                  console.log(room.players.value);
                  return room.players.value.length;
                }}
              </span>
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

        <div class="chat-container">
          <div class="chat-messages" id="chatMessages"></div>
          <div class="chat-input">
            <input
              type="text"
              id="messageInput"
              placeholder="Type your message..."
            />
            <button id="sendMessage">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
