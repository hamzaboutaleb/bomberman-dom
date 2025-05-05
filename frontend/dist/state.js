import { reactive } from "../core/reactive.js";
export const room = reactive({
  type: "",
  time: null,
  players: [],
  messages: []
});
export const game = reactive({
  objects: [],
  players: []
});