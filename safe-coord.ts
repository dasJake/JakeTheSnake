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
import { findSmallerSnakeheads } from "./smallerHeads.js";

export class SafeCoord {
  move: Move;
  coord: Coord;
  rating: number;
  hasFood: boolean;
  adjacentSafeCoords: number;
  chanceToKill: number;

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
    newRating += this.chanceToKill;
    return newRating;
  }

  determineKillChance(gameState: GameState, currentCoord: Coord): number {
    let killChance = 0;
    const firstGradeNeighbors: Coord[] = getNeighbors(currentCoord);
    /*UNFINISHED: const secondGradeNeighbors: Coord[] = getNeighbors(currentCoord).map(
      (neighbor) => 
      getNeighbors(neighbor)).reduce((accumulator, currentValue) => { 
        if (accumulator.find((current) => 
        coordEq(current, neighbor)){return accumulator}
        return [...currentNeighbor, ...accumulator])), [])));

    //UNFINISHED const secondGradeNeighbors: Coord[] = getNeighbors(currentCoord).map(
      (neighbor) => 
      getNeighbors(neighbor)).reduce((accumulator, currentValue) => { 
        return [...accumulator, ...currentValue];
      }, []).filter((neighbor) =>
        !coordEq(neighbor, currentCoord))

    const secondGradeNeighbors: Coord[] = firstGradeNeighbors.flatMap(
      (neighbor) => getNeighbors(neighbor));

    const secondGradeNeighbors: Coord[] = Array.from(
      new Set(
        getNeighbors(currentCoord)
          .flatMap((neighbor) => getNeighbors(neighbor))
          .filter((neighbor) => !coordEq(neighbor, currentCoord))
      )
    );
*/
    let secondGradeNeighbors = firstGradeNeighbors.
      flatMap((neighbor) => 
      getNeighbors(neighbor));

    writeToLog(debugLogStream, `MOVE ${gameState.turn}: 1stNeighbors: ${JSON.stringify({firstGradeNeighbors}, null, 2)}`);

    let smallerHeads = findSmallerSnakeheads(gameState);
    writeToLog(debugLogStream, `MOVE ${gameState.turn}: smallerHeads: ${JSON.stringify({smallerHeads}, null, 2)}`);

    smallerHeads.forEach((head) => {
      if (firstGradeNeighbors.find((currentNeighbor: Coord) =>
      coordEq(head, currentNeighbor))) {
        killChance += 50;
      }
    });
    writeToLog(debugLogStream, `MOVE ${gameState.turn}: killChance: ${JSON.stringify({killChance}, null, 2)}`);
    /*
    writeToLog(debugLogStream, `MOVE ${gameState.turn}: 2ndNeighbors: ${JSON.stringify({secondGradeNeighbors}, null, 2)}`);

    let uniqueSecondNeighbors = removeDuplicates(secondGradeNeighbors);

    writeToLog(debugLogStream, `MOVE ${gameState.turn}: uniqNeighbors: ${JSON.stringify({uniqueSecondNeighbors}, null, 2)}`);
    */
    return killChance;
  }
}

export type SafeCoords = SafeCoord[];
