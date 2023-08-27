
import { coordEq, GameState, SnakeSizeFlag } from "./types.js";

export function numberOfSnakes(gameState: GameState, snakeSize: SnakeSizeFlag): number {
    const snakeCount = gameState.board.snakes.length;

    if (snakeSize === "deadly") {
        const deadlySnakeCount = gameState.board.snakes.reduce(
            (acc, snake) =>
            (snake.length >= gameState.you.length && !coordEq(snake.head, gameState.you.head) ? acc+1 : acc)
            , 0
        );
        return deadlySnakeCount;
    }

    if (snakeSize === "smaller") {
        const smallerSnakeCount = gameState.board.snakes.reduce(
            (acc, snake) =>
            (snake.length < gameState.you.length ? acc+1 : acc)
            , 0
        );
        return smallerSnakeCount;

    }
    return snakeCount;
}