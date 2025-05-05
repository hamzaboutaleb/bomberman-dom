import { h } from "../../core/view.js";
export function Cell({
  cell
}) {
  console.log(cell);
  return h("div", {
    class: `map-cell ${cell.type}`,
    style: {
      transform: `translate(${cell.x}px,${cell.y}px)`
    }
  });
}