/* eslint-disable prettier/prettier */
import { BoxMultiplier } from 'app/services/box-multiplier.service';
import { Coordinate } from '../classes/coordinate.class';
import { Letter } from '../letter';

export class GameBoard {
    private gameboardCoords: Coordinate[];
    private boxMultiplierService: BoxMultiplier;

    constructor() {
        this.createCoordinates();
        this.boxMultiplierService.applyBoxMultipliers();
    }

    createCoordinates() {
        const rowNumbers = 15;
        const columnNumbers = 15;
        for (let i = 0; i < rowNumbers; i++) {
            for (let j = 0; j < columnNumbers; j++) {
                const coord: Coordinate = new Coordinate(i, j, <Letter>{});
                this.gameboardCoords.push(coord);
            }
        }
    }

    getCoord(coord: Coordinate) {
        return this.gameboardCoords.filter((gameboardCoord) => (coord = gameboardCoord))[0];
    }

    placeLetter(letterCoord: Coordinate) {
        const gameboardCoord = this.getCoord(letterCoord);
        if (gameboardCoord.isOccupied == true) {
            return;
        } else {
            gameboardCoord.letter = letterCoord.letter;
            gameboardCoord.isOccupied = true;
            // removeLetterFromChevalet(gameboardCoord.letter);
            //this.newlyPlacedLetters.push(gameboardCoord);
        }
    }

    removeLetter(letterCoord: Coordinate) {
        const gameboardCoord = this.getCoord(letterCoord);
        if (gameboardCoord.isOccupied) {
            // returnLetterToChevalet(gameboardCoord.letter);
            gameboardCoord.letter = <Letter>{};
        } else {
            return;
        }
    }

    // getAdjacentBoxIndex(coord: Coordinate, direction: string) {
    //     const directions: string[] = ['UP', 'DOWN', 'RIGHT', 'LEFT'];
    //     const upDirection =  this.gameboardCoords.
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
