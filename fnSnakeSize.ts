import { coordEq, GameState } from "./types.js";

export function orderedSnakeSize(gameState: GameState): Array<number> {
    const snakeLengths = gameState.board.snakes.map(
        snake => snake.length);
    const orderedSnakeSize = snakeLengths.sort((a, b) => b - a);
    return orderedSnakeSize;
}