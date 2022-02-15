/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Gameboard } from '@app/classes/gameboard.class';
import { Word } from '@app/classes/word.class';
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { Service } from 'typedi';

const ROW_NUMBER = 15;
const COLUMN_NUMBER = 15;

@Service()
export class WordFinderService {
    findNewWords(gameboard: Gameboard, coordList: LetterTile[]) {
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

    buildFirstWord(gameboard: Gameboard, coordList: LetterTile[]) {
        const direction: string = LetterTile.findDirection(coordList) as string;
        const currentCoord = coordList[0];
        let word: Word;
        if (direction === 'Horizontal') word = this.buildHorizontalWord(gameboard, currentCoord);
        else if (direction === 'Vertical') word = this.buildVerticalWord(gameboard, currentCoord);
        else word = {} as Word;
        return word;
    }

    private buildVerticalWord(gameboard: Gameboard, coord: LetterTile) {
        let currentCoord: LetterTile = coord;
        while (gameboard.getCoord(currentCoord).isOccupied && gameboard.getCoord(currentCoord) !== undefined) {
            const x: number = currentCoord.x;
            const y: number = currentCoord.y;
            if (y !== 1) {
                const nextCoord = new LetterTile(x, y - 1, {} as Letter);
                if (gameboard.getCoord(nextCoord).isOccupied) currentCoord = nextCoord;
                else break;
            } else break;
        }
        const coordArray: LetterTile[] = new Array();
        while (gameboard.getCoord(currentCoord).isOccupied && gameboard.getCoord(currentCoord) !== undefined) {
            const gameCoord: LetterTile = gameboard.getCoord(currentCoord);
            coordArray.push(gameCoord);
            if (currentCoord.y !== ROW_NUMBER) {
                currentCoord = new LetterTile(currentCoord.x, currentCoord.y + 1, {} as Letter);
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

    private buildHorizontalWord(gameboard: Gameboard, coord: LetterTile) {
        let currentCoord: LetterTile = coord;
        while (gameboard.getCoord(currentCoord).isOccupied && gameboard.getCoord(currentCoord) !== undefined) {
            const x: number = currentCoord.x;
            const y: number = currentCoord.y;
            if (x !== 1) {
                const nextCoord = new LetterTile(x - 1, y, {} as Letter);
                if (gameboard.getCoord(nextCoord).isOccupied) {
                    currentCoord = nextCoord;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        const coordArray: LetterTile[] = new Array();
        while (gameboard.getCoord(currentCoord).isOccupied && gameboard.getCoord(currentCoord) !== undefined) {
            const x: number = currentCoord.x;
            const y: number = currentCoord.y;
            const gameCoord: LetterTile = gameboard.getCoord(currentCoord);
            coordArray.push(gameCoord);
            if (x !== COLUMN_NUMBER) {
                currentCoord = new LetterTile(x + 1, y, {} as Letter);
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
