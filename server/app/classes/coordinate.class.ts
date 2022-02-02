import { Letter } from './letter.class';

/* eslint-disable prettier/prettier */

export class Coordinate {
    x: number;
    y: number;
    isOccupied: boolean;
    letter: Letter;
    letterMultiplier: number;
    wordMultiplier: number;

    constructor(posX: number, posY: number, letter: Letter) {
        this.x = posX;
        this.y = posY;
        this.isOccupied = false;
        this.letter = letter;
        this.letterMultiplier = 1;
        this.wordMultiplier = 1;
    }

    static findDirection(coordList: Coordinate[]) {
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
            tempHorizontalCoords.push(coord.x);
            tempVerticalCoord.push(coord.y);
        });
        if (tempHorizontalCoords.length > 1 && allEqual(tempHorizontalCoords)) {
            direction = DIRECTIONS.vertical;
            return direction;
        } else if (tempVerticalCoord.length > 1 && allEqual(tempVerticalCoord)) {
            direction = DIRECTIONS.horizontal;
            return direction;
        } else {
            return direction;
        }
    }

    resetLetterMultiplier() {
        this.letterMultiplier = 1;
    }
    resetWordMultiplier() {
        this.wordMultiplier = 1;
    }
}
