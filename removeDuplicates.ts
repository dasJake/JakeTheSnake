import { SafeCoord, SafeCoords } from "./safe-coord.js";
import { GameState, Board, Coord, coordEq, Move } from "./types.js";
import { 
  floodFill,
  isCoordInBounds,
  getNeighbors,
  writeToLog,
  debugLogStream 
} from "./index.js";

export function removeDuplicates(coords: Coord[]): Coord[] {
   let accumulator: Array<Coord> = [coords[0]];
   for ( let j = 1; j < coords.length; j++) {
    let duplicateFound = false;
    for (let i = 0; i < accumulator.length; i++) {
        if (coordEq(accumulator[i], coords[j])){
          duplicateFound = true;
          break;
        }
        /*
        writeToLog(debugLogStream, `accumulator: ${JSON.stringify({accumulator}, null, 2)}`);
        writeToLog(debugLogStream, `index: ${JSON.stringify(i, null, 2)}`);
        writeToLog(debugLogStream, `accumulatorLength: ${JSON.stringify(accumulator.length, null, 2)}`);
        */
    }
    if (!duplicateFound) {
      accumulator.push(coords[j]);
    }
   }
return accumulator;
}
