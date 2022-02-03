/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-restricted-imports */
/* eslint-disable prettier/prettier */
import { Letter } from '@app/letter';
import { Word } from 'app/classes/word.class';
import { Service } from 'typedi';
import { Coordinate } from '../classes/coordinate.class';
import { GameBoard } from '../classes/gameboard.class';

@Service()
export class WordFinderService {
    findNewWords(gameBoard: GameBoard, coordList: Coordinate[]) {
        const newWordsArray: Word[] = new Array();
        // Verify if only one letter is placed
        if (coordList.length === 1) {
            const verticalWord: Word = this.buildVerticalWord(gameBoard, coordList[0]);
            const horizontalWord: Word = this.buildHorizontalWord(gameBoard, coordList[0]);
            if (verticalWord.coords.length > 1) {
                newWordsArray.push(verticalWord);
            }
            if (horizontalWord.coords.length > 1) {
                newWordsArray.push(horizontalWord);
            }
            return newWordsArray;
        } else {
            // Build first word
            const firstWord: Word = this.buildFirstWord(gameBoard, coordList);
            newWordsArray.push(firstWord);
            // Build other words
            coordList.forEach((coord) => {
                if (!firstWord.isHorizontal) {
                    const horizontalWord: Word = this.buildVerticalWord(gameBoard, coord);
                    if (horizontalWord.coords.length !== 0 && horizontalWord.coords.length !== 1) {
                        newWordsArray.push(horizontalWord);
                    }
                } else if (firstWord.isHorizontal) {
                    const verticalWord: Word = this.buildHorizontalWord(gameBoard, coord);
                    if (verticalWord.coords.length !== 0 && verticalWord.coords.length !== 1) {
                        newWordsArray.push(verticalWord);
                    }
                }
            });
            return newWordsArray;
        }
    }

    buildFirstWord(gameboard: GameBoard, coordList: Coordinate[]) {
        const direction: string = Coordinate.findDirection(coordList) as string;
        const currentCoord = coordList[0];
        let word: Word;
        if (direction === 'Horizontal') {
            word = this.buildHorizontalWord(gameboard, currentCoord);
        } else if (direction === 'Vertical') {
            word = this.buildVerticalWord(gameboard, currentCoord);
        } else {
            word = {} as Word;
        }
        return word;
    }

    private buildVerticalWord(gameBoard: GameBoard, coord: Coordinate) {
        let currentCoord: Coordinate = coord;
        while (gameBoard.getCoord(currentCoord).isOccupied && gameBoard.getCoord(currentCoord) !== undefined) {
            const x: number = currentCoord.x;
            const y: number = currentCoord.y;
            if (y !== 14) {
                const nextCoord = new Coordinate(x, y + 1, {} as Letter);
                if (gameBoard.getCoord(nextCoord).isOccupied) {
                    currentCoord = nextCoord;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        const coordArray: Coordinate[] = new Array();
        while (gameBoard.getCoord(currentCoord).isOccupied && gameBoard.getCoord(currentCoord) !== undefined) {
            const x: number = currentCoord.x;
            const y: number = currentCoord.y;
            const gameCoord: Coordinate = gameBoard.getCoord(currentCoord);
            coordArray.push(gameCoord);
            if (y !== 0) {
                currentCoord = new Coordinate(x, y - 1, {} as Letter);
            } else {
                break;
            }
        }
        if (coordArray.length > 1) {
            const word = new Word(false, coordArray);
            return word;
        } else {
            return new Word(false, []);
        }
    }

    private buildHorizontalWord(gameBoard: GameBoard, coord: Coordinate) {
        let currentCoord: Coordinate = coord;
        while (gameBoard.getCoord(currentCoord).isOccupied && gameBoard.getCoord(currentCoord) !== undefined) {
            const x: number = currentCoord.x;
            const y: number = currentCoord.y;
            if (x !== 0) {
                const nextCoord = new Coordinate(x - 1, y, {} as Letter);
                if (gameBoard.getCoord(nextCoord).isOccupied) {
                    currentCoord = nextCoord;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        const coordArray: Coordinate[] = new Array();
        while (gameBoard.getCoord(currentCoord).isOccupied && gameBoard.getCoord(currentCoord) !== undefined) {
            const x: number = currentCoord.x;
            const y: number = currentCoord.y;
            const gameCoord: Coordinate = gameBoard.getCoord(currentCoord);
            coordArray.push(gameCoord);
            if (x !== 14) {
                currentCoord = new Coordinate(x + 1, y, {} as Letter);
            } else {
                break;
            }
        }
        if (coordArray.length > 1) {
            const word = new Word(true, coordArray);
            return word;
        } else {
            return new Word(true, []);
        }
    }
}
