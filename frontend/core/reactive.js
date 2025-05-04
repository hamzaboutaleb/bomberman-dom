import { createSignal } from "./signal.js";

export function reactive(obj) {
  const reactiveObj = {};
  for (let [key, value] of Object.entries(obj)) {
    reactiveObj[key] = createSignal(value);
  }
  return reactiveObj;
}
