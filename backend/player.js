import { PLAYER_START_LIFES, PLAYER_START_SPEED } from "./constante.js";
import { PlayerSocket } from "./playerSocket.js";
import { PowerUps } from "./powersUp.js";

export class Player {
  #speed;
  #life;
  /**
   *
   * @param {PlayerSocket} ws
   * @param {Object} pos
   */
  constructor() {
    this.#speed = PLAYER_START_SPEED;
    this.#life = PLAYER_START_LIFES;
    this.powerups = new PowerUps();
    this.currentBombs = 0;
  }

  get speed() {
    return this.#speed + this.powerups.speed;
  }

  get life() {
    return this.#life;
  }

  canPutBomb() {
    return this.currentBombs < this.powerups.boombs;
  }

  getBombRange() {
    return this.powerups.flames;
  }
}
