import {
  Board,
  Coord,
  coordEq,
  GameState,
  InfoResponse,
  Move,
  MoveResponse,
} from "./types.js";

export function isCoordSafe(coord: Coord, board: Board): boolean {
  return isCoordInBounds(coord, board) && isCoordFree(coord, board);
}

export function isCoordInBounds(coord: Coord, board: Board): boolean {
  const boardWidth = board.width;
  const boardHeight = board.height;

  if (coord.x < 0) {
    return false;
  }
  if (coord.x >= board.width) {
    return false;
  }
  if (coord.y < 0) {
    return false;
  }
  if (coord.y >= board.width) {
    return false;
  }
  return true;
}

function isCoordFree(coord: Coord, board: Board): boolean {
  if (
    board.snakes.some((snake) =>
      snake.body.slice(0, -1).find((snakeCoord) => coordEq(coord, snakeCoord)),
    )
  ) {
    return false;
  }
  return true;
}