/**
 * this is an older pattern
 * the composition pattern, which uses startup(), might simplify
 * and promote de-composition.
 */
import { createGameBoard } from "./fun/createGameBoard.js";
import { log } from "./fun/log.js";
import { range } from "./fun/range.js";

// I am having trouble expressing a N x N grid
// perhaps I should use a css grid
// can I remove the 'ref' and set focus=true instead?
// the ttt-cell must watch and focus itself
function createTemplate(size = 3) {
  return range(size)
    .map((_) => range(size))
    .map((col, x) =>
      col
        .map(
          (_, y) =>
            `<ttt-cell v-on:toggled=playCell v-on:focused=focused v-bind:state=state[${x}][${y}]></ttt-cell>`
        )
        .join("")
    )
    .map((rowTemplate) => `<div>${rowTemplate}</div>`)
    .join("");
}

function clearCell(cell) {
  cell.value = " ";
}

function findActiveCell(state) {
  const activeColumn = state.find((column) => column.find((row) => row.focus));
  return activeColumn?.find((row) => row.focus);
}

export function run({ gridSize }) {
  const players = [{ piece: "X" }, { piece: "O" }];
  let currentPlayerIndex = -1;

  function currentPlayer() {
    return players[currentPlayerIndex];
  }

  function nextPlayer() {
    currentPlayerIndex = (1 + currentPlayerIndex) % players.length;
    return currentPlayer();
  }

  const app = Vue.createApp({
    template: `<div>This is the app</div>
    <tic-tac-toe v-on:playCell=playCell v-bind:state=gameState winner="?">
    </tic-tac-toe>`,
    methods: {
      play({ row, col, piece }) {
        this.gameState[col][row].value = piece;
      },
      playCell(cell) {
        cell.state.value = nextPlayer().piece;
      },
    },
    data() {
      return {
        gameState: createGameBoard(gridSize),
      };
    },
  });

  app.component("tic-tac-toe", {
    template: `<p>{{winner}}</p>
    <div class="tic-tac-toe" @keypress="keypress">
    ${createTemplate(gridSize)}
    </div>`,
    props: ["winner", "state"],
    emits: ["playCell"],
    methods: {
      playCell(cell) {
        this.$emit("playCell", cell);
      },
      focusCell(colIndex, rowIndex) {
        this.state.forEach((col) => col.forEach((row) => (row.focus = false)));
        this.state[colIndex][rowIndex].focus = true;
      },
      focused(cell) {
        this.state.forEach((col) => col.forEach((row) => (row.focus = false)));
        cell.state.focus = true;
      },
      playActiveCell() {
        findActiveCell(this.state).value = nextPlayer().piece;
      },
      keypress(event) {
        switch (event.code) {
          case "Space":
          case "NumpadEnter":
          case "Enter":
            this.playActiveCell();
            break;
          case "Digit1":
          case "Digit2":
          case "Digit3":
          case "Digit4":
          case "Digit5":
          case "Digit6":
          case "Digit7":
          case "Digit8":
          case "Digit9":
          case "Numpad1":
          case "Numpad2":
          case "Numpad3":
          case "Numpad4":
          case "Numpad5":
          case "Numpad6":
          case "Numpad7":
          case "Numpad8":
          case "Numpad9":
            {
              const cell = event.keyCode - 49;
              const x = cell % gridSize;
              const y = Math.floor(cell / gridSize);
              this.focusCell(y, x);
            }
            break;
          case "KeyA":
          case "KeyD":
          case "KeyW":
          case "KeyS":
            {
              const activeCell = findActiveCell(this.state);
              if (activeCell) {
                let { colIndex, rowIndex } = activeCell;
                switch (event.code) {
                  case "KeyA":
                    log("move left");
                    rowIndex = (rowIndex + gridSize - 1) % gridSize;
                    break;
                  case "KeyD":
                    log("move right");
                    rowIndex = (rowIndex + gridSize + 1) % gridSize;
                    break;
                  case "KeyW":
                    log("move up");
                    colIndex = (colIndex + gridSize - 1) % gridSize;
                    break;
                  case "KeyS":
                    log("move down");
                    colIndex = (colIndex + gridSize + 1) % gridSize;
                    break;
                }
                this.focusCell(colIndex, rowIndex);
              }
            }
            break;
          default:
            log("grid", event.code);
            break;
        }
      },
    },
  });

  app.component("ttt-cell", {
    template: `<span tabIndex="0" class="ttt-cell" @focus="focus" @click="toggle">{{state.value}}{{state.focus ? "*" : ''}}</span>`,
    props: ["state"],
    methods: {
      toggle() {
        this.$emit("toggled", this);
      },
      focus() {
        this.state.focus = true;
        this.$emit("focused", this);
      },
    },
  });

  return app;
}
