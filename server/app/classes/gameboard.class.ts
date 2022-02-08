/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-restricted-imports */
/* eslint-disable prettier/prettier */
import { Letter } from '@app/letter';
import { BoxMultiplier } from 'app/services/box-multiplier.service';
import { Inject } from 'typedi';
import { Coordinate } from '../classes/coordinate.class';

export class GameBoard {
    gameboardCoords: Coordinate[] = new Array();

    constructor(@Inject() private boxMultiplierService: BoxMultiplier) {
        this.createCoordinates();
        this.boxMultiplierService.applyBoxMultipliers(this);
    }

    createCoordinates() {
        const rowNumbers = 15;
        const columnNumbers = 15;
        for (let j = 0; j < rowNumbers; j++) {
            for (let i = 0; i < columnNumbers; i++) {
                const letter: Letter = {} as Letter;
                const coord: Coordinate = new Coordinate(i, j, letter);
                this.gameboardCoords.push(coord);
            }
        }
    }

    getCoord(coord: Coordinate) {
        // eslint-disable-next-line no-unused-vars
        const x: number = coord.x;
        const y: number = coord.y;
        if (x > 14 || x < 0 || y > 14 || y < 0) return {} as Coordinate;
        return this.gameboardCoords[15 * y + x];
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
}
