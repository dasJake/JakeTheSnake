import { Coord, coordEq, GameState } from "./types.js";
import {
  gameLog,
  gameLogStream,
  debugLog,
  debugLogStream,
  writeToLog,
} from "./fnLogging.js";

export function rateCoords (
    radar: Array<Array<Coord>>,
    lookup: Array<Coord>,
    lookupElementScore: number,
    radarStartOffset: number,
    maxRadarDepth: number,
    ): number {
    let rating: number = 0;

   //count occurances for each row
   /*with radarStartOffset and maxRadarDepth it can be specified what radar field should be analyzed
   radar[0] contains only the Coord itself (not a neigbor)
   food should be evaltuated starting from radar[0];
   everything else from radar[1]*/
    for ( var radarDepth = 0 + radarStartOffset; radarDepth <= maxRadarDepth; radarDepth++) {
        //rowcount => rowrating
        const rowCount: number = countMatchesInRow(radar[radarDepth], lookup);
        let divisor: number = radarDepth;

        //hackjob to avoid divide by 0 error when offset 0
        if (radarStartOffset === 0) {
            divisor = radarDepth + 1;
        }
        const rowRating: number = rowCount * lookupElementScore * (1/(divisor));
        rating += rowRating;
    writeToLog(debugLogStream, `rowRating: ${JSON.stringify(rowRating, null, 2)}`);
    writeToLog(debugLogStream, `Rating: ${JSON.stringify(rating, null, 2)}`);
    }
   //add ratings 
return rating;
}

function countMatchesInRow(radarRow: Array<Coord>, lookup: Array<Coord> ): number {
    let rowMatchCount: number = 0;
    radarRow.forEach((rowCoord) => {
        if (lookup.some((element) =>
            coordEq(element, rowCoord))) {
                rowMatchCount++;
        }
    });
    return rowMatchCount;
}
/*
    //row level
    for ( var i = 1; i < radar.length; i++) { //start at i=1 because radar[0] must be ignored
        let rowRating: number = 0;
        let rowMatchCount: number = 0;
        //coord level
        radar[i].forEach((radarCoord) => {
            if (lookup.some((element) =>
                coordEq(element, radarCoord))) {
                    rowMatchCount++;
            }
        rowRating = rowMatchCount * lookupElementScore * (1/i);
        });
        return rowRating;
    }
}
*/