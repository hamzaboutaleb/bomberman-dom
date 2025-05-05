import { GAME_EVENTS, PLAYER_EVENTS, WS_EVENETS } from "./constante.js";
import { gameObject } from "./game.js";
import { Player } from "./player.js";
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
    this.player.setState(new PlayerSocketRoom(this.player));
  }
}

class PlayerSocketRoom {
  constructor(player) {
    this.player = player;
  }

  enter() {
    eventEmitter.on(
      PLAYER_EVENTS.MESSAGE,
      this.player.ws,
      this.onMessage.bind(this)
    );
  }

  exit() {
    eventEmitter.delete(PLAYER_EVENTS.MESSAGE, this.player.ws);
  }

  onMessage(data) {
    try {
      const room = roomManager.getRoom(this.player.roomId);
      room.send(PLAYER_EVENTS.MESSAGE, {
        name: this.player.playerName,
        message: data.message || "",
      });
    } catch (error) {
      console.error("onMessage Event ", error);
    }
  }
}

export class PlayerSocketGame {
  constructor(player) {
    this.player = player;
  }
  enter() {
    eventEmitter.on(
      PLAYER_EVENTS.MESSAGE,
      this.player.ws,
      this.onMessage.bind(this)
    );

    eventEmitter.on(
      GAME_EVENTS.BOTTOM,
      this.player.ws,
      this.onMoveBottom.bind(this)
    );
    eventEmitter.on(GAME_EVENTS.TOP, this.player.ws, this.onMoveTop.bind(this));
    eventEmitter.on(
      GAME_EVENTS.LEFT,
      this.player.ws,
      this.onMoveLeft.bind(this)
    );
    eventEmitter.on(
      GAME_EVENTS.RIGHT,
      this.player.ws,
      this.onMoveRight.bind(this)
    );
    eventEmitter.on(
      GAME_EVENTS.PLACE_BOMB,
      this.player.ws,
      this.onPlaceBomb.bind(this)
    );
  }

  exit() {
    eventEmitter.delete(PLAYER_EVENTS.MESSAGE, this.player.ws);
    eventEmitter.delete(GAME_EVENTS.BOTTOM, this.player.ws);
    eventEmitter.delete(GAME_EVENTS.TOP, this.player.ws);
    eventEmitter.delete(GAME_EVENTS.LEFT, this.player.ws);
    eventEmitter.delete(GAME_EVENTS.RIGHT, this.player.ws);
    eventEmitter.delete(GAME_EVENTS.PLACE_BOMB, this.player.ws);
  }

  onMoveBottom() {
    const room = roomManager.getRoom(this.player.roomId);
    const game = room.game;
    const playerIndex = game.objects.findIndex(
      (obj) => obj.id == this.player.playerId
    );
    if (playerIndex < 0) return;
    const player = game.objects[playerIndex];

    // update player position
    player.y += this.player.player.speed;
    let isMoved = true;
    // check collision with other players
    const others = game.objects.filter((obj) => obj.id != this.player.playerId);
    //check wall collision map is 600 * 600
    if (player.x < 0 || player.x > 600 - player.width) {
      player.x = Math.max(0, Math.min(player.x, 600 - player.width));
      isMoved = false;
    }
    if (player.y < 0 || player.y > 600 - player.height) {
      player.y = Math.max(0, Math.min(player.y, 600 - player.height));
      isMoved = false;
    }

    const bombs = game.objects.filter((obj) => obj.type == "bomb");
    //check bomb player collision
    for (const bomb of bombs) {
      const isColiding =
        player.x < bomb.x + bomb.width &&
        player.x + player.width > bomb.x &&
        player.y < bomb.y + bomb.height &&
        player.y + player.height > bomb.y;
      if (!isColiding && bomb.onColision) {
        bomb.onColision = false;
      }
    }

    for (const other of others) {
      const isColiding =
        player.x < other.x + other.width &&
        player.x + player.width > other.x &&
        player.y < other.y + other.height &&
        player.y + player.height > other.y;

      if (isColiding) {
        if (other.type == "bomb" && other.onColision) continue;
        player.y -= this.player.player.speed;
        isMoved = false;
        break;
      }
    }
    if (isMoved) {
      room.send(GAME_EVENTS.BOTTOM, {
        id: this.player.playerId,
        x: player.x,
        y: player.y,
      });
    }

    console.log(this.player.playerId);
  }

  onMoveTop() {
    const room = roomManager.getRoom(this.player.roomId);
    const game = room.game;
    const playerIndex = game.objects.findIndex(
      (obj) => obj.id == this.player.playerId
    );
    if (playerIndex < 0) return;
    const player = game.objects[playerIndex];

    // update player position
    player.y -= this.player.player.speed;
    let isMoved = true;
    // check collision with other players
    const others = game.objects.filter((obj) => obj.id != this.player.playerId);
    //check wall collision map is 600 * 600
    if (player.x < 0 || player.x > 600 - player.width) {
      player.x = Math.max(0, Math.min(player.x, 600 - player.width));
      isMoved = false;
    }
    if (player.y < 0 || player.y > 600 - player.height) {
      player.y = Math.max(0, Math.min(player.y, 600 - player.height));
      isMoved = false;
    }

    const bombs = game.objects.filter((obj) => obj.type == "bomb");
    //check bomb player collision
    for (const bomb of bombs) {
      const isColiding =
        player.x < bomb.x + bomb.width &&
        player.x + player.width > bomb.x &&
        player.y < bomb.y + bomb.height &&
        player.y + player.height > bomb.y;
      if (!isColiding) {
        bomb.onColision = false;
      }
    }

    for (const other of others) {
      const isColiding =
        player.x < other.x + other.width &&
        player.x + player.width > other.x &&
        player.y < other.y + other.height &&
        player.y + player.height > other.y;

      if (isColiding) {
        if (other.type == "bomb" && other.onColision) continue;
        player.y += this.player.player.speed;
        isMoved = false;
        break;
      }
    }
    console.log(player.x, player.y);
    if (isMoved) {
      room.send(GAME_EVENTS.BOTTOM, {
        id: this.player.playerId,
        x: player.x,
        y: player.y,
      });
    }

    console.log(this.player.playerId);
  }

