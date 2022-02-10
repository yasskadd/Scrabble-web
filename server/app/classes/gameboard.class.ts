/* eslint-disable prettier/prettier */
import { Letter } from '@common/letter';
import { BoxMultiplier } from 'app/services/box-multiplier.service';
import { Inject } from 'typedi';
import { GameboardCoordinate } from './gameboard-coordinate.class';

export class GameBoard {
    gameboardCoords: GameboardCoordinate[] = new Array();

    constructor(@Inject() private boxMultiplierService: BoxMultiplier) {
        this.createGameboardCoordinates();
        this.boxMultiplierService.applyBoxMultipliers(this);
    }

    createGameboardCoordinates() {
        const rowNumbers = 15;
        const columnNumbers = 15;
        for (let i = 0; i < rowNumbers; i++) {
            for (let j = 0; j < columnNumbers; j++) {
                const letter: Letter = {} as Letter;
                const coord: GameboardCoordinate = new GameboardCoordinate(j, i, letter);
                this.gameboardCoords.push(coord);
            }
        }
    }

    getCoord(coord: GameboardCoordinate) {
        // eslint-disable-next-line no-unused-vars
        const x: number = coord.x;
        const y: number = coord.y;
        if (x > 14 || x < 0 || y > 14 || y < 0) return {} as GameboardCoordinate;
        return this.gameboardCoords[15 * y + x];
    }

    placeLetter(letterCoord: GameboardCoordinate) {
        const gameboardCoord = this.getCoord(letterCoord);
        if (gameboardCoord.isOccupied === true) {
            return false;
        } else {
            // TODO : removeLetterFromChevalet(gameboardCoord.letter);
            gameboardCoord.letter = letterCoord.letter;
            gameboardCoord.isOccupied = true;
            return true;
        }
    }

    removeLetter(letterCoord: GameboardCoordinate) {
        const gameboardCoord = this.getCoord(letterCoord);
        if (gameboardCoord.isOccupied) {
            gameboardCoord.letter = {} as Letter;
            gameboardCoord.isOccupied = false;
        } else {
            return;
        }
    }
}
