/* eslint-disable @typescript-eslint/no-magic-numbers */
import { GameboardCoordinate } from '@app/classes/gameboard-coordinate.class';
import { Gameboard } from '@app/classes/gameboard.class';
import { Word } from '@app/classes/word.class';
import { Letter } from '@common/letter';
import { Service } from 'typedi';

@Service()
export class WordFinderService {
    findNewWords(gameboard: Gameboard, coordList: GameboardCoordinate[]) {
        const newWordsArray: Word[] = new Array();
        if (coordList.length === 0) return [];
        // Verify if only one letter is placed
        if (coordList.length === 1) {
            const verticalWord: Word = this.buildVerticalWord(gameboard, coordList[0]);
            const horizontalWord: Word = this.buildHorizontalWord(gameboard, coordList[0]);
            if (verticalWord.coords.length > 1) {
                newWordsArray.push(verticalWord);
            }
            if (horizontalWord.coords.length > 1) {
                newWordsArray.push(horizontalWord);
            }
            return newWordsArray;
        } else {
            const firstWord: Word = this.buildFirstWord(gameboard, coordList);
            newWordsArray.push(firstWord);
            coordList.forEach((coord) => {
                if (!firstWord.isHorizontal) {
                    const horizontalWord: Word = this.buildHorizontalWord(gameboard, coord);
                    console.log('CALLED HORIZONTAL');
                    newWordsArray.push(horizontalWord);
                } else {
                    const verticalWord: Word = this.buildVerticalWord(gameboard, coord);
                    console.log('CALLED Vertical');
                    newWordsArray.push(verticalWord);
                }
            });
            return newWordsArray;
        }
    }

    buildFirstWord(gameboard: Gameboard, coordList: GameboardCoordinate[]) {
        const direction: string = GameboardCoordinate.findDirection(coordList) as string;
        const currentCoord = coordList[0];
        let word: Word;
        if (direction === 'Horizontal') word = this.buildHorizontalWord(gameboard, currentCoord);
        else if (direction === 'Vertical') word = this.buildVerticalWord(gameboard, currentCoord);
        else word = {} as Word;
        return word;
    }

    private buildVerticalWord(gameboard: Gameboard, coord: GameboardCoordinate) {
        let currentCoord: GameboardCoordinate = coord;
        while (gameboard.getCoord(currentCoord).isOccupied && gameboard.getCoord(currentCoord) !== undefined) {
            const x: number = currentCoord.x;
            const y: number = currentCoord.y;
            if (y !== 0) {
                const nextCoord = new GameboardCoordinate(x, y - 1, {} as Letter);
                if (gameboard.getCoord(nextCoord).isOccupied) currentCoord = nextCoord;
                else break;
            } else break;
        }
        const coordArray: GameboardCoordinate[] = new Array();
        while (gameboard.getCoord(currentCoord).isOccupied && gameboard.getCoord(currentCoord) !== undefined) {
            const x: number = currentCoord.x;
            const y: number = currentCoord.y;
            const gameCoord: GameboardCoordinate = gameboard.getCoord(currentCoord);
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

    private buildHorizontalWord(gameboard: Gameboard, coord: GameboardCoordinate) {
        let currentCoord: GameboardCoordinate = coord;
        while (gameboard.getCoord(currentCoord).isOccupied && gameboard.getCoord(currentCoord) !== undefined) {
            const x: number = currentCoord.x;
            const y: number = currentCoord.y;
            if (x !== 0) {
                const nextCoord = new GameboardCoordinate(x - 1, y, {} as Letter);
                if (gameboard.getCoord(nextCoord).isOccupied) {
                    currentCoord = nextCoord;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        const coordArray: GameboardCoordinate[] = new Array();
        while (gameboard.getCoord(currentCoord).isOccupied && gameboard.getCoord(currentCoord) !== undefined) {
            const x: number = currentCoord.x;
            const y: number = currentCoord.y;
            const gameCoord: GameboardCoordinate = gameboard.getCoord(currentCoord);
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
