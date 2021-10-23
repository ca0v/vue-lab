import { range } from "./range.js";

export function createGameBoard(size = 3) {
  const cells = range(size).map((_, colIndex) =>
    range(size).map((_, rowIndex) => ({
      name: `${1 + colIndex * size + rowIndex}`,
      colIndex,
      rowIndex,
      value: " ",
      focus: false,
    }))
  );
  return cells;
}
