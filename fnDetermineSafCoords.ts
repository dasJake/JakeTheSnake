import { Coord, Board, GameState } from "./types";
import { SafeCoord, SafeCoords } from "./classSafeCoord.js";

export function determineSafeCoords(
  safeNeighbors: Array<Coord>,
  board: Board,
  gameState: GameState
): SafeCoords {
  const safeCoords: SafeCoords = [];
  for (const currentNeighbor of safeNeighbors) {
    const currentSafeCoord = new SafeCoord(
      currentNeighbor,
      board,
      gameState,
    );
    safeCoords.push(currentSafeCoord);
  }
  return safeCoords;
}