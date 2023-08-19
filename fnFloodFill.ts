import { Board, GameState, Coord, coordEq } from "./types.js";
import { getNeighbors } from "./fnGetNeighbors.js";

export function floodFill(
  area: Array<Coord>,
  index: number,
  board: Board,
  gameState: GameState,
): Array<Coord> {
  if (index >= area.length) {
    return area;
  }
  const currentCoord: Coord = area[index];
  const currentSafeNeighbors: Array<Coord> = getNeighbors(currentCoord, board, "safe");
  const safeNeighborsNotInArea: Array<Coord> = currentSafeNeighbors.filter(
    (coord) =>
      !area.find((areaCoord) => coordEq(coord, areaCoord)),
  );

 // writeToLog(debugLogStream, `MOVE ${gameState.turn}| index: ${[index]} -- ${[...area, ...safeNeighborsNotInArea].length}`);
  return floodFill([...area, ...safeNeighborsNotInArea], index + 1, board, gameState);
}