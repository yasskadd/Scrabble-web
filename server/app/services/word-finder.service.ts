/* eslint-disable prettier/prettier */
import { Coordinate } from '@app/classes/gameboard-coordinate.class';
import { Letter } from '@app/classes/letter';
import { Service } from 'typedi';
import { GameBoard } from './gameboard.service';

@Service()
export class WordFinderService {
    // Logic implemented in order to search for newly formed words after Player validates action

    private findNewWords(gameBoard: GameBoard, coordList: Coordinate[]) {
        let newWordsArray: string[];
        // Verify if word is vertical or horizontal if coordList is > 1
        const isHorizontal: boolean = this.checkDirectionWord(coordList) as boolean;
        coordList.forEach((coord) => {
            let mostLeftIndex: number = gameBoard.findArrayIndex(coord);
            let mostUpIndex: number = gameBoard.findArrayIndex(coord);
            if (isHorizontal) {
                while (gameBoard[mostUpIndex + 15].getOccupy() && gameBoard[mostUpIndex + 15] !== undefined) {
                    mostUpIndex += 15;
                }
                const letterArray: Letter[] = new Array();
                letterArray.push(gameBoard.getLetterArray[mostUpIndex]);
                while (gameBoard.getLetterArray()[mostUpIndex - 15].char !== '' && gameBoard.getLetterArray()[mostUpIndex - 15] !== undefined) {
                    mostUpIndex -= 15;
                    letterArray.push(gameBoard.getLetterArray()[mostUpIndex - 15]);
                }
                // Construct word from the letterArray and add it to newWords array
                const newWord: string = letterArray.join('');
                newWordsArray.push(newWord);
            } else {
                while (gameBoard[mostLeftIndex - 1].getOccupy() && gameBoard[mostLeftIndex - 1] !== undefined) {
                    mostLeftIndex -= 1;
                }
                const letterArray: Letter[] = new Array();
                letterArray.push(gameBoard.getLetterArray[mostUpIndex]);
                while (gameBoard.getLetterArray()[mostUpIndex + 1].char !== '' && gameBoard.getLetterArray()[mostUpIndex + 1] !== undefined) {
                    mostUpIndex += 1;
                    letterArray.push(gameBoard.getLetterArray()[mostUpIndex + 1]);
                }
                // Construct word from the letterArray and add it to newWords array
                const newWord: string = letterArray.join('');
                newWordsArray.push(newWord);
            }
            return newWordsArray;
        });
    }

    private checkDirectionWord(coordList: Coordinate[]) {
        let isHorizontal: boolean;
        const allEqual = (arr: number[]) => arr.every((v) => v === arr[0]);
        const tempHorizontalCoords: number[] = [];
        const tempVerticalCoord: number[] = [];
        coordList.forEach((coord) => {
            tempHorizontalCoords.push(coord.getX());
            tempVerticalCoord.push(coord.getY());
        });
        if (tempHorizontalCoords.length !== 0 && allEqual(tempHorizontalCoords)) {
            isHorizontal = true;
            return isHorizontal;
        } else if (tempVerticalCoord.length !== 0 && allEqual(tempVerticalCoord)) {
            isHorizontal = false;
            return isHorizontal;
        }
    }
}
