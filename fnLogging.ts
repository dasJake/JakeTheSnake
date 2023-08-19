import * as fs from "fs";

export const gameLog = "log.game";
export const debugLog = "log.debug";
export let gameLogStream = fs.createWriteStream(gameLog);
export let debugLogStream = fs.createWriteStream(debugLog);

export function writeToLog(logStream: any, message: any): void {
  logStream.write(`${message}\n`);
}

export function resetGameLogStream(): void {
    gameLogStream = fs.createWriteStream(gameLog);
}