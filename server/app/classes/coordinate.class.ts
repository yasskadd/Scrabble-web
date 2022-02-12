import { Letter } from './letter.class';

/* eslint-disable prettier/prettier */
export class Coordinate {
    private x: number;
    private y: number; // POURQUOI UTILISER DES MEMBRES PRIVES EN TS?
    private isOccupied: boolean;
    private letter: Letter;
    private letterMultiplier: number;
    private wordMultiplier: number;

    constructor(posX: number, posY: number, letter: Letter) {
        this.x = posX;
        this.y = posY;
        this.isOccupied = false;
        this.letter = letter;
        this.letterMultiplier = 1;
        this.wordMultiplier = 1;
    }

    static checkDirectionWord(coordList: Coordinate[]) {
        const DIRECTIONS = {
            horizontal: 'Horizontal',
            vertical: 'Vertical',
            none: 'None',
        };
        let direction: string = DIRECTIONS.none;
        const allEqual = (arr: number[]) => arr.every((v) => v === arr[0]);
        const tempHorizontalCoords: number[] = [];
        const tempVerticalCoord: number[] = [];
        coordList.forEach((coord) => {
            tempHorizontalCoords.push(coord.getX());
            tempVerticalCoord.push(coord.getY());
        });
        if (tempHorizontalCoords.length > 1 && allEqual(tempHorizontalCoords)) {
            direction = DIRECTIONS.horizontal;
            return direction;
        } else if (tempVerticalCoord.length > 1 && allEqual(tempVerticalCoord)) {
            direction = DIRECTIONS.vertical;
            return direction;
        } else {
            return direction;
        } // fix this problem
    }
    // EST-CE QUE C'EST UTILE?
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
    getIsOccupied() {
        return this.isOccupied;
    }
    getLetter() {
        return this.letter;
    }
    getLetterMultiplier() {
        return this.letterMultiplier;
    }
    getWordMultiplier() {
        return this.wordMultiplier;
    }

    resetLetterMultiplier() {
        this.letterMultiplier = 1;
    }
    resetWordMultiplier() {
        this.wordMultiplier = 1;
    }
}
