import BaseScene from "./BaseScene.js";
import Game from "./game.js";

export class SceneManager {
  /** @type {BaseScene} */
  #scenesStack;
  /**
   * 
   * @param {Game} game 
   */
  constructor(game) {
    this.#scenesStack = [];
    this.game = game;
  }

  current() {
    if (this.#scenesStack.length === 0) {
      return null;
    }
    return this.#scenesStack[this.#scenesStack.length - 1];
  }

  push(sceneClass) {
    if (this.#scenesStack.length > 0) {
      this.current()?.pause();
    }
    const scene = new sceneClass();
    scene.init(this.game);
    this.#scenesStack.push(scene);
    scene.enter();
    this.game.container.innerHTML = "";
    scene.render(this.game.container)
    return scene;
  }

  pop() {
    if (this.#scenesStack.length === 0) {
      return null;
    }
    const scene = this.#scenesStack.pop();
    scene.exit();
    if (this.#scenesStack.length > 0) {
      this.current()?.resume();
    }
    return scene;
  }

  overlay(sceneClass) {
    if (this.#scenesStack.length > 0) {
      this.current()?.pause();
    }
    const scene = new sceneClass();
    scene.init(this.game);
    this.#scenesStack.push(scene);
    scene.enter();
    scene.render(this.game.container)
    return scene;
  }

  switchScene(sceneClass) {
    this.replace(sceneClass);
  }

  replace(scene) {
    if (this.#scenesStack.length > 0) {
      this.pop();
    }
    this.push(scene);
    return scene;
  }

  update(dt) {
    if (this.#scenesStack.length === 0) {
      return;
    }
    this.current().update(dt);
  }

}

export default SceneManager;
