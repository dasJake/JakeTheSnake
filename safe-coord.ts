import { GameState, Board, Coord, coordEq, Move } from "./types.js";
import { floodFill } from "./index.js";

export class SafeCoord {
  move: Move;
  coord: Coord;
  rating: number;
  isSomeonesHead: boolean; //useless because head will be somewhere else in the next move; instead anticipate if a head could land on this coord in the next move.
  hasFood: boolean;
  adjacentSafeCoords: number;

  constructor(
    currentMove: Move,
    myHead: Coord,
    snakeHeads: Array<Coord>,
    foods: Array<Coord>,
    board: Board,
    gameState: GameState,
  ) {
    this.move = currentMove;
    this.coord = this.setCoord(this.move, myHead);
    this.isSomeonesHead = this.checkForHead(snakeHeads);
    this.hasFood = this.checkForFood(foods);
    this.adjacentSafeCoords = floodFill([this.coord], 0, board, gameState).length;
    this.rating = this.setRating();
  }

  setCoord(move: Move, myHead: Coord): Coord {
    const coord = { ...myHead }; // Create a new object with the same properties as myHead
    switch (move) {
      case "up":
        coord.y++;
        break;
      case "down":
        coord.y--;
        break;
      case "left":
        coord.x--;
        break;
      case "right":
        coord.x++;
        break;
    }
    return coord;
  }

  checkForHead(snakeHeads: Array<Coord>): boolean {
    return Boolean(
      snakeHeads.find((currentCoord: Coord) =>
        coordEq(this.coord, currentCoord),
      ),
    );
  }

  checkForFood(foods: Array<Coord>): boolean {
    return Boolean(
      foods.find((currentCoord: Coord) => coordEq(this.coord, currentCoord)),
    );
  }

  setRating(): number {
    let newRating: number = this.adjacentSafeCoords + 1;
    if (this.hasFood) {
      newRating += 25;
    }
    return newRating;
  }
}

export type SafeCoords = SafeCoord[];
