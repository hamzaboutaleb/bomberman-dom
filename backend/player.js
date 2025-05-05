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
    this._speed = PLAYER_START_SPEED;
    this.life = PLAYER_START_LIFES;
    this.powerups = new PowerUps();
    this.currentBombs = 0;
  }

  canPutBomb() {
    return this.currentBombs < this.powerups.bombs;
  }

  get speed() {
    return Math.max(this._speed + this.powerups.speed, 1.5);
  }

  get range() {
    return this.powerups.flames;
  }

  get bombs() {
    return this.powerups.bombs;
  }

  set bombs(value) {
    this.powerups.bombs = value;
  }

  set speed(value) {
    this.powerups.speed = value;
  }

  getBombRange() {
    return this.powerups.flames;
  }
}
