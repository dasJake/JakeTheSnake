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

import runServer from './server';
import { Coord, GameState, InfoResponse, MoveResponse } from './types';
import { SafeCoord, SafeCoords } from './safe-coord';

// info is called when you create your Battlesnake on play.battlesnake.com
// and controls your Battlesnake's appearance
// TIP: If you open your Battlesnake URL in a browser you should see this data
function info(): InfoResponse {
  console.log("INFO");

  return {
    apiversion: "1",
    author: "JakeTheSnake",       // TODO: Your Battlesnake Username
    color: "#bd324f", // TODO: Choose color
    head: "tiger-king",  // TODO: Choose head
    tail: "tiger-tail",  // TODO: Choose tail
  };
}

// start is called when your Battlesnake begins a game
function start(gameState: GameState): void {
  console.log("GAME START");
}

// end is called when your Battlesnake finishes a game
function end(gameState: GameState): void {
  console.log("GAME OVER\n");
}

// move is called on every turn and returns your next move
// Valid moves are "up", "down", "left", or "right"
// See https://docs.battlesnake.com/api/example-move for available data
function move(gameState: GameState): MoveResponse {

  let isMoveSafe: { [key: string]: boolean; } = {
    up: true,
    down: true,
    left: true,
    right: true
  };

  // We've included code to prevent your Battlesnake from moving backwards
  const myHead = gameState.you.body[0];
  const myNeck = gameState.you.body[1];

  if (myNeck.x < myHead.x) {        // Neck is left of head, don't move left
    isMoveSafe.left = false;

  } else if (myNeck.x > myHead.x) { // Neck is right of head, don't move right
    isMoveSafe.right = false;

  } else if (myNeck.y < myHead.y) { // Neck is below head, don't move down
    isMoveSafe.down = false;

  } else if (myNeck.y > myHead.y) { // Neck is above head, don't move up
    isMoveSafe.up = false;
  }

  // TODO: Step 1 - Prevent your Battlesnake from moving out of bounds
  const boardWidth = gameState.board.width;
  const boardHeight = gameState.board.height;

  if (myHead.x == 0)
  {
    isMoveSafe.left = false;
  }
  if (myHead.y == 0)
  {
    isMoveSafe.down = false;
  }
  if (myHead.x == boardWidth - 1)
  {
    isMoveSafe.right = false;
  }
  if (myHead.y == boardHeight - 1)
  {
    isMoveSafe.up = false;
  }

  // TODO: Step 2 - Prevent your Battlesnake from colliding with itself and other snakes

  // slice last element/tail because it will be possible to move where the tail is now
  myBody = gameState.you.body.slice(0, -1);

  gameState.board.snakes.forEach((snake) => snake.body.slice(0, -1).forEach((cell) => myBody.push(cell)));

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
  const safeMoves = Object.keys(isMoveSafe).filter(key => isMoveSafe[key]);
  console.log({safeMoves, myHead, myBody});
  if (safeMoves.length == 0) {
    console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
    return { move: "down" };
  }
  
  // determine safe coordinates
  const snakeHeads: Coord[] = gameState.board.snakes.map((snake) => snake.head);
  console.log({snakeHeads});
  const safeCoords = determineSafeCoords(safeMoves, myHead, snakeHeads);
  console.log(JSON.stringify({safeCoords}, null, 2));
  safeCoords.forEach((piece) => {console.log(piece.coord);});

  // Choose a random move from the safe moves
  const nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];

 // coordAfterMove(myHead, safeMoves, gameState.board.food);

  
  console.log(`MOVE ${gameState.turn}: ${nextMove}`)
  return { move: nextMove };
}

function determineSafeCoords(safeMoves: Array<Move>, myHead: Coord, snakeHeads: Array<Coord>): SafeCoords
{
  const safeCoords: SafeCoords = [];
  for (const currentMove of safeMoves)
    {
    const currentSafeCoord = new SafeCoord(currentMove, myHead, snakeHeads);
    safeCoords.push(currentSafeCoord);
    }
  return safeCoords;
}
  // TODO: Step 4 - Move towards food instead of random, to regain health and survive longer
/*function coordAfterMove(myHead: Coord, safeMoves: Array<Move>, food: Array<Coord>): Coord {
  const safeCoords = safeMoves.map((move) =>
  {
    const coord: Coord = {x: myHead.x, y: myHead.y};
    
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
  });
  const availableFood = food.find((currentFood) => safeCoords.find((currentCoord) => currentCoord.x == currentFood.x && currentCoord.y == currentFood.y));
  
console.log({safeCoords, availableFood});
}*/
runServer({
  info: info,
  start: start,
  move: move,
  end: end
});
