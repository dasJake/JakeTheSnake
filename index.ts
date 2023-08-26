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
import { SafeDestination, SafeDestinations } from "./classSafeDestination.js";
import { getNeighbors } from "./fnGetNeighbors.js";
import * as fs from "fs";
import { determineSafeDestinations } from "./fnDetermineSafeDestinations.js";
import {
  gameLog,
  gameLogStream,
  debugLog,
  debugLogStream,
  writeToLog,
  resetGameLogStream,
} from "./fnLogging.js";

// info is called when you create your Battlesnake on play.battlesnake.com
// and controls your Battlesnake's appearance
// TIP: If you open your Battlesnake URL in a browser you should see this data
function info(): InfoResponse {
  gameLogStream.end(); //causes for a new log file to be written
  fs.truncateSync(gameLog, 0); //keeps file open
  resetGameLogStream(); //reopen after .end()
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

  // find safe neighbors to the head
  const safeNeighbors = getNeighbors(myHead, gameState.board, "safe");
  
  // if no safe neighbors found bite your own neck
  if (safeNeighbors.length === 0) {
    writeToLog(gameLogStream, `MOVE ${gameState.turn}: No safe moves detected! Moving backwards`);
    return { move: neckMove };
  }

  // determine safe coordinates
  const safeDestinations = determineSafeDestinations(
    safeNeighbors,
    gameState.board,
    gameState,
  );

  // Choose move according to rating
  const highestRatedCoords: SafeDestination[] = safeDestinations.filter(coord =>
    coord.rating === Math.max(...safeDestinations.map(c => c.rating))
  );
  const nextMove = highestRatedCoords[Math.floor(Math.random() * highestRatedCoords.length)].moveToCoord;
  writeToLog(debugLogStream, `MOVE ${gameState.turn}: highestRatedCoords: ${JSON.stringify({highestRatedCoords}, null, 2)}`);
  if (highestRatedCoords.length === 1) {
    writeToLog(gameLogStream, `MOVE ${gameState.turn}: moving ${nextMove} to highest rated Coord`);
  return { move: nextMove };
  }
  writeToLog(gameLogStream, `MOVE ${gameState.turn}: multiple moves rated same, randomly moving ${nextMove}`);
  return { move: nextMove };
}

runServer({
  info: info,
  start: start,
  move: move,
  end: end,
});
