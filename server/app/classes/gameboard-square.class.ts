/* eslint-disable prettier/prettier */
import { Coordinate } from './gameboard-coordinate.class';
import { Letter } from './letter';

export class Box {
    isWordMultiplier: boolean;
    isLetterMultiplier: boolean;
    private position: Coordinate;
    private pointsMultiplier: number;
    private isOccupied: boolean;
    private letter: Letter;

    constructor(position: Coordinate, multiplier: number = 1, isWordMultiplier: boolean = false) {
        this.position = position;
        this.pointsMultiplier = multiplier;
        this.isWordMultiplier = isWordMultiplier;
    }

    setOccupy(occupied: boolean) {
        this.isOccupied = occupied;
    }

    getOccupy() {
        return this.isOccupied;
    }

    setWordMultiplier(multiplier: number, isWordMultiplier: boolean) {
        this.isWordMultiplier = isWordMultiplier;
        this.pointsMultiplier = multiplier;
    }

    setLetterMultiplier(multiplier: number, isLetterMultiplier: boolean) {
        this.isLetterMultiplier = isLetterMultiplier;
        this.pointsMultiplier = multiplier;
    }

    getPointsMultiplier() {
        return this.pointsMultiplier;
    }
}
