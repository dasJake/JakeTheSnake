import { Coord, Move } from "./types"

export class SafeCoord
{
  move: Move;
  coord: Coord;
  rating: number;
  isSomeonesHead: boolean;   //useless because head will be somewhere else in the next move; instead anticipate if a head could land on this coord in the next move.
  hasFood: boolean;

  constructor (currentMove: Move, myHead: Coord, snakeHeads: Array<Coord>)
  {
    this.move = currentMove;
    this.coord = this.setCoord(this.move, myHead);
    this.rating = 100;
    this.isSomeonesHead = this.checkForHead(snakeHeads)
  }

  setCoord (move: Move, myHead: Coord): Coord
  {
    const coord = { ...myHead }; // Create a new object with the same properties as myHead
    switch (move)
    {
      case "up":
        coord.y++;
        break;
      case "down":
        coord.y--;
        break;
      case "left":
        coord.x--;
        break;
      case "right":
        coord.x++;
        break;
    }
    return coord;
  }
  
  checkForHead (snakeHeads: Array<Coord>): boolean
  {
   for (const currentCoord of snakeHeads)
     {
       if (currentCoord.x === this.coord.x && currentCoord.y === this.coord.y)
       {
         return true;
       }
     }
    return false;
  }
}

export interface SafeCoords
  {
    safeCoords: SafeCoord[];
  }