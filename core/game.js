/**
 * @typedef {Object} GameConfig
 * @property {HTMLElement} container - The HTML element that will contain the game.
 * @property {number} width - The width of the game canvas.
 * @property {number} height - The height of the game canvas.
 */

import { InputManager } from "./inputManager.js";
import SceneManager from "./sceneManager.js";

class Game {
  /**
   * @param {GameConfig} config - The configuration object for the game.
   */
  constructor(config) {
    if (!config.container) {
      throw new Error("Container is required");
    }
    if (!(config.container instanceof HTMLElement)) {
      throw new Error("Container must be an HTML element");
    }
    this.container = config.container;
    this.width = config.width || 800;
    this.height = config.height || 600;
    this.initiScene = config.initiScene || null;
    this.lastTime = 0;
    this.deltaTime = 0;
  }

  /**
   * Initializes the game.
   */
  init() {
    this.sceneManager = new SceneManager(this);
    this.inputManager = new InputManager();
    this.container.style.width = this.width + "px";
    this.container.style.height = this.height + "px";
    if (this.initiScene) {
      this.sceneManager.push(this.initiScene);
    }
    this.gameLoop();
  }

  gameLoop(t) {
    const dt = (t - this.lastTime) / 1000;
    this.lastTime = t;
    this.sceneManager.update(dt);
    this.inputManager.update();
    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

export default Game;
