import { GameState, Board, Coord, coordEq, Move } from "./types.js";
import {
  removeDuplicates,
} from "./fnRemoveDuplicates.js";
import { findSnakeheads } from "./fnFindSnakeHeads.js";
import { getNeighbors } from "./fnGetNeighbors.js";
import { getMoveToCoordinate } from "./fnGetMoveToCoordinate.js";
import { floodFill } from "./fnFloodFill.js";
import {
  gameLog,
  gameLogStream,
  debugLog,
  debugLogStream,
  writeToLog,
} from "./fnLogging.js";

export class SafeCoord {
  moveToCoord: Move;
  coord: Coord;
  rating: number;
  hasFood: boolean;
  adjacentSafeCoords: number;
  chanceToKill: number;
  riskToBeKilled: number;

  constructor(
    currentNeighbor: Coord,
    board: Board,
    gameState: GameState,
  ) {
    this.coord = currentNeighbor;
    this.moveToCoord = getMoveToCoordinate(gameState.you.head, this.coord);
    this.hasFood = this.checkForFood(gameState);
    writeToLog(debugLogStream, `MOVE ${gameState.turn}: head: ${JSON.stringify(gameState.you.head, null, 2)}`);
    writeToLog(debugLogStream, `MOVE ${gameState.turn}: Coord: ${JSON.stringify(this.coord, null, 2)}`);
    this.adjacentSafeCoords = floodFill([this.coord], 0, board, gameState).length;
    writeToLog(debugLogStream, `MOVE ${gameState.turn}: area: ${JSON.stringify(this.adjacentSafeCoords, null, 2)}`);
    this.chanceToKill = this.determineKillChance(gameState, this.coord);
    this.riskToBeKilled = this.determineRiskToKilled();
    this.rating = this.setRating(gameState);
    writeToLog(debugLogStream, `MOVE ${gameState.turn}: rating: ${JSON.stringify(this.rating, null, 2)}`);
  }

  checkForFood(gameState: GameState): boolean {
    return Boolean(
      gameState.board.food.find((currentCoord: Coord) => coordEq(this.coord, currentCoord)),
    );
  }

  setRating(gameState: GameState): number {
    let newRating: number = this.adjacentSafeCoords + 1;
    
    writeToLog(debugLogStream, `MOVE ${gameState.turn}: newRating1: ${JSON.stringify(newRating, null, 2)}`);

    if (this.hasFood) {
      newRating += 25;
    }
    newRating += this.chanceToKill;

    writeToLog(debugLogStream, `MOVE ${gameState.turn}: newRating2: ${JSON.stringify(newRating, null, 2)}`);

    return newRating;
  }

  determineKillChance(gameState: GameState, currentCoord: Coord): number {
    let killChance = 0;
    const firstGradeNeighbors: Coord[] = getNeighbors(currentCoord, gameState.board);

    let secondGradeNeighbors = firstGradeNeighbors.
      flatMap((neighbor) => 
      getNeighbors(neighbor, gameState.board));

   // writeToLog(debugLogStream, `MOVE ${gameState.turn}: 1stNeighbors: ${JSON.stringify({firstGradeNeighbors}, null, 2)}`);

    let smallerHeads = findSnakeheads(gameState, "smaller");
    //writeToLog(debugLogStream, `MOVE ${gameState.turn}: smallerHeads: ${JSON.stringify({smallerHeads}, null, 2)}`);

    smallerHeads.forEach((head) => {
      if (firstGradeNeighbors.find((currentNeighbor: Coord) =>
      coordEq(head, currentNeighbor))) {
        killChance += 50;
      }
    });
    smallerHeads.forEach((head) => {
      if (secondGradeNeighbors.find((currentNeighbor: Coord) =>
      coordEq(head, currentNeighbor))) {
        killChance += 25;
      }
    });
    let biggerHeads = findSnakeheads(gameState, "bigger");
    //writeToLog(debugLogStream, `MOVE ${gameState.turn}: smallerHeads: ${JSON.stringify({smallerHeads}, null, 2)}`);

    biggerHeads.forEach((head) => {
      if (firstGradeNeighbors.find((currentNeighbor: Coord) =>
      coordEq(head, currentNeighbor))) {
        killChance -= 70;
      }
    });
    biggerHeads.forEach((head) => {
      if (secondGradeNeighbors.find((currentNeighbor: Coord) =>
      coordEq(head, currentNeighbor))) {
        killChance -= 40;
      }
    });
    //writeToLog(debugLogStream, `MOVE ${gameState.turn}: killChance: ${JSON.stringify({killChance}, null, 2)}`);
    //writeToLog(debugLogStream, `MOVE ${gameState.turn}: 2ndNeighbors: ${JSON.stringify({secondGradeNeighbors}, null, 2)}`);

    let uniqueSecondNeighbors = removeDuplicates(secondGradeNeighbors);

    //writeToLog(debugLogStream, `MOVE ${gameState.turn}: uniqNeighbors: ${JSON.stringify({uniqueSecondNeighbors}, null, 2)}`);
    return killChance;
  }

 determineRiskToKilled(): number {
  return 0;
  }
}

export type SafeCoords = SafeCoord[];
