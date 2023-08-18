import { Coord, Move } from "./types";

export function getMoveToCoordinate (origin: Coord, destination: Coord): Move {
    const deltaX: number = origin.x - destination.x;
    const deltaY: number = origin.y - destination.y;
    if ( deltaX === 1 && deltaY === 0 ) {
        return "left";
    }
    if ( deltaX === -1 && deltaY === 0 ) {
        return "right";
    }
    if ( deltaX === 0 && deltaY === -1 ) {
        return "up";
    }
    if ( deltaX === 0 && deltaY === 1 ) {
        return "down";
    }
    throw new Error ("Bad Coordinates");
}