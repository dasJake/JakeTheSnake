import { Config, GameState } from "./types";

function baseConfig(): Config {
    return {
        foodScore: 30,
        killScore: 20,
        deathScore: -60,
    };
} 

export function getTurnConfig(gameState: GameState): Config {
    const config = baseConfig();
    return config;
}