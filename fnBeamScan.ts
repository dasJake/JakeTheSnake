import { getNeighborByDirection } from "./fnGetNeighbors.js";
import { Coord, GameState, Move } from "./types.js";
import { isCoordSafe } from "./fnIsCoordSafe.js";

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