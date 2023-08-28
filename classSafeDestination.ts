import { Config, GameState, Board, Coord, coordEq, Move } from "./types.js";
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
import { getTurnConfig } from "./config.js";

export class SafeDestination {
  moveToCoord: Move;
  coord: Coord;
  rating: number;
  hasFood: boolean;
  safeAreaSize: number;
  chanceToKill: number;
  riskToBeKilled: number;
  foodRadar: number;
  config: Config;
  radar: Coord[][];

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
    this.config = getTurnConfig(gameState);
    this.radar = findNeighbors([[this.coord]], gameState.board, this.config.radarDepth, "ignoreHeads" );
    writeToLog(debugLogStream, `MOVE ${gameState.turn}: radarDepth: ${JSON.stringify(this.radar.length, null, 2)}`);
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
    newRating += this.chanceToKill;

    writeToLog(debugLogStream, `MOVE ${gameState.turn}: newRatingKill: ${JSON.stringify(newRating, null, 2)}`);

    newRating -= this.riskToBeKilled;

    writeToLog(debugLogStream, `MOVE ${gameState.turn}: newRatingDeath: ${JSON.stringify(newRating, null, 2)}`);

    return newRating;
  }

  determineFoodRadar(gameState: GameState, currentCoord: Coord): number {
    writeToLog(debugLogStream, `Food==========`);
    let foodRadar = 0;
    /*
    if (this.hasFood) {
      foodRadar += this.config.foodScore;
    }
    */
    //const radar: Coord[][] = findNeighbors([[currentCoord]], gameState.board, this.config.foodRadarDepth );
    const foodRating = rateCoords (this.radar, gameState.board.food, this.config.foodScore, 0, this.config.foodRadarDepth);
    foodRadar += foodRating;
    writeToLog(debugLogStream, `MOVE ${gameState.turn}: FoodRadar: ${JSON.stringify(foodRadar, null, 2)}`);
  return foodRadar;
  }

  determineKillChance(gameState: GameState, currentCoord: Coord): number {
    writeToLog(debugLogStream, `Kill==========`);
    let killChance = 0;
    //const radar: Coord[][] = findNeighbors([[currentCoord]], gameState.board, this.config.killRadarDepth );
    let smallerHeads = findSnakeheads(gameState, "smaller");
    const smallHeadsRating = rateCoords (this.radar, smallerHeads, this.config.killScore, 1 , this.config.killRadarDepth);
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
    writeToLog(debugLogStream, `DeathRisk====`);
    let riskToBeKilled = 0;
    //const radar: Coord[][] = findNeighbors([[currentCoord]], gameState.board, this.config.deathRadarDepth, );
    const deadlyHeads = findSnakeheads(gameState, "deadly");
    const smallHeadsRating = rateCoords (this.radar, deadlyHeads, this.config.deathScore, 1, this.config.deathRadarDepth);
    riskToBeKilled -= smallHeadsRating;
    writeToLog(debugLogStream, `MOVE ${gameState.turn}: DeathRisk: ${JSON.stringify(riskToBeKilled, null, 2)}`);
  return riskToBeKilled;
  }
}

export type SafeDestinations = SafeDestination[];
