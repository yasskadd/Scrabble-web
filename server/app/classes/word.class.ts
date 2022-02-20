import { Gameboard } from '@app/classes/gameboard.class';
import { Coordinate } from '@common/coordinate';
import { LetterTile } from '@common/letter-tile.class';

const ROW_NUMBER = 15;
const COLUMN_NUMBER = 15;
export class Word {
    isHorizontal: boolean;
    isValid: boolean = false;
    points: number = 0;
    coords: LetterTile[];
    stringFormat: string = '';

    constructor(isHorizontal: boolean, coordList: LetterTile[]) {
        this.isHorizontal = isHorizontal;
        this.isValid = false;
        this.coords = coordList;
        coordList.forEach((coord: LetterTile) => {
            this.stringFormat += coord.letter.value?.toLowerCase();
        });
    }

    static findNewWords(gameboard: Gameboard, placedLettersCoords: LetterTile[]): Word[] {
        const newWordsArray: Word[] = new Array();
        if (placedLettersCoords.length === 0) return [];
        if (placedLettersCoords.length === 1) {
            const verticalWord: Word = this.buildWord(false, placedLettersCoords[0], gameboard);
            const horizontalWord: Word = this.buildWord(true, placedLettersCoords[0], gameboard);
            if (verticalWord.coords.length > 1) newWordsArray.push(verticalWord);
            if (horizontalWord.coords.length > 1) newWordsArray.push(horizontalWord);
        } else {
            const firstWord: Word = this.buildFirstWord(placedLettersCoords, gameboard);
            newWordsArray.push(firstWord);
            placedLettersCoords.forEach((coord) => {
                const word: Word = this.buildWord(!firstWord.isHorizontal, coord, gameboard);
                if (word.coords?.length > 1) newWordsArray.push(word);
            });
        }
        return newWordsArray;
    }

    private static buildFirstWord(coordList: LetterTile[], gameboard: Gameboard): Word {
        const isHorizontal: boolean | null = LetterTile.findDirection(coordList) as boolean | null;
        const currentCoord = coordList[0];
        let word: Word;
        if (isHorizontal === null) word = {} as Word;
        else word = this.buildWord(isHorizontal as boolean, currentCoord, gameboard);
        return word;
    }

    private static buildWord(isHorizontal: boolean, coord: Coordinate, gameboard: Gameboard): Word {
        if (isHorizontal === null) return {} as Word;
        let currentCoord: Coordinate = this.findFirstCoord(isHorizontal, coord, gameboard);
        const coordArray: LetterTile[] = new Array();
        while (gameboard.getCoord(currentCoord).isOccupied && gameboard.getCoord(currentCoord) !== undefined) {
            coordArray.push(gameboard.getCoord(currentCoord));
            if (isHorizontal && currentCoord.x !== COLUMN_NUMBER) currentCoord = { x: currentCoord.x + 1, y: currentCoord.y } as Coordinate;
            else if (!isHorizontal && currentCoord.y !== ROW_NUMBER) currentCoord = { x: currentCoord.x, y: currentCoord.y + 1 } as Coordinate;
            else break;
        }
        if (coordArray.length > 1) return new Word(isHorizontal, coordArray);
        else return new Word(isHorizontal, []);
    }

    private static findFirstCoord(isHorizontal: boolean, coord: Coordinate, gameboard: Gameboard): Coordinate {
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

    calculatePoints(gameboard: Gameboard): number {
        const letterCoords: LetterTile[] = this.coords;
        this.addLetterPoints(letterCoords, gameboard);
        this.addWordMultiplierPoints(letterCoords, gameboard);
        return this.points;
    }

    private addLetterPoints(letterCoords: LetterTile[], gameboard: Gameboard): void {
        letterCoords.forEach((letterCoord: LetterTile) => {
            const gameboardCoord = gameboard.getCoord(letterCoord);
            if (gameboardCoord.letterMultiplier > 1) {
                this.points += letterCoord.letter.points * gameboardCoord.letterMultiplier;
                gameboardCoord.resetLetterMultiplier();
            } else {
                this.points += letterCoord.letter.points;
            }
        });
    }

    private addWordMultiplierPoints(letterCoords: LetterTile[], gameboard: Gameboard): void {
        letterCoords.forEach((letterCoord: LetterTile) => {
            const gameboardCoord = gameboard.getCoord(letterCoord);
            if (gameboardCoord.wordMultiplier > 1) {
                this.points *= gameboardCoord.wordMultiplier;
                gameboardCoord.resetWordMultiplier();
            }
        });
    }
}
