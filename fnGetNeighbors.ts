import {
  Board,
  Coord,
  SafeMarker,
  coordEq,
  GameState,
  InfoResponse,
  Move,
  MoveResponse,
} from "./types.js";
import { isCoordInBounds, isCoordSafe } from "./fnIsCoordSafe.js";

export function getNeighbors(currentCoord: Coord, board: Board, safe?: SafeMarker): Coord[] {
  const neighbors = [
    { ...currentCoord, x: currentCoord.x - 1 },
    { ...currentCoord, x: currentCoord.x + 1 },
    { ...currentCoord, y: currentCoord.y - 1 },
    { ...currentCoord, y: currentCoord.y + 1 },
  ];

  // return only SAFE neighbors
  if (safe === "safe") {
    const safeNeigbors = neighbors.filter((neighbor) =>
      isCoordSafe(neighbor, board)
    );

    return safeNeigbors;
  }

  // return ALL neighbors which are within bounds of the game board
  const neighborsInBounds = neighbors.filter((neighbor) => 
    isCoordInBounds(neighbor, board)
  );

  return neighborsInBounds;
}


export function findNeighbors (
  origin: Array<Coord>,
  board: Board,
  recursionDepth: number,
  safe?: SafeMarker,
  ): Array<Coord> {
    if (recursionDepth < 1) {
      return origin; 
    }
    origin = origin.flatMap((neighbor) => [
      { ...neighbor, x: neighbor.x - 1 },
      { ...neighbor, x: neighbor.x + 1 },
      { ...neighbor, y: neighbor.y - 1 },
      { ...neighbor, y: neighbor.y + 1 },
  ]);
    return findNeighbors(origin, board, recursionDepth - 1, safe);
  }
