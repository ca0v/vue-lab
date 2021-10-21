import { log } from "./fun/log.js";
import { range } from "./fun/range.js";

export function run() {
  const app = Vue.createApp({
    template: `<div>This is the app</div>
    <tic-tac-toe v-on:toggleCell=toggleCell v-bind:state=gameState winner="?">
    </tic-tac-toe>`,
    methods: {
      play(move) {
        let { row, col, piece } = move;
        log(JSON.stringify(move)); // how to call play on the tic-tac-toe component?
        this.gameState[col][row] = piece;
      },
      toggleCell({ row, col }) {
        this.gameState[row][col] = this.gameState[row][col] === "X" ? "O" : "X";
      },
    },
    data() {
      return {
        gameState: [
          ["7", "8", "9"],
          ["4", "5", "6"],
          ["1", "2", "3"],
        ],
      };
    },
  });

  // I am having trouble expressing a N x N grid
  // perhaps I should use a css grid
  const template = range(3)
    .map((_) => range(3))
    .map((row, rowIndex) =>
      row
        .map(
          (col, colIndex) =>
            `<ttt-cell v-on:toggled=toggleCell(${rowIndex},${colIndex}) v-bind:state=state[${rowIndex}][${colIndex}]></ttt-cell>`
        )
        .join("")
    )
    .map((rowTemplate) => `<div>${rowTemplate}</div>`)
    .join("");

  app.component("tic-tac-toe", {
    template: `<p>{{winner}}</p>
    <div class="tic-tac-toe">
    ${template}
    </div>`,
    props: ["winner", "state"],
    emits: ["toggleCell"],
    methods: {
      toggleCell(row, col) {
        this.$emit("toggleCell", { row, col });
        log("toggleCell", JSON.stringify(this.state));
      },
    },
  });

  app.component("ttt-cell", {
    template: `<span class="ttt-cell" @click="toggle()">{{state}}</span>`,
    props: ["state"],
    methods: {
      toggle() {
        log("ttt-cell:toggle");
        this.$emit("toggled");
      },
    },
  });

  return app;
}
