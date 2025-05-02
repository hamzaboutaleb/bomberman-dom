export class InputManager {
  #keys;
  #prevKeys;
  constructor() {
    this.#keys = new Map();
    this.#prevKeys = new Map();
    this.#setupEventListeners();
  }

  #setupEventListeners() {
    window.addEventListener("keydown", (event) => {
      this.#keys.set(event.key, true);
    });

    window.addEventListener("keyup", (event) => {
      this.#keys.set(event.key, false);
    });
  }

  update() {
    this.#prevKeys = new Map(this.#keys);
  }

  isKeyPressed(key) {
    return this.#keys.get(key) === true && this.#prevKeys.get(key) === false;
  }

  isKeyReleased(key) {
    return this.#keys.get(key) === false && this.#prevKeys.get(key) === true;
  }

  isKeyHeld(key) {
    return this.#keys.get(key) === true && this.#prevKeys.get(key) === true;
  }
}
