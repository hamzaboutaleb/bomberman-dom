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
    ws.emit(PLAYER_EVENTS.MESSAGE, {
      message
    });
    e.target.reset();
  }
  return h("div", {
    class: "chat-container"
  }, h(For, {
    each: room.messages,
    container: h("div", {
      class: "chat-messages"
    }),
    component: m => h("div", null, m.name, " : ", m.message)
  }), h("form", {
    onSubmit: onSubmitMessage,
    class: "chat-input"
  }, h("input", {
    type: "text",
    name: "message",
    id: "messageInput",
    placeholder: "Type your message..."
  }), h("button", {
    id: "sendMessage"
  }, "Send")));
}