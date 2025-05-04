import { h } from "../../core/view.js";
import { ws } from "../app.js";
import { WS_EVENETS } from "../constant.js";
export function EntryPage() {
  function onSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    console.log(name);
    ws.emit(WS_EVENETS.SET_NAME, {
      name
    });
  }
  return h("div", {
    class: "container"
  }, h("div", {
    class: "name-input-container"
  }, h("h1", null, "Bomberman"), h("form", {
    onSubmit: onSubmit
  }, h("input", {
    type: "text",
    name: "name",
    id: "playerName",
    placeholder: "Enter your name",
    required: true
  }), h("button", {
    type: "submit"
  }, "Join Game"))));
}