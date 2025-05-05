import { For } from "../../core/For.js";
import { h } from "../../core/view.js";
import { ws } from "../app.js";
import { PLAYER_EVENTS } from "../constant.js";
import { room } from "../state.js";

export function Chat() {
  function onSubmitMessage(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const message = formData.get("message");
    ws.emit(PLAYER_EVENTS.MESSAGE, { message });
    e.target.reset();
  }
  return (
    <div class="chat-container">
      <For
        each={room.messages}
        container={<div class="chat-messages"></div>}
        component={(m) => (
          <div>
            {m.name} : {m.message}
          </div>
        )}
      />
      <form onSubmit={onSubmitMessage} class="chat-input">
        <input
          type="text"
          name="message"
          id="messageInput"
          placeholder="Type your message..."
        />
        <button id="sendMessage">Send</button>
      </form>
    </div>
  );
}