  onMoveLeft() {
    const room = roomManager.getRoom(this.player.roomId);
    const game = room.game;
    const playerIndex = game.objects.findIndex(
      (obj) => obj.id == this.player.playerId
    );
    if (playerIndex < 0) return;
    const player = game.objects[playerIndex];
    // update player position
    player.x -= this.player.player.speed;
    let isMoved = true;
    // check collision with other players
    const others = game.objects.filter((obj) => obj.id != this.player.playerId);
    //check wall collision map is 600 * 600
    if (player.x < 0 || player.x > 600 - player.width) {
      player.x = Math.max(0, Math.min(player.x, 600 - player.width));
      isMoved = false;
    }
    if (player.y < 0 || player.y > 600 - player.height) {
      player.y = Math.max(0, Math.min(player.y, 600 - player.height));
      isMoved = false;
    }
    const bombs = game.objects.filter((obj) => obj.type == "bomb");
    //check bomb player collision
    for (const bomb of bombs) {
      const isColiding =
        player.x < bomb.x + bomb.width &&
        player.x + player.width > bomb.x &&
        player.y < bomb.y + bomb.height &&
        player.y + player.height > bomb.y;
      if (!isColiding && bomb.onColision) {
        bomb.onColision = false;
      }
    }
    for (const other of others) {
      const isColiding =
        player.x < other.x + other.width &&
        player.x + player.width > other.x &&
        player.y < other.y + other.height &&
        player.y + player.height > other.y;

      if (isColiding) {
        if (other.type == "bomb" && other.onColision) continue;
        player.x += this.player.player.speed;
        isMoved = false;
        break;
      }
    }
    console.log(player.x, player.y);
    if (isMoved) {
      room.send(GAME_EVENTS.LEFT, {
        id: this.player.playerId,
        x: player.x,
        y: player.y,
      });
    }
    console.log(this.player.playerId);
  }

  onMoveRight() {
    const room = roomManager.getRoom(this.player.roomId);
    const game = room.game;
    const playerIndex = game.objects.findIndex(
      (obj) => obj.id == this.player.playerId
    );
    if (playerIndex < 0) return;
    const player = game.objects[playerIndex];
    // update player position
    player.x += this.player.player.speed;
    let isMoved = true;
    // check collision with other players
    const others = game.objects.filter((obj) => obj.id != this.player.playerId);
    //check wall collision map is 600 * 600
    if (player.x < 0 || player.x > 600 - player.width) {
      player.x = Math.max(0, Math.min(player.x, 600 - player.width));
      isMoved = false;
    }
    if (player.y < 0 || player.y > 600 - player.height) {
      player.y = Math.max(0, Math.min(player.y, 600 - player.height));
      isMoved = false;
    }
    const bombs = game.objects.filter((obj) => obj.type == "bomb");
    //check bomb player collision
    for (const bomb of bombs) {
      const isColiding =
        player.x < bomb.x + bomb.width &&
        player.x + player.width > bomb.x &&
        player.y < bomb.y + bomb.height &&
        player.y + player.height > bomb.y;
      if (!isColiding && bomb.onColision) {
        bomb.onColision = false;
      }
    }
    for (const other of others) {
      const isColiding =
        player.x < other.x + other.width &&
        player.x + player.width > other.x &&
        player.y < other.y + other.height &&
        player.y + player.height > other.y;

      if (isColiding) {
        if (other.type == "bomb" && other.onColision) continue;
        player.x -= this.player.player.speed;
        isMoved = false;
        break;
      }
    }
    console.log(player.x, player.y);
    if (isMoved) {
      room.send(GAME_EVENTS.RIGHT, {
        id: this.player.playerId,
        x: player.x,
        y: player.y,
      });
    }
  }

  onPlaceBomb() {
    const room = roomManager.getRoom(this.player.roomId);
    const game = room.game;
    const playerIndex = game.objects.findIndex(
      (obj) => obj.id == this.player.playerId
    );
    if (playerIndex < 0) return;
    const player = game.objects[playerIndex];
    const bomb = gameObject(
      Math.round(player.x / 30) * 30,
      Math.round(player.y / 30) * 30,
      30,
      30,
      "bomb"
    );
    game.objects.push(bomb);
    room.send(GAME_EVENTS.PLACE_BOMB, { bomb });
    bomb.onColision = true;
  }

  onMessage(data) {
    try {
      const room = roomManager.getRoom(this.player.roomId);
      room.send(PLAYER_EVENTS.MESSAGE, {
        name: this.player.playerName,
        message: data.message || "",
      });
    } catch (error) {
      console.error("onMessage Event ", error);
    }
  }
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
    this.playerName = null;
    this.playerId = null;
    this.player = new Player();
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
