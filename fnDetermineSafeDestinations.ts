import { Coord, Board, GameState } from "./types";
import { SafeDestination, SafeDestinations } from "./classSafeDestination.js";

export function determineSafeDestinations(
  safeNeighbors: Array<Coord>,
  board: Board,
  gameState: GameState
): SafeDestinations {
  const safeDestinations: SafeDestinations = [];
  for (const currentNeighbor of safeNeighbors) {
    const currentSafeDestination = new SafeDestination(
      currentNeighbor,
      board,
      gameState,
    );
    safeDestinations.push(currentSafeDestination);
  }
  return safeDestinations;
}