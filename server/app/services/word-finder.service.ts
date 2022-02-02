/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-restricted-imports */
/* eslint-disable prettier/prettier */
import { Letter } from 'app/classes/letter.class';
import { Word } from 'app/classes/word.class';
import { Service } from 'typedi';
import { Coordinate } from '../classes/coordinate.class';
import { GameBoard } from '../classes/gameboard.class';

@Service()
export class WordFinderService {
    // Logic implemented in order to search for newly formed words after Player validates action
    private findNewWords(gameBoard: GameBoard, coordList: Coordinate[]) {
        const newWordsArray: Word[] = new Array();
        // Verify if only one letter is placed
        if (coordList.length === 1) {
            const verticalWord: Word = this.buildVerticalWord(gameBoard, coordList[0]);
            const horizontalWord: Word = this.buildHorizontal(gameBoard, coordList[0]);
            if (verticalWord.coords.length !== 0 && verticalWord.coords.length !== 1) {
                newWordsArray.push(verticalWord);
            } else if (horizontalWord.coords.length !== 0 && horizontalWord.coords.length !== 1) {
                newWordsArray.push(horizontalWord);
            }
            return newWordsArray;
        } else {
            // Build first word
            const firstWord: Word = this.buildFirstWord(gameBoard, coordList);
            newWordsArray.push(firstWord);
            // Build other words
            coordList.forEach((coord) => {
                const direction: string = Coordinate.checkDirection(coordList) as string;
                if (direction === 'Horizontal') {
                    const horizontalWord: Word = this.buildVerticalWord(gameBoard, coord);
                    // Construct word from the letterArray and add it to newWords array
                    if (horizontalWord.coords.length !== 0 && horizontalWord.coords.length !== 1) {
                        newWordsArray.push(horizontalWord);
                    }
                } else if (direction === 'Vertical') {
                    const verticalWord: Word = this.buildHorizontal(gameBoard, coord);
                    // add it to newWords array
                    if (verticalWord.coords.length !== 0 && verticalWord.coords.length !== 1) {
                        newWordsArray.push(verticalWord);
                    }
                }
            });
            return newWordsArray;
        }
    }

    private buildVerticalWord(gameBoard: GameBoard, coord: Coordinate) {
        let currentCoord: Coordinate = coord;
        while (gameBoard.getCoord(currentCoord).isOccupied && gameBoard.getCoord(currentCoord) !== undefined) {
            const x: number = currentCoord.x;
            const y: number = currentCoord.y;
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            if (y !== 14) {
                currentCoord = new Coordinate(x, y + 1, {} as Letter);
            } else {
                break;
            }
        }
        const coordArray: Coordinate[] = new Array();
        const stringArray: string[] = new Array();
        coordArray.push(currentCoord);
        while (gameBoard.getCoord(currentCoord).isOccupied && gameBoard.getCoord(currentCoord) !== undefined) {
            const x: number = currentCoord.x;
            const y: number = currentCoord.y;
            const gameCoord: Coordinate = gameBoard.getCoord(currentCoord);
            coordArray.push(gameCoord);
            stringArray.push(gameCoord.letter.stringChar);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            if (y !== 0) {
                currentCoord = new Coordinate(x, y - 1, {} as Letter);
            }
        }
        // TODO: Construct word from the letterArray
        const stringFormat: string = stringArray.join('');
        const word = new Word(false, false, coordArray[0], stringFormat, gameBoard);
        return word;
    }

    private buildHorizontal(gameBoard: GameBoard, coord: Coordinate) {
        let currentCoord: Coordinate = coord;
        while (gameBoard.getCoord(currentCoord).isOccupied && gameBoard.getCoord(currentCoord) !== undefined) {
            const x: number = currentCoord.x;
            const y: number = currentCoord.y;
            if (x !== 0) {
                currentCoord = new Coordinate(x - 1, y, {} as Letter);
            } else {
                break;
            }
        }
        const coordArray: Coordinate[] = new Array();
        const stringArray: string[] = new Array();
        coordArray.push(currentCoord);
        stringArray.push(currentCoord.letter.stringChar);
        while (gameBoard.getCoord(currentCoord).isOccupied && gameBoard.getCoord(currentCoord) !== undefined) {
            const x: number = currentCoord.x;
            const y: number = currentCoord.y;
            const gameCoord: Coordinate = gameBoard.getCoord(currentCoord);
            coordArray.push(gameCoord);
            stringArray.push(gameCoord.letter.stringChar);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            if (x !== 14) {
                currentCoord = new Coordinate(x + 1, y, {} as Letter);
            }
        }
        // TODO: Construct word from the letterArray and add it to newWords array
        const stringFormat: string = stringArray.join('');
        const word = new Word(true, false, coordArray[0], stringFormat, gameBoard);
        return word;
    }

    private buildFirstWord(gameboard: GameBoard, coordList: Coordinate[]) {
        const direction: string = Coordinate.checkDirection(coordList) as string;
        let currentCoord = coordList[0];
        const coordArray: Coordinate[] = new Array();
        const stringArray: string[] = new Array();
        if (direction === 'Horizontal') {
            while (gameboard.getCoord(currentCoord).isOccupied && gameboard.getCoord(currentCoord) !== undefined) {
                const x: number = currentCoord.x;
                const y: number = currentCoord.y;
                const gameCoord = gameboard.getCoord(currentCoord);
                coordArray.push(gameCoord);
                stringArray.push(gameCoord.letter.stringChar);
                if (x !== 14) {
                    currentCoord = new Coordinate(x + 1, y, {} as Letter);
                }
            }
        } else if (direction === 'Vertical') {
            while (gameboard.getCoord(currentCoord).isOccupied && gameboard.getCoord(currentCoord) !== undefined) {
                const x: number = currentCoord.x;
                const y: number = currentCoord.y;
                const gameCoord = gameboard.getCoord(currentCoord);
                coordArray.push(gameCoord);
                stringArray.push(gameCoord.letter.stringChar);
                if (y !== 0) {
                    currentCoord = new Coordinate(x, y - 1, {} as Letter);
                }
            }
        }
        const stringFormat: string = stringArray.join('');
        const word = new Word(true, false, coordArray[0], stringFormat, gameboard);
        return word;
    }
}
