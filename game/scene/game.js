import BaseScene from "../../core/BaseScene.js";
import { EntryScene } from "./entry.js";

export class GameScene extends BaseScene {
  enter() {}

  exit() {
    console.log("Exiting Entry Scene.");
  }

  update(dt) {
    if (this.input.isKeyPressed("q")) {
      this.scene.switchScene(EntryScene);
    }
  }

  render(container) {
    container.innerHTML = `
      <div>
        <h1>Game Scene</h1>
        <p>Press "Q" to quit the game.</p>
      </div>
    `;
  }
}
