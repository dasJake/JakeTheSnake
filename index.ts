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
import { SafeCoord, SafeCoords } from "./safe-coord.js";
import * as fs from "fs";
import * as util from "util";
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
  let isMoveSafe: { [key in Move]: boolean } = {
    up: true,
    down: true,
    left: true,
    right: true,
  };

  // We've included code to prevent your Battlesnake from moving backwards
  const myHead = gameState.you.body[0];
  const myNeck = gameState.you.body[1];
  let neckMove: Move = "left";

  if (myNeck.x < myHead.x) {
    // Neck is left of head, don't move left
   // isMoveSafe.left = false;
    neckMove = "left";
  } else if (myNeck.x > myHead.x) {
    // Neck is right of head, don't move right
    //isMoveSafe.right = false;
    neckMove = "right";
  } else if (myNeck.y < myHead.y) {
    // Neck is below head, don't move down
    //isMoveSafe.down = false;
    neckMove = "down";
  } else if (myNeck.y > myHead.y) {
    // Neck is above head, don't move up
    //isMoveSafe.up = false;
    neckMove = "up";
  }

  // TODO: Step 1 - Prevent your Battlesnake from moving out of bounds
  const boardWidth = gameState.board.width;
  const boardHeight = gameState.board.height;

  if (myHead.x == 0) {
    isMoveSafe.left = false;
  }
  if (myHead.y == 0) {
    isMoveSafe.down = false;
  }
  if (myHead.x == boardWidth - 1) {
    isMoveSafe.right = false;
  }
  if (myHead.y == boardHeight - 1) {
    isMoveSafe.up = false;
  }

  // TODO: Step 2 - Prevent your Battlesnake from colliding with itself and other snakes

  // slice last element/tail because it will be possible to move where the tail is now
  const myBody = gameState.you.body.slice(0, -1);

  gameState.board.snakes.forEach((snake) =>
    snake.body.slice(0, -1).forEach((cell) => myBody.push(cell)),
  );

  // illegal up
  if (myBody.find((cell) => cell.x == myHead.x && cell.y == myHead.y + 1)) {
    isMoveSafe.up = false;
  }

  // illegal down
  if (myBody.find((cell) => cell.x == myHead.x && cell.y == myHead.y - 1)) {
    isMoveSafe.down = false;
  }

  // illegal left
  if (myBody.find((cell) => cell.x == myHead.x - 1 && cell.y == myHead.y)) {
    isMoveSafe.left = false;
  }

  // illegal right
  if (myBody.find((cell) => cell.x == myHead.x + 1 && cell.y == myHead.y)) {
    isMoveSafe.right = false;
  }
  // TODO: Step 3 - Prevent your Battlesnake from colliding with other Battlesnakes
  // opponents = gameState.board.snakes;

  // Are there any safe moves left?
  const safeMoves = Object.keys(isMoveSafe).filter(
    (key) => isMoveSafe[key as Move],
  ) as Move[];
  if (safeMoves.length == 0) {
    writeToLog(gameLogStream, `MOVE ${gameState.turn}: No safe moves detected! Moving backwards`);
    //writeToLog(gameLogStream, `MOVE ${gameState.turn}: No safe moves detected! Moving ${neckMove}`);
    return { move: neckMove };
  }

  // determine safe coordinates
  const safeCoords = determineSafeCoords(
    safeMoves,
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
  const nextMove = highestRatedCoords[Math.floor(Math.random() * safeMoves.length)].move;

  writeToLog(gameLogStream, `MOVE ${gameState.turn}: all moves rated same, moving ${nextMove}`);
  return { move: nextMove };
}

function determineSafeCoords(
  safeMoves: Array<Move>,
  board: Board,
  gameState: GameState
): SafeCoords {
  const safeCoords: SafeCoords = [];
  for (const currentMove of safeMoves) {
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
  const currentNeighbors: Array<Coord> = getNeighbors(currentCoord);
  const safeNeighborsNotInArea: Array<Coord> = currentNeighbors.filter(
    (coord) =>
      isCoordSafe(coord, board) &&
      !area.find((areaCoord) => coordEq(coord, areaCoord)),
  );

 // writeToLog(debugLogStream, `MOVE ${gameState.turn}| index: ${[index]} -- ${[...area, ...safeNeighborsNotInArea].length}`);
  return floodFill([...area, ...safeNeighborsNotInArea], index + 1, board, gameState);
}

function isCoordSafe(coord: Coord, board: Board): boolean {
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
  if (board.hazards.find((hazardCoord) => coordEq(coord, hazardCoord))) {
    return false;
  }
  if (
    board.snakes.some((snake) =>
      snake.body.slice(0, -1).find((snakeCoord) => coordEq(coord, snakeCoord)),
    )
  ) {
    return false;
  }
  return true;
}

export function getNeighbors(currentCoord: Coord): Coord[] {
  return [
    { ...currentCoord, x: currentCoord.x - 1 },
    { ...currentCoord, x: currentCoord.x + 1 },
    { ...currentCoord, y: currentCoord.y - 1 },
    { ...currentCoord, y: currentCoord.y + 1 },
  ];
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
