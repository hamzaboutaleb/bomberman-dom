import {
  GAME_INITIAL_COUNTDOWN_TIME,
  GAME_INITIAL_WAITING_TIME,
  MAX_ROOM_PLAYERS,
  ROOM_EVENTS,
  ROOM_STATES,
  WS_EVENETS,
} from "./constante.js";
import { PlayerSocket } from "./playerSocket.js";

const { randomUUID } = require("crypto");

class RoomIdle {
  /**
   *
   * @param {Room} room
   */
  constructor(room) {
    this.room = room;
  }

  enter() {
    this.room.sendIdleStateEvent();
  }

  exit() {}

  update() {
    if (this.room.players.length >= 2) {
      this.room.setState(new RoomWait(this.room));
    }
  }

  /**
   *
   * @param {PlayerSocket} player
   */
  addPlayer(player) {
    if (this.room.isFull()) throw new Error("room is Full");
    this.room.sendPlayerJoin(player);
    player.roomId = this.room.id;
    this.room.players.push(player);
    this.notifyNewPlayer(player);
  }

  removePlayer() {}

  /**
   *
   * @param {PlayerSocket} player
   */
  notifyNewPlayer(player) {
    player.send(ROOM_EVENTS.IDLE, {
      players: this.room.players.map((p) => ({ id: p.id, name: p.playerName })),
    });
  }
}

class RoomWait {
  constructor(room) {
    this.room = room;
  }

  enter() {
    this.time = GAME_INITIAL_WAITING_TIME;
    this.room.sendWaitStateEvent();
  }

  exit() {}

  update(dt) {
    this.time -= dt;
    if (this.room.player.length <= 1) {
      this.room.setState(new RoomIdle(this.room));
      return;
    }
    if (this.room.players.length >= 4 || this.room.time <= 0) {
      this.room.setState(new RoomCountDown(this.room));
      return;
    }
  }

  addPlayer(player) {
    if (this.room.isFull()) throw new Error("room is Full");
    this.room.sendPlayerJoin(player);
    this.room.players.push(player);
    this.notifyNewPlayer(player);
  }

  removePlayer() {}

  notifyNewPlayer(player) {
    player.send(ROOM_EVENTS.WAIT, {
      players: this.room.players.map((p) => ({ id: p.id, name: p.playerName })),
      time: this.time,
    });
  }
}

class RoomCountDown {
  constructor(room) {
    this.room = room;
  }

  enter() {
    this.time = GAME_INITIAL_COUNTDOWN_TIME;
    this.room.sendCountDownStateEvent();
  }

  exit() {}

  update(dt) {
    this.time -= dt;
    if (this.time <= 0) {
      // start game
    }
    if (this.room.player.length <= 1) {
      this.room.setState(new RoomIdle(this.room));
      return;
    }
  }

  addPlayer(player) {
    if (this.room.isFull()) throw new Error("room is Full");
    this.room.sendPlayerJoin(player);
    this.room.players.push(player);
    this.notifyNewPlayer(player);
  }

  removePlayer() {}

  notifyNewPlayer(player) {
    player.send(ROOM_EVENTS.COUNTDOWN, {
      players: this.room.players.map((p) => ({ id: p.id, name: p.playerName })),
      time: this.time,
    });
  }
}

export class Room {
  id;
  constructor() {
    this.id = randomUUID();
    /** @type {PlayerSocket[]}  */
    this.players = [];
    this.state = ROOM_STATES.IDLE;
    this.time = null;
    this.currentState = null;
    this.setState(new RoomIdle(this));
  }

  setState(state) {
    if (this.currentState) this.currentState.exit();
    this.currentState = state;
    this.currentState.enter();
  }

  isFull() {
    return this.players >= MAX_ROOM_PLAYERS;
  }

  canStartTime() {
    return this.players.length >= 2;
  }

  update(dt) {
    this.currentState.update(dt);
  }

  addPlayer(player) {
    this.currentState.addPlayer(player);
  }

  send(eventType, data) {
    this.players.forEach((player) => {
      player.send(eventType, data);
    });
  }

  sendWaitStateEvent() {
    this.send(ROOM_STATES.WAIT, {
      time: this.time,
    });
  }

  sendIdleStateEvent() {
    this.send(ROOM_STATES.WAIT, {});
  }

  sendCountDownStateEvent() {
    this.send(ROOM_STATES.WAIT, {
      time: this.time,
    });
  }

  sendPlayerJoin(player) {
    this.send(WS_EVENETS.PLAYER_JOIN_ROOM, {
      name: player.playerName,
      id: player.id,
      totalPlayer: this.players.length + 1,
    });
  }
}
