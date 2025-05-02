import { PLAYER_START_LIFES, PLAYER_START_SPEED } from "./constante.js";
import { PlayerSocket } from "./playerSocket.js";
import { PowerUps } from "./powersUp.js";

const { randomUUID } = require("crypto");

export class Player {
  /**
   *
   * @param {PlayerSocket} ws
   * @param {Object} pos
   */
  constructor(ws, pos) {
    this.ws = ws;
    this.pos = pos;
    this.speed = PLAYER_START_SPEED;
    this.life = PLAYER_START_LIFES;
    this.powerups = new PowerUps();
  }
}
