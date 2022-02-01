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

    resetLetterMultiplier() {
        this.letterMultiplier = 1;
    }
    resetWordMultiplier() {
        this.wordMultiplier = 1;
    }
}
