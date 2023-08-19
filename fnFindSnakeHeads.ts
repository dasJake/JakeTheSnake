import { GameState,
    Coord,
} from "./types.js";
import {
  gameLog,
  gameLogStream,
  debugLog,
  debugLogStream,
  writeToLog,
} from "./fnLogging.js";

export function findSnakeheads(gameState: GameState, marker?: string): Coord[] {
    
    if (marker === "smaller") {
        let smallerHeads: Array<Coord> = [];
        gameState.board.snakes.forEach((snake) => {
            if (snake.length < gameState.you.length) {
                smallerHeads.push(snake.head);
            }
        });
        return smallerHeads;
    }

    if (marker === "bigger") {
        let biggerHeads: Array<Coord> = [];
        gameState.board.snakes.forEach((snake) => {
            if (snake.length > gameState.you.length) {
                biggerHeads.push(snake.head);
            }
        });
        return biggerHeads;
    }

    let heads: Array<Coord> = [];
    gameState.board.snakes.forEach((snake) => {
        heads.push(snake.head);
    });
    return heads;
}