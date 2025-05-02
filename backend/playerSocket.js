import { PLAYER_STATES, WS_EVENETS } from "./constante.js";
import { eventEmitter, roomManager } from "./server.js";
import { isAlphanumeric } from "./utils.js";

const { randomUUID } = require("crypto");
// state desing pattern

class PlayerSocketIdle {
  constructor(player) {
    /** @type {PlayerSocket} */
    this.player = player;
  }

  entre() {
    eventEmitter.on(
      WS_EVENETS.SET_NAME,
      this.player.ws,
      this.OnSetName.bind(this.player)
    );
  }

  exit() {
    eventEmitter.delete(WS_EVENETS.SET_NAME, this.player.ws);
  }

  OnSetName({ name }) {
    if (!name || !isAlphanumeric(name)) throw new Error("invalid name");
    this.playerName = name;
    //-------------- change state
    let room = roomManager.findOpenRoom();
    if (!room) room = roomManager.createNewRoom();
    room.addPlayer(this.player);
  }
}

class PlayerSocketQueue {
  entre() {}

  exit() {}
}

class PlayerSocketGame {
  entre() {}

  exit() {}
}

class PlayerSocketEnd {
  entre() {}

  exit() {}
}

export class PlayerSocket {
  /**
   *
   * @param {WebSocket} ws
   */
  constructor(ws) {
    this.ws = ws;
    this.id = randomUUID();
    this.roomId = null;
    this.playerId = null;
    this.playerName = null;
  }

  setupEventListeners() {}

  OnSetName({ name }) {
    if (!name || !isAlphanumeric(name)) throw new Error("invalid name");
    if (this.state != PLAYER_STATES.ENTRY)
      throw new Error("not allowed to change name");
    this.playerName = name;
    //-------------- change state
    this.state = PLAYER_STATES.QUEUE;
    //-------------- get room
    let room = roomManager.findOpenRoom();
    if (!room) room = roomManager.createNewRoom();
    room.addPlayer(this);
    this.send(WS_EVENETS.CHANGE_STATE, {
      state: this.state,
      roomId: room.id,
    });
  }

  send(eventName, data) {
    const request = {
      type: eventName,
      ...data,
    };
    this.ws.send(JSON.stringify(request));
  }
}
