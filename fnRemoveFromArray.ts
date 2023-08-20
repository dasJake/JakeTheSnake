import { Coord, coordEq } from "./types.js";
import {
  gameLog,
  gameLogStream,
  debugLog,
  debugLogStream,
  writeToLog,
} from "./fnLogging.js";

export function removeDuplicates(array: Array<Coord>): Array<Coord> {
   let accumulator: Array<Coord> = [array[0]];
   for ( let j = 1; j < array.length; j++) {
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

export function removeElements(array: Array<Coord>, removeElements: Array<Coord>): Array<Coord> {
  const result: Coord[] = array.filter(item => !removeElements.some(removeItem =>
    coordEq(removeItem, item)
  ));
  return result;
}
