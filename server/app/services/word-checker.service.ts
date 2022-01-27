/* eslint-disable prettier/prettier */
import { Coordinate } from '@app/classes/gameboard-coordinate.class';
import { Word } from '@app/classes/word';
import { Service } from 'typedi';
import { GameBoard } from './gameboard.service';

@Service()
export class WordChecker {
   // Logic implemented in order to search for newly formed words after Player validates action

   private checkNewWords(gameBoard : GameBoard, coordList : Coordinate[]) {
       let newWords : Word[];
       // Verify if word is vertical or horizontal
       const isHorizontal : boolean = this.checkDirectionWord(coordList) as boolean;
       if (isHorizontal) {
           // We suppose that the coordinates list representing the letters of the word are in order


       }
       else {

       }

       coordList.forEach((coord) => {
           const index : number = gameBoard.findArrayIndex(coord);
           // Check for the leftmost letter
           while (gameBoard.getAdjacentBox())

       });

       
   }

   private checkDirectionWord(coordList : Coordinate[]) {
       let isHorizontal : boolean;
       const allEqual = (arr: number[]) => arr.every( (v) => v === arr[0]);
       const tempHorizontalCoords : number[] = []; const tempVerticalCoord : number[] = [];
       coordList.forEach((coord) => {
           tempHorizontalCoords.push(coord.getX()); tempVerticalCoord.push(coord.getY());
       });
       if (tempHorizontalCoords.length !== 0 && allEqual(tempHorizontalCoords)) {
            isHorizontal = true; return isHorizontal;
       }
       else if (tempVerticalCoord.length !== 0 && allEqual(tempVerticalCoord)) {
           isHorizontal = false; return isHorizontal;
       }
   }
}
