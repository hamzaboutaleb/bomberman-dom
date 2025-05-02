import BaseScene from "../../core/BaseScene.js";
import Game from "../../core/game.js";
import { InputManager } from "../../core/inputManager.js";
import { GameScene } from "./game.js";

export class EntryScene extends BaseScene {
  enter() {
    this.title = "Welcome to the Game!";
    this.instructions = "Press Enter to start the game.";
  }

  exit() {
    console.log("Exiting Entry Scene.");
  }

  update(dt) {
    const startBtn = document.getElementById("startBtn");
    if (this.input.isKeyPressed("q") && startBtn) {
      this.scene.switchScene(GameScene);
    }
  }

  render(container) {
    container.innerHTML = `
     <div class="entry-container">
        <h1 class="title">🔥 Bomberman</h1>

        <div class="form-group">
          <label for="playerName">Enter your name</label>
          <input type="text" id="playerName" placeholder="BomberX">
        </div>

        <div class="form-group">
          <label for="difficulty">Select difficulty</label>
          <select id="difficulty">
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <button id="startBtn">Start Game</button>
        <p id="error" class="error"></p>
    </div>
    `;
  }
}
