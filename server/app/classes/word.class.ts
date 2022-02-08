/* eslint-disable no-restricted-imports */
import { GameBoard } from '../classes/gameboard.class';
import { GameboardCoordinate } from './gameboard-coordinate.class';

export class Word {
    isHorizontal: boolean;
    isValid: boolean;
    points: number = 0;
    isFirstWord: boolean = false;
    coords: GameboardCoordinate[];
    stringFormat: string = '';

    constructor(isHorizontal: boolean, coordList: GameboardCoordinate[]) {
        this.isHorizontal = isHorizontal;
        this.isValid = false;
        this.points = 0;
        coordList.forEach((coord: GameboardCoordinate) => {
            this.stringFormat += coord.letter.stringChar;
        });
    }

    calculatePoints(gameboard: GameBoard) {
        const letterCoords: GameboardCoordinate[] = this.coords;
        this.addLetterPoints(letterCoords, gameboard);
        this.addWordMultiplierPoints(letterCoords, gameboard);
        return this.points;
    }

    private addLetterPoints(letterCoords: GameboardCoordinate[], gameboard: GameBoard) {
        letterCoords.forEach((letterCoord: GameboardCoordinate) => {
            const gameboardCoord = gameboard.getCoord(letterCoord);
            if (gameboardCoord.letterMultiplier > 1) {
                this.points += letterCoord.letter.points * gameboardCoord.letterMultiplier;
                gameboardCoord.resetLetterMultiplier();
            } else {
                this.points += letterCoord.letter.points;
            }
        });
    }

    private addWordMultiplierPoints(letterCoords: GameboardCoordinate[], gameboard: GameBoard) {
        letterCoords.forEach((letterCoord: GameboardCoordinate) => {
            const gameboardCoord = gameboard.getCoord(letterCoord);
            if (gameboardCoord.wordMultiplier > 1) {
                this.points *= gameboardCoord.wordMultiplier;
            }
        });
    }
}
