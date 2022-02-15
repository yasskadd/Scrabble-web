/* eslint-disable prettier/prettier */
import { BoxMultiplierService } from '@app/services/box-multiplier.service';
import { Letter } from '@common/letter';
import { Inject } from 'typedi';
import { GameboardCoordinate } from './gameboard-coordinate.class';

const ROW_NUMBERS = 15;
const COLUMN_NUMBERS = 15;

export class Gameboard {
    gameboardCoords: GameboardCoordinate[] = new Array();

    constructor(@Inject() private boxMultiplierService: BoxMultiplierService) {
        this.createGameboardCoordinates();
        this.boxMultiplierService.applyBoxMultipliers(this);
    }

    createGameboardCoordinates() {
        for (let i = 1; i <= ROW_NUMBERS; i++) {
            for (let j = 1; j <= COLUMN_NUMBERS; j++) {
                const letter: Letter = {} as Letter;
                const coord: GameboardCoordinate = new GameboardCoordinate(j, i, letter);
                this.gameboardCoords.push(coord);
            }
        }
    }

    getCoord(coord: GameboardCoordinate) {
        if (coord.x > ROW_NUMBERS || coord.x < 1 || coord.y > ROW_NUMBERS || coord.y < 1) return {} as GameboardCoordinate;
        return this.gameboardCoords.filter((gameboardCoord) => {
            return gameboardCoord.x === coord.x && gameboardCoord.y === coord.y;
        })[0];
    }

    placeLetter(letterCoord: GameboardCoordinate) {
        this.getCoord(letterCoord).letter = letterCoord.letter;
        this.getCoord(letterCoord).isOccupied = true;
    }

    removeLetter(letterCoord: GameboardCoordinate) {
        this.getCoord(letterCoord).letter = {} as Letter;
        this.getCoord(letterCoord).isOccupied = false;
    }
}
