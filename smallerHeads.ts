import { GameState,
    Coord,
} from "./types.js";
import { 
  writeToLog,
  debugLogStream 
} from "./index.js";

export function findSmallerSnakeheads(gameState: GameState): Coord[] {
    let smallerHeads: Array<Coord> = [];
    gameState.board.snakes.forEach((snake) => {
        if (snake.length < gameState.you.length) {
            smallerHeads.push(snake.head);
        }
    });
    return smallerHeads;
}