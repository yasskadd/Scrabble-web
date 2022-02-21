/* eslint-disable prettier/prettier */
import { Letter } from '@common/letter';
import { Coordinate } from './coordinate';

export class LetterTile implements Coordinate {
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

    static findDirection(coordList: LetterTile[]) {
        let isHorizontal: boolean | null = null;
        const allEqual = (arr: number[]) => arr.every((v) => v === arr[0]);
        const tempHorizontalCoords: number[] = [];
        const tempVerticalCoord: number[] = [];
        coordList.forEach((coord) => {
            tempHorizontalCoords.push(coord.x);
            tempVerticalCoord.push(coord.y);
        });
        if (tempHorizontalCoords.length > 1 && allEqual(tempHorizontalCoords)) isHorizontal = false;
        else if (tempVerticalCoord.length > 1 && allEqual(tempVerticalCoord)) isHorizontal = true;
        return isHorizontal;
    }

    resetLetterMultiplier() {
        this.letterMultiplier = 1;
    }
    resetWordMultiplier() {
        this.wordMultiplier = 1;
    }
}
