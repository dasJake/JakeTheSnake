import { getNeighborByDirection } from "./fnGetNeighbors.js";
import { Coord, GameState, Move } from "./types.js";
import { isCoordSafe } from "./fnIsCoordSafe.js";
import { debugLog, debugLogStream, writeToLog } from "./fnLogging.js";

export function beamScan (
    gameState: GameState,
    currentCoord: Coord,
    direction: Move,
    ): Array<Coord> {
    
    const scan: Coord[] = [];
    let addToScan: Coord = getNeighborByDirection(currentCoord, direction);

    while (isCoordSafe(addToScan, gameState.board, "safe")) {
        scan.push(addToScan);
        addToScan = getNeighborByDirection(addToScan, direction);
    }
    return scan;
}

export function perpendicularBeamScan (
    gameState: GameState,
    currentCoord: Coord,
    direction: Move,
    ): Array<Array<Coord>> {

    const oneDimensionalScan: Coord[] = beamScan(gameState, currentCoord, direction);

    if (direction === "left" || direction === "right") {
        const twoDimensionalScan: Coord[][] = oneDimensionalScan.map(
            coord => [coord,
                ...beamScan(gameState, coord, "up"),
                ...beamScan(gameState, coord, "down")]
            );
        return twoDimensionalScan;
    }
    if (direction === "up" || direction === "down") {
        const twoDimensionalScan: Coord[][] = oneDimensionalScan.map(
            coord => [coord,
                ...beamScan(gameState, coord, "left"),
                ...beamScan(gameState, coord, "right")]
            );
        return twoDimensionalScan;
    }

    return [oneDimensionalScan];
}

export function determinePassageWidth(scan: Array<Array<Coord>>): Array<number> {
    const scanlineWidth: number[] = scan.map(
        scanline => scanline.length);

  return scanlineWidth;
}