/* eslint-disable no-unused-expressions */
/* eslint-disable no-restricted-imports */
import { GameBoard } from '../classes/gameboard.class';
import { Coordinate } from './coordinate.class';

export class Word {
    isHorizontal: boolean;
    isValid: boolean;
    points: number = 0;
    isFirstWord: boolean = false;
    coords: Coordinate[];
    stringFormat: string = '';

    constructor(isHorizontal: boolean, coordList: Coordinate[]) {
        this.isHorizontal = isHorizontal;
        this.isValid = false;
        this.coords = coordList;
        this.points = 0;
        coordList.forEach((coord: Coordinate) => {
            this.stringFormat += coord.letter.stringChar;
        });
    }

    // TODO: find adjacent words à partir de this.coords and return array of string words

    calculatePoints(word: Word, gameboard: GameBoard) {
        const letterCoords: Coordinate[] = word.coords;
        this.addLetterPoints(letterCoords, gameboard);
        this.addLetterPoints(letterCoords, gameboard);
        return this.points;
    }

    addLetterPoints(letterCoords: Coordinate[], gameboard: GameBoard) {
        letterCoords.forEach((letterCoord: Coordinate) => {
            const gameboardCoord = gameboard.getCoord(letterCoord);
            if (gameboardCoord.letterMultiplier > 1) {
                this.points += letterCoord.letter.points * gameboardCoord.letterMultiplier;
                gameboardCoord.resetLetterMultiplier();
            } else {
                this.points += letterCoord.letter.points;
            }
        });
    }

    addWordMultiplierPoints(letterCoords: Coordinate[], gameboard: GameBoard) {
        letterCoords.forEach((letterCoord: Coordinate) => {
            const gameboardCoord = gameboard.getCoord(letterCoord);
            if (gameboardCoord.wordMultiplier > 1) {
                this.points *= gameboardCoord.wordMultiplier;
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                gameboardCoord.resetWordMultiplier;
            }
        });
    }
}
