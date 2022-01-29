/* eslint-disable prettier/prettier */
import { Coordinate } from './gameboard-coordinate.class';
import { Letter } from './letter';

export class Box {
    private position: Coordinate;
    private pointsMultiplier: number;
    private isWordMultiplier: boolean;
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

    setMultiplier(multiplier: number, isWordMultiplier: boolean) {
        this.isWordMultiplier = isWordMultiplier;
        this.pointsMultiplier = multiplier;
    }
}
