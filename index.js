function range(n) {
  return new Array(n).fill(0);
}

export function log(...args) {
  const logger = document.getElementById("logger");
  const logItem = document.createElement("p");
  logger.insertBefore(logItem, logger.firstChild);
  logItem.innerText = args.join("+");
}

export function run() {
  const app = Vue.createApp({
    template: `<div>This is the app</div><tic-tac-toe v-on:toggleCell=toggleCell v-bind:state=gameState winner="?"></tic-tac-toe>`,
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
          ["?", "?", "?"],
          ["?", "?", "?"],
          ["?", "?", "?"],
        ],
      };
    },
  });

  const template = range(9)
    .map((_, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      let result = `<ttt-cell v-on:toggled=toggleCell(${row},${col}) v-bind:state=state[${row}][${col}]></ttt-cell>`;
      if (0 === col) result = `<div>${result}`;
      if (2 === col) result = `${result}</div>`;
      return result;
    })
    .join("");

  app.component("tic-tac-toe", {
    template: `<p>{{winner}}</p>
    <div class="tic-tac-toe">${template}</div>`,
    props: ["winner", "state"],
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
