import { WS_EVENETS } from "./constante.js";
import { eventEmitter, roomManager } from "./server.js";
import { isAlphanumeric } from "./utils.js";
import { randomUUID } from "crypto";
// state desing pattern

class PlayerSocketIdle {
  constructor(player) {
    /** @type {PlayerSocket} */
    this.player = player;
  }

  enter() {
    eventEmitter.on(
      WS_EVENETS.SET_NAME,
      this.player.ws,
      this.OnSetName.bind(this)
    );
  }

  exit() {
    eventEmitter.delete(WS_EVENETS.SET_NAME, this.player.ws);
  }

  OnSetName({ name }) {
    if (!name || !isAlphanumeric(name)) throw new Error("invalid name");
    this.player.playerName = name;
    //-------------- change state
    let room = roomManager.findOpenRoom();
    if (!room) room = roomManager.createNewRoom();
    room.addPlayer(this.player);
  }
}

class PlayerSocketQueue {
  enter() {}

  exit() {}
}

class PlayerSocketGame {
  enter() {}

  exit() {}
}

class PlayerSocketEnd {
  enter() {}

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
    this.currentState = null;
    this.setState(new PlayerSocketIdle(this));
  }

  setState(state) {
    if (this.currentState) this.currentState.exit();
    this.currentState = state;
    this.currentState.enter();
  }

  clean() {
    try {
      const room = roomManager.getRoom(this.roomId);

      if (room) {
        console.log("yes");
        room.removePlayer(this);
        eventEmitter.cleanAll(this);
      }
    } catch (error) {
      console.error(error);
    }
  }

  OnSetName({ name }) {
    if (!name || !isAlphanumeric(name)) throw new Error("invalid name");
    if (this.state != PLAYER_STATES.ENTRY)
      throw new Error("not allowed to change name");
    this.playerName = name;
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
