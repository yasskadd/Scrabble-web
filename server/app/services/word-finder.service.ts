/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-restricted-imports */
/* eslint-disable prettier/prettier */
import { GameboardCoordinate } from '@app/classes/gameboard-coordinate.class';
import { GameBoard } from '@app/classes/gameboard.class';
import { Word } from '@app/classes/word.class';
import { Letter } from '@common/letter';
import { Service } from 'typedi';

@Service()
export class WordFinderService {
    findNewWords(gameBoard: GameBoard, coordList: GameboardCoordinate[]) {
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

    buildFirstWord(gameboard: GameBoard, coordList: GameboardCoordinate[]) {
        const direction: string = GameboardCoordinate.findDirection(coordList) as string;
        const currentCoord = coordList[0];
        let word: Word;
        if (direction === 'Horizontal') word = this.buildHorizontalWord(gameboard, currentCoord);
        else if (direction === 'Vertical') word = this.buildVerticalWord(gameboard, currentCoord);
        else word = {} as Word;
        return word;
    }

    private buildVerticalWord(gameBoard: GameBoard, coord: GameboardCoordinate) {
        let currentCoord: GameboardCoordinate = coord;
        while (gameBoard.getCoord(currentCoord).isOccupied && gameBoard.getCoord(currentCoord) !== undefined) {
            const x: number = currentCoord.x;
            const y: number = currentCoord.y;
            if (y !== 0) {
                const nextCoord = new GameboardCoordinate(x, y - 1, {} as Letter);
                if (gameBoard.getCoord(nextCoord).isOccupied) currentCoord = nextCoord;
                else break;
            } else break;
        }
        const coordArray: GameboardCoordinate[] = new Array();
        while (gameBoard.getCoord(currentCoord).isOccupied && gameBoard.getCoord(currentCoord) !== undefined) {
            const x: number = currentCoord.x;
            const y: number = currentCoord.y;
            const gameCoord: GameboardCoordinate = gameBoard.getCoord(currentCoord);
            coordArray.push(gameCoord);
            if (y !== 14) {
                currentCoord = new GameboardCoordinate(x, y + 1, {} as Letter);
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

    private buildHorizontalWord(gameBoard: GameBoard, coord: GameboardCoordinate) {
        let currentCoord: GameboardCoordinate = coord;
        while (gameBoard.getCoord(currentCoord).isOccupied && gameBoard.getCoord(currentCoord) !== undefined) {
            const x: number = currentCoord.x;
            const y: number = currentCoord.y;
            if (x !== 0) {
                const nextCoord = new GameboardCoordinate(x - 1, y, {} as Letter);
                if (gameBoard.getCoord(nextCoord).isOccupied) {
                    currentCoord = nextCoord;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        const coordArray: GameboardCoordinate[] = new Array();
        while (gameBoard.getCoord(currentCoord).isOccupied && gameBoard.getCoord(currentCoord) !== undefined) {
            const x: number = currentCoord.x;
            const y: number = currentCoord.y;
            const gameCoord: GameboardCoordinate = gameBoard.getCoord(currentCoord);
            coordArray.push(gameCoord);
            if (x !== 14) {
                currentCoord = new GameboardCoordinate(x + 1, y, {} as Letter);
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
