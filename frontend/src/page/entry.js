import { h } from "../../core/view.js";
import { ws } from "../app.js";
import { WS_EVENETS } from "../constant.js";

export function EntryPage() {
  function onSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    console.log(name);
    ws.emit(WS_EVENETS.SET_NAME, { name });
  }
  return (
    <div class="container">
      <div class="name-input-container">
        <h1>Bomberman</h1>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="name"
            id="playerName"
            placeholder="Enter your name"
            required
          />
          <button type="submit">Join Game</button>
        </form>
      </div>
    </div>
  );
}
