import { Coord, coordEq } from "./types.js";
import {
  gameLog,
  gameLogStream,
  debugLog,
  debugLogStream,
  writeToLog,
} from "./fnLogging.js";

export function removeDuplicates(array: Array<Coord>): Array<Coord> {
   let accumulator: Array<Coord> = [];
   for ( let j = 0; j < array.length; j++) {
    let duplicateFound = false;
    for (let i = 0; i < accumulator.length; i++) {
        if (coordEq(accumulator[i], array[j])){
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
      accumulator.push(array[j]);
    }
   }
return accumulator;
}

export function removeElements(array: Array<Coord>, toBeRemoved: Array<Coord>): Array<Coord> {
  const result: Coord[] = array.filter(item => !toBeRemoved.some(removeItem =>
    coordEq(removeItem, item)
  ));
  return result;
}
