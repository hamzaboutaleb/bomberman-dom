import { Room } from "./room.js";
import { randomUUID } from "crypto";

export function isAlphanumeric(str) {
  return /^[a-zA-Z0-9]+$/.test(str);
}

export function generateBomberManMap(rows = 10, cols = 10) {
  const map = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (i % 2 === 1 && j % 2 === 1) {
        map[i][j] = 1;
      }
    }
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (map[i][j] !== 0) continue;

      const isCorner =
        (i <= 1 && j <= 1) ||
        (i <= 1 && j >= cols - 2) ||
        (i >= rows - 2 && j <= 1) ||
        (i >= rows - 2 && j >= cols - 2);

      if (!isCorner && Math.random() > 0.3) {
        map[i][j] = 2;
      } else {
        map[i][j] = 0;
      }
    }
  }

  map[0][0] = 3;
  map[0][1] = 0;
  map[1][0] = 0;

  map[0][cols - 1] = 3;
  map[0][cols - 2] = 0;
  map[1][cols - 1] = 0;

  map[rows - 1][0] = 3;
  map[rows - 1][1] = 0;
  map[rows - 2][0] = 0;

  map[rows - 1][cols - 1] = 3;
  map[rows - 1][cols - 2] = 0;
  map[rows - 2][cols - 1] = 0;

  return map;
}

export function isCollision(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

export function randomPowerUp(x, y, width, height) {
  const id = randomUUID();
  const powerUps = [
    { id, type: "bombs", value: 1, x, y, width, height },
    { id, type: "speed", value: 0.2, x, y, width, height },
    { id, type: "bombRange", value: 1, x, y, width, height },
    { id, type: "life", value: 1, x, y, width, height },
  ];
  return powerUps[Math.floor(Math.random() * powerUps.length)];
}
