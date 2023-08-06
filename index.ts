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

// info is called when you create your Battlesnake on play.battlesnake.com
// and controls your Battlesnake's appearance
// TIP: If you open your Battlesnake URL in a browser you should see this data
function info(): InfoResponse {
  debug("INFO");

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
  debug("GAME START");
}

// end is called when your Battlesnake finishes a game
function end(gameState: GameState): void {
  debug("GAME OVER\n");
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

  if (myNeck.x < myHead.x) {
    // Neck is left of head, don't move left
    isMoveSafe.left = false;
  } else if (myNeck.x > myHead.x) {
    // Neck is right of head, don't move right
    isMoveSafe.right = false;
  } else if (myNeck.y < myHead.y) {
    // Neck is below head, don't move down
    isMoveSafe.down = false;
  } else if (myNeck.y > myHead.y) {
    // Neck is above head, don't move up
    isMoveSafe.up = false;
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
  debug({ safeMoves, myHead, myBody });
  if (safeMoves.length == 0) {
    debug(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
    return { move: "down" };
  }

  // determine safe coordinates
  const snakeHeads: Coord[] = gameState.board.snakes.map((snake) => snake.head);

  debug({ snakeHeads });

  const foods: Coord[] = gameState.board.food;

  const safeCoords = determineSafeCoords(
    safeMoves,
    myHead,
    snakeHeads,
    foods,
    gameState.board,
  );

  debug(JSON.stringify({ safeCoords }, null, 2));
  safeCoords.forEach((piece) => {
    debug(piece.coord);
  });

  // Find safeCoord with food
  /*
  const coordWithFood: SafeCoord | undefined = safeCoords.find(
    (c) => c.hasFood,
  );
  if (coordWithFood) {
    debug(`MOVE ${gameState.turn}: ${coordWithFood.move} - FOUND FOOD`);
    return { move: coordWithFood.move }; 
  }
  */
  // Choose move according to rating
  const allAreasEqual = safeCoords.reduce((accumulator, currentValue) => {
    if (currentValue.rating !== accumulator.acc.rating){
      return {...accumulator, result: false}
    }
    return accumulator
  }, {
    result: true,
    acc: safeCoords[0],
  }).result;

  if (!allAreasEqual){
  const nextMove: Move = safeCoords.reduce((accumulator, currentValue) =>
    accumulator.rating > currentValue.rating ? accumulator : currentValue,
  ).move;

    debug(`MOVE ${gameState.turn}: Multiple areas detected, moving to largest`);
  return {move: nextMove};
  }

  // Choose a random move from the safe moves
  const nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];

  debug(`MOVE ${gameState.turn}: ${nextMove}`);
  return { move: nextMove };
}

function determineSafeCoords(
  safeMoves: Array<Move>,
  myHead: Coord,
  snakeHeads: Array<Coord>,
  foods: Array<Coord>,
  board: Board,
): SafeCoords {
  const safeCoords: SafeCoords = [];
  for (const currentMove of safeMoves) {
    const currentSafeCoord = new SafeCoord(
      currentMove,
      myHead,
      snakeHeads,
      foods,
      board,
    );
    safeCoords.push(currentSafeCoord);
  }
  return safeCoords;
}

export function floodFill(
  area: Array<Coord>,
  index: number,
  board: Board,
): Array<Coord> {
  debug({area, index, board});
  
  //debug(JSON.stringify({  }, null, 2));
  
  if (index >= area.length) {
    return area;
  }
  const currentCoord: Coord = area[index];
  const currentNeighbors: Array<Coord> = [
    { ...currentCoord, x: currentCoord.x - 1 },
    { ...currentCoord, x: currentCoord.x + 1 },
    { ...currentCoord, y: currentCoord.y - 1 },
    { ...currentCoord, y: currentCoord.y + 1 },
  ];
  const safeNeighborsNotInArea: Array<Coord> = currentNeighbors.filter(
    (coord) =>
      isCoordSafe(coord, board) &&
      !area.find((areaCoord) => coordEq(coord, areaCoord)),
  );

  return floodFill([...area, ...safeNeighborsNotInArea], index + 1, board);
}

function isCoordSafe(coord: Coord, board: Board): boolean {
  return isCoordInBounds(coord, board) && isCoordFree(coord, board);
}

function isCoordInBounds(coord: Coord, board: Board): boolean {
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
      snake.body.find((snakeCoord) => coordEq(coord, snakeCoord)),
    )
  ) {
    return false;
  }
  return true;
}

function debug(message: any): void {
  fs.writeFileSync("debug.log", util.inspect(message) + "\n", { flag: "a+" });
}

runServer({
  info: info,
  start: start,
  move: move,
  end: end,
});
