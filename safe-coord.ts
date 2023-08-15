import { GameState, Board, Coord, coordEq, Move } from "./types.js";
import { 
  floodFill,
  isCoordInBounds,
  getNeighbors,
  writeToLog,
  debugLogStream 
} from "./index.js";
import {
  removeDuplicates,
} from "./removeDuplicates.js";

export class SafeCoord {
  move: Move;
  coord: Coord;
  rating: number;
  hasFood: boolean;
  adjacentSafeCoords: number;
  chanceToKill: any;

  constructor(
    currentMove: Move,
    board: Board,
    gameState: GameState,
  ) {
    this.move = currentMove;
    this.coord = this.setCoord(this.move, gameState.you.body[0]);
    this.hasFood = this.checkForFood(gameState);
    writeToLog(debugLogStream, `MOVE ${gameState.turn}: head: ${JSON.stringify(gameState.you.head, null, 2)}`);
    writeToLog(debugLogStream, `MOVE ${gameState.turn}: Coord: ${JSON.stringify(this.coord, null, 2)}`);
    this.adjacentSafeCoords = floodFill([this.coord], 0, board, gameState).length;
    this.rating = this.setRating();
    this.chanceToKill = this.determineKillChance(gameState, this.coord);
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

  /*
  checkForHead(snakeHeads: Array<Coord>): boolean {
    return Boolean(
      snakeHeads.find((currentCoord: Coord) =>
        coordEq(this.coord, currentCoord),
      ),
    );
  }
  */

  checkForFood(gameState: GameState): boolean {
    return Boolean(
      gameState.board.food.find((currentCoord: Coord) => coordEq(this.coord, currentCoord)),
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
