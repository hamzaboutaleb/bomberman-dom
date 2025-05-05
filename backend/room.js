import {
  GAME_EVENTS,
  GAME_INITIAL_COUNTDOWN_TIME,
  GAME_INITIAL_WAITING_TIME,
  MAX_ROOM_PLAYERS,
  ROOM_EVENTS,
  SWITCH_EVENTS,
  WS_EVENETS,
} from "./constante.js";
import { PlayerSocket, PlayerSocketGame } from "./playerSocket.js";
import { randomUUID } from "crypto";
import { generateBomberManMap } from "./utils.js";
import { Game } from "./game.js";

class RoomIdle {
  /**
   *
   * @param {Room} room
   */
  constructor(room) {
    this.room = room;
    this.room.isOpen = true;
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

  removePlayer(player) {
    const isPlayerExist = this.room.players.some((p) => p == player);
    if (isPlayerExist) {
      this.room.players = this.room.players.filter((p) => p != player);
      this.room.send(WS_EVENETS.PLAYER_LEAVE_ROOM, {
        id: player.id,
      });
    }
  }

  /**
   *
   * @param {PlayerSocket} player
   */
  notifyNewPlayer(player) {
    player.send(ROOM_EVENTS.IDLE, {
      players: this.room.players.map((p) => {
        return { id: p.id, name: p.playerName };
      }),
    });
  }
}

class RoomWait {
  constructor(room) {
    this.room = room;
  }

  enter() {
    this.room.time = GAME_INITIAL_WAITING_TIME;
    this.room.isOpen = true;
    this.room.sendWaitStateEvent();
  }

  exit() {}

  update(dt) {
    this.room.time -= dt;
    if (this.room.players.length <= 1) {
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
    player.roomId = this.room.id;
    this.room.players.push(player);
    this.notifyNewPlayer(player);
  }

  removePlayer(player) {
    const isPlayerExist = this.room.players.some((p) => p == player);
    if (isPlayerExist) {
      this.room.players = this.room.players.filter((p) => p != player);
      this.room.send(WS_EVENETS.PLAYER_LEAVE_ROOM, {
        id: player.id,
      });
    } else {
      console.log("player not exist");
    }
  }

  notifyNewPlayer(player) {
    player.send(ROOM_EVENTS.WAIT, {
      players: this.room.players.map((p) => ({ id: p.id, name: p.playerName })),
      time: this.room.time,
    });
  }
}

class RoomCountDown {
  constructor(room) {
    this.room = room;
  }

  enter() {
    this.room.time = GAME_INITIAL_COUNTDOWN_TIME;
    this.room.isOpen = false;
    this.room.sendCountDownStateEvent();
  }

  exit() {}

  update(dt) {
    this.room.time -= dt;
    if (this.room.players.length <= 1) {
      this.room.setState(new RoomIdle(this.room));
      return;
    }
    if (this.room.time <= 0) {
      this.room.setState(new RoomGame(this.room));
      return;
    }
  }

  addPlayer(player) {
    if (this.room.isFull()) throw new Error("room is Full");
    this.room.sendPlayerJoin(player);
    player.roomId = this.room.id;
    this.room.players.push(player);
    this.notifyNewPlayer(player);
  }

  removePlayer(player) {
    const isPlayerExist = this.room.players.some((p) => p == player);
    if (isPlayerExist) {
      this.room.players = this.room.players.filter((p) => p != player);
      this.room.send(WS_EVENETS.PLAYER_LEAVE_ROOM, {
        id: player.id,
      });
    } else {
      console.log("player not exist");
    }
  }

  notifyNewPlayer(player) {
    player.send(ROOM_EVENTS.COUNTDOWN, {
      players: this.room.players.map((p) => ({ id: p.id, name: p.playerName })),
      time: this.room.time,
    });
  }
}

class RoomGame {
  constructor(room) {
    this.room = room;
  }
  enter() {
    this.room.sendGameStateEvent();
    this.room.players.forEach((p) => {
      p.setState(new PlayerSocketGame(p));
    });
  }

  removePlayer(player) {
    const isPlayerExist = this.room.players.some((p) => p == player);
    if (isPlayerExist) {
      this.room.players = this.room.players.filter((p) => p != player);
      this.room.send(WS_EVENETS.PLAYER_LEAVE_ROOM, {
        id: player.id,
      });
      this.room.game.deleteObject(player.playerId);
      this.room.send(GAME_EVENTS.DELETE_OBJECT, {
        ids: [player.playerId],
      });
      this.room.send(GAME_EVENTS.PLAYER_DIE, {
        id: player.id,
      });
    } else {
      console.log("player not exist");
    }
  }

  exit() {}

  update() {}
}

export class Room {
  id;
  constructor() {
    this.id = randomUUID();
    /** @type {PlayerSocket[]}  */
    this.players = [];
    this.time = null;
    this.game = new Game(this);
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

  removePlayer(player) {
    this.currentState.removePlayer(player);
  }

  getPlayerById(id) {
    return this.players.find((p) => p.playerId == id);
  }

  send(eventType, data) {
    this.players.forEach((player) => {
      player.send(eventType, data);
    });
  }

  sendWaitStateEvent() {
    this.send(SWITCH_EVENTS.ROOM_WAIT, {
      time: this.time,
    });
  }

  sendIdleStateEvent() {
    this.send(SWITCH_EVENTS.ROOM_IDLE, {});
  }

  sendCountDownStateEvent() {
    this.send(SWITCH_EVENTS.ROOM_COUNTDOWN, {
      time: this.time,
    });
  }

  sendGameStateEvent() {
    this.game.initGame(this.players);
    const { objects } = this.game;
    this.send(SWITCH_EVENTS.GAME, { objects });
  }

  sendPlayerJoin(player) {
    this.send(WS_EVENETS.PLAYER_JOIN_ROOM, {
      name: player.playerName,
      id: player.id,
      totalPlayer: this.players.length + 1,
    });
  }
}
