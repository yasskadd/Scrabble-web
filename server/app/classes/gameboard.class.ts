/* eslint-disable prettier/prettier */
import { BoxMultiplier } from 'app/services/box-multiplier.service';
import { Coordinate } from '../classes/coordinate.class';
import { Letter } from './letter.class';

export class GameBoard {
    gameboardCoords: Coordinate[] = new Array();

    constructor(private boxMultiplierService: BoxMultiplier) {
        this.createCoordinates();
        this.boxMultiplierService.applyBoxMultipliers(this);
    }

    createCoordinates() {
        const rowNumbers = 15;
        const columnNumbers = 15;
        for (let i = 0; i < rowNumbers; i++) {
            for (let j = 0; j < columnNumbers; j++) {
                const letter: Letter = new Letter();
                const coord: Coordinate = new Coordinate(i, j, letter);
                this.gameboardCoords.push(coord);
            }
        }
    }

    getCoord(coord: Coordinate) {
        // eslint-disable-next-line no-unused-vars
        const x: number = coord.x;
        const y: number = coord.y;
        return this.gameboardCoords[14 * x + y + 1];
    }

    placeLetter(letterCoord: Coordinate) {
        const gameboardCoord = this.getCoord(letterCoord);
        if (gameboardCoord.isOccupied === true) {
            return false;
        } else {
            gameboardCoord.letter = letterCoord.letter;
            gameboardCoord.isOccupied = true;
            // removeLetterFromChevalet(gameboardCoord.letter);
            // this.newlyPlacedLetters.push(gameboardCoord);
            return true;
        }
    }

    removeLetter(letterCoord: Coordinate) {
        const gameboardCoord = this.getCoord(letterCoord);
        if (gameboardCoord.isOccupied) {
            // returnLetterToChevalet(gameboardCoord.letter);
            gameboardCoord.letter = {} as Letter;
            gameboardCoord.isOccupied = false;
        } else {
            return;
        }
    }

    // getAdjacentCoordinate(coord: Coordinate, direction: string) {
    //     const directions: string[] = ['UP', 'DOWN', 'RIGHT', 'LEFT'];
    //     if (directions.includes(direction)) {
    //         if (direction === 'UP') {
    //             coord.setY(coord.getY() + 1);
    //             this.findArrayIndex(coord);
    //         }
    //         if (direction === 'DOWN') {
    //             coord.setY(coord.getY() - 1);
    //             return this.findArrayIndex(coord);
    //         }
    //         if (direction === 'DOWN') {
    //             coord.setY(coord.getY() - 1);
    //             return this.findArrayIndex(coord);
    //         }
    //         if (direction === 'RIGHT') {
    //             coord.setX(coord.getX() + 1);
    //             return this.findArrayIndex(coord);
    //         }
    //         if (direction === 'LEFT') {
    //             coord.setX(coord.getX() - 1);
    //             return this.findArrayIndex(coord);
    //         }
    //     } else {
    //         throw new Error("It's not a valid direction");
    //     }
    // }
}
