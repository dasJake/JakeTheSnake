import { GameState,
    Coord,
    SnakeSizeFlag,
} from "./types.js";
import {
  gameLog,
  gameLogStream,
  debugLog,
  debugLogStream,
  writeToLog,
} from "./fnLogging.js";
import { removeElements } from "./fnRemoveFromArray.js";

export function findSnakeheads(gameState: GameState, marker?: SnakeSizeFlag): Coord[] {
    
    if (marker === "smaller") {
        let smallerHeads: Array<Coord> = [];
        gameState.board.snakes.forEach((snake) => {
            if (snake.length < gameState.you.length) {
                smallerHeads.push(snake.head);
            }
        });
        return smallerHeads;
    }

    if (marker === "deadly") {
        let deadlyHeads: Array<Coord> = [];
        gameState.board.snakes.forEach((snake) => {
            if (snake.length >= gameState.you.length) {
                deadlyHeads.push(snake.head);
            }
        });
        deadlyHeads = removeElements(deadlyHeads, [gameState.you.head]);
        return deadlyHeads;
    }

    let heads: Array<Coord> = [];
    gameState.board.snakes.forEach((snake) => {
        heads.push(snake.head);
    });
    return heads;
}