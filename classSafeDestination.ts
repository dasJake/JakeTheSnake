import { GameState, Board, Coord, coordEq, Move } from "./types.js";
import {
  removeDuplicates, removeElements,
} from "./fnRemoveFromArray.js";
import { findSnakeheads } from "./fnFindSnakeHeads.js";
import { getNeighbors,
  findNeighbors,
} from "./fnGetNeighbors.js";
import { getMoveToCoordinate } from "./fnGetMoveToCoordinate.js";
import { floodFill } from "./fnFloodFill.js";
import {
  gameLog,
  gameLogStream,
  debugLog,
  debugLogStream,
  writeToLog,
} from "./fnLogging.js";
import { rateCoords } from "./fnRateCoords.js";

export class SafeDestination {
  moveToCoord: Move;
  coord: Coord;
  rating: number;
  hasFood: boolean;
  safeAreaSize: number;
  chanceToKill: number;
  riskToBeKilled: number;
  foodRadar: number;

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
    this.safeAreaSize = floodFill([this.coord], 0, board, gameState).length;
    writeToLog(debugLogStream, `MOVE ${gameState.turn}: area: ${JSON.stringify(this.safeAreaSize, null, 2)}`);
    this.chanceToKill = this.determineKillChance(gameState, this.coord);
    this.riskToBeKilled = this.determineRiskToKilled(gameState, this.coord);
    this.foodRadar = this.determineFoodRadar(gameState, this.coord);
    this.rating = this.setRating(gameState);
    writeToLog(debugLogStream, `MOVE ${gameState.turn}: rating: ${JSON.stringify(this.rating, null, 2)}`);
  }

  checkForFood(gameState: GameState): boolean {
    return Boolean(
      gameState.board.food.find((currentCoord: Coord) => coordEq(this.coord, currentCoord)),
    );
  }

  setRating(gameState: GameState): number {
    let newRating: number = this.safeAreaSize + 1;
    
    writeToLog(debugLogStream, `MOVE ${gameState.turn}: newRatingArea: ${JSON.stringify(newRating, null, 2)}`);

    newRating += this.foodRadar;

    writeToLog(debugLogStream, `MOVE ${gameState.turn}: newRatingFood: ${JSON.stringify(newRating, null, 2)}`);
    /*
    if (this.hasFood) {
      newRating += 25;
    }
    */
    newRating += this.chanceToKill;

    writeToLog(debugLogStream, `MOVE ${gameState.turn}: newRatingKill: ${JSON.stringify(newRating, null, 2)}`);

    newRating -= this.riskToBeKilled;

    writeToLog(debugLogStream, `MOVE ${gameState.turn}: newRatingDeath: ${JSON.stringify(newRating, null, 2)}`);

    return newRating;
  }

  determineFoodRadar(gameState: GameState, currentCoord: Coord): number {
    let foodRadar = 0;
    const radar: Coord[][] = findNeighbors([[currentCoord]], gameState.board, 10, );
    const foodRating = rateCoords (radar, gameState.board.food, 25);
    foodRadar += foodRating;
  return foodRadar;
  }

  determineKillChance(gameState: GameState, currentCoord: Coord): number {
    let killChance = 0;
    const ersteGradeNeighbors: Coord[] = getNeighbors(currentCoord, gameState.board);
    //const firstGradeNeighbors: Coord[][] = findNeighbors([[currentCoord]], gameState.board, 1);

    //writeToLog(debugLogStream, `MOVE ${gameState.turn}: ${JSON.stringify({ersteGradeNeighbors}, null, 2)}`);
    //writeToLog(debugLogStream, `MOVE ${gameState.turn}: ${JSON.stringify({firstGradeNeighbors}, null, 2)}`);
    
    let zweiteGradeNeighbors = ersteGradeNeighbors.
      flatMap((neighbor) => 
      getNeighbors(neighbor, gameState.board));
    //const secondGradeNeighbors: Coord[][] = findNeighbors([[currentCoord]], gameState.board, 2);

    //writeToLog(debugLogStream, `MOVE ${gameState.turn}: ${JSON.stringify({zweiteGradeNeighbors}, null, 2)}`);
    //writeToLog(debugLogStream, `MOVE ${gameState.turn}: ${JSON.stringify({secondGradeNeighbors}, null, 2)}`);
    const radar: Coord[][] = findNeighbors([[currentCoord]], gameState.board, 5, );
    //writeToLog(debugLogStream, `MOVE ${gameState.turn}: ${JSON.stringify({radar}, null, 2)}`);


    let smallerHeads = findSnakeheads(gameState, "smaller");
    const smallHeadsRating = rateCoords (radar, smallerHeads, 30);
    killChance += smallHeadsRating;
    
    /*
    writeToLog(debugLogStream, `MOVE ${gameState.turn}: smallerHeads: ${JSON.stringify({smallerHeads}, null, 2)}`);
    for ( var i = 0; i < radar.length; i++) {
      let rowRating = 0;
      radar[i].forEach((radarCoord) => {
        if (smallerHeads.some((head) =>
          coordEq(head, radarCoord))) {
            rowRating++;
          }
      });
    writeToLog(debugLogStream, `rowRating: ${JSON.stringify({rowRating}, null, 2)}`);


    }
    */
/*
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
    let deadlyHeads = findSnakeheads(gameState, "deadly");
    //writeToLog(debugLogStream, `MOVE ${gameState.turn}: deadlyHeads: ${JSON.stringify({deadlyHeads}, null, 2)}`);

    deadlyHeads.forEach((head) => {
      if (ersteGradeNeighbors.find((currentNeighbor: Coord) =>
      coordEq(head, currentNeighbor))) {
        killChance -= 70;
      }
    });
    deadlyHeads.forEach((head) => {
      if (zweiteGradeNeighbors.find((currentNeighbor: Coord) =>
      coordEq(head, currentNeighbor))) {
        killChance -= 40;
      }
    });
    */
    //writeToLog(debugLogStream, `MOVE ${gameState.turn}: killChance: ${JSON.stringify({killChance}, null, 2)}`);
    //writeToLog(debugLogStream, `MOVE ${gameState.turn}: 2ndNeighbors: ${JSON.stringify({secondGradeNeighbors}, null, 2)}`);

    //let uniqueSecondNeighbors = removeDuplicates(secondGradeNeighbors);
    //writeToLog(debugLogStream, `MOVE ${gameState.turn}: uniqNeighbors: ${JSON.stringify({uniqueSecondNeighbors}, null, 2)}`);
    writeToLog(debugLogStream, `MOVE ${gameState.turn}: killChance: ${JSON.stringify(killChance, null, 2)}`);
    return killChance;
  }

  determineRiskToKilled(gameState: GameState, currentCoord: Coord): number {
    let riskToBeKilled = 0;
    const radar: Coord[][] = findNeighbors([[currentCoord]], gameState.board, 3, );
    const deadlyHeads = findSnakeheads(gameState, "deadly");
    const smallHeadsRating = rateCoords (radar, deadlyHeads, -60);
    riskToBeKilled -= smallHeadsRating;
  return riskToBeKilled;
  }
}

export type SafeDestinations = SafeDestination[];
