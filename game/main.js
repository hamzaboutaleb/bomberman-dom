import Game from "../core/game.js";
import { EntryScene } from "./scene/entry.js";

const config = {
  width: 800,
  height: 600,
  container: document.getElementById("game-container"),
  initiScene: EntryScene,
};

const game = new Game(config);

game.init();
