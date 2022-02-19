import { Gameboard } from '@app/classes/gameboard.class';
import { Word } from '@app/classes/word.class';
import { Coordinate } from '@common/coordinate';
import { LetterTile } from '@common/letter-tile.class';
import { Service } from 'typedi';

const ROW_NUMBER = 15;
const COLUMN_NUMBER = 15;

@Service()
export class WordFinderService {
    findNewWords(gameboard: Gameboard, coordList: LetterTile[]): Word[] {
        const newWordsArray: Word[] = new Array();
        if (coordList.length === 0) return [];
        if (coordList.length === 1) {
            const verticalWord: Word = this.buildWord(false, coordList[0], gameboard);
            const horizontalWord: Word = this.buildWord(true, coordList[0], gameboard);
            if (verticalWord.coords.length > 1) newWordsArray.push(verticalWord);
            if (horizontalWord.coords.length > 1) newWordsArray.push(horizontalWord);
        } else {
            const firstWord: Word = this.buildFirstWord(coordList, gameboard);
            newWordsArray.push(firstWord);
            coordList.forEach((coord) => {
                const word: Word = this.buildWord(firstWord.isHorizontal, coord, gameboard);
                if (word.coords.length !== 0 && word.coords.length !== 1) newWordsArray.push(word);
            });
        }
        return newWordsArray;
    }

    private buildFirstWord(coordList: LetterTile[], gameboard: Gameboard): Word {
        const isHorizontal: boolean | null = LetterTile.findDirection(coordList) as boolean | null;
        const currentCoord = coordList[0];
        let word: Word;
        if (isHorizontal === null) word = {} as Word;
        else word = this.buildWord(isHorizontal as boolean, currentCoord, gameboard);
        return word;
    }

    private buildWord(isHorizontal: boolean, coord: Coordinate, gameboard: Gameboard): Word {
        let currentCoord: Coordinate = this.findFirstCoord(isHorizontal, coord, gameboard);
        const coordArray: LetterTile[] = new Array();
        while (gameboard.getCoord(currentCoord).isOccupied && gameboard.getCoord(currentCoord) !== undefined) {
            coordArray.push(gameboard.getCoord(currentCoord));
            if (isHorizontal && currentCoord.x !== COLUMN_NUMBER) currentCoord = { x: currentCoord.x + 1, y: currentCoord.y } as Coordinate;
            else if (!isHorizontal && currentCoord.y !== ROW_NUMBER) currentCoord = { x: currentCoord.x, y: currentCoord.y + 1 } as Coordinate;
            else break;
        }
        if (coordArray.length > 1) return new Word(true, coordArray);
        else return new Word(true, []);
    }

    private findFirstCoord(isHorizontal: boolean, coord: Coordinate, gameboard: Gameboard): Coordinate {
        let currentCoord: Coordinate = coord;
        if (isHorizontal) {
            while (gameboard.getCoord(currentCoord).isOccupied && gameboard.getCoord(currentCoord) !== undefined) {
                if (currentCoord.x !== 1) {
                    const nextCoord: Coordinate = { x: currentCoord.x - 1, y: currentCoord.y } as Coordinate;
                    if (gameboard.getCoord(nextCoord).isOccupied) currentCoord = nextCoord;
                    else break;
                } else break;
            }
        } else {
            while (gameboard.getCoord(currentCoord).isOccupied && gameboard.getCoord(currentCoord) !== undefined) {
                if (currentCoord.y !== 1) {
                    const nextCoord: Coordinate = { x: currentCoord.x, y: currentCoord.y - 1 } as Coordinate;
                    if (gameboard.getCoord(nextCoord).isOccupied) currentCoord = nextCoord;
                    else break;
                } else break;
            }
        }
        return currentCoord;
    }
}
