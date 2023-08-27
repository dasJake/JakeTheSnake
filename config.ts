import { Config, coordEq, Game, GameState, SnakeSizeFlag } from "./types.js";

function baseConfig(): Config {
    return {
        foodScore: 25,
        foodRadarDepth: 10,
        killScore: 30,
        killRadarDepth: 5,
        deathScore: -60,
        deathRadarDepth: 1,
    };
} 

export function getTurnConfig(gameState: GameState): Config {
    const config = baseConfig();

    //if I am not alone
    if (gameState.board.snakes.length > 1) {
        if (numberOfSnakes(gameState, "deadly") === 0) {
            config.foodScore = 0;
            config.killRadarDepth = 25;
        }
    }
    return config;
}

function numberOfSnakes(gameState: GameState, snakeSize: SnakeSizeFlag): number {
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
