import { randomUUID } from "crypto";
import { generateBomberManMap } from "./utils.js";

export function gameObject(x, y, width, height, type) {
  return {
    id: randomUUID(),
    type,
    x,
    y,
    width,
    height,
  };
}

export class Game {
  constructor(room) {
    this.objects = [];
    this.room = room;
  }

  initGame(players) {
    const map = generateBomberManMap(20, 20);
    let playerIdx = 0;
    for (let r = 0; r < map.length; r++) {
      for (let c = 0; c < map[0].length; c++) {
        const cell = map[r][c];
        if (cell == 0) continue;
        let obj;

        if (cell == 1) {
          obj = gameObject(r * 30, c * 30, 30, 30, "wall");
        } else if (cell == 2) {
          obj = gameObject(r * 30, c * 30, 30, 30, "block");
        } else if (cell == 3) {
          if (playerIdx >= players.length) continue;
          obj = gameObject(r * 30, c * 30, 30, 30, "player");
          console.log(players[playerIdx], playerIdx);
          players[playerIdx++].playerId = obj.id;
        }
        this.objects.push(obj);
      }
    }
  }

  update() {}
}
