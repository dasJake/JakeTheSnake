import {
  Board,
  Coord,
  coordEq,
  GameState,
  InfoResponse,
  Move,
  MoveResponse,
} from "./types.js";
import { isCoordInBounds } from "./fnIsCoordSafe.js";

export function getNeighbors(currentCoord: Coord, board: Board): Coord[] {
  const neighbors = [
    { ...currentCoord, x: currentCoord.x - 1 },
    { ...currentCoord, x: currentCoord.x + 1 },
    { ...currentCoord, y: currentCoord.y - 1 },
    { ...currentCoord, y: currentCoord.y + 1 },
  ];

  // remove neighbors which are off the game board
  const neighborsInBounds = neighbors.filter((neighbor) => 
    isCoordInBounds(neighbor, board)
  );

  return neighborsInBounds;
}