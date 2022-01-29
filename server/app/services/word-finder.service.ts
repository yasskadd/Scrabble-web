/* eslint-disable prettier/prettier */
import { Coordinate } from '@app/classes/gameboard-coordinate.class';
import { Letter } from '@app/classes/letter';
import { Service } from 'typedi';
import { GameBoard } from './gameboard.service';

@Service()
export class WordFinderService {
    // Logic implemented in order to search for newly formed words after Player validates action

    static readonly VERTICAL_MOVEMENT: number = 15;

    private findNewWords(gameBoard: GameBoard, coordList: Coordinate[]) {
        let newWordsArray: string[];
        // Verify if word is vertical or horizontal if coordList is > 1
        coordList.forEach((coord) => {
            const mostLeftIndex: number = gameBoard.findArrayIndex(coord);
            const mostUpIndex: number = gameBoard.findArrayIndex(coord);
            if (coordList.length === 1) {
                const verticalWord: string = this.buildVerticalWord(gameBoard, mostLeftIndex);
                const horizontalWord: string = this.buildHorizontal(gameBoard, mostUpIndex);
                if (verticalWord !== '') {
                    newWordsArray.push(verticalWord);
                } else if (horizontalWord !== '') {
                    newWordsArray.push(horizontalWord);
                }
                return newWordsArray;
            }
            const isHorizontal: boolean = this.checkDirectionWord(coordList) as boolean;
            if (isHorizontal) {
                const newWord: string = this.buildVerticalWord(gameBoard, mostUpIndex);
                // Construct word from the letterArray and add it to newWords array
                if (newWord !== '') {
                    newWordsArray.push(newWord);
                }
            } else {
                const newWord: string = this.buildHorizontal(gameBoard, mostLeftIndex);
                // Construct word from the letterArray and add it to newWords array
                if (newWord !== '') {
                    newWordsArray.push(newWord);
                }
            }
            return newWordsArray;
        });
    }

    private buildVerticalWord(gameBoard: GameBoard, mostUpIndex: number) {
        while (gameBoard.getGameBoard()[mostUpIndex + 15].getOccupy() && gameBoard.getGameBoard()[mostUpIndex + 15] !== undefined) {
            mostUpIndex += 15;
        }
        const letterArray: Letter[] = new Array();
        letterArray.push(gameBoard.getLetterArray[mostUpIndex]);
        while (gameBoard.getLetterArray()[mostUpIndex - 15].char !== '' && gameBoard.getLetterArray()[mostUpIndex - 15] !== undefined) {
            mostUpIndex -= 15;
            letterArray.push(gameBoard.getLetterArray()[mostUpIndex - 15]);
        }
        // Construct word from the letterArray and add it to newWords array
        if (letterArray.length > 1) {
            const newWord: string = letterArray.join('');
            return newWord;
        } else {
            return '';
        }
    }

    private buildHorizontal(gameBoard: GameBoard, mostLeftIndex: number) {
        while (gameBoard.getGameBoard()[mostLeftIndex - 1].getOccupy() && gameBoard.getGameBoard()[mostLeftIndex - 1] !== undefined) {
            mostLeftIndex -= 1;
        }
        const letterArray: Letter[] = new Array();
        letterArray.push(gameBoard.getLetterArray[mostLeftIndex]);
        while (gameBoard.getLetterArray()[mostLeftIndex + 1].char !== '' && gameBoard.getLetterArray()[mostLeftIndex + 1] !== undefined) {
            mostLeftIndex += 1;
            letterArray.push(gameBoard.getLetterArray()[mostLeftIndex + 1]);
        }
        // Construct word from the letterArray and add it to newWords array
        if (letterArray.length > 1) {
            const newWord: string = letterArray.join('');
            return newWord;
        } else {
            return '';
        }
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
        if (tempHorizontalCoords.length > 1 && allEqual(tempHorizontalCoords)) {
            isHorizontal = true;
            return isHorizontal;
        } else if (tempVerticalCoord.length > 1 && allEqual(tempVerticalCoord)) {
            isHorizontal = false;
            return isHorizontal;
        } else {
            return undefined;
        } // fix this problem
    }
}
