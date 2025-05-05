import { GAME_EVENTS, PLAYER_EVENTS, WS_EVENETS } from "./constante.js";
import { gameObject } from "./game.js";
import { Player } from "./player.js";
import { eventEmitter, roomManager } from "./server.js";
import { isAlphanumeric, isCollision, randomPowerUp } from "./utils.js";
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
    this.player.sendPlayerState();
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
      if (
        bomb.ownerId == this.player.playerId &&
        !isColiding &&
        bomb.onColision
      ) {
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
        console.log(
          "condition",
          `-- ${JSON.stringify(player, 2, null)}--`,
          other.type == "bomb" && other.onColision && other.ownerId == player.id
        );
        if (
          other.type == "bomb" &&
          other.onColision &&
          other.ownerId == player.id
        )
          continue;
        if (this.collideWithPowerUp(other, room)) {
          continue;
        }
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
      if (bomb.ownerId == this.player.id && !isColiding && bomb.onColision) {
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
        if (
          other.type == "bomb" &&
          other.onColision &&
          other.ownerId == player.id
        )
          continue;
        if (this.collideWithPowerUp(other, room)) {
          continue;
        }
        player.y += this.player.player.speed;
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
      if (
        bomb.ownerId == this.player.playerId &&
        !isColiding &&
        bomb.onColision
      ) {
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
        if (
          other.type == "bomb" &&
          other.onColision &&
          other.ownerId == player.id
        )
          continue;
        if (this.collideWithPowerUp(other, room)) {
          continue;
        }
        player.x += this.player.player.speed;
        isMoved = false;
        break;
      }
    }
    if (isMoved) {
      room.send(GAME_EVENTS.LEFT, {
        id: this.player.playerId,
        x: player.x,
        y: player.y,
      });
    }
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
      if (
        bomb.ownerId == this.player.playerId &&
        !isColiding &&
        bomb.onColision
      ) {
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
        if (
          other.type == "bomb" &&
          other.onColision &&
          other.ownerId == player.id
        )
          continue;
        if (this.collideWithPowerUp(other, room)) {
          continue;
        }
        player.x -= this.player.player.speed;
        isMoved = false;
        break;
      }
    }
    if (isMoved) {
      room.send(GAME_EVENTS.RIGHT, {
        id: this.player.playerId,
        x: player.x,
        y: player.y,
      });
    }
  }

  collideWithPowerUp(other, room) {
    if (other.type == "speed") {
      this.player.player.powerups.speed += other.value;
      room.send(GAME_EVENTS.DELETE_OBJECT, {
        ids: [other.id],
      });
      this.player.sendPlayerState();
      room.game.deleteObject(other.id);
      return true;
    } else if (other.type == "bombs") {
      this.player.player.powerups.bombs += other.value;
      room.send(GAME_EVENTS.DELETE_OBJECT, {
        ids: [other.id],
      });
      this.player.sendPlayerState();
      room.game.deleteObject(other.id);
      return true;
    } else if (other.type == "life") {
      this.player.player.life += other.value;
      room.send(GAME_EVENTS.DELETE_OBJECT, {
        ids: [other.id],
      });
      room.game.deleteObject(other.id);
      this.player.sendPlayerState();
      return true;
    } else if (other.type == "bombRange") {
      this.player.player.powerups.flames += other.value;
      room.send(GAME_EVENTS.DELETE_OBJECT, {
        ids: [other.id],
      });
      room.game.deleteObject(other.id);
      this.player.sendPlayerState();
      return true;
    }

    return false;
  }

  onPlaceBomb() {
    if (!this.player.player.canPutBomb()) {
      console.log("you can't put bomb");
      return;
    }
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
    bomb.onColision = true;
    bomb.ownerId = this.player.playerId;
    bomb.range = this.player.player.getBombRange();
    game.objects.push(bomb);
    this.player.player.currentBombs++;
    room.send(GAME_EVENTS.PLACE_BOMB, { bomb });

    setTimeout(() => {
      const directions = [
        { dx: 0, dy: -1 }, // up
        { dx: 0, dy: 1 }, // down
        { dx: -1, dy: 0 }, // left
        { dx: 1, dy: 0 }, // right
      ];
      const affectedPositions = [
        { x: bomb.x, y: bomb.y, width: 30, height: 30 },
      ];
      for (const { dx, dy } of directions) {
        for (let i = 1; i <= bomb.range; i++) {
          const x = bomb.x + dx * i * 30;
          const y = bomb.y + dy * i * 30;
          if (x < 0 || x >= 600 || y < 0 || y >= 600) {
            break;
          }
          const wall = game.objects.find((w) => w.x == x && w.y == y);
          if (wall && wall.type == "wall") {
            break;
          }
          affectedPositions.push({ x, y, width: 30, height: 30 });
          if (wall && wall.type == "block") break;
        }
      }
      const objects = game.objects.filter((obj) => obj.type != "bomb");
      for (const pos of affectedPositions) {
        for (const obj of objects) {
          if (isCollision(obj, pos)) {
            if (obj.type == "player") {
              const player = room.getPlayerById(obj.id);
              player.player.life--;
              if (player.player.life <= 0) {
                room.send(GAME_EVENTS.PLAYER_DIE, {
                  id: obj.id,
                  life: player.player.life,
                });
                player.sendPlayerState();
                room.game.deleteObject(obj.id);
              } else {
                player.send(GAME_EVENTS.PLAYER_HIT, {
                  life: player.player.life,
                });
              }
            } else if (obj.type == "block") {
              game.objects = game.objects.filter((o) => o.id != obj.id);
              room.send(GAME_EVENTS.DELETE_OBJECT, { ids: [obj.id] });
              if (Math.random() < 0.5) {
                const powerUp = randomPowerUp(obj.x, obj.y, 30, 30);
                room.send(GAME_EVENTS.ADD_OBJECT, { objects: [powerUp] });
                room.game.objects.push(powerUp);
              }
            }
          }
        }
      }

      this.player.player.currentBombs--;
      room.send(GAME_EVENTS.DELETE_OBJECT, { ids: [bomb.id] });
      room.game.deleteObject(bomb.id);
      room.send(GAME_EVENTS.EXPLODE, {
        positions: affectedPositions.map((pos) => ({
          id: randomUUID(),
          type: "explosion",
          x: pos.x,
          y: pos.y,
          width: pos.width,
          height: pos.height,
        })),
      });
      // game.objects.splice(bombIndex, 1);
    }, 2500);
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

  sendPlayerState() {
    this.send(GAME_EVENTS.PLAYER_STATE, {
      playerName: this.playerName,
      life: this.player.life,
      speed: this.player.speed,
      bombs: this.player.powerups.bombs,
      bombRange: this.player.powerups.flames,
    });
  }
}
