// Welcome to
// __________         __    __  .__                               __
// \______   \_____ _/  |__/  |_|  |   ____   ______ ____ _____  |  | __ ____
//  |    |  _/\__  \\   __\   __\  | _/ __ \ /  ___//    \\__  \ |  |/ // __ \
//  |    |   \ / __ \|  |  |  | |  |_\  ___/ \___ \|   |  \/ __ \|    <\  ___/
//  |________/(______/__|  |__| |____/\_____>______>___|__(______/__|__\\_____>
//
// This file can be a nice home for your Battlesnake logic and helper functions.
//
// To get you started we've included code to prevent your Battlesnake from moving backwards.
// For more info see docs.battlesnake.com

import runServer from "./server.js";
import {
  Board,
  Coord,
  coordEq,
  GameState,
  InfoResponse,
  Move,
  MoveResponse,
} from "./types.js";
import { SafeCoord, SafeCoords } from "./classSafeCoord.js";
import { isCoordSafe } from "./fnIsCoordSafe.js";
import { getNeighbors } from "./fnGetNeighbors.js";
import * as fs from "fs";
import * as util from "util";
import { getMoveToCoordinate } from "./fnGetMoveToCoordinate.js";
export const gameLog = "game.log";
export const debugLog = "debug.log";
export let gameLogStream = fs.createWriteStream(gameLog);
export let debugLogStream = fs.createWriteStream(debugLog);

// info is called when you create your Battlesnake on play.battlesnake.com
// and controls your Battlesnake's appearance
// TIP: If you open your Battlesnake URL in a browser you should see this data
function info(): InfoResponse {
  writeToLog(gameLogStream, "INFO");

  return {
    apiversion: "1",
    author: "JakeTheSnake", // TODO: Your Battlesnake Username
    color: "#bd324f", // TODO: Choose color
    head: "tiger-king", // TODO: Choose head
    tail: "tiger-tail", // TODO: Choose tail
  };
}

// start is called when your Battlesnake begins a game
function start(gameState: GameState): void {
  gameLogStream.end();
  fs.truncateSync(gameLog, 0);
  gameLogStream = fs.createWriteStream(gameLog);
  writeToLog(gameLogStream, "GAME START");
}

// end is called when your Battlesnake finishes a game
function end(gameState: GameState): void {
  writeToLog(gameLogStream, "GAME OVER\n");
}

// move is called on every turn and returns your next move
// Valid moves are "up", "down", "left", or "right"
// See https://docs.battlesnake.com/api/example-move for available data

function move(gameState: GameState): MoveResponse {

  // determine which move leads to my neck; this move will only be valid if there are no safe moves possible
  const myHead = gameState.you.body[0];
  const myNeck = gameState.you.body[1];
  let neckMove: Move = "left";

  if (myNeck.x < myHead.x) {
    // Neck is left of head, don't move left
    neckMove = "left";
  } else if (myNeck.x > myHead.x) {
    // Neck is right of head, don't move right
    neckMove = "right";
  } else if (myNeck.y < myHead.y) {
    // Neck is below head, don't move down
    neckMove = "down";
  } else if (myNeck.y > myHead.y) {
    // Neck is above head, don't move up
    neckMove = "up";
  }

  // find safe neighbors to the neck
  const safeNeighbors = getNeighbors(myHead, gameState.board, "safe");
  const movesToNeighbors: Move[] = [];
  for (const currentNeighbor of safeNeighbors) {
    const currentMoveToNeighbor = getMoveToCoordinate(
      myHead,
      currentNeighbor
    );
    movesToNeighbors.push(currentMoveToNeighbor);
  }
  writeToLog(debugLogStream, `MOVE ${gameState.turn}: movesToNeigh: ${JSON.stringify({movesToNeighbors}, null, 2)}`);

  // Are there any safe moves left?
  if (movesToNeighbors.length == 0) {
    writeToLog(gameLogStream, `MOVE ${gameState.turn}: No safe moves detected! Moving backwards`);
    return { move: neckMove };
  }

  // determine safe coordinates
  const safeCoords = determineSafeCoords(
    movesToNeighbors,
    gameState.board,
    gameState,
  );

  // Choose move according to rating
  const highestRatedCoords: SafeCoord[] = safeCoords.filter(coord =>
    coord.rating === Math.max(...safeCoords.map(c => c.rating))
  );
  if (highestRatedCoords.length === 1) {
  const nextMove: Move = highestRatedCoords[0].move;

    writeToLog(gameLogStream, `MOVE ${gameState.turn}: moving ${nextMove} to highest rated Coord`);
  return {move: nextMove};
  }

  // Choose a random move if multiple highest coords rated highest
  const nextMove = highestRatedCoords[Math.floor(Math.random() * movesToNeighbors.length)].move;

  writeToLog(gameLogStream, `MOVE ${gameState.turn}: all moves rated same, moving ${nextMove}`);
  return { move: nextMove };
}

function determineSafeCoords(
  movesToNeighbors: Array<Move>,
  board: Board,
  gameState: GameState
): SafeCoords {
  const safeCoords: SafeCoords = [];
  for (const currentMove of movesToNeighbors) {
    const currentSafeCoord = new SafeCoord(
      currentMove,
      board,
      gameState,
    );
    safeCoords.push(currentSafeCoord);
  }
  return safeCoords;
}

export function floodFill(
  area: Array<Coord>,
  index: number,
  board: Board,
  gameState: GameState,
): Array<Coord> {
  if (index >= area.length) {
    return area;
  }
  const currentCoord: Coord = area[index];
  const currentNeighbors: Array<Coord> = getNeighbors(currentCoord, board);
  const safeNeighborsNotInArea: Array<Coord> = currentNeighbors.filter(
    (coord) =>
      isCoordSafe(coord, board) &&
      !area.find((areaCoord) => coordEq(coord, areaCoord)),
  );

 // writeToLog(debugLogStream, `MOVE ${gameState.turn}| index: ${[index]} -- ${[...area, ...safeNeighborsNotInArea].length}`);
  return floodFill([...area, ...safeNeighborsNotInArea], index + 1, board, gameState);
}

export function writeToLog(logStream: any, message: any): void {
  logStream.write(`${message}\n`);
}

runServer({
  info: info,
  start: start,
  move: move,
  end: end,
});
