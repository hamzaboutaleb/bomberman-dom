import { reactive } from "../core/reactive.js";
import { createSignal } from "../core/signal.js";

export const room = reactive({
  type: "",
  time: null,
  players: [],
  messages: [],
});

export const game = reactive({
  objects: [],
  life: 3,
  playerName: "",
  life: 3,

  speed: 1,
  bombs: 1,
  bombRange: 1,
  maxBombs: 1,
});
