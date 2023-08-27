import { Config, coordEq, Game, GameState, SnakeSizeFlag } from "./types.js";
import { numberOfSnakes } from "./fnNumberOfSnakes.js";
import { orderedSnakeSize } from "./fnSnakeSize.js";

function baseConfig(): Config {
    return {
        foodScore: 25,
        foodRadarDepth: 10,
        killScore: 30,
        killRadarDepth: 4,
        deathScore: -60,
        deathRadarDepth: 2,
    };
} 

export function getTurnConfig(gameState: GameState): Config {
    const config = baseConfig();
    const snakeSizeList = orderedSnakeSize(gameState);

    //if I am not alone
    if (gameState.board.snakes.length > 1) {
        
        //if I am the single longest snake and have at least 2 points size advantage
        if (numberOfSnakes(gameState, "deadly") === 0 &&
            snakeSizeList[0] - snakeSizeList[1] >= 2) {
            config.foodScore = 5;
            config.killRadarDepth = 15;
        }
    }
    return config;
}
