/* eslint-disable prettier/prettier */
import { BoxMultiplierService } from '@app/services/box-multiplier.service';
import { LetterTile } from '@common/classes/letter-tile.class';
import { Letter } from '@common/interfaces/letter';
import { Inject } from 'typedi';

const ROW_NUMBERS = 15;
const COLUMN_NUMBERS = 15;

export class Gameboard {
    gameboardCoords: LetterTile[];

    constructor(@Inject() private boxMultiplierService: BoxMultiplierService) {
        this.gameboardCoords = new Array();
        this.createLetterTiles();
        this.boxMultiplierService.applyBoxMultipliers(this);
    }

    createLetterTiles() {
        for (let i = 1; i <= ROW_NUMBERS; i++) {
            for (let j = 1; j <= COLUMN_NUMBERS; j++) {
                const letter: Letter = {} as Letter;
                const coord: LetterTile = new LetterTile(j, i, letter);
                this.gameboardCoords.push(coord);
            }
        }
    }

    getCoord(coord: LetterTile) {
        if (coord.x > ROW_NUMBERS || coord.x < 1 || coord.y > ROW_NUMBERS || coord.y < 1) return {} as LetterTile;
        return this.gameboardCoords.filter((gameboardCoord) => {
            return gameboardCoord.x === coord.x && gameboardCoord.y === coord.y;
        })[0];
    }

    placeLetter(letterCoord: LetterTile) {
        this.getCoord(letterCoord).letter = letterCoord.letter;
        this.getCoord(letterCoord).isOccupied = true;
    }

    removeLetter(letterCoord: LetterTile) {
        this.getCoord(letterCoord).letter = {} as Letter;
        this.getCoord(letterCoord).isOccupied = false;
    }
}
